#include <stdio.h>
#include <string.h>
#include <errno.h>
#include <stdlib.h>        // qsort ()
#include <time.h>
#include <stdarg.h>        // LOG (LL3, "...", ... );
#include <sys/time.h>

#include "config.h"
#include "log.h"

int   LogLevel    = LOG_LEVEL_INFO;
int   LoggingFlag = LOG_FLAG_FILE;
char  LoggingDate  [ 32];
FILE  *LogFP = NULL;

extern config_t config;

void
LOG(int _log_level, char *_fmt, ...)
{
    static char   *fnm = "LOG ()";

    char           curr_date_buf[32];
    struct timeval tp;
    struct tm      stime;

    if ((LOG_FLAG_NONE == LoggingFlag) || (LOG_LEVEL_NONE == LogLevel)) {
        return;
    }

    if (_log_level < LogLevel) {
        return;
    }

    gettimeofday(&tp, NULL);
    localtime_r((time_t *)&tp.tv_sec, &stime);
    snprintf(curr_date_buf, sizeof(curr_date_buf), "%04d%02d%02d",
             stime.tm_year + 1900,
             stime.tm_mon  + 1,
             stime.tm_mday);
    if (NULL == LogFP || memcmp (LoggingDate, curr_date_buf, 8)) {
        char log_file_path[MAX_LBUF_SIZE + 1];

        if (LogFP) {
            fclose (LogFP);
            LogFP = NULL;
        }
        snprintf(log_file_path, sizeof(log_file_path), "%s/%s_%s.log",
                 config.log_path, config.log_prefix , curr_date_buf);

        if (NULL == (LogFP = fopen (log_file_path, "a+"))) {
            fprintf (stderr, "%s: fopen('%s')[E:%d]\n",
                    fnm, log_file_path, errno);

            return;
        }
        snprintf(LoggingDate, sizeof(LoggingDate), "%s", curr_date_buf);
    }

    if (LogFP) {
        va_list ap;
        char    c_dtime[32];
	size_t  n;

        n = strftime(c_dtime, sizeof(c_dtime), "%Y/%m/%d %H:%M:%S:", &stime);
        snprintf (&c_dtime[20], sizeof(c_dtime) - n, "%03d", (int) (tp.tv_usec / 1000));
        fprintf (LogFP, "%s [%d] ", c_dtime, _log_level);

        va_start (ap,    _fmt);
        vfprintf (LogFP, _fmt, ap);
        va_end   (ap);

        fflush (LogFP);
    }

    return;
}
