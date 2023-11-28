#include <pthread.h>
#include <sys/types.h>
#include <sys/socket.h>
#include <netinet/in.h>
#include <arpa/inet.h>
#include <signal.h>
#include <string.h>
#include <stdio.h>
#include <netdb.h>
#include <errno.h>
#include <stdlib.h>        // qsort ()
#include <time.h>
#include <unistd.h>        // getopt (), optarg , ..
#include <sys/stat.h>      // struct stat
#include <fcntl.h>         // O_RDWR
#include <sys/mman.h>      // PROT_READ,
#include <syslog.h>
#include <sys/types.h>
#include <sys/wait.h>

#include "config.h"
#include "log.h"
#include "work.h"
#include "tsdb.h"

/*[=== macro constant definitions ===========================================]*/
#define TID_SIGNAL_MONITOR      0
#define TID_WORK_MANAGER        1
#define MAX_TID                ( TID_WORK_MANAGER + 1 )

/*[=== global variable definitions ==========================================]*/
char                           MyNameBuf[128];
int                            opt_cmd;
int                            run = 1;
config_t                       config;

/*[=== static variable definitions ==========================================]*/
static char                    CmdBuf[32];
static char                    MyPidFilePath[128];
static char                    InitCWD [128];
static pthread_t               TID_List [MAX_TID];

/*[=== static function declaration ==========================================]*/
static void   Usage            (char *_p_pgm);
static void   SignalHandler    (const int _signal);
static void   FreeResources    ( void );
static void  *signal_monitor   (void *_p_arg);
static int    ProcCmd          (char *_p_cmd);

/*[=== extern variable definitions ==========================================]*/
extern int                     LogLevel;
extern int                     LoggingFlag;
extern FILE                   *LogFP;
extern unsigned long           stat_tsdb_count;

extern void*                   work_proc(void *_p_arg);

config_t                       config;

int 
main(int _argc, char * _argv [])
{
    char *        fnm          ;
    int           ch           ;
    int           i            ;
    char *        p_pgm        ;
    char *        p_tmp        ;
    int           rc           ;
    char          lbuf [512]   ;
    pthread_t     tid          ;

    struct stat   pid_file_info;
    int           pid          ;
    int           status       ;
    FILE *        fp           ;

    static pthread_attr_t attributes;
    struct sched_param    scheduling_info;

    /**
     * get program name
     */
    for (p_pgm = _argv [0]; p_tmp = strchr(p_pgm, '/'); p_pgm = ++p_tmp) {}
    snprintf (MyNameBuf, sizeof(MyNameBuf), "%s", p_pgm);
    fnm = p_pgm ;

    /**
     * get current working directory
     */
    p_tmp = getcwd (InitCWD, sizeof (InitCWD));

    /**
     * make pid file name
     */
    if (getuid ())
        snprintf (MyPidFilePath, sizeof(MyPidFilePath), "/tmp/%s.pid", MyNameBuf);
    else
        snprintf (MyPidFilePath, sizeof(MyPidFilePath), "/var/run/%s.pid", MyNameBuf);

    /**
     * process getopt options
     */
    opt_cmd  = 0;
    while (-1 != (ch = getopt (_argc, _argv, "hc:"))) {
        switch (ch) {
        case 'c':
            opt_cmd ++;
            snprintf (CmdBuf, sizeof(CmdBuf), "%s", optarg);
            break;

        case 'f':
            snprintf (config.cfg_path, sizeof(config.cfg_path), "%s", optarg);
            break;

        case 'h':
        case '?':
        default:
            Usage (p_pgm);
            exit (0);
        }
    }

    /**
     *  verification of command-line arguments
     */
    if (opt_cmd) {
        ProcCmd ( CmdBuf );

        exit (0);
    }
    else if (0 == stat ( MyPidFilePath , &pid_file_info )) {
        if ( S_IFREG != (pid_file_info.st_mode &  S_IFREG )) {
            fprintf (stderr, "%s: '%s' (not regular file)\n", fnm, MyPidFilePath );
            exit (170);
        }
        if (NULL == (fp = fopen ( MyPidFilePath , "r" ))) {
            fprintf (stderr, "%s: fopen ('%s', 'r')[E:%d]\n", fnm, MyPidFilePath , errno);
            exit (171);
        }
        p_tmp = fgets (lbuf , sizeof (lbuf), fp);
        fclose (fp);

        fprintf (stderr, "%s: already invoked (pid = %d)\n", fnm, pid = atoi(lbuf));

        exit (172);
    }

    /**
     * initialize of thread list
     */
    for (i = 0; i < MAX_TID ; i++) {
        TID_List [i] = (pthread_t)0;
    }

    /*
     * load config file
     */
    if (strlen(config.cfg_path) == 0) {
        snprintf(config.cfg_path, sizeof(config.cfg_path), "%s", "/opt/cfg/mtsdb.json");
    }
    if (load_config(&config) != 0) {
        fprintf (stderr, "%s: %s can't load config file\n", fnm, config.cfg_path);
        exit(20);
    }

    /**
     * setting Log environment
     */
    if (strncasecmp(config.log_flag, "none", strlen("none")) == 0) {
        LoggingFlag = LOG_FLAG_NONE;
    }
    else if (strncasecmp(config.log_flag, "file", strlen("file")) == 0) {
        LoggingFlag = LOG_FLAG_FILE;
    }
    else {
        LoggingFlag = LOG_FLAG_FILE;
    }

    if (strncasecmp(config.log_level, "none", strlen("none")) == 0) {
        LogLevel = LOG_LEVEL_NONE;
    }
    else if (strncasecmp(config.log_level, "info", strlen("info")) == 0) {
        LogLevel = LOG_LEVEL_INFO;
    }
    else if (strncasecmp(config.log_level, "warning", strlen("warning")) == 0) {
        LogLevel = LOG_LEVEL_WARNING;
    }
    else if (strncasecmp(config.log_level, "error", strlen("error")) == 0) {
        LogLevel = LOG_LEVEL_ERROR;
    }
    else {
        LogLevel = LOG_LEVEL_INFO;
    }

    LOG (LL1, "start %s program\n", MyNameBuf);

    /*
     * create pthread (signal, control, stream) thread
     */
    if (rc = pthread_attr_init (&attributes)) {
        LOG (LL3, "pthread_attr_init ()[E:%d]\n", rc);
        exit (21);
    }
    pthread_attr_getschedparam (&attributes, &scheduling_info);
    scheduling_info.sched_priority++;
    pthread_attr_setschedparam (&attributes, &scheduling_info);

    if (rc = pthread_create (&tid, &attributes, signal_monitor, NULL)) {
        LOG (LL3, "signal_monitor thread creation error - [E:%d:%d]\n", rc, errno );
        exit (22);
    }
    else {
        TID_List [ TID_SIGNAL_MONITOR ] = tid ;
    }
    LOG (LL1, "success signal_monitor thread creation\n");

    if (rc = pthread_create (&tid, &attributes, work_proc, "1")) {
        LOG (LL3, "work_proc thread creation error - [E:%d:%d]\n", rc, errno );
        exit (23);
    }
    else {
        TID_List [ TID_WORK_MANAGER ] = tid ;
    }
    LOG (LL1, "success work_proc thread creation\n");

    for (i = 0; i < MAX_TID; i ++) {
        if (0 < TID_List [i]) {
            pthread_join (TID_List [i], (void **)&status);
        }
    }

    exit (0);
}

static void
Usage (char *_p_pgm)
{
    fprintf (stderr, "\nUsage:\n\n %s [-h] [-c cmd] [-f config_file] \n\n", _p_pgm);
    fprintf (stderr, "\t -h : display this message\n");
    fprintf (stderr, "\t -f : config file\n");
    fprintf (stderr, "\t -c : execute command\n");
    fprintf (stderr, "\t\t stop  : terminate daemon\n");
    fprintf (stderr, "\n");

    return;
}

static void *
signal_monitor (void *_p_arg)
{
    static char     *fnm = "signal_monitor ()";

    int              rc;
    int              sig;
    sigset_t         sig_set ;
    struct sigaction sig_act ;
    FILE  *          fp;
    int              pid;
    int              i;
    int              sig_list [] = { SIGINT, SIGPIPE, SIGALRM, SIGTERM , SIGSEGV };

    signal(SIGCHLD, SIG_IGN);

#define N_SIG_LIST  (sizeof (sig_list) / sizeof (sig_list [0]))
    if (NULL == (fp = fopen ( MyPidFilePath , "w" ))) {
        LOG (LL3, "%s : fopen ('%s','w')[E:%d]\n", fnm, MyPidFilePath, errno);
    }
    else {
        fprintf (fp, "%d\n", pid = getpid ());
        fclose (fp);
    }

    alarm (config.report_interval);

    while (run) {
        sigemptyset (&sig_set);
        for (i = N_SIG_LIST - 1; 0 <= i; i--) {
            sigaddset (&sig_set , sig_list [i]);
        }

        sig_act.sa_handler = SignalHandler ;
        for (i = N_SIG_LIST - 1; 0 <= i; i--) {
            sigaction (sig_list [i], &sig_act , NULL);
        }
        pthread_sigmask (SIG_UNBLOCK, &sig_set, NULL);

        if (rc = sigwait (&sig_set, &sig)) {
            LOG (LL1, "%s: signal capture[E:%d]\n", fnm, rc);
        }
        LOG (LL1, "%s: signal(%d) captured\n", fnm, sig);

        SignalHandler (sig);
    }

    return NULL;
}

static void
SignalHandler (const int _signal)
{
    static char  *fnm = "SignalHandler ()";

    switch (_signal) {
    case SIGHUP:
        break;

    case SIGINT:
        break;

    case SIGALRM:
        LOG (LL1, "tsdb process (CPS) = %ld\n", stat_tsdb_count);
        stat_tsdb_count = 0L;
        alarm(config.report_interval);
        break;

    case SIGTERM:
        LOG (LL1, "%s : sigterm signal occured.\n", fnm);
        FreeResources ();
        exit (11);

    case SIGPIPE:
        LOG (LL1, "%s : sigpipe signal occured.\n", fnm);
        break;

    case SIGSEGV:
        LOG (LL1, "%s : segment violation signal occured.\n", fnm);
        FreeResources ();
        exit (12);

    default:
        break;
    }
}

static void
FreeResources ()
{
    int   i;

    LOG (LL1, "stop %s program\n", MyNameBuf);

    unlink (MyPidFilePath);

    run = 0;
    usleep(100000);

    for (i = 0 ; i < MAX_TID; i ++) {
        if (0 < TID_List [i]) {
            pthread_kill (TID_List [i], SIGKILL);
            TID_List [i] = (pthread_t)-1;
        }
    }

    disconnectAMQP();
    disconnectDB();

    if(LogFP != NULL)
        fclose(LogFP);
}

static int
ProcCmd ( char *_p_cmd )
{
    FILE *fp;
    char  *p_tmp;
    char  pid_buf [32];
    int   pid;
    int   sig;

    if (!_p_cmd) {
        return -1;
    }

    if (NULL == (fp = fopen (MyPidFilePath, "r"))) {
        fprintf (stderr, "there's no such daemon('%s')[E:%d]\n", MyNameBuf, errno);

        return -1;
    }
    p_tmp = fgets (pid_buf, sizeof (pid_buf), fp);
    fclose (fp);

    pid = atoi (pid_buf);

    if (!strcasecmp (_p_cmd, "stop")) {
        sig = SIGTERM ;
    }
    else {
        return 0;
    }
    kill (pid, sig);

    return 1;
}
