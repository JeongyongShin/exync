#ifndef _CONFIG_H_
#define _CONFIG_H_

#include "common.h"

typedef struct {
    char cfg_path[MAX_MBUF_SIZE + 1];
    char cfg_dir[MAX_MBUF_SIZE + 1];

    char log_path[MAX_MBUF_SIZE + 1];
    char log_prefix[MAX_SBUF_SIZE + 1];
    char log_flag[MAX_SBUF_SIZE + 1];
    char log_level[MAX_SBUF_SIZE + 1];

    char amqp_host[MAX_MBUF_SIZE + 1];
    char amqp_user[MAX_SBUF_SIZE + 1];
    char amqp_pwd_file[MAX_SBUF_SIZE + 1];
    char amqp_pwd[MAX_SBUF_SIZE + 1];
    char amqp_exchange_sub[MAX_MBUF_SIZE + 1];
    char amqp_bindkey_sub[MAX_MBUF_SIZE + 1];
    int  amqp_port;
    int  amqp_timeout;

    int  report_interval;

    char tsdb_host[MAX_MBUF_SIZE + 1];
    char tsdb_uid[MAX_SBUF_SIZE + 1];
    char tsdb_pwd_file[MAX_SBUF_SIZE + 1];
    char tsdb_pwd[MAX_SBUF_SIZE + 1];
    int  tsdb_port;
} config_t;

extern int load_config(config_t *config);

#endif
