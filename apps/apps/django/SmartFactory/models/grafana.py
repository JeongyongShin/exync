# This is an auto-generated Django model module.
# You'll have to do the following manually to clean this up:
#   * Rearrange models' order
#   * Make sure each model has one field with primary_key=True
#   * Make sure each ForeignKey and OneToOneField has `on_delete` set to the desired behavior
#   * Remove `managed = False` lines if you wish to allow Django to create, modify, and delete the table
# Feel free to rename the models, but don't rename db_table values or field names.
from django.db import models


class Alert(models.Model):
    id = models.BigAutoField(primary_key=True)
    version = models.BigIntegerField()
    dashboard_id = models.BigIntegerField()
    panel_id = models.BigIntegerField()
    org_id = models.BigIntegerField()
    name = models.CharField(max_length=255)
    message = models.TextField()
    state = models.CharField(max_length=190)
    settings = models.TextField(blank=True, null=True)
    frequency = models.BigIntegerField()
    handler = models.BigIntegerField()
    severity = models.TextField()
    silenced = models.IntegerField()
    execution_error = models.TextField()
    eval_data = models.TextField(blank=True, null=True)
    eval_date = models.DateTimeField(blank=True, null=True)
    new_state_date = models.DateTimeField()
    state_changes = models.IntegerField()
    created = models.DateTimeField()
    updated = models.DateTimeField()
    for_field = models.BigIntegerField(db_column='for', blank=True, null=True)  # Field renamed because it was a Python reserved word.

    class Meta:
        managed = False
        db_table = 'alert'


class AlertNotification(models.Model):
    id = models.BigAutoField(primary_key=True)
    org_id = models.BigIntegerField()
    name = models.CharField(max_length=190)
    type = models.CharField(max_length=255)
    settings = models.TextField()
    created = models.DateTimeField()
    updated = models.DateTimeField()
    is_default = models.IntegerField()
    frequency = models.BigIntegerField(blank=True, null=True)
    send_reminder = models.IntegerField(blank=True, null=True)
    disable_resolve_message = models.IntegerField()
    uid = models.CharField(max_length=40, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'alert_notification'
        unique_together = (('org_id', 'uid'),)


class AlertNotificationState(models.Model):
    id = models.BigAutoField(primary_key=True)
    org_id = models.BigIntegerField()
    alert_id = models.BigIntegerField()
    notifier_id = models.BigIntegerField()
    state = models.CharField(max_length=50)
    version = models.BigIntegerField()
    updated_at = models.BigIntegerField()
    alert_rule_state_updated_version = models.BigIntegerField()

    class Meta:
        managed = False
        db_table = 'alert_notification_state'
        unique_together = (('org_id', 'alert_id', 'notifier_id'),)


class AlertRuleTag(models.Model):
    alert_id = models.BigIntegerField()
    tag_id = models.BigIntegerField()

    class Meta:
        managed = False
        db_table = 'alert_rule_tag'
        unique_together = (('alert_id', 'tag_id'),)


class Annotation(models.Model):
    id = models.BigAutoField(primary_key=True)
    org_id = models.BigIntegerField()
    alert_id = models.BigIntegerField(blank=True, null=True)
    user_id = models.BigIntegerField(blank=True, null=True)
    dashboard_id = models.BigIntegerField(blank=True, null=True)
    panel_id = models.BigIntegerField(blank=True, null=True)
    category_id = models.BigIntegerField(blank=True, null=True)
    type = models.CharField(max_length=25)
    title = models.TextField()
    text = models.TextField()
    metric = models.CharField(max_length=255, blank=True, null=True)
    prev_state = models.CharField(max_length=25)
    new_state = models.CharField(max_length=25)
    data = models.TextField()
    epoch = models.BigIntegerField()
    region_id = models.BigIntegerField(blank=True, null=True)
    tags = models.CharField(max_length=500, blank=True, null=True)
    created = models.BigIntegerField(blank=True, null=True)
    updated = models.BigIntegerField(blank=True, null=True)
    epoch_end = models.BigIntegerField()

    class Meta:
        managed = False
        db_table = 'annotation'


class AnnotationTag(models.Model):
    annotation_id = models.BigIntegerField()
    tag_id = models.BigIntegerField()

    class Meta:
        managed = False
        db_table = 'annotation_tag'
        unique_together = (('annotation_id', 'tag_id'),)


class ApiKey(models.Model):
    id = models.BigAutoField(primary_key=True)
    org_id = models.BigIntegerField()
    name = models.CharField(max_length=190)
    key = models.CharField(unique=True, max_length=190)
    role = models.CharField(max_length=255)
    created = models.DateTimeField()
    updated = models.DateTimeField()
    expires = models.BigIntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'api_key'
        unique_together = (('org_id', 'name'),)


class CacheData(models.Model):
    cache_key = models.CharField(primary_key=True, max_length=168)
    data = models.TextField()
    expires = models.IntegerField()
    created_at = models.IntegerField()

    class Meta:
        managed = False
        db_table = 'cache_data'


class Dashboard(models.Model):
    id = models.BigAutoField(primary_key=True)
    version = models.IntegerField()
    slug = models.CharField(max_length=189)
    title = models.CharField(max_length=189)
    data = models.TextField()
    org_id = models.BigIntegerField()
    created = models.DateTimeField()
    updated = models.DateTimeField()
    updated_by = models.IntegerField(blank=True, null=True)
    created_by = models.IntegerField(blank=True, null=True)
    gnet_id = models.BigIntegerField(blank=True, null=True)
    plugin_id = models.CharField(max_length=189, blank=True, null=True)
    folder_id = models.BigIntegerField()
    is_folder = models.IntegerField()
    has_acl = models.IntegerField()
    uid = models.CharField(max_length=40, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'dashboard'
        unique_together = (('org_id', 'uid'), ('org_id', 'folder_id', 'title'),)


class DashboardAcl(models.Model):
    id = models.BigAutoField(primary_key=True)
    org_id = models.BigIntegerField()
    dashboard_id = models.BigIntegerField()
    user_id = models.BigIntegerField(blank=True, null=True)
    team_id = models.BigIntegerField(blank=True, null=True)
    permission = models.SmallIntegerField()
    role = models.CharField(max_length=20, blank=True, null=True)
    created = models.DateTimeField()
    updated = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'dashboard_acl'
        unique_together = (('dashboard_id', 'user_id'), ('dashboard_id', 'team_id'),)


class DashboardProvisioning(models.Model):
    id = models.BigAutoField(primary_key=True)
    dashboard_id = models.BigIntegerField(blank=True, null=True)
    name = models.CharField(max_length=150)
    external_id = models.TextField()
    updated = models.IntegerField()
    check_sum = models.CharField(max_length=32, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'dashboard_provisioning'


class DashboardSnapshot(models.Model):
    id = models.BigAutoField(primary_key=True)
    name = models.CharField(max_length=255)
    key = models.CharField(unique=True, max_length=190)
    delete_key = models.CharField(unique=True, max_length=190)
    org_id = models.BigIntegerField()
    user_id = models.BigIntegerField()
    external = models.IntegerField()
    external_url = models.CharField(max_length=255)
    dashboard = models.TextField()
    expires = models.DateTimeField()
    created = models.DateTimeField()
    updated = models.DateTimeField()
    external_delete_url = models.CharField(max_length=255, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'dashboard_snapshot'


class DashboardTag(models.Model):
    id = models.BigAutoField(primary_key=True)
    dashboard_id = models.BigIntegerField()
    term = models.CharField(max_length=50)

    class Meta:
        managed = False
        db_table = 'dashboard_tag'


class DashboardVersion(models.Model):
    id = models.BigAutoField(primary_key=True)
    dashboard_id = models.BigIntegerField()
    parent_version = models.IntegerField()
    restored_from = models.IntegerField()
    version = models.IntegerField()
    created = models.DateTimeField()
    created_by = models.BigIntegerField()
    message = models.TextField()
    data = models.TextField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'dashboard_version'
        unique_together = (('dashboard_id', 'version'),)


class DataSource(models.Model):
    id = models.BigAutoField(primary_key=True)
    org_id = models.BigIntegerField()
    version = models.IntegerField()
    type = models.CharField(max_length=255)
    name = models.CharField(max_length=190)
    access = models.CharField(max_length=255)
    url = models.CharField(max_length=255)
    password = models.CharField(max_length=255, blank=True, null=True)
    user = models.CharField(max_length=255, blank=True, null=True)
    database = models.CharField(max_length=255, blank=True, null=True)
    basic_auth = models.IntegerField()
    basic_auth_user = models.CharField(max_length=255, blank=True, null=True)
    basic_auth_password = models.CharField(max_length=255, blank=True, null=True)
    is_default = models.IntegerField()
    json_data = models.TextField(blank=True, null=True)
    created = models.DateTimeField()
    updated = models.DateTimeField()
    with_credentials = models.IntegerField()
    secure_json_data = models.TextField(blank=True, null=True)
    read_only = models.IntegerField(blank=True, null=True)
    uid = models.CharField(max_length=40)

    class Meta:
        managed = False
        db_table = 'data_source'
        unique_together = (('org_id', 'name'), ('org_id', 'uid'),)


class LoginAttempt(models.Model):
    id = models.BigAutoField(primary_key=True)
    username = models.CharField(max_length=190)
    ip_address = models.CharField(max_length=30)
    created = models.IntegerField()

    class Meta:
        managed = False
        db_table = 'login_attempt'


class MigrationLog(models.Model):
    id = models.BigAutoField(primary_key=True)
    migration_id = models.CharField(max_length=255)
    sql = models.TextField()
    success = models.IntegerField()
    error = models.TextField()
    timestamp = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'migration_log'


class Org(models.Model):
    id = models.BigAutoField(primary_key=True)
    version = models.IntegerField()
    name = models.CharField(unique=True, max_length=190)
    address1 = models.CharField(max_length=255, blank=True, null=True)
    address2 = models.CharField(max_length=255, blank=True, null=True)
    city = models.CharField(max_length=255, blank=True, null=True)
    state = models.CharField(max_length=255, blank=True, null=True)
    zip_code = models.CharField(max_length=50, blank=True, null=True)
    country = models.CharField(max_length=255, blank=True, null=True)
    billing_email = models.CharField(max_length=255, blank=True, null=True)
    created = models.DateTimeField()
    updated = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'org'


class OrgUser(models.Model):
    id = models.BigAutoField(primary_key=True)
    org_id = models.BigIntegerField()
    user_id = models.BigIntegerField()
    role = models.CharField(max_length=20)
    created = models.DateTimeField()
    updated = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'org_user'
        unique_together = (('org_id', 'user_id'),)


class Playlist(models.Model):
    id = models.BigAutoField(primary_key=True)
    name = models.CharField(max_length=255)
    interval = models.CharField(max_length=255)
    org_id = models.BigIntegerField()

    class Meta:
        managed = False
        db_table = 'playlist'


class PlaylistItem(models.Model):
    id = models.BigAutoField(primary_key=True)
    playlist_id = models.BigIntegerField()
    type = models.CharField(max_length=255)
    value = models.TextField()
    title = models.TextField()
    order = models.IntegerField()

    class Meta:
        managed = False
        db_table = 'playlist_item'


class PluginSetting(models.Model):
    id = models.BigAutoField(primary_key=True)
    org_id = models.BigIntegerField(blank=True, null=True)
    plugin_id = models.CharField(max_length=190)
    enabled = models.IntegerField()
    pinned = models.IntegerField()
    json_data = models.TextField(blank=True, null=True)
    secure_json_data = models.TextField(blank=True, null=True)
    created = models.DateTimeField()
    updated = models.DateTimeField()
    plugin_version = models.CharField(max_length=50, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'plugin_setting'
        unique_together = (('org_id', 'plugin_id'),)


class Preferences(models.Model):
    id = models.BigAutoField(primary_key=True)
    org_id = models.BigIntegerField()
    user_id = models.BigIntegerField()
    version = models.IntegerField()
    home_dashboard_id = models.BigIntegerField()
    timezone = models.CharField(max_length=50)
    theme = models.CharField(max_length=20)
    created = models.DateTimeField()
    updated = models.DateTimeField()
    team_id = models.BigIntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'preferences'


class Quota(models.Model):
    id = models.BigAutoField(primary_key=True)
    org_id = models.BigIntegerField(blank=True, null=True)
    user_id = models.BigIntegerField(blank=True, null=True)
    target = models.CharField(max_length=190)
    limit = models.BigIntegerField()
    created = models.DateTimeField()
    updated = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'quota'
        unique_together = (('org_id', 'user_id', 'target'),)


class ServerLock(models.Model):
    id = models.BigAutoField(primary_key=True)
    operation_uid = models.CharField(unique=True, max_length=100)
    version = models.BigIntegerField()
    last_execution = models.BigIntegerField()

    class Meta:
        managed = False
        db_table = 'server_lock'


class Session(models.Model):
    key = models.CharField(primary_key=True, max_length=16)
    data = models.TextField()
    expiry = models.IntegerField()

    class Meta:
        managed = False
        db_table = 'session'


class Star(models.Model):
    id = models.BigAutoField(primary_key=True)
    user_id = models.BigIntegerField()
    dashboard_id = models.BigIntegerField()

    class Meta:
        managed = False
        db_table = 'star'
        unique_together = (('user_id', 'dashboard_id'),)


class Tag(models.Model):
    id = models.BigAutoField(primary_key=True)
    key = models.CharField(max_length=100)
    value = models.CharField(max_length=100)

    class Meta:
        managed = False
        db_table = 'tag'
        unique_together = (('key', 'value'),)


class Team(models.Model):
    id = models.BigAutoField(primary_key=True)
    name = models.CharField(max_length=190)
    org_id = models.BigIntegerField()
    created = models.DateTimeField()
    updated = models.DateTimeField()
    email = models.CharField(max_length=190, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'team'
        unique_together = (('org_id', 'name'),)


class TeamMember(models.Model):
    id = models.BigAutoField(primary_key=True)
    org_id = models.BigIntegerField()
    team_id = models.BigIntegerField()
    user_id = models.BigIntegerField()
    created = models.DateTimeField()
    updated = models.DateTimeField()
    external = models.IntegerField(blank=True, null=True)
    permission = models.SmallIntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'team_member'
        unique_together = (('org_id', 'team_id', 'user_id'),)


class TempUser(models.Model):
    id = models.BigAutoField(primary_key=True)
    org_id = models.BigIntegerField()
    version = models.IntegerField()
    email = models.CharField(max_length=190)
    name = models.CharField(max_length=255, blank=True, null=True)
    role = models.CharField(max_length=20, blank=True, null=True)
    code = models.CharField(max_length=190)
    status = models.CharField(max_length=20)
    invited_by_user_id = models.BigIntegerField(blank=True, null=True)
    email_sent = models.IntegerField()
    email_sent_on = models.DateTimeField(blank=True, null=True)
    remote_addr = models.CharField(max_length=255, blank=True, null=True)
    created = models.DateTimeField()
    updated = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'temp_user'


class TestData(models.Model):
    metric1 = models.CharField(max_length=20, blank=True, null=True)
    metric2 = models.CharField(max_length=150, blank=True, null=True)
    value_big_int = models.BigIntegerField(blank=True, null=True)
    value_double = models.FloatField(blank=True, null=True)
    value_float = models.FloatField(blank=True, null=True)
    value_int = models.IntegerField(blank=True, null=True)
    time_epoch = models.BigIntegerField()
    time_date_time = models.DateTimeField()
    time_time_stamp = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'test_data'


class User(models.Model):
    id = models.BigAutoField(primary_key=True)
    version = models.IntegerField()
    login = models.CharField(unique=True, max_length=190)
    email = models.CharField(unique=True, max_length=190)
    name = models.CharField(max_length=255, blank=True, null=True)
    password = models.CharField(max_length=255, blank=True, null=True)
    salt = models.CharField(max_length=50, blank=True, null=True)
    rands = models.CharField(max_length=50, blank=True, null=True)
    company = models.CharField(max_length=255, blank=True, null=True)
    org_id = models.BigIntegerField()
    is_admin = models.IntegerField()
    email_verified = models.IntegerField(blank=True, null=True)
    theme = models.CharField(max_length=255, blank=True, null=True)
    created = models.DateTimeField()
    updated = models.DateTimeField()
    help_flags1 = models.BigIntegerField()
    last_seen_at = models.DateTimeField(blank=True, null=True)
    is_disabled = models.IntegerField()

    class Meta:
        managed = False
        db_table = 'user'


class UserAuth(models.Model):
    id = models.BigAutoField(primary_key=True)
    user_id = models.BigIntegerField()
    auth_module = models.CharField(max_length=190)
    auth_id = models.CharField(max_length=190, blank=True, null=True)
    created = models.DateTimeField()
    o_auth_access_token = models.TextField(blank=True, null=True)
    o_auth_refresh_token = models.TextField(blank=True, null=True)
    o_auth_token_type = models.TextField(blank=True, null=True)
    o_auth_expiry = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'user_auth'


class UserAuthToken(models.Model):
    id = models.BigAutoField(primary_key=True)
    user_id = models.BigIntegerField()
    auth_token = models.CharField(unique=True, max_length=100)
    prev_auth_token = models.CharField(unique=True, max_length=100)
    user_agent = models.CharField(max_length=255)
    client_ip = models.CharField(max_length=255)
    auth_token_seen = models.IntegerField()
    seen_at = models.IntegerField(blank=True, null=True)
    rotated_at = models.IntegerField()
    created_at = models.IntegerField()
    updated_at = models.IntegerField()

    class Meta:
        managed = False
        db_table = 'user_auth_token'
