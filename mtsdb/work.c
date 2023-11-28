#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>
#include <signal.h>
#include <sys/time.h>
#include <unistd.h>
#include <fcntl.h>
#include <errno.h>
#include <sys/types.h>
#include <sys/socket.h>
#include <netinet/in.h>
#include <arpa/inet.h>

#include <amqp.h>
#include <amqp_tcp_socket.h>
#include <assert.h>

#include "config.h"
#include "log.h"
#include "work.h"
#include "tsdb.h"

extern int run;
extern config_t config;

amqp_socket_t  *amqp_socket = NULL;
amqp_connection_state_t amqp_conn;
amqp_channel_t amqp_channel;
amqp_bytes_t   amqp_queuename;

useconds_t sleep_usec = 1000000;

static char sTagName[512];

void *
work_proc(void *_p_arg)
{
    int status;
    amqp_frame_t frame;
    amqp_rpc_reply_t ret;
    amqp_envelope_t envelope;

    while ((status = connectAMQP()) != 0) {
        LOG (LL3, "connect amqp error [%d]\n", status);
        usleep(sleep_usec);
    }

    LOG (LL1, "amqp connected!!!\n");

    while(run) {
        amqp_maybe_release_buffers(amqp_conn);
        ret = amqp_consume_message(amqp_conn, &envelope, NULL, 0);
        if (ret.reply_type != AMQP_RESPONSE_NORMAL) {
            if (AMQP_RESPONSE_LIBRARY_EXCEPTION == ret.reply_type &&
                AMQP_STATUS_UNEXPECTED_STATE == ret.library_error) {
                if (AMQP_STATUS_OK != amqp_simple_wait_frame(amqp_conn, &frame)) {
                    /*
                     * unexpected state
                     */
                    run = 0;
                }

                if (AMQP_FRAME_METHOD == frame.frame_type) {
                    switch (frame.payload.method.id) {
                    case AMQP_BASIC_ACK_METHOD:
                        /* if we've turned publisher confirms on, and we've published a
                         * message here is a message being confirmed.
                         */
                        break;

                    case AMQP_BASIC_RETURN_METHOD:
                        /* if a published message couldn't be routed and the mandatory
                         * flag was set this is what would be returned. The message then
                         * needs to be read.
                         */
                        {
                            amqp_message_t message;
                            ret = amqp_read_message(amqp_conn, frame.channel, &message, 0);
                            if (ret.reply_type != AMQP_RESPONSE_NORMAL) {
                                run = 0;
                            }
                            else {
                                amqp_destroy_message(&message);
                            }
                        }
                        break;

                    case AMQP_CHANNEL_CLOSE_METHOD:
                        /* a channel.close method happens when a channel exception occurs,
                         * this can happen by publishing to an exchange that doesn't exist
                         * for example.
                         *
                         * In this case you would need to open another channel redeclare
                         * any queues that were declared auto-delete, and restart any
                         * consumers that were attached to the previous channel.
                         */
                        LOG (LL3, "recvived AMQP_CHANNEL_CLOSE method\n");

                        disconnectAMQP();
                        usleep(sleep_usec);
                        while ((status = connectAMQP()) != 0) {
                            LOG (LL3, "connect amqp error [%d]\n", status);
                            usleep(sleep_usec);
                        }
                        LOG (LL1, "amqp reconnectioned!!!!\n");
                        break;

                    case AMQP_CONNECTION_CLOSE_METHOD:
                        /* a connection.close method happens when a connection exception
                         * occurs, this can happen by trying to use a channel that isn't
                         * open for example.
                         *
                         * In this case the whole connection must be restarted.
                         */
                        LOG (LL3, "received AMQP_CONNECTION_CLOSE method\n");

                        disconnectAMQP();
                        usleep(sleep_usec);
                        while ((status = connectAMQP()) != 0) {
                            LOG (LL3, "connect amqp error [%d]\n", status);
                            usleep(sleep_usec);
                        }
                        LOG (LL1, "amqp reconnected!!!!\n");
                        break;

                    default:
                        LOG(LL3, "An unexpected method was received %u\n", frame.payload.method.id);
                        run = 0;
                        break;
                    }
                }
            }
        }
        else {
            if (envelope.message.body.len > 0) {
                snprintf(sTagName, sizeof(sTagName), "%.*s",
                         (int)envelope.routing_key.len, (char *)envelope.routing_key.bytes);

                char *p = strchr(sTagName, '.');
                if (p != NULL) p++;
                if (p != NULL) {
                    struct tag_val *t_val;

                    t_val = (struct tag_val *)envelope.message.body.bytes;
                    insertTagData(p, t_val);
                }
            }

            amqp_destroy_envelope(&envelope);
        }
    }

    raise(SIGTERM);

    return NULL;
}

int
connectAMQP(void)
{
    int status;
    struct timeval tv;

    amqp_rpc_reply_t rpc_reply;
    amqp_queue_declare_ok_t *r;

    /*
     * create amqp connection
     */
    amqp_conn = amqp_new_connection();

    /*
     * create amqp socket
     */
    amqp_socket = amqp_tcp_socket_new(amqp_conn);
    if (!amqp_socket) {
        disconnectAMQP();

        LOG (LL3, "amqp socket creation error\n");
        return -1;
    }

    /*
     * open amqp socket
     */
    tv.tv_sec = config.amqp_timeout;
    tv.tv_usec = 0;
    status = amqp_socket_open_noblock(amqp_socket, config.amqp_host, config.amqp_port, &tv);
    if (status != AMQP_STATUS_OK) {
        disconnectAMQP();

        LOG (LL3, "amqp socket open error\n");

        return -2;
    }

    /*
     * login amqp connection
     */
    rpc_reply = amqp_login(amqp_conn, "/", 0, 131072, 0, AMQP_SASL_METHOD_PLAIN, config.amqp_user, config.amqp_pwd);
    if (rpc_reply.reply_type != AMQP_RESPONSE_NORMAL) {
        disconnectAMQP();

        LOG (LL3, "amqp login error\n");

        return -3;
    }

    /*
     * open amqp channel
     */
    amqp_channel = 1;
    amqp_channel_open(amqp_conn, amqp_channel);
    rpc_reply = amqp_get_rpc_reply(amqp_conn);
    if (rpc_reply.reply_type != AMQP_RESPONSE_NORMAL) {
        disconnectAMQP();

        LOG (LL3, "amqp channel open error\n");

	return -4;
    }

    /*
     *  declare amqp queue
     */
    amqp_boolean_t passive = 0;
    amqp_boolean_t durable = 0;
    amqp_boolean_t exclusive = 0;
    amqp_boolean_t auto_delete = 1;
    amqp_boolean_t no_local = 0;
    amqp_boolean_t no_ack = 1;
    r = amqp_queue_declare(amqp_conn, amqp_channel, amqp_empty_bytes,
                           passive, durable, exclusive, auto_delete,
                           amqp_empty_table);
    rpc_reply = amqp_get_rpc_reply(amqp_conn);
    if (rpc_reply.reply_type != AMQP_RESPONSE_NORMAL) {
        disconnectAMQP();
        LOG (LL3, "amqp queue declare error\n");
        return -5;
    }

    amqp_queuename = amqp_bytes_malloc_dup(r->queue);
    if (amqp_queuename.bytes == NULL) {
        disconnectAMQP();

        LOG (LL3, "amqp queue name copy error\n");
        return -6;
    }

    /*
     * bind queue with amqp connection channel
     */
    LOG (LL1, "exchange = %s, bind = %s\n", config.amqp_exchange_sub, config.amqp_bindkey_sub);
    amqp_queue_bind(amqp_conn, amqp_channel, amqp_queuename,
                    amqp_cstring_bytes(config.amqp_exchange_sub),
                    amqp_cstring_bytes(config.amqp_bindkey_sub), amqp_empty_table);
    rpc_reply = amqp_get_rpc_reply(amqp_conn);
    if (rpc_reply.reply_type != AMQP_RESPONSE_NORMAL) {
        disconnectAMQP();

        LOG (LL3, "amqp queue bind error\n");
        return -7;
    }

    /*
     * consume amqp queue
     */
    amqp_basic_consume(amqp_conn, amqp_channel, amqp_queuename, amqp_empty_bytes,
                       no_local, no_ack, exclusive, amqp_empty_table);
    rpc_reply = amqp_get_rpc_reply(amqp_conn);
    if (rpc_reply.reply_type != AMQP_RESPONSE_NORMAL) {
        disconnectAMQP();

        LOG (LL3, "amqp queue consume error\n");
        return -8;
    }

    return 0;
}

int
disconnectAMQP(void)
{
    /*
     * free queue name memory
     */
    if (amqp_queuename.bytes != NULL) {
        amqp_bytes_free(amqp_queuename);
        amqp_queuename.bytes = NULL;
    }

    /*
     * close amqp channel
     */
    amqp_channel_close(amqp_conn, amqp_channel, AMQP_REPLY_SUCCESS);

    /*
     * close amqp connection
     */
    amqp_connection_close(amqp_conn, AMQP_REPLY_SUCCESS);

    /*
     * free amqp connection memory
     */
    amqp_destroy_connection(amqp_conn);

    if (amqp_socket != NULL) amqp_socket = NULL;
    if (amqp_conn != NULL) amqp_conn = NULL;

    return 0;
}
