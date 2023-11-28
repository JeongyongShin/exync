# This is an auto-generated Django model module.
# You'll have to do the following manually to clean this up:
#   * Rearrange models' order
#   * Make sure each model has one field with primary_key=True
#   * Make sure each ForeignKey and OneToOneField has `on_delete` set to the desired behavior
#   * Remove `managed = False` lines if you wish to allow Django to create, modify, and delete the table
# Feel free to rename the models, but don't rename db_table values or field names.
from django.db import models


class Base(models.Model):
    baseCd = models.CharField(db_column='BASE_CD', primary_key=True, max_length=2)  # Field name made lowercase.
    baseNm = models.CharField(db_column='BASE_NM', max_length=100)  # Field name made lowercase.
    name1 = models.CharField(db_column='NAME1', max_length=100, blank=True, null=True)  # Field name made lowercase.
    name2 = models.CharField(db_column='NAME2', max_length=100, blank=True, null=True)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'BASE'


class Common(models.Model):
    baseCd = models.OneToOneField(Base, models.DO_NOTHING, db_column='BASE_CD', primary_key=True)  # Field name made lowercase.
    commCd = models.CharField(db_column='COMMON_CD', max_length=5)  # Field name made lowercase.
    commNm = models.CharField(db_column='COMMON_NM', max_length=100)  # Field name made lowercase.
    item1 = models.CharField(db_column='ITEM1', max_length=100)  # Field name made lowercase.
    item2 = models.CharField(db_column='ITEM2', max_length=100, blank=True, null=True)  # Field name made lowercase.
    item3 = models.CharField(db_column='ITEM3', max_length=100, blank=True, null=True)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'COMMON'
        unique_together = (('baseCd', 'commCd'),)


class LoginLog(models.Model):
    no = models.AutoField(db_column='NO', primary_key=True)  # Field name made lowercase.
    userId = models.CharField(db_column='USER_ID', max_length=191)  # Field name made lowercase.
    ip = models.CharField(db_column='IP', max_length=15)  # Field name made lowercase.
    state = models.IntegerField(db_column='STATE')  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'LOG_LOGIN'


class Aasx(models.Model):
    aasxNo = models.BigAutoField(db_column='AASX_NO', primary_key=True)  # Field name made lowercase.
    aasxNm = models.CharField(db_column='AASX_NM', max_length=100)  # Field name made lowercase.
    userId = models.CharField(db_column='USER_ID', max_length=191)  # Field name made lowercase.
    imgUrl = models.CharField(db_column='IMAGE_URL', max_length=100)  # Field name made lowercase.
    version = models.CharField(db_column='VERSION', max_length=10)  # Field name made lowercase.
    desc = models.CharField(db_column='DESC', max_length=500)  # Field name made lowercase.
    createDte = models.DateTimeField(db_column='CREATE_DTE')  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'AASX'

class Eclass(models.Model):
    irid = models.CharField(db_column='IRID', primary_key=True, max_length=20)  # Field name made lowercase.
    type = models.CharField(db_column='TYPE', max_length=2)  # Field name made lowercase.
    pName = models.CharField(db_column='PREFERRED_NAME', max_length=100, blank=True, null=True)  # Field name made lowercase.
    deft = models.CharField(db_column='DEFINITION', max_length=2000, blank=True, null=True)  # Field name made lowercase.
    dType = models.CharField(db_column='DATA_TYPE', max_length=100, blank=True, null=True)  # Field name made lowercase.
    unit = models.CharField(db_column='UNIT', max_length=45, blank=True, null=True)  # Field name made lowercase.
    resol = models.CharField(db_column='RESOLUTION', max_length=45, blank=True, null=True)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'ECLASS'
