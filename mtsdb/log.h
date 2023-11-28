#ifndef _LOG_H_
#define _LOG_H_

#include "common.h"

#define LOG_FLAG_NONE       0
#define LOG_FLAG_FILE       1

#define LOG_LEVEL_NONE      0
#define LOG_LEVEL_INFO      1
#define LOG_LEVEL_WARNING   2
#define LOG_LEVEL_ERROR     3

#define LOG_LEVEL_MAX       LOG_LEVEL_ERROR

#define LL0                 LOG_LEVEL_NONE
#define LL1                 LOG_LEVEL_INFO
#define LL2                 LOG_LEVEL_WARNING
#define LL3                 LOG_LEVEL_ERROR

extern void LOG (int _log_level, char *_fmt, ...);

#endif  // _LOG_H_
