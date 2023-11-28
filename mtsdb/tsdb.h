#ifndef _TSDB_H_
#define _TSDB_H_

#include <machbase_sqlcli.h>

#include "common.h"
#include "work.h"

#define RC_SUCCESS		0
#define RC_FAILURE		-1
#define ERROR_CHECK_COUNT       100000

#define DB_WORK_SIZE		100
#define DB_PARAM_SIZE		3
#define TAG_NAME_SIZE		256

int appendOpen(SQLHSTMT aStmt);
unsigned long appendClose(SQLHSTMT aStmt);

extern int connectDB(void);
extern void disconnectDB(void);
extern int insertTagData(char *sTagName, struct tag_val *t_val);

#endif
