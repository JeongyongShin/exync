-- MariaDB dump 10.17  Distrib 10.5.5-MariaDB, for debian-linux-gnu (x86_64)
--
-- Host: localhost    Database: smartfactory
-- ------------------------------------------------------
-- Server version	10.5.5-MariaDB-1:10.5.5+maria~bionic

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Current Database: `smartfactory`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `smartfactory` /*!40100 DEFAULT CHARACTER SET utf8mb4 */;

USE `smartfactory`;

--
-- Table structure for table `AASX`
--
SET FOREIGN_KEY_CHECKS=0;
DROP TABLE IF EXISTS `AASX`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `AASX` (
  `AASX_NO` bigint(20) NOT NULL AUTO_INCREMENT,
  `USER_ID` varchar(255) NOT NULL,
  `AASX_NM` varchar(100) NOT NULL,
  `IMAGE_URL` varchar(100) DEFAULT NULL,
  `VERSION` varchar(10) NOT NULL,
  `DESC` varchar(500) NOT NULL,
  `CREATE_DTE` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`AASX_NO`)
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `AASX`
--

LOCK TABLES `AASX` WRITE;
/*!40000 ALTER TABLE `AASX` DISABLE KEYS */;
/*!40000 ALTER TABLE `AASX` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `BASE`
--

DROP TABLE IF EXISTS `BASE`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `BASE` (
  `BASE_CD` varchar(2) NOT NULL,
  `BASE_NM` varchar(100) NOT NULL,
  `NAME1` varchar(100) DEFAULT NULL,
  `NAME2` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`BASE_CD`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `BASE`
--

LOCK TABLES `BASE` WRITE;
/*!40000 ALTER TABLE `BASE` DISABLE KEYS */;
-- INSERT INTO `BASE` VALUES ('01','DASHBOARD URL',NULL,NULL);

UPDATE `BASE`
SET `BASE_NM` = 'DASHBOARD URL', `NAME1` = NULL, `NAME2` = NULL
WHERE `BASE_CD` = '01';

/*!40000 ALTER TABLE `BASE` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `COMMON`
--

DROP TABLE IF EXISTS `COMMON`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `COMMON` (
  `BASE_CD` varchar(2) NOT NULL,
  `COMMON_CD` varchar(5) NOT NULL,
  `COMMON_NM` varchar(100) NOT NULL,
  `ITEM1` varchar(100) NOT NULL,
  `ITEM2` varchar(100) DEFAULT NULL,
  `ITEM3` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`BASE_CD`,`COMMON_CD`),
  CONSTRAINT `BASE_COMMON_FK` FOREIGN KEY (`BASE_CD`) REFERENCES `BASE` (`BASE_CD`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `COMMON`
--

LOCK TABLES `COMMON` WRITE;
/*!40000 ALTER TABLE `COMMON` DISABLE KEYS */;
INSERT INTO `COMMON` VALUES ('01','00001','CLOUD MONITORING','/d/000000002/cloud-monitoring','3','5m'),('01','00002','DEVICE MONITORING','/playlists/play/1','5','1m'),('01','00003','HISTORY','/d/Jj_H_OIPDMH',NULL,NULL);
/*!40000 ALTER TABLE `COMMON` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ECLASS`
--

DROP TABLE IF EXISTS `ECLASS`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ECLASS` (
  `IRID` varchar(20) NOT NULL,
  `TYPE` char(2) NOT NULL DEFAULT '01',
  `PREFERRED_NAME` varchar(100) DEFAULT NULL,
  `SHORT_NAME` varchar(100) DEFAULT NULL,
  `DEFINITION` varchar(2000) DEFAULT NULL,
  `DATA_TYPE` varchar(100) DEFAULT NULL,
  `UNIT` varchar(45) DEFAULT NULL,
  `RESOLUTION` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`IRID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ECLASS`
--

LOCK TABLES `ECLASS` WRITE;
/*!40000 ALTER TABLE `ECLASS` DISABLE KEYS */;
/*!40000 ALTER TABLE `ECLASS` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `LOG_ALARM`
--

DROP TABLE IF EXISTS `LOG_ALARM`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `LOG_ALARM` (
  `NO` int(11) NOT NULL AUTO_INCREMENT,
  `CREATE_DTE` datetime NOT NULL DEFAULT current_timestamp(),
  `ALARM_DTE` datetime NOT NULL,
  `USER_ID` varchar(255) NOT NULL,
  `PHONE_NUMBER` varchar(15) NOT NULL,
  `LOCATION` varchar(100) NOT NULL,
  `TAG_ID` varchar(256) NOT NULL,
  `CODE` varchar(10) NOT NULL,
  `IMP` varchar(10) NOT NULL,
  `DESCRIPTION` varchar(1000) NOT NULL,
  PRIMARY KEY (`NO`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `LOG_ALARM`
--

LOCK TABLES `LOG_ALARM` WRITE;
/*!40000 ALTER TABLE `LOG_ALARM` DISABLE KEYS */;
/*!40000 ALTER TABLE `LOG_ALARM` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `LOG_LOGIN`
--

DROP TABLE IF EXISTS `LOG_LOGIN`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `LOG_LOGIN` (
  `NO` bigint(20) NOT NULL AUTO_INCREMENT,
  `USER_ID` varchar(255) NOT NULL,
  `CREATE_DTE` timestamp NOT NULL DEFAULT current_timestamp(),
  `IP` varchar(15) NOT NULL,
  `STATE` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`NO`)
) ENGINE=InnoDB AUTO_INCREMENT=35 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `LOG_LOGIN`
--

LOCK TABLES `LOG_LOGIN` WRITE;
/*!40000 ALTER TABLE `LOG_LOGIN` DISABLE KEYS */;
/*!40000 ALTER TABLE `LOG_LOGIN` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `TAG`
--

DROP TABLE IF EXISTS `TAG`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `TAG` (
  `TAG_ID` varchar(256) NOT NULL,
  `TAG_NAME` varchar(100) NOT NULL,
  `TAG_DESC` varchar(500) NOT NULL,
  `VALUE` varchar(100) DEFAULT NULL,
  `CREATE_DTE` timestamp NOT NULL DEFAULT current_timestamp(),
  `UPDATE_DTE` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`TAG_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `TAG`
--

LOCK TABLES `TAG` WRITE;
/*!40000 ALTER TABLE `TAG` DISABLE KEYS */;
/*!40000 ALTER TABLE `TAG` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `TAG_INFO`
--

DROP TABLE IF EXISTS `TAG_INFO`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `TAG_INFO` (
  `CREATE_DTE` timestamp NOT NULL DEFAULT current_timestamp(),
  `TAG_ID` varchar(256) NOT NULL,
  `VALUE` varchar(100) NOT NULL,
  PRIMARY KEY (`CREATE_DTE`,`TAG_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `TAG_INFO`
--

LOCK TABLES `TAG_INFO` WRITE;
/*!40000 ALTER TABLE `TAG_INFO` DISABLE KEYS */;
/*!40000 ALTER TABLE `TAG_INFO` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `account_user`
--

DROP TABLE IF EXISTS `account_user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `account_user` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `password` varchar(128) NOT NULL,
  `last_login` datetime(6) DEFAULT NULL,
  `user_id` varchar(255) NOT NULL,
  `phone_number` varchar(15) NOT NULL,
  `api_key` varchar(50) DEFAULT NULL,
  `api_expire_date` timestamp NULL DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL,
  `is_admin` tinyint(1) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `account_user`
--

LOCK TABLES `account_user` WRITE;
/*!40000 ALTER TABLE `account_user` DISABLE KEYS */;
/*!40000 ALTER TABLE `account_user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auth_group`
--

DROP TABLE IF EXISTS `auth_group`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `auth_group` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(150) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_group`
--

LOCK TABLES `auth_group` WRITE;
/*!40000 ALTER TABLE `auth_group` DISABLE KEYS */;
/*!40000 ALTER TABLE `auth_group` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auth_group_permissions`
--

DROP TABLE IF EXISTS `auth_group_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `auth_group_permissions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `group_id` int(11) NOT NULL,
  `permission_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `auth_group_permissions_group_id_permission_id_0cd325b0_uniq` (`group_id`,`permission_id`),
  KEY `auth_group_permissio_permission_id_84c5c92e_fk_auth_perm` (`permission_id`),
  CONSTRAINT `auth_group_permissio_permission_id_84c5c92e_fk_auth_perm` FOREIGN KEY (`permission_id`) REFERENCES `auth_permission` (`id`),
  CONSTRAINT `auth_group_permissions_group_id_b120cbf9_fk_auth_group_id` FOREIGN KEY (`group_id`) REFERENCES `auth_group` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_group_permissions`
--

LOCK TABLES `auth_group_permissions` WRITE;
/*!40000 ALTER TABLE `auth_group_permissions` DISABLE KEYS */;
/*!40000 ALTER TABLE `auth_group_permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auth_permission`
--

DROP TABLE IF EXISTS `auth_permission`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `auth_permission` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `content_type_id` int(11) NOT NULL,
  `codename` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `auth_permission_content_type_id_codename_01ab375a_uniq` (`content_type_id`,`codename`),
  CONSTRAINT `auth_permission_content_type_id_2f476e4b_fk_django_co` FOREIGN KEY (`content_type_id`) REFERENCES `django_content_type` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_permission`
--

LOCK TABLES `auth_permission` WRITE;
/*!40000 ALTER TABLE `auth_permission` DISABLE KEYS */;
/*!40000 ALTER TABLE `auth_permission` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `django_admin_log`
--

DROP TABLE IF EXISTS `django_admin_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `django_admin_log` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `action_time` datetime(6) NOT NULL,
  `object_id` longtext DEFAULT NULL,
  `object_repr` varchar(200) NOT NULL,
  `action_flag` smallint(5) unsigned NOT NULL CHECK (`action_flag` >= 0),
  `change_message` longtext NOT NULL,
  `content_type_id` int(11) DEFAULT NULL,
  `user_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `django_admin_log_content_type_id_c4bce8eb_fk_django_co` (`content_type_id`),
  KEY `django_admin_log_user_id_c564eba6_fk_account_user_id` (`user_id`),
  CONSTRAINT `django_admin_log_content_type_id_c4bce8eb_fk_django_co` FOREIGN KEY (`content_type_id`) REFERENCES `django_content_type` (`id`)

) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `django_admin_log`
--

LOCK TABLES `django_admin_log` WRITE;
/*!40000 ALTER TABLE `django_admin_log` DISABLE KEYS */;
/*!40000 ALTER TABLE `django_admin_log` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `django_content_type`
--

DROP TABLE IF EXISTS `django_content_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `django_content_type` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `app_label` varchar(100) NOT NULL,
  `model` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `django_content_type_app_label_model_76bd3d3b_uniq` (`app_label`,`model`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `django_content_type`
--

LOCK TABLES `django_content_type` WRITE;
/*!40000 ALTER TABLE `django_content_type` DISABLE KEYS */;
/*!40000 ALTER TABLE `django_content_type` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `django_migrations`
--

DROP TABLE IF EXISTS `django_migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `django_migrations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `app` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `applied` datetime(6) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `django_migrations`
--

LOCK TABLES `django_migrations` WRITE;
/*!40000 ALTER TABLE `django_migrations` DISABLE KEYS */;
/*!40000 ALTER TABLE `django_migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `django_session`
--

DROP TABLE IF EXISTS `django_session`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `django_session` (
  `session_key` varchar(40) NOT NULL,
  `session_data` longtext NOT NULL,
  `expire_date` datetime(6) NOT NULL,
  PRIMARY KEY (`session_key`),
  KEY `django_session_expire_date_a5c62663` (`expire_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `django_session`
--

LOCK TABLES `django_session` WRITE;
/*!40000 ALTER TABLE `django_session` DISABLE KEYS */;
/*!40000 ALTER TABLE `django_session` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2021-01-27 15:51:44

SET FOREIGN_KEY_CHECKS=1;

GRANT ALL PRIVILEGES ON smartfactory.* TO 'jy'@'localhost' IDENTIFIED BY 'cubgogo8';
FLUSH PRIVILEGES;


