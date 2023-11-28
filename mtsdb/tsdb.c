#include <stdio.h>
#include <stdlib.h>
#include <stdarg.h>
#include <string.h>
#include <unistd.h>
#include <machbase_sqlcli.h>

#include "config.h"
#include "log.h"
#include "tsdb.h"
#include "config.h"

SQLBIGINT   gCount = 0;
SQLHENV     gEnv;
SQLHDBC     gCon;
SQLHSTMT    gStmt = SQL_NULL_HSTMT;

unsigned long stat_tsdb_count = 0L;

extern config_t config;

unsigned long convert_machbase_time(long t);
void printError(SQLHENV aEnv, SQLHDBC aCon, SQLHSTMT aStmt, char *aMsg);

int appendOpen(SQLHSTMT aStmt);
unsigned long appendClose(SQLHSTMT aStmt);

void
printError(SQLHENV aEnv, SQLHDBC aCon, SQLHSTMT aStmt, char *aMsg)
{
    SQLINTEGER      sNativeError;
    SQLCHAR         sErrorMsg[SQL_MAX_MESSAGE_LENGTH + 1];
    SQLCHAR         sSqlState[SQL_SQLSTATE_SIZE + 1];
    SQLSMALLINT     sMsgLength;

    if (aMsg != NULL) {
        LOG (LL3, "%s\n", aMsg);
    }

    if (SQLError(aEnv, aCon, aStmt, sSqlState, &sNativeError,
        sErrorMsg, SQL_MAX_MESSAGE_LENGTH, &sMsgLength) == SQL_SUCCESS) {
        LOG (LL3, "SQLSTATE-[%s], Machbase-[%d][%s]\n", sSqlState, sNativeError, sErrorMsg);
    }
}

int
connectDB(void)
{
    char sConnStr[1024];

    if (SQLAllocEnv(&gEnv) != SQL_SUCCESS) {
        LOG (LL3, "SQLAllocEnv error\n");
        return RC_FAILURE;
    }

    if (SQLAllocConnect(gEnv, &gCon) != SQL_SUCCESS) {
        LOG (LL3, "SQLAllocConnect error\n");

        SQLFreeEnv(gEnv);
        gEnv = SQL_NULL_HENV;

        return RC_FAILURE;
    }

    snprintf(sConnStr, sizeof(sConnStr), "SERVER=%s;UID=%s;PWD=%s;CONNTYPE=1;PORT_NO=%d",
             config.tsdb_host,
             config.tsdb_uid,
             config.tsdb_pwd,
             config.tsdb_port);
    if (SQLDriverConnect(gCon, NULL,
                         (SQLCHAR *)sConnStr,
                         SQL_NTS,
                         NULL, 0, NULL,
                         SQL_DRIVER_NOPROMPT ) != SQL_SUCCESS) {
        printError(gEnv, gCon, NULL, "SQLDriverConnect error");

        SQLFreeConnect(gCon);
        gCon = SQL_NULL_HDBC;

        SQLFreeEnv(gEnv);
        gEnv = SQL_NULL_HENV;

        return RC_FAILURE;
    }

    if (SQLAllocStmt(gCon, &gStmt) != SQL_SUCCESS) {
        LOG (LL3, "SQLAllocStmt Error\n");
    }

    if (appendOpen(gStmt) != RC_SUCCESS) {
        LOG (LL3, "appendOpen failure\n");
        return RC_FAILURE;
    }

    return RC_SUCCESS;
}

void
disconnectDB(void)
{
    int sCount = appendClose(gStmt);
    if (sCount <= 0) {
        LOG (LL3, "appendClose failure\n");
    }

    if (SQLFreeStmt(gStmt, SQL_DROP) != SQL_SUCCESS) {
        LOG (LL3, "SQLFreeStmt Error\n");
    }
    gStmt = SQL_NULL_HSTMT;

    if (SQLDisconnect(gCon) != SQL_SUCCESS) {
        LOG (LL3, "SQLDisconnect error\n");
    }

    SQLFreeConnect(gCon);
    gCon = SQL_NULL_HDBC;

    SQLFreeEnv(gEnv);
    gEnv = SQL_NULL_HENV;
}

int
appendOpen(SQLHSTMT aStmt)
{
    const char *sTableName = "TAG";

    if (SQLAppendOpen(aStmt, (SQLCHAR *)sTableName, ERROR_CHECK_COUNT) != SQL_SUCCESS) {
        LOG (LL3, "SQLAppendOpen Error\n");
        return RC_FAILURE;
    }

    return RC_SUCCESS;
}

unsigned long
appendClose(SQLHSTMT aStmt)
{
    SQLBIGINT sSuccessCount = 0;
    SQLBIGINT sFailureCount = 0;

    if (SQLAppendClose(aStmt, (SQLBIGINT *)&sSuccessCount, (SQLBIGINT *)&sFailureCount) != SQL_SUCCESS) {
        LOG (LL3, "SQLAppendClose Error\n");
        return RC_FAILURE;
    }
    else {
        LOG (LL1, "success : %ld, failure : %ld\n", sSuccessCount, sFailureCount);

        return sSuccessCount;
    }
}

int idx = 0;
SQL_APPEND_PARAM sParam[DB_WORK_SIZE][DB_PARAM_SIZE];

#define UA_DATETIME_USEC 10L
#define UA_DATETIME_MSEC (UA_DATETIME_USEC * 1000L)
#define UA_DATETIME_SEC (UA_DATETIME_MSEC * 1000L)
#define UA_DATETIME_UNIX_EPOCH (11644473600L * UA_DATETIME_SEC)

unsigned long convert_machbase_time(long t)
{
    unsigned long time = 0L;
    unsigned short nanoSec;
    unsigned short microSec;
    unsigned short milliSec;


    if (t > 0) {
        nanoSec  = (unsigned short)((t % 10) * 100);
        microSec = (unsigned short)((t % 10000) / 10);
        milliSec = (unsigned short)((t % 10000000) / 10000);
    }
    else {
        nanoSec  = (unsigned short)(((t % 10 + t) % 10) * 100);
        microSec = (unsigned short)(((t % 10000 + t) % 10000) / 10);
        milliSec = (unsigned short)(((t % 10000000 + t) % 10000000) / 10000);
    }

    time = (unsigned long)(t / UA_DATETIME_SEC) - (unsigned long)(UA_DATETIME_UNIX_EPOCH / UA_DATETIME_SEC);
    time *= MACHBASE_UINT64_LITERAL(1000000000);
    time += milliSec * 1000000 + microSec * 1000 + nanoSec;

    return time;
}

int
insertTagData(char *tag_name, struct tag_val *t_val)
{
    unsigned long sTime = convert_machbase_time(t_val->data_time);
    double sValue = 0.0;

    if (t_val->data_type == OPCUA_TYPE_BOOLEAN) {
        sValue = *(unsigned char *) t_val->data_value;
    }
    else if (t_val->data_type == OPCUA_TYPE_SBYTE) {
        sValue = *(char  *) t_val->data_value;
    }
    else if (t_val->data_type == OPCUA_TYPE_BYTE) {
        sValue = *(unsigned char *) t_val->data_value;
    }
    else if (t_val->data_type == OPCUA_TYPE_INT16) {
        sValue = *(short *) t_val->data_value;
    }
    else if (t_val->data_type == OPCUA_TYPE_UINT16) {
        sValue = *(unsigned short *) t_val->data_value;
    }
    else if (t_val->data_type == OPCUA_TYPE_INT32) {
        sValue = *(int *) t_val->data_value;
    }
    else if (t_val->data_type == OPCUA_TYPE_UINT32) {
        sValue = *(unsigned int *) t_val->data_value;
    }
    else if (t_val->data_type == OPCUA_TYPE_INT64) {
        sValue = *(long long *) t_val->data_value;
    }
    else if (t_val->data_type == OPCUA_TYPE_UINT64) {
        sValue = *(unsigned long long *) t_val->data_value;
    }
    else if (t_val->data_type == OPCUA_TYPE_FLOAT) {
        sValue = *(float *) t_val->data_value;
    }
    else if (t_val->data_type == OPCUA_TYPE_DOUBLE) {
        sValue = *(double *) t_val->data_value;
    }
    else if (t_val->data_type == OPCUA_TYPE_STRING) {
        char value[MAX_LBUF_SIZE + 1];
        int len = t_val->data_len;
        if (len >= MAX_LBUF_SIZE) len = MAX_LBUF_SIZE;

        memcpy(value, t_val->data_value, len);
        value[len] = '\0';

        sValue = atof(value);
    }
    else if (t_val->data_type == OPCUA_TYPE_ARRAY) {
    }
    else {
        LOG (LL3, "[%s] invalid type\n", tag_name);
        return -1;
    }

    memset(sParam[idx], 0, sizeof(sParam[idx]));
    sParam[idx][0].mVar.mLength    = strnlen(tag_name, TAG_NAME_SIZE);
    sParam[idx][0].mVar.mData      = tag_name;
    sParam[idx][1].mDateTime.mTime = sTime;
    sParam[idx][2].mDouble         = sValue;

    LOG (LL1, "tag = %s, time = %ld, value = %f\n", tag_name, sTime, sValue);

    return 0;

retry:
    if (SQLAppendDataV2(gStmt, sParam[idx]) != SQL_SUCCESS) {
        disconnectDB();
        connectDB();
	usleep(10000);
	goto retry;
    }

    if ((++gCount % 100) == 0) {
        if (SQLAppendFlush(gStmt) != SQL_SUCCESS) {
            LOG (LL3, "SQLAppendFlush Error\n");
        }
    }

    idx = (idx + 1) % DB_WORK_SIZE;

    ++stat_tsdb_count;

    return 0;
}
