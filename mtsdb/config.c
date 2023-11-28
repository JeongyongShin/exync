#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <ctype.h>
#include <libgen.h>
#include <cjson/cJSON.h>

#include "config.h"
#include "decrypt.h"

int
load_config(config_t *config)
{
    FILE *f = NULL;
    long len = 0;
    char *jsonData = NULL;

    /*
     * split config directory
     */
    snprintf(config->cfg_dir, sizeof(config->cfg_dir), "%s", dirname(strdup(config->cfg_path)));

    /*
     * open config file
     */
    f = fopen(config->cfg_path, "rb");
    if (f == NULL) {
        return -1;
    }

    fseek(f, 0, SEEK_END);
    len = ftell(f);
    fseek(f, 0, SEEK_SET);

    jsonData = (char *)malloc(len + 1);
    if (jsonData == NULL) {
        return -2;
    }

    fread(jsonData, 1, len, f);
    jsonData[len] = '\0';
    fclose(f);

    /*
     * parse config json
     */
    cJSON *root = cJSON_Parse((const char *)jsonData);
    cJSON *parent;
    cJSON *child;

    /*
     * parsing logging configration
     */
    parent = cJSON_GetObjectItem(root, "LOG_INFO");
    if (parent != NULL) {
        child = cJSON_GetObjectItem(parent, "PATH");
        if (child != NULL) {
            snprintf(config->log_path, sizeof(config->log_path), "%s", child->valuestring);
        }

        child = cJSON_GetObjectItem(parent, "PREFIX");
        if (child != NULL) {
            snprintf(config->log_prefix, sizeof(config->log_prefix), "%s", child->valuestring);
        }

        child = cJSON_GetObjectItem(parent, "FLAG");
        if (child != NULL) {
            snprintf(config->log_flag, sizeof(config->log_flag), "%s", child->valuestring);
        }

        child = cJSON_GetObjectItem(parent, "LEVEL");
        if (child != NULL) {
            snprintf(config->log_level, sizeof(config->log_level), "%s", child->valuestring);
        }
    }
   
    /*
     * parsing amqp configration
     */
    parent = cJSON_GetObjectItem(root, "AMQP_INFO");
    if (parent != NULL) {
        child = cJSON_GetObjectItem(parent, "HOST");
        if (child != NULL) {
            snprintf(config->amqp_host, sizeof(config->amqp_host), "%s", child->valuestring);
        }

        child = cJSON_GetObjectItem(parent, "PORT");
        if (child != NULL) {
            config->amqp_port = child->valueint;
        }

        child = cJSON_GetObjectItem(parent, "USER");
        if (child != NULL) {
            snprintf(config->amqp_user, sizeof(config->amqp_user), "%s", child->valuestring);
        }

        child = cJSON_GetObjectItem(parent, "PWD_FILE");
        if (child != NULL) {
            char pwd_path[MAX_LBUF_SIZE + 1];

            snprintf(config->amqp_pwd_file, sizeof(config->amqp_pwd_file), "%s", child->valuestring);

            snprintf(pwd_path, sizeof(pwd_path), "%s/security/%s", config->cfg_dir, config->amqp_pwd_file);
            decode_aes_256_cbc (pwd_path, config->amqp_pwd, sizeof(config->amqp_pwd));
        }

        child = cJSON_GetObjectItem(parent, "EXCHANGE_SUB");
        if (child != NULL) {
            snprintf(config->amqp_exchange_sub, sizeof(config->amqp_exchange_sub), "%s", child->valuestring);
        }

        child = cJSON_GetObjectItem(parent, "BINDKEY_SUB");
        if (child != NULL) {
            snprintf(config->amqp_bindkey_sub, sizeof(config->amqp_bindkey_sub), "%s", child->valuestring);
        }

        child = cJSON_GetObjectItem(parent, "TIMEOUT");
        if (child != NULL) {
            config->amqp_timeout = child->valueint;
        }
    }

    /*
     * parsing report configration
     */
    config->report_interval = 5;
    parent = cJSON_GetObjectItem(root, "REPORT_INFO");
    if (parent != NULL) {
        child = cJSON_GetObjectItem(parent, "INTERVAL");
        if (child != NULL) {
            config->report_interval = child->valueint;
        }
    }

    /*
     * parsing tsdb configration
     */
    parent = cJSON_GetObjectItem(root, "TSDB_INFO");
    if (parent != NULL) {
        child = cJSON_GetObjectItem(parent, "HOST");
        if (child != NULL) {
            snprintf(config->tsdb_host, sizeof(config->tsdb_host), "%s", child->valuestring);
        }

        child = cJSON_GetObjectItem(parent, "PORT");
        if (child != NULL) {
            config->tsdb_port = child->valueint;
        }

        child = cJSON_GetObjectItem(parent, "UID");
        if (child != NULL) {
            snprintf(config->tsdb_uid, sizeof(config->tsdb_uid), "%s", child->valuestring);
        }

        child = cJSON_GetObjectItem(parent, "PWD_FILE");
        if (child != NULL) {
            char pwd_path[MAX_LBUF_SIZE + 1];

            snprintf(config->tsdb_pwd_file, sizeof(config->tsdb_pwd_file), "%s", child->valuestring);

            snprintf(pwd_path, sizeof(pwd_path), "%s/security/%s", config->cfg_dir, config->tsdb_pwd_file);
            decode_aes_256_cbc (pwd_path, config->tsdb_pwd, sizeof(config->tsdb_pwd));
        }
    }

    if (jsonData != NULL) {
        free (jsonData);
    }

    return 0;
}
