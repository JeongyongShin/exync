#ifndef _COMMON_H_
#define _COMMON_H_

#define SUCCESS                 1
#define FAILURE                 0

#define MAX_LBUF_SIZE           255
#define MAX_MBUF_SIZE           127
#define MAX_SBUF_SIZE           63

#define OPCUA_TYPE_NONE         0
#define OPCUA_TYPE_BOOLEAN      1
#define OPCUA_TYPE_SBYTE        2
#define OPCUA_TYPE_BYTE         3
#define OPCUA_TYPE_INT16        4
#define OPCUA_TYPE_UINT16       5
#define OPCUA_TYPE_INT32        6
#define OPCUA_TYPE_UINT32       7
#define OPCUA_TYPE_INT64        8
#define OPCUA_TYPE_UINT64       9
#define OPCUA_TYPE_FLOAT        10
#define OPCUA_TYPE_DOUBLE       11
#define OPCUA_TYPE_STRING       12
#define OPCUA_TYPE_ARRAY        13

typedef unsigned long long      uint64;
typedef unsigned int            uint32;
typedef unsigned short          uint16;
typedef unsigned char           uint8;
typedef unsigned char           boolean;

typedef long long               int64;
typedef int                     int32;
typedef short                   int16;
typedef char                    int8;

#endif // _COMMON_H_
