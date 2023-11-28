#ifndef _WORK_H_
#define _WORK_H_

#include "common.h"

#define MAX_DATA_SIZE   1024

struct tag_val {
    long data_time;
    unsigned int  data_type;
    unsigned int  data_len;
    unsigned char data_value[MAX_DATA_SIZE+1];
};

extern int connectAMQP(void);
extern int disconnectAMQP(void);
extern void *work_proc(void *_p_arg);

#endif
