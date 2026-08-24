-- MySQL dump 10.13  Distrib 8.0.19, for Win64 (x86_64)
--
-- Host: localhost    Database: edusphere
-- ------------------------------------------------------
-- Server version	8.0.45

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `academic_sessions`
--

DROP TABLE IF EXISTS `academic_sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `academic_sessions` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL COMMENT 'e.g. 2024-25, Spring 2025',
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `status` enum('upcoming','active','closing','completed') NOT NULL DEFAULT 'upcoming' COMMENT 'Session lifecycle: upcoming → active → closing → completed',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_session_name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `academic_sessions`
--

LOCK TABLES `academic_sessions` WRITE;
/*!40000 ALTER TABLE `academic_sessions` DISABLE KEYS */;
INSERT INTO `academic_sessions` VALUES (1,'2026','2026-01-01','2026-12-31','active','2026-05-25 09:01:35','2026-05-25 09:01:38'),(2,'2027','2027-01-01','2027-12-31','upcoming','2026-05-25 09:02:18','2026-05-25 09:02:18');
/*!40000 ALTER TABLE `academic_sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `attendance_records`
--

DROP TABLE IF EXISTS `attendance_records`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `attendance_records` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `attendance_session_id` int unsigned NOT NULL COMMENT 'Owned child — cascades when session header is deleted',
  `student_id` int unsigned NOT NULL COMMENT 'Historical record — never cascade-delete attendance facts',
  `status` enum('present','absent','late','leave') NOT NULL,
  `remarks` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_att_record_session_student` (`attendance_session_id`,`student_id`),
  KEY `idx_att_record_student` (`student_id`),
  CONSTRAINT `attendance_records_ibfk_1` FOREIGN KEY (`attendance_session_id`) REFERENCES `attendance_sessions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `attendance_records_ibfk_2` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=47 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `attendance_records`
--

LOCK TABLES `attendance_records` WRITE;
/*!40000 ALTER TABLE `attendance_records` DISABLE KEYS */;
INSERT INTO `attendance_records` VALUES (1,2,1,'late',NULL,'2026-07-08 09:46:26','2026-07-08 10:23:31'),(2,2,3,'absent',NULL,'2026-07-08 09:46:26','2026-07-08 10:23:31'),(3,2,6,'present',NULL,'2026-07-08 09:46:26','2026-07-08 10:23:31'),(4,2,7,'leave',NULL,'2026-07-08 09:46:26','2026-07-08 10:23:31'),(5,2,8,'present',NULL,'2026-07-08 09:46:26','2026-07-08 10:23:31'),(6,2,9,'late',NULL,'2026-07-08 09:46:26','2026-07-08 10:23:31'),(7,2,10,'absent',NULL,'2026-07-08 09:46:26','2026-07-08 10:23:31'),(22,2,81,'late',NULL,'2026-07-08 09:49:45','2026-07-08 10:23:31'),(23,2,83,'present',NULL,'2026-07-08 09:49:45','2026-07-08 10:23:31'),(24,2,86,'present',NULL,'2026-07-08 09:49:45','2026-07-08 10:23:31'),(25,2,93,'leave',NULL,'2026-07-08 09:49:45','2026-07-08 10:23:31'),(26,2,96,'late',NULL,'2026-07-08 09:49:45','2026-07-08 10:23:31'),(27,2,99,'absent',NULL,'2026-07-08 09:49:45','2026-07-08 10:23:31'),(28,2,101,'late',NULL,'2026-07-08 09:49:45','2026-07-08 10:23:31'),(29,2,104,'present',NULL,'2026-07-08 09:49:45','2026-07-08 10:23:31'),(30,2,105,'absent',NULL,'2026-07-08 09:49:45','2026-07-08 10:23:31');
/*!40000 ALTER TABLE `attendance_records` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `attendance_sessions`
--

DROP TABLE IF EXISTS `attendance_sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `attendance_sessions` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `campus_id` int unsigned NOT NULL,
  `session_id` int unsigned NOT NULL COMMENT 'Session the class belongs to, not the currently running calendar session',
  `class_group_id` int unsigned NOT NULL COMMENT 'Denormalized from section for efficient reporting queries',
  `section_id` int unsigned NOT NULL,
  `date` date NOT NULL,
  `marked_by` int unsigned DEFAULT NULL COMMENT 'User who submitted this register. Nullable: SET NULL if user account is deleted',
  `status` enum('draft','submitted') NOT NULL DEFAULT 'draft',
  `submitted_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_att_session_section_date` (`campus_id`,`session_id`,`section_id`,`date`),
  KEY `session_id` (`session_id`),
  KEY `idx_att_session_campus_date` (`campus_id`,`date`),
  KEY `idx_att_session_class_group` (`class_group_id`),
  KEY `idx_att_session_section` (`section_id`),
  KEY `idx_att_session_marked_by` (`marked_by`),
  CONSTRAINT `attendance_sessions_ibfk_1` FOREIGN KEY (`campus_id`) REFERENCES `campuses` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `attendance_sessions_ibfk_2` FOREIGN KEY (`session_id`) REFERENCES `academic_sessions` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `attendance_sessions_ibfk_3` FOREIGN KEY (`class_group_id`) REFERENCES `class_groups` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `attendance_sessions_ibfk_4` FOREIGN KEY (`section_id`) REFERENCES `sections` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `attendance_sessions_ibfk_5` FOREIGN KEY (`marked_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `attendance_sessions`
--

LOCK TABLES `attendance_sessions` WRITE;
/*!40000 ALTER TABLE `attendance_sessions` DISABLE KEYS */;
INSERT INTO `attendance_sessions` VALUES (1,1,1,6,6,'2026-07-08',1,'draft',NULL,'2026-07-08 09:04:04','2026-07-08 09:04:04'),(2,1,1,7,7,'2026-07-08',1,'submitted','2026-07-08 10:23:31','2026-07-08 09:17:12','2026-07-08 10:23:31');
/*!40000 ALTER TABLE `attendance_sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `campus_settings`
--

DROP TABLE IF EXISTS `campus_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `campus_settings` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `campus_id` int unsigned NOT NULL COMMENT 'One settings row per campus. Auto-created when a campus is created.',
  `logo_url` varchar(500) DEFAULT NULL,
  `tagline` varchar(255) DEFAULT NULL COMMENT 'Campus-specific motto or tagline for letterheads and report cards',
  `academic_year_start_month` tinyint DEFAULT NULL COMMENT 'Month number 1-12. NULL = inherit from school_settings.',
  `default_pass_percentage` decimal(5,2) DEFAULT NULL COMMENT 'NULL = inherit from school_settings.',
  `min_attendance_percentage` decimal(5,2) DEFAULT NULL COMMENT 'NULL = inherit from school_settings.',
  `working_days` json DEFAULT NULL COMMENT 'Array of lowercase day names e.g. ["monday","tuesday","wednesday","thursday","friday"]. NULL = default Mon-Fri assumed by application.',
  `school_start_time` time DEFAULT NULL,
  `school_end_time` time DEFAULT NULL,
  `late_arrival_minutes` smallint unsigned DEFAULT NULL COMMENT 'Minutes after school_start_time before a student is marked late. 0 = no grace period.',
  `max_students_per_section` smallint unsigned DEFAULT NULL COMMENT 'Default section capacity pre-filled when creating sections. Can be overridden per section.',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `campus_id` (`campus_id`),
  CONSTRAINT `campus_settings_ibfk_1` FOREIGN KEY (`campus_id`) REFERENCES `campuses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `campus_settings`
--

LOCK TABLES `campus_settings` WRITE;
/*!40000 ALTER TABLE `campus_settings` DISABLE KEYS */;
INSERT INTO `campus_settings` VALUES (1,1,NULL,NULL,NULL,NULL,NULL,'[\"wednesday\", \"thursday\", \"monday\", \"tuesday\", \"friday\", \"saturday\"]','07:00:00','01:45:00',NULL,NULL,'2026-05-05 06:57:09','2026-06-22 04:51:25'),(2,2,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-06-12 05:50:41','2026-06-12 05:50:41');
/*!40000 ALTER TABLE `campus_settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `campuses`
--

DROP TABLE IF EXISTS `campuses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `campuses` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(150) NOT NULL,
  `code` varchar(20) DEFAULT NULL COMMENT 'Short identifier e.g. CAMP-A',
  `address` text,
  `phone` varchar(20) DEFAULT NULL,
  `email` varchar(150) DEFAULT NULL,
  `is_active` tinyint NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  UNIQUE KEY `code_2` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `campuses`
--

LOCK TABLES `campuses` WRITE;
/*!40000 ALTER TABLE `campuses` DISABLE KEYS */;
INSERT INTO `campuses` VALUES (1,'Male Campus','KPS',NULL,NULL,NULL,1,'2026-05-05 06:57:09','2026-06-12 05:50:19'),(2,'Female Campus',NULL,NULL,NULL,NULL,1,'2026-06-12 05:50:41','2026-06-12 05:50:41');
/*!40000 ALTER TABLE `campuses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `class_groups`
--

DROP TABLE IF EXISTS `class_groups`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `class_groups` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `campus_id` int unsigned NOT NULL COMMENT 'Campus this class belongs to',
  `session_id` int unsigned NOT NULL COMMENT 'Academic session this class belongs to',
  `name` varchar(100) NOT NULL COMMENT 'e.g. Class 9, Grade 5 — unique per campus+session',
  `level` int unsigned NOT NULL COMMENT 'Numeric sort order for display ordering',
  `academic_level` enum('pre_primary','primary','middle','secondary','higher_secondary') NOT NULL COMMENT 'Educational band',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_class_campus_session_name` (`campus_id`,`session_id`,`name`),
  KEY `session_id` (`session_id`),
  CONSTRAINT `class_groups_ibfk_1` FOREIGN KEY (`campus_id`) REFERENCES `campuses` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `class_groups_ibfk_2` FOREIGN KEY (`session_id`) REFERENCES `academic_sessions` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `class_groups`
--

LOCK TABLES `class_groups` WRITE;
/*!40000 ALTER TABLE `class_groups` DISABLE KEYS */;
INSERT INTO `class_groups` VALUES (6,1,1,'3',6,'primary','2026-07-08 06:55:29','2026-07-13 08:09:11'),(7,1,1,'4',7,'primary','2026-07-08 06:55:29','2026-07-13 08:09:56'),(8,1,1,'5',8,'primary','2026-07-08 06:55:29','2026-07-13 08:10:23'),(9,1,1,'6',9,'middle','2026-07-08 06:55:29','2026-07-13 08:10:41'),(10,1,1,'7',10,'middle','2026-07-08 06:55:29','2026-07-13 08:10:55'),(11,1,1,'8',11,'middle','2026-07-08 06:55:29','2026-07-13 08:11:05'),(12,1,1,'9',12,'secondary','2026-07-08 06:55:29','2026-07-13 08:11:12'),(13,1,1,'10',13,'secondary','2026-07-08 06:55:29','2026-07-13 08:11:22');
/*!40000 ALTER TABLE `class_groups` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `class_teacher_assignments`
--

DROP TABLE IF EXISTS `class_teacher_assignments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `class_teacher_assignments` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `campus_id` int unsigned NOT NULL COMMENT 'Campus this assignment belongs to',
  `session_id` int unsigned NOT NULL COMMENT 'Sessions are historical records; RESTRICT prevents silent deletion of assignment history',
  `section_id` int unsigned NOT NULL COMMENT 'If a section is deleted, its assignments are meaningless',
  `staff_id` int unsigned NOT NULL COMMENT 'If a staff record is removed, their assignments go with them',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_cta_campus_session_section_staff` (`campus_id`,`session_id`,`section_id`,`staff_id`),
  KEY `session_id` (`session_id`),
  KEY `idx_cta_staff_id` (`staff_id`),
  KEY `idx_cta_campus_session` (`campus_id`,`session_id`),
  KEY `idx_cta_section_id` (`section_id`),
  CONSTRAINT `class_teacher_assignments_ibfk_1` FOREIGN KEY (`campus_id`) REFERENCES `campuses` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `class_teacher_assignments_ibfk_2` FOREIGN KEY (`session_id`) REFERENCES `academic_sessions` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `class_teacher_assignments_ibfk_3` FOREIGN KEY (`section_id`) REFERENCES `sections` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `class_teacher_assignments_ibfk_4` FOREIGN KEY (`staff_id`) REFERENCES `staff` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `class_teacher_assignments`
--

LOCK TABLES `class_teacher_assignments` WRITE;
/*!40000 ALTER TABLE `class_teacher_assignments` DISABLE KEYS */;
INSERT INTO `class_teacher_assignments` VALUES (2,1,1,7,6,'2026-07-08 09:05:21','2026-07-08 09:05:21'),(3,1,1,8,9,'2026-07-08 09:05:32','2026-07-08 09:05:32'),(4,1,1,9,12,'2026-07-08 09:05:40','2026-07-08 09:05:40'),(5,1,1,10,2,'2026-07-08 09:05:59','2026-07-08 09:05:59'),(6,1,1,13,3,'2026-07-08 09:06:21','2026-07-08 09:06:21'),(7,1,1,12,11,'2026-07-08 09:06:36','2026-07-08 09:06:36'),(8,1,1,11,10,'2026-07-08 09:06:54','2026-07-08 09:06:54'),(9,1,1,6,8,'2026-07-08 10:10:21','2026-07-08 10:10:21');
/*!40000 ALTER TABLE `class_teacher_assignments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `enrollments`
--

DROP TABLE IF EXISTS `enrollments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `enrollments` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `campus_id` int unsigned NOT NULL COMMENT 'Which campus this enrollment belongs to',
  `session_id` int unsigned NOT NULL COMMENT 'Academic session this enrollment belongs to',
  `class_group_id` int unsigned NOT NULL COMMENT 'Class (grade level) for this enrollment',
  `student_id` int unsigned NOT NULL,
  `section_id` int unsigned NOT NULL COMMENT 'Section is always required — every class has at least one section',
  `class_no` int unsigned NOT NULL COMMENT 'Auto-assigned by service as MAX(class_no)+1 within class at enrollment time',
  `status` enum('active','transferred','withdrawn') NOT NULL DEFAULT 'active' COMMENT 'active = attending; transferred = moved to another campus mid-session; withdrawn = left school',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_enrollment_class_no` (`campus_id`,`session_id`,`class_group_id`,`section_id`,`class_no`),
  UNIQUE KEY `uq_student_session_campus` (`student_id`,`session_id`,`campus_id`),
  KEY `idx_enrollment_campus_id` (`campus_id`),
  KEY `idx_enrollment_session_id` (`session_id`),
  KEY `idx_enrollment_student_id` (`student_id`),
  KEY `idx_enrollment_section_id` (`section_id`),
  KEY `idx_enrollment_class_group_id` (`class_group_id`),
  CONSTRAINT `enrollments_ibfk_1` FOREIGN KEY (`campus_id`) REFERENCES `campuses` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `enrollments_ibfk_2` FOREIGN KEY (`session_id`) REFERENCES `academic_sessions` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `enrollments_ibfk_3` FOREIGN KEY (`class_group_id`) REFERENCES `class_groups` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `enrollments_ibfk_4` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `enrollments_ibfk_5` FOREIGN KEY (`section_id`) REFERENCES `sections` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=184 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `enrollments`
--

LOCK TABLES `enrollments` WRITE;
/*!40000 ALTER TABLE `enrollments` DISABLE KEYS */;
INSERT INTO `enrollments` VALUES (1,1,1,7,1,7,1,'active','2026-05-11 04:57:00','2026-05-11 04:57:00'),(2,1,1,6,2,6,1,'active','2026-05-11 05:09:00','2026-05-11 05:09:00'),(3,1,1,7,3,7,2,'active','2026-05-11 05:11:00','2026-05-11 05:11:00'),(4,1,1,9,4,9,1,'active','2026-05-11 05:13:00','2026-05-11 05:13:00'),(5,1,1,9,5,9,2,'active','2026-05-11 05:15:00','2026-05-11 05:15:00'),(6,1,1,7,6,7,3,'active','2026-05-11 05:15:00','2026-05-11 05:15:00'),(7,1,1,7,7,7,4,'active','2026-05-11 05:19:00','2026-05-11 05:19:00'),(8,1,1,7,8,7,5,'active','2026-05-11 05:23:00','2026-05-11 05:23:00'),(9,1,1,7,9,7,6,'active','2026-05-11 05:26:00','2026-05-11 05:26:00'),(10,1,1,7,10,7,7,'active','2026-05-11 05:31:00','2026-05-11 05:31:00'),(11,1,1,9,11,9,3,'active','2026-05-11 05:32:00','2026-05-11 05:32:00'),(12,1,1,9,12,9,4,'active','2026-05-11 05:53:00','2026-05-11 05:53:00'),(13,1,1,6,13,6,2,'active','2026-05-11 05:53:00','2026-05-11 05:53:00'),(14,1,1,9,14,9,5,'active','2026-05-11 05:58:00','2026-05-11 05:58:00'),(15,1,1,13,15,16,1,'active','2026-05-11 06:01:00','2026-05-11 06:01:00'),(16,1,1,12,16,12,1,'active','2026-05-11 06:04:00','2026-05-11 06:04:00'),(17,1,1,12,17,12,2,'active','2026-05-11 06:07:00','2026-05-11 06:07:00'),(18,1,1,12,18,12,3,'active','2026-05-11 06:10:00','2026-05-11 06:10:00'),(19,1,1,12,19,12,4,'active','2026-05-11 06:15:00','2026-05-11 06:15:00'),(20,1,1,12,20,12,5,'active','2026-05-11 06:17:00','2026-05-11 06:17:00'),(21,1,1,12,21,12,6,'active','2026-05-11 06:21:00','2026-05-11 06:21:00'),(22,1,1,9,22,9,6,'active','2026-05-11 06:31:00','2026-05-11 06:31:00'),(23,1,1,9,23,9,7,'active','2026-05-11 06:34:00','2026-05-11 06:34:00'),(24,1,1,9,24,9,8,'active','2026-05-11 06:37:00','2026-05-11 06:37:00'),(25,1,1,9,25,9,9,'active','2026-05-11 06:43:00','2026-05-11 06:43:00'),(26,1,1,9,26,9,10,'active','2026-05-11 06:49:00','2026-05-11 06:49:00'),(27,1,1,9,27,9,11,'active','2026-05-11 06:53:00','2026-05-11 06:53:00'),(28,1,1,9,28,9,12,'active','2026-05-11 06:55:00','2026-05-11 06:55:00'),(29,1,1,9,29,9,13,'active','2026-05-11 06:59:00','2026-05-11 06:59:00'),(30,1,1,9,30,9,14,'active','2026-05-11 07:01:00','2026-05-11 07:01:00'),(31,1,1,6,31,6,3,'active','2026-05-11 07:16:00','2026-05-11 07:16:00'),(32,1,1,6,32,6,4,'active','2026-05-11 07:18:00','2026-05-11 07:18:00'),(33,1,1,13,33,16,2,'active','2026-05-11 07:21:00','2026-05-11 07:21:00'),(34,1,1,6,34,6,5,'active','2026-05-11 07:22:00','2026-05-11 07:22:00'),(35,1,1,6,35,6,6,'active','2026-05-11 07:24:00','2026-05-11 07:24:00'),(36,1,1,6,36,6,7,'active','2026-05-11 07:26:00','2026-05-11 07:26:00'),(37,1,1,13,37,16,3,'active','2026-05-11 07:27:00','2026-05-11 07:27:00'),(38,1,1,6,38,6,8,'active','2026-05-11 07:28:00','2026-05-11 07:28:00'),(39,1,1,13,39,16,4,'active','2026-05-11 07:31:00','2026-05-11 07:31:00'),(40,1,1,13,40,16,5,'active','2026-05-11 07:34:00','2026-05-11 07:34:00'),(41,1,1,6,41,6,9,'active','2026-05-11 07:37:00','2026-05-11 07:37:00'),(42,1,1,13,42,16,6,'active','2026-05-11 07:42:00','2026-05-11 07:42:00'),(43,1,1,10,43,10,1,'active','2026-05-11 07:55:00','2026-05-11 07:55:00'),(44,1,1,10,44,10,2,'active','2026-05-11 08:02:00','2026-05-11 08:02:00'),(45,1,1,10,45,10,3,'active','2026-05-11 08:06:00','2026-05-11 08:06:00'),(46,1,1,10,46,10,4,'active','2026-05-11 08:08:00','2026-05-11 08:08:00'),(47,1,1,8,47,8,1,'active','2026-05-11 08:36:00','2026-05-11 08:36:00'),(48,1,1,12,48,12,7,'active','2026-05-12 03:07:00','2026-05-12 03:07:00'),(49,1,1,8,49,8,2,'active','2026-05-12 03:09:00','2026-05-12 03:09:00'),(50,1,1,13,50,16,7,'active','2026-05-12 03:10:00','2026-05-12 03:10:00'),(51,1,1,12,51,12,8,'active','2026-05-12 03:11:00','2026-05-12 03:11:00'),(52,1,1,8,52,8,3,'active','2026-05-12 03:13:00','2026-05-12 03:13:00'),(53,1,1,13,53,16,8,'active','2026-05-12 03:13:00','2026-05-12 03:13:00'),(54,1,1,12,54,12,9,'active','2026-05-12 03:16:00','2026-05-12 03:16:00'),(55,1,1,13,55,16,9,'active','2026-05-12 03:17:00','2026-05-12 03:17:00'),(56,1,1,12,56,12,10,'active','2026-05-12 03:19:00','2026-05-12 03:19:00'),(57,1,1,13,57,16,10,'active','2026-05-12 03:20:00','2026-05-12 03:20:00'),(58,1,1,12,58,12,11,'active','2026-05-12 03:22:00','2026-05-12 03:22:00'),(59,1,1,8,59,8,4,'active','2026-05-12 03:23:00','2026-05-12 03:23:00'),(60,1,1,13,60,16,11,'active','2026-05-12 03:24:00','2026-05-12 03:24:00'),(61,1,1,13,61,16,12,'active','2026-05-12 03:26:00','2026-05-12 03:26:00'),(62,1,1,12,62,12,12,'active','2026-05-12 03:28:00','2026-05-12 03:28:00'),(63,1,1,8,63,8,5,'active','2026-05-12 03:28:00','2026-05-12 03:28:00'),(64,1,1,13,64,16,13,'active','2026-05-12 03:29:00','2026-05-12 03:29:00'),(65,1,1,12,65,12,13,'active','2026-05-12 03:31:00','2026-05-12 03:31:00'),(66,1,1,8,66,8,6,'active','2026-05-12 03:31:00','2026-05-12 03:31:00'),(67,1,1,13,67,16,14,'active','2026-05-12 03:31:00','2026-05-12 03:31:00'),(68,1,1,12,68,12,14,'active','2026-05-12 03:32:00','2026-05-12 03:32:00'),(69,1,1,12,69,12,15,'active','2026-05-12 03:34:00','2026-05-12 03:34:00'),(70,1,1,8,70,8,7,'active','2026-05-12 03:34:00','2026-05-12 03:34:00'),(71,1,1,13,71,16,15,'active','2026-05-12 03:34:00','2026-05-12 03:34:00'),(72,1,1,13,72,16,16,'active','2026-05-12 03:37:00','2026-05-12 03:37:00'),(73,1,1,8,73,8,8,'active','2026-05-12 03:37:00','2026-05-12 03:37:00'),(74,1,1,12,74,12,16,'active','2026-05-12 03:40:00','2026-05-12 03:40:00'),(75,1,1,13,75,16,17,'active','2026-05-12 03:40:00','2026-05-12 03:40:00'),(76,1,1,8,76,8,9,'active','2026-05-12 03:40:00','2026-05-12 03:40:00'),(77,1,1,13,77,16,18,'active','2026-05-12 03:42:00','2026-05-12 03:42:00'),(78,1,1,12,78,12,17,'active','2026-05-12 03:43:00','2026-05-12 03:43:00'),(79,1,1,11,79,11,1,'active','2026-05-12 03:48:00','2026-05-12 03:48:00'),(80,1,1,12,80,12,18,'active','2026-05-12 04:25:00','2026-05-12 04:25:00'),(81,1,1,7,81,7,8,'active','2026-05-12 04:26:00','2026-05-12 04:26:00'),(82,1,1,12,82,12,19,'active','2026-05-12 04:27:00','2026-05-12 04:27:00'),(83,1,1,7,83,7,9,'active','2026-05-12 04:29:00','2026-05-12 04:29:00'),(84,1,1,12,84,12,20,'active','2026-05-12 04:30:00','2026-05-12 04:30:00'),(85,1,1,13,85,16,19,'active','2026-05-12 04:30:00','2026-05-12 04:30:00'),(86,1,1,7,86,7,10,'active','2026-05-12 04:31:00','2026-05-12 04:31:00'),(88,1,1,12,88,12,21,'active','2026-05-12 04:34:00','2026-05-12 04:34:00'),(90,1,1,12,90,12,22,'active','2026-05-12 04:36:00','2026-05-12 04:36:00'),(91,1,1,13,91,13,1,'active','2026-05-12 04:36:00','2026-05-12 04:36:00'),(92,1,1,12,92,12,23,'active','2026-05-12 04:38:00','2026-05-12 04:38:00'),(93,1,1,7,93,7,11,'active','2026-05-12 04:39:00','2026-05-12 04:39:00'),(94,1,1,13,94,13,2,'active','2026-05-12 04:40:00','2026-05-12 04:40:00'),(95,1,1,12,95,12,24,'active','2026-05-12 04:40:00','2026-05-12 04:40:00'),(96,1,1,7,96,7,12,'active','2026-05-12 04:42:00','2026-05-12 04:42:00'),(97,1,1,12,97,12,25,'active','2026-05-12 04:43:00','2026-05-12 04:43:00'),(98,1,1,13,98,13,3,'active','2026-05-12 04:43:00','2026-05-12 04:43:00'),(99,1,1,7,99,7,13,'active','2026-05-12 04:43:00','2026-05-12 04:43:00'),(100,1,1,12,100,12,26,'active','2026-05-12 04:45:00','2026-05-12 04:45:00'),(101,1,1,7,101,7,14,'active','2026-05-12 04:45:00','2026-05-12 04:45:00'),(102,1,1,13,102,13,4,'active','2026-05-12 04:46:00','2026-05-12 04:46:00'),(103,1,1,12,103,12,27,'active','2026-05-12 04:47:00','2026-05-12 04:47:00'),(104,1,1,7,104,7,15,'active','2026-05-12 04:50:00','2026-05-12 04:50:00'),(105,1,1,7,105,7,16,'active','2026-05-12 04:52:00','2026-05-12 04:52:00'),(106,1,1,13,106,13,5,'active','2026-05-12 05:37:00','2026-05-12 05:37:00'),(107,1,1,13,107,13,6,'active','2026-05-12 05:41:00','2026-05-12 05:41:00'),(108,1,1,13,108,13,7,'active','2026-05-12 05:46:00','2026-05-12 05:46:00'),(109,1,1,13,109,13,8,'active','2026-05-12 05:50:00','2026-05-12 05:50:00'),(110,1,1,11,110,11,2,'active','2026-05-12 06:14:00','2026-05-12 06:14:00'),(111,1,1,11,111,11,3,'active','2026-05-12 06:17:00','2026-05-12 06:17:00'),(112,1,1,11,112,11,4,'active','2026-05-12 06:19:00','2026-05-12 06:19:00'),(113,1,1,11,113,11,5,'active','2026-05-12 06:24:00','2026-05-12 06:24:00'),(114,1,1,10,114,10,5,'active','2026-05-12 06:26:00','2026-05-12 06:26:00'),(115,1,1,11,115,11,6,'active','2026-05-12 06:26:00','2026-05-12 06:26:00'),(116,1,1,11,116,11,7,'active','2026-05-12 06:28:00','2026-05-12 06:28:00'),(117,1,1,13,117,13,9,'active','2026-05-12 06:29:00','2026-05-12 06:29:00'),(118,1,1,10,118,10,6,'active','2026-05-12 06:32:00','2026-05-12 06:32:00'),(119,1,1,13,119,13,10,'active','2026-05-12 06:33:00','2026-05-12 06:33:00'),(120,1,1,10,120,10,7,'active','2026-05-12 06:35:00','2026-05-12 06:35:00'),(121,1,1,13,121,13,11,'active','2026-05-12 06:36:00','2026-05-12 06:36:00'),(122,1,1,10,122,10,8,'active','2026-05-12 06:38:00','2026-05-12 06:38:00'),(123,1,1,13,123,13,12,'active','2026-05-12 06:38:00','2026-05-12 06:38:00'),(124,1,1,13,124,13,13,'active','2026-05-12 06:41:00','2026-05-12 06:41:00'),(125,1,1,13,125,13,14,'active','2026-05-12 06:43:00','2026-05-12 06:43:00'),(126,1,1,13,126,13,15,'active','2026-05-12 06:46:00','2026-05-12 06:46:00'),(127,1,1,13,127,13,16,'active','2026-05-12 06:48:00','2026-05-12 06:48:00'),(128,1,1,13,128,13,17,'active','2026-05-12 06:51:00','2026-05-12 06:51:00'),(129,1,1,13,129,13,18,'active','2026-05-12 06:52:00','2026-05-12 06:52:00'),(130,1,1,11,130,11,8,'active','2026-05-13 03:01:00','2026-05-13 03:01:00'),(131,1,1,11,131,11,9,'active','2026-05-13 03:07:00','2026-05-13 03:07:00'),(132,1,1,11,132,11,10,'active','2026-05-13 03:10:00','2026-05-13 03:10:00'),(133,1,1,11,133,11,11,'active','2026-05-13 03:12:00','2026-05-13 03:12:00'),(134,1,1,11,134,11,12,'active','2026-05-13 03:14:00','2026-05-13 03:14:00'),(135,1,1,11,135,11,13,'active','2026-05-13 03:17:00','2026-05-13 03:17:00'),(136,1,1,11,136,11,14,'active','2026-05-13 03:19:00','2026-05-13 03:19:00'),(137,1,1,11,137,11,15,'active','2026-05-13 03:21:00','2026-05-13 03:21:00'),(138,1,1,11,138,11,16,'active','2026-05-13 03:23:00','2026-05-13 03:23:00'),(139,1,1,11,139,11,17,'active','2026-05-13 03:25:00','2026-05-13 03:25:00'),(140,1,1,11,140,11,18,'active','2026-05-13 03:27:00','2026-05-13 03:27:00'),(141,1,1,11,141,11,19,'active','2026-05-13 03:29:00','2026-05-13 03:29:00'),(142,1,1,11,142,11,20,'active','2026-05-13 03:31:00','2026-05-13 03:31:00'),(143,1,1,11,143,11,21,'active','2026-05-13 03:34:00','2026-05-13 03:34:00'),(144,1,1,11,144,11,22,'active','2026-05-13 03:36:00','2026-05-13 03:36:00'),(145,1,1,11,145,11,23,'active','2026-05-13 03:38:00','2026-05-13 03:38:00'),(146,1,1,11,146,11,24,'active','2026-05-13 03:41:00','2026-05-13 03:41:00'),(147,1,1,11,147,11,25,'active','2026-05-13 03:44:00','2026-05-13 03:44:00'),(148,1,1,11,148,11,26,'active','2026-05-13 03:46:00','2026-05-13 03:46:00'),(149,1,1,11,149,11,27,'active','2026-05-13 03:48:00','2026-05-13 03:48:00'),(150,1,1,11,150,11,28,'active','2026-05-13 03:50:00','2026-05-13 03:50:00'),(151,1,1,11,151,11,29,'active','2026-05-13 03:54:00','2026-05-13 03:54:00'),(152,1,1,10,152,10,9,'active','2026-05-13 06:17:00','2026-05-13 06:17:00'),(153,1,1,10,153,10,10,'active','2026-05-13 06:18:00','2026-05-13 06:18:00'),(154,1,1,10,154,10,11,'active','2026-05-13 06:21:00','2026-05-13 06:21:00'),(155,1,1,10,155,10,12,'active','2026-05-13 06:23:00','2026-05-13 06:23:00'),(156,1,1,10,156,10,13,'active','2026-05-13 06:24:00','2026-05-13 06:24:00'),(157,1,1,10,157,10,14,'active','2026-05-13 06:25:00','2026-05-13 06:25:00'),(158,1,1,10,158,10,15,'active','2026-05-13 06:27:00','2026-05-13 06:27:00'),(159,1,1,8,159,8,10,'active','2026-05-13 06:44:00','2026-05-13 06:44:00'),(160,1,1,8,160,8,11,'active','2026-05-13 06:46:00','2026-05-13 06:46:00'),(161,1,1,8,161,8,12,'active','2026-05-13 06:48:00','2026-05-13 06:48:00'),(162,1,1,8,162,8,13,'active','2026-05-13 06:50:00','2026-05-13 06:50:00'),(163,1,1,8,163,8,14,'active','2026-05-13 06:53:00','2026-05-13 06:53:00'),(164,1,1,8,164,8,15,'active','2026-05-13 06:56:00','2026-05-13 06:56:00'),(165,1,1,8,165,8,16,'active','2026-05-13 06:58:00','2026-05-13 06:58:00'),(166,1,1,8,166,8,17,'active','2026-05-13 07:00:00','2026-05-13 07:00:00'),(167,1,1,8,167,8,18,'active','2026-05-13 07:06:00','2026-05-13 07:06:00'),(168,1,1,8,168,8,19,'active','2026-05-13 07:08:00','2026-05-13 07:08:00'),(169,1,1,8,169,8,20,'active','2026-05-13 07:57:00','2026-05-13 07:57:00'),(170,1,1,8,170,8,21,'active','2026-05-13 08:00:00','2026-05-13 08:00:00'),(171,1,1,8,171,8,22,'active','2026-05-13 08:03:00','2026-05-13 08:03:00'),(172,1,1,8,172,8,23,'active','2026-05-13 08:08:00','2026-05-13 08:08:00'),(173,1,1,8,173,8,24,'active','2026-05-13 08:14:00','2026-05-13 08:14:00'),(174,1,1,8,174,8,25,'active','2026-05-13 08:17:00','2026-05-13 08:17:00'),(175,1,1,8,175,8,26,'active','2026-05-13 08:20:00','2026-05-13 08:20:00'),(176,1,1,8,176,8,27,'active','2026-05-13 08:23:00','2026-05-13 08:23:00'),(177,1,1,12,177,12,28,'active','2026-05-25 06:14:45','2026-05-25 06:14:45'),(178,1,1,6,178,6,10,'active','2026-06-02 07:18:00','2026-06-02 07:18:00'),(179,1,1,6,179,6,11,'active','2026-06-02 07:24:38','2026-06-02 07:24:38'),(180,1,1,9,180,9,15,'active','2026-06-02 07:31:09','2026-06-02 07:31:09'),(181,1,1,9,181,9,16,'active','2026-06-02 07:34:02','2026-06-02 07:34:02'),(182,1,1,10,182,10,16,'active','2026-06-02 07:35:40','2026-06-02 07:35:40'),(183,1,1,12,183,12,29,'active','2026-06-02 07:39:36','2026-06-02 07:39:36');
/*!40000 ALTER TABLE `enrollments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `guardian_students`
--

DROP TABLE IF EXISTS `guardian_students`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `guardian_students` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `guardian_id` int unsigned NOT NULL,
  `student_id` int unsigned NOT NULL,
  `is_primary` tinyint NOT NULL DEFAULT '0' COMMENT 'Whether this is the primary contact guardian for this student',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `guardian_students_student_id_guardian_id_unique` (`guardian_id`,`student_id`),
  UNIQUE KEY `uq_guardian_student` (`guardian_id`,`student_id`),
  KEY `idx_gs_student_id` (`student_id`),
  CONSTRAINT `guardian_students_ibfk_3` FOREIGN KEY (`guardian_id`) REFERENCES `guardians` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `guardian_students_ibfk_4` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `guardian_students`
--

LOCK TABLES `guardian_students` WRITE;
/*!40000 ALTER TABLE `guardian_students` DISABLE KEYS */;
/*!40000 ALTER TABLE `guardian_students` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `guardians`
--

DROP TABLE IF EXISTS `guardians`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `guardians` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int unsigned DEFAULT NULL COMMENT 'Null until guardian accepts invitation and activates account',
  `first_name` varchar(80) NOT NULL,
  `last_name` varchar(80) NOT NULL,
  `email` varchar(150) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `relationship` varchar(50) DEFAULT NULL COMMENT 'e.g. Father, Mother, Uncle',
  `address` text,
  `is_active` tinyint NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_guardian_user_id` (`user_id`),
  KEY `idx_guardian_email` (`email`),
  CONSTRAINT `guardians_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `guardians`
--

LOCK TABLES `guardians` WRITE;
/*!40000 ALTER TABLE `guardians` DISABLE KEYS */;
/*!40000 ALTER TABLE `guardians` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `invitations`
--

DROP TABLE IF EXISTS `invitations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `invitations` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `email` varchar(150) NOT NULL,
  `token` varchar(255) NOT NULL COMMENT 'Hashed token embedded in the invitation link',
  `guardian_id` int unsigned DEFAULT NULL COMMENT 'The pre-created guardian record this invitation activates',
  `status` enum('pending','accepted','expired') NOT NULL DEFAULT 'pending',
  `expires_at` datetime NOT NULL,
  `accepted_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `token` (`token`),
  UNIQUE KEY `uq_invitation_token` (`token`),
  UNIQUE KEY `token_2` (`token`),
  KEY `idx_invitation_email` (`email`),
  KEY `idx_invitation_status` (`status`),
  KEY `guardian_id` (`guardian_id`),
  CONSTRAINT `invitations_ibfk_1` FOREIGN KEY (`guardian_id`) REFERENCES `guardians` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `invitations`
--

LOCK TABLES `invitations` WRITE;
/*!40000 ALTER TABLE `invitations` DISABLE KEYS */;
/*!40000 ALTER TABLE `invitations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `password_reset_tokens`
--

DROP TABLE IF EXISTS `password_reset_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `password_reset_tokens` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int unsigned NOT NULL,
  `token` varchar(255) NOT NULL,
  `expires_at` datetime NOT NULL,
  `used_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_token` (`token`),
  KEY `idx_user_id` (`user_id`),
  CONSTRAINT `password_reset_tokens_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `password_reset_tokens`
--

LOCK TABLES `password_reset_tokens` WRITE;
/*!40000 ALTER TABLE `password_reset_tokens` DISABLE KEYS */;
/*!40000 ALTER TABLE `password_reset_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL COMMENT 'System identifier e.g. SUPER_ADMIN, TEACHER. Never changed after seeding.',
  `label` varchar(100) NOT NULL COMMENT 'Human-readable display name e.g. Super Admin',
  `description` varchar(255) DEFAULT NULL,
  `layer` enum('global','campus') NOT NULL DEFAULT 'campus' COMMENT 'global = assigned via user_global_roles, no campus boundary. campus = assigned via user_role_campuses, scoped to one campus.',
  `is_active` tinyint NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  UNIQUE KEY `name_2` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'SUPER_ADMIN','Super Admin',NULL,'global',1,'2026-05-05 06:55:40','2026-05-05 06:55:40'),(3,'CAMPUS_ADMIN','Campus Admin',NULL,'campus',1,'2026-05-05 06:55:40','2026-05-05 06:55:40'),(4,'PRINCIPAL','Principal',NULL,'campus',1,'2026-05-05 06:55:40','2026-05-05 06:55:40'),(5,'TEACHER','Teacher',NULL,'campus',1,'2026-05-05 06:55:40','2026-05-05 06:55:40'),(7,'EXAM_CONTROLLER','Exam Controller',NULL,'campus',1,'2026-05-05 06:55:40','2026-05-05 06:55:40'),(8,'ACCOUNTANT','Accountant',NULL,'campus',1,'2026-05-05 06:55:40','2026-05-05 06:55:40'),(9,'RECEPTIONIST','Receptionist',NULL,'campus',1,'2026-05-05 06:55:40','2026-05-05 06:55:40'),(10,'GUARDIAN','Guardian',NULL,'campus',1,'2026-05-05 06:55:40','2026-05-05 06:55:40'),(11,'STUDENT','Student',NULL,'campus',1,'2026-05-05 06:55:40','2026-05-05 06:55:40'),(12,'SCHOOL_ADMIN','School Admin',NULL,'global',1,'2026-05-25 08:51:50','2026-05-25 08:51:50');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `school_settings`
--

DROP TABLE IF EXISTS `school_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `school_settings` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `school_name` varchar(150) NOT NULL,
  `short_name` varchar(50) DEFAULT NULL COMMENT 'Abbreviated display name used in UI headers and reports where full name is too long',
  `tagline` varchar(255) DEFAULT NULL COMMENT 'School motto or tagline shown on printed documents and the login screen',
  `logo_url` varchar(500) DEFAULT NULL COMMENT 'Relative or absolute path to the uploaded school logo image',
  `registration_no` varchar(100) DEFAULT NULL COMMENT 'Official government registration or charter number issued to the institution',
  `school_type` enum('private','government','semi_government') DEFAULT NULL,
  `email` varchar(150) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `website` varchar(255) DEFAULT NULL,
  `address` text,
  `city` varchar(100) DEFAULT NULL,
  `state_province` varchar(100) DEFAULT NULL,
  `country` varchar(100) DEFAULT NULL,
  `postal_code` varchar(20) DEFAULT NULL,
  `timezone` varchar(80) NOT NULL DEFAULT 'Asia/Karachi' COMMENT 'IANA timezone identifier used for all date/time display and scheduling logic throughout the system',
  `date_format` varchar(20) NOT NULL DEFAULT 'DD/MM/YYYY' COMMENT 'Display format for dates in UI and printed documents. Does not affect how dates are stored in the database (always ISO)',
  `currency_code` varchar(10) NOT NULL DEFAULT 'PKR' COMMENT 'ISO 4217 currency code used in fee and finance modules',
  `currency_symbol` varchar(10) NOT NULL DEFAULT '₨',
  `currency_position` enum('before','after') NOT NULL DEFAULT 'before' COMMENT 'Controls whether the currency symbol appears before or after the amount e.g. ₨500 vs 500₨',
  `academic_year_start_month` tinyint NOT NULL DEFAULT '4' COMMENT 'Month number (1-12) when the academic year begins. Used as the default when creating new academic sessions. April = 4 is common in Pakistan.',
  `default_pass_percentage` decimal(5,2) NOT NULL DEFAULT '40.00' COMMENT 'Minimum percentage a student must score to be considered passing. Used as the default in exam and result modules; can be overridden per exam.',
  `min_attendance_percentage` decimal(5,2) NOT NULL DEFAULT '75.00' COMMENT 'Minimum attendance percentage required. Used in attendance reports and eligibility checks for exams.',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `school_settings`
--

LOCK TABLES `school_settings` WRITE;
/*!40000 ALTER TABLE `school_settings` DISABLE KEYS */;
INSERT INTO `school_settings` VALUES (1,'EduSphere School',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Asia/Karachi','DD/MM/YYYY','PKR','₨','before',4,40.00,75.00,'2026-05-05 06:55:40','2026-05-05 06:55:40');
/*!40000 ALTER TABLE `school_settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sections`
--

DROP TABLE IF EXISTS `sections`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sections` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `class_group_id` int unsigned NOT NULL COMMENT 'Parent class. Sections cascade-delete when a class is deleted.',
  `name` varchar(50) DEFAULT NULL COMMENT 'Section label e.g. Eagle, A, Blue. NULL = unsectioned (exactly one per class, invisible to admin).',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_section_class_name` (`class_group_id`,`name`),
  CONSTRAINT `sections_ibfk_1` FOREIGN KEY (`class_group_id`) REFERENCES `class_groups` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sections`
--

LOCK TABLES `sections` WRITE;
/*!40000 ALTER TABLE `sections` DISABLE KEYS */;
INSERT INTO `sections` VALUES (6,6,'EAGLE','2026-07-08 06:55:29','2026-07-08 08:01:43'),(7,7,'EAGLE','2026-07-08 06:55:29','2026-07-08 06:55:29'),(8,8,'EAGLE','2026-07-08 06:55:29','2026-07-08 06:55:29'),(9,9,'EAGLE','2026-07-08 06:55:29','2026-07-08 06:55:29'),(10,10,'EAGLE','2026-07-08 06:55:29','2026-07-08 06:55:29'),(11,11,'EAGLE','2026-07-08 06:55:29','2026-07-08 06:55:29'),(12,12,'EAGLE','2026-07-08 06:55:29','2026-07-08 06:55:29'),(13,13,'EAGLE','2026-07-08 06:55:29','2026-07-08 06:55:29'),(16,13,'FALCON','2026-07-08 07:25:59','2026-07-08 07:25:59');
/*!40000 ALTER TABLE `sections` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `staff`
--

DROP TABLE IF EXISTS `staff`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `staff` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int unsigned DEFAULT NULL COMMENT 'Null until portal access is granted. Managed by dedicated account-linking flow, not the staff create/update endpoints.',
  `email` varchar(150) DEFAULT NULL,
  `full_name` varchar(150) NOT NULL,
  `name_initials` varchar(20) DEFAULT NULL,
  `marital_status` enum('married','single') DEFAULT NULL,
  `address` text,
  `cnic` varchar(15) NOT NULL COMMENT 'Pakistani national identity card number',
  `gender` enum('male','female') NOT NULL,
  `date_of_birth` date DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_staff_cnic` (`cnic`),
  UNIQUE KEY `uq_staff_user_id` (`user_id`),
  UNIQUE KEY `uq_staff_name_initials` (`name_initials`),
  KEY `idx_staff_user_id` (`user_id`),
  CONSTRAINT `staff_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `staff`
--

LOCK TABLES `staff` WRITE;
/*!40000 ALTER TABLE `staff` DISABLE KEYS */;
INSERT INTO `staff` VALUES (1,NULL,'wajidmian2255@gmail.com','WAJID GUL','W.G.','married','CHAMTALAI TEHSIL KHWAZAKHELA SWAT','15602-8311440-1','male','2026-07-04','2026-05-19 05:14:26','2026-06-11 08:31:21'),(2,NULL,'noorislam9888@gmail.com','NOOR ISLAM','N.I.','married','JANO TEHSIL KHWAZAKHELA SWAT','15602-0877606-5','male','1987-03-06','2026-05-19 05:17:00','2026-06-22 04:47:51'),(3,NULL,'jamaluddin67k6@gmail.com','JAMAL UDDIN','J.U.','married','BERARAI TEHSIL KHWAZAKHELA SWAT','15602-0278148-3','male','1981-03-01','2026-05-19 05:21:11','2026-06-11 08:27:45'),(4,NULL,'MUHAMMADDIDAR711@GMAIL.COM','MUHAMMAD DIDAR','M.D.',NULL,'CHAMTALAI KHWAZA KHELA SWAT','15602-5188982-9','male',NULL,'2026-05-19 05:21:13','2026-06-11 08:28:19'),(5,NULL,'luqmankhan102003@gmail.com','LUQMAN ALI','L.K.','single','KACHIGRAM KHWAZA KHELA SWAT','15602-9276302-9','male','2003-02-10','2026-05-19 05:53:50','2026-06-11 08:28:04'),(6,NULL,NULL,'HASHMAT ULLAH','H.U.',NULL,'VILLAGE KHWAZA KHELA','15602-9450952-1','male',NULL,'2026-05-19 05:55:11','2026-06-11 08:27:11'),(7,NULL,NULL,'FAYAZ AHMAD','F.A.','married','LANDIKAS KHWAZAKHILA SWAT','15602-2165133-1','male','1989-03-01','2026-05-19 07:10:21','2026-06-11 08:26:31'),(8,NULL,NULL,'HAIDER ALI  KHAN','H.A.K.','married','TEETABUT KHWAZA KHELA SWAT','15602-7551873-5','male','1985-01-05','2026-05-19 07:11:42','2026-06-11 08:26:52'),(9,NULL,NULL,'ZAHID ALI','Z.A.','married','KUZ KILY KHWAZAKHILA SWAT','15602-3513128-9','male','1989-05-01','2026-05-19 07:12:42','2026-06-11 08:32:08'),(10,NULL,NULL,'SHAHABUD DIN','S.U.D.','married','BERARAI KHWAZA KHELA SWAT','15607-0342612-7','male','1998-10-12','2026-05-20 04:45:06','2026-06-12 06:01:52'),(11,NULL,'shadabkabir249@gmail.com','SHADAB KABIR KHAN','S.K.K.','single','KOZ KALAY KHWAZA KHELA','15605-0355645-1','male','2001-01-02','2026-05-20 04:46:17','2026-06-11 08:29:57'),(12,NULL,NULL,'HASSAN ZEB','H.Z.','married','JANO TEHSIL KHWAZAKHELA SWAT','15602-0465226-1','male','1986-04-01','2026-05-20 07:01:28','2026-06-11 08:27:29'),(13,NULL,'aibni0917@gmail.com','ABNE AMIN','','married','KUZA ASALA KHWAZAKHILA SWAT','15602-0374688-9','male','1963-03-02','2026-05-21 04:14:08','2026-06-11 08:34:52'),(14,NULL,NULL,'NOOR RAHMAN',NULL,'married','ALAMGANJ CHARBAGH SWAT','42401-1544470-1','male','1982-12-31','2026-05-21 04:18:39','2026-05-21 04:18:39'),(15,NULL,NULL,'SAIF UR RAHMAN',NULL,NULL,'MAIN BAZAR MATTA','15601-3526726-7','male','1993-05-04','2026-05-21 04:23:13','2026-05-21 04:23:13'),(16,NULL,NULL,'SAMI ULLAH','S.U.','single','SHIN KHWAZA KHELA SWAT','15605-0387579-9','male','1998-03-09','2026-05-21 04:49:10','2026-06-12 05:59:19'),(17,NULL,'hasnain3942@gmail.com','YOUSAF KHAN','Y.K.','married','ALAM GANK CHARBAGH SWAT','15602-6391408-5','male','1974-02-20','2026-05-21 05:00:10','2026-06-11 08:32:26');
/*!40000 ALTER TABLE `staff` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `staff_phones`
--

DROP TABLE IF EXISTS `staff_phones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `staff_phones` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `staff_id` int unsigned NOT NULL,
  `label` varchar(50) DEFAULT NULL COMMENT 'Free-text label e.g. Personal, Work, WhatsApp',
  `phone` varchar(20) NOT NULL,
  `is_primary` tinyint NOT NULL DEFAULT '0' COMMENT 'Only one phone per staff member should have is_primary = 1, enforced at service layer',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_staff_phone_staff_id` (`staff_id`),
  CONSTRAINT `staff_phones_ibfk_1` FOREIGN KEY (`staff_id`) REFERENCES `staff` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=52 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `staff_phones`
--

LOCK TABLES `staff_phones` WRITE;
/*!40000 ALTER TABLE `staff_phones` DISABLE KEYS */;
INSERT INTO `staff_phones` VALUES (18,14,NULL,'03452774840',1,'2026-05-21 04:18:39','2026-05-21 04:18:39'),(19,15,NULL,'03413786052',1,'2026-05-21 04:23:13','2026-05-21 04:23:13'),(28,7,NULL,'03439070614',1,'2026-06-11 08:26:31','2026-06-11 08:26:31'),(29,8,NULL,'03149744117',1,'2026-06-11 08:26:52','2026-06-11 08:26:52'),(30,6,NULL,'03456426072',1,'2026-06-11 08:27:11','2026-06-11 08:27:11'),(31,12,NULL,'03479460006',1,'2026-06-11 08:27:29','2026-06-11 08:27:29'),(32,3,NULL,'03469487848',1,'2026-06-11 08:27:45','2026-06-11 08:27:45'),(33,5,NULL,'03423131235',1,'2026-06-11 08:28:04','2026-06-11 08:28:04'),(34,4,NULL,'03479514922',1,'2026-06-11 08:28:19','2026-06-11 08:28:19'),(37,11,NULL,'03479675428',1,'2026-06-11 08:29:57','2026-06-11 08:29:57'),(40,9,NULL,'03315978799',1,'2026-06-11 08:32:08','2026-06-11 08:32:08'),(41,17,NULL,'03429043942',1,'2026-06-11 08:32:26','2026-06-11 08:32:26'),(46,13,NULL,'03469339538',1,'2026-06-11 08:35:04','2026-06-11 08:35:04'),(47,16,NULL,'03442316091',1,'2026-06-12 05:59:19','2026-06-12 05:59:19'),(49,10,NULL,'03359767182',1,'2026-06-12 06:01:52','2026-06-12 06:01:52'),(50,2,NULL,'03469693595',1,'2026-06-22 04:47:51','2026-06-22 04:47:51'),(51,1,NULL,'03452051704',1,'2026-06-22 04:48:35','2026-06-22 04:48:35');
/*!40000 ALTER TABLE `staff_phones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `staff_postings`
--

DROP TABLE IF EXISTS `staff_postings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `staff_postings` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `staff_id` int unsigned NOT NULL,
  `campus_id` int unsigned NOT NULL,
  `employee_no` varchar(50) DEFAULT NULL COMMENT 'Campus-assigned employee number',
  `joining_date` date DEFAULT NULL,
  `is_active` tinyint NOT NULL DEFAULT '1',
  `is_timetable_eligible` tinyint(1) NOT NULL DEFAULT '0' COMMENT 'Whether this staff member can be assigned to timetable slots at this campus',
  `allow_concurrent_periods` tinyint(1) NOT NULL DEFAULT '0' COMMENT 'When true, this staff member is exempt from the single-class-per-period timetable conflict check (e.g. PET teachers running drills across multiple sections at once)',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_posting_campus_staff` (`campus_id`,`staff_id`),
  UNIQUE KEY `uq_posting_campus_employee_no` (`campus_id`,`employee_no`),
  KEY `idx_posting_staff_id` (`staff_id`),
  KEY `idx_posting_campus_id` (`campus_id`),
  CONSTRAINT `staff_postings_ibfk_1` FOREIGN KEY (`staff_id`) REFERENCES `staff` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `staff_postings_ibfk_2` FOREIGN KEY (`campus_id`) REFERENCES `campuses` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `staff_postings`
--

LOCK TABLES `staff_postings` WRITE;
/*!40000 ALTER TABLE `staff_postings` DISABLE KEYS */;
INSERT INTO `staff_postings` VALUES (1,1,1,NULL,NULL,1,1,0,'2026-05-19 05:14:26','2026-06-20 06:22:36'),(2,2,1,NULL,NULL,1,1,0,'2026-05-19 05:17:00','2026-06-20 06:21:32'),(3,3,1,NULL,NULL,1,1,0,'2026-05-19 05:21:11','2026-06-20 06:21:04'),(4,4,1,NULL,NULL,1,1,0,'2026-05-19 05:21:13','2026-06-20 06:21:21'),(5,5,1,NULL,'2025-06-12',1,1,0,'2026-05-19 05:53:50','2026-06-20 06:21:12'),(6,6,1,NULL,NULL,1,1,0,'2026-05-19 05:55:11','2026-06-20 06:20:48'),(7,7,1,NULL,NULL,1,1,0,'2026-05-19 07:10:21','2026-06-20 06:20:21'),(8,8,1,NULL,NULL,1,1,0,'2026-05-19 07:11:42','2026-06-20 06:20:35'),(9,9,1,NULL,NULL,1,1,0,'2026-05-19 07:12:42','2026-06-20 06:22:54'),(10,10,1,NULL,'2026-05-01',1,1,0,'2026-05-20 04:45:06','2026-06-20 06:22:02'),(11,11,1,NULL,'2025-05-02',1,1,0,'2026-05-20 04:46:17','2026-06-20 06:21:52'),(12,12,1,NULL,NULL,1,1,0,'2026-05-20 07:01:28','2026-06-20 06:20:57'),(13,13,1,NULL,'2015-05-01',1,0,0,'2026-05-21 04:14:08','2026-05-21 06:09:47'),(14,14,1,NULL,'2010-12-01',1,0,0,'2026-05-21 04:18:39','2026-05-21 04:18:39'),(15,15,1,NULL,'2026-04-01',1,0,0,'2026-05-21 04:23:13','2026-05-21 04:23:13'),(16,16,1,NULL,'2025-05-02',1,1,0,'2026-05-21 04:49:10','2026-06-20 06:21:43'),(17,17,1,NULL,'2009-04-01',1,1,1,'2026-05-21 05:00:10','2026-07-13 07:57:14');
/*!40000 ALTER TABLE `staff_postings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `staff_qualifications`
--

DROP TABLE IF EXISTS `staff_qualifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `staff_qualifications` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `staff_id` int unsigned NOT NULL,
  `type` enum('academic','professional') NOT NULL,
  `title` varchar(200) NOT NULL COMMENT 'e.g. BS Physics, B.Ed, Teaching Certificate in Early Childhood',
  `completion_date` date DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_staff_qualification_staff_id` (`staff_id`),
  CONSTRAINT `staff_qualifications_ibfk_1` FOREIGN KEY (`staff_id`) REFERENCES `staff` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=46 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `staff_qualifications`
--

LOCK TABLES `staff_qualifications` WRITE;
/*!40000 ALTER TABLE `staff_qualifications` DISABLE KEYS */;
INSERT INTO `staff_qualifications` VALUES (17,14,'academic','Matric',NULL,'2026-05-21 04:18:39','2026-05-21 04:18:39'),(18,15,'academic','B. A',NULL,'2026-05-21 04:23:13','2026-05-21 04:23:13'),(24,12,'academic','MA Islamyat',NULL,'2026-06-11 08:27:29','2026-06-11 08:27:29'),(25,12,'academic','B.Ed',NULL,'2026-06-11 08:27:29','2026-06-11 08:27:29'),(26,3,'academic','MA islamyat',NULL,'2026-06-11 08:27:45','2026-06-11 08:27:45'),(27,5,'academic','BS BOTANY',NULL,'2026-06-11 08:28:04','2026-06-11 08:28:04'),(28,5,'professional','B Ed',NULL,'2026-06-11 08:28:04','2026-06-11 08:28:04'),(29,5,'professional','DIT',NULL,'2026-06-11 08:28:04','2026-06-11 08:28:04'),(30,5,'professional','SUPERVISOR AND SERVEYAR IN WHO DEPARTMENT',NULL,'2026-06-11 08:28:04','2026-06-11 08:28:04'),(31,4,'academic','MA',NULL,'2026-06-11 08:28:19','2026-06-11 08:28:19'),(33,11,'academic','Bs physics',NULL,'2026-06-11 08:29:57','2026-06-11 08:29:57'),(36,17,'academic','BA',NULL,'2026-06-11 08:32:26','2026-06-11 08:32:26'),(41,13,'academic','Matric',NULL,'2026-06-11 08:35:04','2026-06-11 08:35:04'),(43,10,'academic','MA ISLAMYAT',NULL,'2026-06-12 06:01:52','2026-06-12 06:01:52'),(44,2,'academic','MA islamyat',NULL,'2026-06-22 04:47:51','2026-06-22 04:47:51'),(45,1,'academic','BS mathematics',NULL,'2026-06-22 04:48:35','2026-06-22 04:48:35');
/*!40000 ALTER TABLE `staff_qualifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `student_contacts`
--

DROP TABLE IF EXISTS `student_contacts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `student_contacts` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(100) DEFAULT NULL COMMENT 'Name of the person who can be reached at this number',
  `student_id` int unsigned NOT NULL,
  `label` varchar(50) NOT NULL COMMENT 'Descriptive label e.g. Father, Mother, Guardian, Emergency',
  `phone` varchar(20) NOT NULL,
  `is_primary` tinyint NOT NULL DEFAULT '0' COMMENT 'Only one contact per student should have is_primary = 1, enforced at service layer',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_student_contact_student_id` (`student_id`),
  KEY `idx_student_contact_phone` (`phone`),
  CONSTRAINT `student_contacts_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=350 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student_contacts`
--

LOCK TABLES `student_contacts` WRITE;
/*!40000 ALTER TABLE `student_contacts` DISABLE KEYS */;
INSERT INTO `student_contacts` VALUES (3,'ATIQ ULLAH',3,'Father','03453062018',1,'2026-05-11 05:11:20','2026-05-11 05:11:20'),(17,'MANSOOR KHAN',15,'Father','03441192822',1,'2026-05-11 06:01:27','2026-05-11 06:01:27'),(48,'MUHAMMAD',44,'Father','03499660095',1,'2026-05-11 08:02:25','2026-05-11 08:02:25'),(49,'TARIQ SHAH',45,'UNCLE','03025744326',1,'2026-05-11 08:06:22','2026-05-11 08:06:22'),(50,'SHAH NAMDAR KHAN',46,'Father','03449667020',1,'2026-05-11 08:08:48','2026-05-11 08:08:48'),(73,NULL,66,'Father','03446701172',1,'2026-05-12 03:31:49','2026-05-12 03:31:49'),(77,NULL,70,'Father','03461133434',1,'2026-05-12 03:34:37','2026-05-12 03:34:37'),(80,NULL,73,'Father','03437037968',1,'2026-05-12 03:37:43','2026-05-12 03:37:43'),(100,'BAKHT ZADA',93,'Father','03449758584',1,'2026-05-12 04:39:16','2026-05-12 04:39:16'),(106,'BAKHT ZADA',99,'Father','03449758584',1,'2026-05-12 04:43:44','2026-05-12 04:43:44'),(113,NULL,79,'Father','03468757437',1,'2026-05-12 05:04:22','2026-05-12 05:04:22'),(118,'AMAN ULLAH',110,'Father','03439262196',1,'2026-05-12 06:14:15','2026-05-12 06:14:15'),(119,'SHAMS UL HAQ',111,'Father','03412443448',1,'2026-05-12 06:17:56','2026-05-12 06:17:56'),(120,'MUHIB ULLAH',112,'Father','03439590015',1,'2026-05-12 06:19:47','2026-05-12 06:19:47'),(121,'ABDULLAH KHAN',113,'Father','03439590015',1,'2026-05-12 06:24:09','2026-05-12 06:24:09'),(122,'ABDUL MAULA',114,'Father','03420228801',1,'2026-05-12 06:26:29','2026-05-12 06:26:29'),(123,'MUHAMMAD KARIM',115,'Father','03245995380',1,'2026-05-12 06:26:46','2026-05-12 06:26:46'),(124,'ZAFAR ALI KHAN',116,'Father','03469466812',1,'2026-05-12 06:28:38','2026-05-12 06:28:38'),(126,'RAZA KHAN',118,'Father','03469157274',1,'2026-05-12 06:32:52','2026-05-12 06:32:52'),(128,'RAHMAT ALI',120,'Father','03453040555',1,'2026-05-12 06:35:53','2026-05-12 06:35:53'),(130,'JAVED',122,'Father','03469431660',1,'2026-05-12 06:38:48','2026-05-12 06:38:48'),(138,'ALAM SHER',109,'Father','03439611645',1,'2026-05-12 08:24:04','2026-05-12 08:24:04'),(139,'KIFAYAT ULLAH',130,'Father','03452785668',1,'2026-05-13 03:01:03','2026-05-13 03:01:03'),(144,'MALAK SARDAR',135,'Father','03466734232',1,'2026-05-13 03:17:06','2026-05-13 03:17:06'),(148,'LIAQAT ALI KHAN',139,'Father','03458001089',1,'2026-05-13 03:25:27','2026-05-13 03:25:27'),(149,'ZAHIR SHAH MIAN',140,'Father','03485745845',1,'2026-05-13 03:27:20','2026-05-13 03:27:20'),(151,'USMAN GHANI',142,'Father','03456688666',1,'2026-05-13 03:31:40','2026-05-13 03:31:40'),(152,'MEHBOOB ALI',143,'Father','03423358015',1,'2026-05-13 03:34:35','2026-05-13 03:34:35'),(153,'ABDUL MABOOD',144,'Father','03458505081',1,'2026-05-13 03:36:28','2026-05-13 03:36:28'),(154,'SAID NAWAB',145,'Father','03479101002',1,'2026-05-13 03:38:55','2026-05-13 03:38:55'),(155,'YOUSAF KHAN',146,'Father','03429043942',1,'2026-05-13 03:41:16','2026-05-13 03:41:16'),(156,'FAZAL ZADA',147,'Father','03429595718',1,'2026-05-13 03:44:10','2026-05-13 03:44:10'),(157,'ATTA ULLAH SHAH',148,'Father','03450454384',1,'2026-05-13 03:46:16','2026-05-13 03:46:16'),(161,'NASAR ALI',152,'Father','03489021479',1,'2026-05-13 06:17:00','2026-05-13 06:17:00'),(162,'NADAR KHAN',153,'Father','034502228',1,'2026-05-13 06:18:25','2026-05-13 06:18:25'),(164,'ASHRAF ALI',155,'Father','03475126033',1,'2026-05-13 06:23:00','2026-05-13 06:23:00'),(168,NULL,159,'Father','03489188725',1,'2026-05-13 06:44:04','2026-05-13 06:44:04'),(169,NULL,160,'Father','03489506398',1,'2026-05-13 06:46:11','2026-05-13 06:46:11'),(171,'HASHMAT ULLAH',151,'Father','03456426072',1,'2026-05-13 06:50:14','2026-05-13 06:50:14'),(180,'ABDULLAH',129,'Father','03448748468',1,'2026-05-13 06:58:23','2026-05-13 06:58:23'),(181,'Fazal Ali',33,'Uncle','03457778467',1,'2026-05-13 06:59:11','2026-05-13 06:59:11'),(182,'MUHAMMAD FAYOON',37,'Father','0342982127',1,'2026-05-13 06:59:48','2026-05-13 06:59:48'),(183,'RAZA KHAN',39,'Father','03469757274',1,'2026-05-13 07:00:24','2026-05-13 07:00:24'),(185,'SHABIR KHAN',40,'Father','03481096696',1,'2026-05-13 07:00:45','2026-05-13 07:00:45'),(186,'MASUD UR RAHMAN',42,'Father','02345347212',1,'2026-05-13 07:01:17','2026-05-13 07:01:17'),(189,'MUSTAAN',53,'Father','03444707788',1,'2026-05-13 07:02:32','2026-05-13 07:02:32'),(190,'MUHAMMAD KARIM',57,'Father','03058751264',1,'2026-05-13 07:03:05','2026-05-13 07:03:05'),(191,'MAIN SAID ALI BACHA',60,'Father','03430989033',1,'2026-05-13 07:03:29','2026-05-13 07:03:29'),(193,'ANWAR ALI',61,'Father','03449087574',1,'2026-05-13 07:06:55','2026-05-13 07:06:55'),(194,'Kamran Khan',64,'Uncle','03439603747',1,'2026-05-13 07:07:27','2026-05-13 07:07:27'),(195,'RAHMAT ALI',67,'Father','03453247948',1,'2026-05-13 07:07:52','2026-05-13 07:07:52'),(196,'SAMI ULLAH',71,'Father','0349083229',1,'2026-05-13 07:08:16','2026-05-13 07:08:16'),(198,'DOST MUHAMMAD',72,'Father','03425000788',1,'2026-05-13 07:08:41','2026-05-13 07:08:41'),(199,'SHER ALAM KHAN',75,'Father','03000929797',1,'2026-05-13 07:09:00','2026-05-13 07:09:00'),(200,'NASARULLAH',77,'Father','03445315559',1,'2026-05-13 07:09:17','2026-05-13 07:09:17'),(201,'HABIB UR RAHIM',91,'Father','03439145121',1,'2026-05-13 07:09:55','2026-05-13 07:09:55'),(202,'MUHAMMAD HANIF',94,'Father','03409080324',1,'2026-05-13 07:10:19','2026-05-13 07:10:19'),(203,NULL,85,'Uncle','0348540931',1,'2026-05-13 07:10:55','2026-05-13 07:10:55'),(204,'BAKHT AKBAR',98,'Father','03461961219',1,'2026-05-13 07:11:26','2026-05-13 07:11:26'),(207,'YOUSAF KHAN',102,'Father','03454749234',1,'2026-05-13 08:02:19','2026-05-13 08:02:19'),(208,'BATH SAHIB KHAN',106,'Father','03437289939',1,'2026-05-13 08:02:53','2026-05-13 08:02:53'),(209,'ABAD KHAN',107,'Father','03449652722',1,'2026-05-13 08:03:29','2026-05-13 08:03:29'),(211,'ABDULLAH',117,'Father','03478918980',1,'2026-05-13 08:04:05','2026-05-13 08:04:05'),(213,'GUL MAIN',119,'Father','03431922607',1,'2026-05-13 08:05:19','2026-05-13 08:05:19'),(214,'BAIDAR BAKHT KHAN',121,'Father','03449622897',1,'2026-05-13 08:06:07','2026-05-13 08:06:07'),(215,'AFZAL KHAN',123,'Father','03469409984',1,'2026-05-13 08:06:50','2026-05-13 08:06:50'),(216,'ZAMIR KHAN',124,'Father','03469410567',1,'2026-05-13 08:07:19','2026-05-13 08:07:19'),(217,'HAZRAT HUSSAIN',125,'Father','033294520005',1,'2026-05-13 08:08:09','2026-05-13 08:08:09'),(219,'DAWOOD KHAN',126,'Father','03443536131',1,'2026-05-13 08:08:40','2026-05-13 08:08:40'),(220,'WATAN SHER',127,'Father','0344356131',1,'2026-05-13 08:09:21','2026-05-13 08:09:21'),(225,NULL,176,'Father','03429887912',1,'2026-05-13 08:23:33','2026-05-13 08:23:33'),(226,'WAHAB KHAN',108,'Father','03449652722',1,'2026-05-14 08:33:49','2026-05-14 08:33:49'),(227,'AFSAR ALI',86,'Father','-',1,'2026-05-18 09:16:40','2026-05-18 09:16:40'),(229,NULL,162,'Father','03468088911',1,'2026-05-19 05:57:56','2026-05-19 05:57:56'),(230,'FAZAL RAHMAN',23,'Father','03409381666',1,'2026-05-19 06:05:19','2026-05-19 06:05:19'),(231,NULL,24,'Father','03442999832',1,'2026-05-19 06:11:34','2026-05-19 06:11:34'),(232,'ADIL SHAH',25,'Father','03456037876',1,'2026-05-19 06:13:39','2026-05-19 06:13:39'),(233,'IQBAL ALI',26,'Father','03429339329',1,'2026-05-19 06:19:09','2026-05-19 06:19:09'),(234,'HAJI QASIM',27,'Father','03431199533',1,'2026-05-19 06:23:55','2026-05-19 06:23:55'),(236,'SHABIR KHAN',28,'Father','03481096696',1,'2026-05-19 06:28:23','2026-05-19 06:28:23'),(237,'FAZAL TAHMAN',29,'Father','03439589891',1,'2026-05-19 07:10:39','2026-05-19 07:10:39'),(238,'RAHMAT ALI KHAN',30,'Father','0344988691',1,'2026-05-19 07:13:15','2026-05-19 07:13:15'),(239,'KHKWALAY KHAN',55,'Father','03419489222',1,'2026-05-19 07:16:24','2026-05-19 07:16:24'),(241,'FAZAL BACHA',136,'Father','03479486201',1,'2026-05-19 07:26:02','2026-05-19 07:26:02'),(242,'ABDUL WAHAB',163,'Father','03459452472',1,'2026-05-19 07:29:06','2026-05-19 07:29:06'),(243,NULL,164,'Father','03421926578',1,'2026-05-19 07:30:21','2026-05-19 07:30:21'),(244,NULL,165,'Father','03459455405',1,'2026-05-19 07:31:50','2026-05-19 07:31:50'),(245,NULL,166,'Father','03463319256',1,'2026-05-19 07:33:38','2026-05-19 07:33:38'),(246,NULL,167,'Father','03485745845',1,'2026-05-19 07:36:36','2026-05-19 07:36:36'),(247,NULL,168,'Father','03449645400',1,'2026-05-19 07:41:42','2026-05-19 07:41:42'),(248,NULL,169,'Father','03453572331',1,'2026-05-19 07:43:09','2026-05-19 07:43:09'),(249,NULL,170,'Father','03438986147',1,'2026-05-19 07:44:56','2026-05-19 07:44:56'),(250,NULL,171,'Father','03469994863',1,'2026-05-19 07:46:56','2026-05-19 07:46:56'),(252,NULL,172,'Father','03459455405',1,'2026-05-19 07:49:44','2026-05-19 07:49:44'),(253,NULL,173,'Father','03459527696',1,'2026-05-19 07:50:59','2026-05-19 07:50:59'),(254,NULL,174,'Father','03429595718',1,'2026-05-19 07:53:33','2026-05-19 07:53:33'),(255,NULL,175,'Father','03459270333',1,'2026-05-19 07:54:46','2026-05-19 07:54:46'),(257,'NASAR KHAN',1,'UNCLE','03479486201',1,'2026-05-19 08:00:36','2026-05-19 08:00:36'),(258,'IMRAN ALI',6,'Father','03469342455',1,'2026-05-19 08:02:00','2026-05-19 08:02:00'),(259,'MUHAMMAD ZARNOSH',7,'Father','03457788303',1,'2026-05-19 08:03:23','2026-05-19 08:03:23'),(260,'MALAK SARDAR',8,'Father','03462572227',1,'2026-05-19 08:04:51','2026-05-19 08:04:51'),(262,'YOUSAF KHAN',10,'Father','03429043942',1,'2026-05-19 08:07:44','2026-05-19 08:07:44'),(263,'SARFARAZ KHAN',81,'Father','03438986147',1,'2026-05-19 08:09:13','2026-05-19 08:09:13'),(264,'ASHRAF ALI',83,'Father','03475126033',1,'2026-05-19 08:10:27','2026-05-19 08:10:27'),(265,'SYED KHALID SHAH',132,'Father','03409273544',1,'2026-05-19 08:13:12','2026-05-19 08:13:12'),(266,'ALAFAIQ',131,'Father','03463536916',1,'2026-05-19 08:15:01','2026-05-19 08:15:01'),(267,'SHAH NOORAQ',4,'Father','03444896322',1,'2026-05-19 08:18:03','2026-05-19 08:18:03'),(268,'HAFIZ UL AMIN',156,'Father','03449206810',1,'2026-05-19 08:19:38','2026-05-19 08:19:38'),(269,NULL,49,'Father','03470934380',1,'2026-05-19 08:21:38','2026-05-19 08:21:38'),(271,NULL,52,'Father','03470934380',1,'2026-05-19 08:22:50','2026-05-19 08:22:50'),(272,'SHAH KHALID',47,'Father','03483403493',1,'2026-05-19 08:23:59','2026-05-19 08:23:59'),(274,'SAEED ULLAH KHAN',133,'Father','03479395727',1,'2026-05-19 08:28:23','2026-05-19 08:28:23'),(275,'SAID ALI KHAN',157,'Father','03441229175',1,'2026-05-19 08:31:27','2026-05-19 08:31:27'),(276,NULL,2,'Father','03469405188',1,'2026-05-19 08:34:12','2026-05-19 08:34:12'),(277,'BAKHT ZADA',96,'Father','03449758584',1,'2026-05-19 08:35:00','2026-05-19 08:35:00'),(278,NULL,13,'Father','03459455405',1,'2026-05-19 08:35:59','2026-05-19 08:35:59'),(279,NULL,31,'Father','03039217216',1,'2026-05-19 08:37:47','2026-05-19 08:37:47'),(280,NULL,32,'Father','03439598292',1,'2026-05-19 08:39:45','2026-05-19 08:39:45'),(281,NULL,35,'Father','03420137819',1,'2026-05-19 08:43:24','2026-05-19 08:43:24'),(282,'AMJAD KHAN',105,'Father','03429662871',1,'2026-05-19 08:44:44','2026-05-19 08:44:44'),(283,NULL,41,'Father','03490064602',1,'2026-05-19 08:46:16','2026-05-19 08:46:16'),(284,'UMAR DAIR',134,'Father','03439237661',1,'2026-05-19 08:47:54','2026-05-19 08:47:54'),(285,'ZIA UR REHMAN',14,'Father','03449688400',1,'2026-05-19 08:49:49','2026-05-19 08:49:49'),(286,NULL,161,'Father','03466619256',1,'2026-05-19 08:55:02','2026-05-19 08:55:02'),(287,'FAZAL RAHMAT',101,'Father','03462341737',1,'2026-05-19 08:58:18','2026-05-19 08:58:18'),(289,'MISBAH UDDIN',22,'FATHER','03459527642',1,'2026-05-19 09:01:18','2026-05-19 09:01:18'),(290,'FAROOQ KHAN',104,'Father','03419051193',1,'2026-05-19 09:02:46','2026-05-19 09:02:46'),(291,'JAMAL UD DIN',158,'Father','03462027572',1,'2026-05-19 09:06:00','2026-05-19 09:06:00'),(292,NULL,63,'Father','03433411175',1,'2026-05-19 09:08:47','2026-05-19 09:08:47'),(293,NULL,76,'Father','03143588999',1,'2026-05-19 09:10:11','2026-05-19 09:10:11'),(294,'SAID NAWAB',9,'Father','03479101002',1,'2026-05-19 09:12:17','2026-05-19 09:12:17'),(295,'MAJEEDULLAH KHAN',19,'Father','03456093567',1,'2026-05-20 06:19:36','2026-05-20 06:19:36'),(296,'IJAZ AHMAD',20,'Father','03431730012',1,'2026-05-20 06:21:58','2026-05-20 06:21:58'),(297,'MUSTAAN',21,'Father','03444707788',1,'2026-05-20 06:23:49','2026-05-20 06:23:49'),(298,'NASIR ULLAH KHAN',48,'Father','03469429431',1,'2026-05-20 06:25:49','2026-05-20 06:25:49'),(299,'SADAR NAWAB',51,'Father','03459414925',1,'2026-05-20 06:27:26','2026-05-20 06:27:26'),(300,'AKBAR ZADA',54,'Father','03462087477',1,'2026-05-20 06:29:49','2026-05-20 06:29:49'),(301,'RAHMAT ALI',56,'Father','03453040555',1,'2026-05-20 07:14:52','2026-05-20 07:14:52'),(303,'HUSSAIN ALI',65,'Father','03474428232',1,'2026-05-20 07:21:59','2026-05-20 07:21:59'),(304,'FAZAL WAHAB',68,'Father','03459527696',1,'2026-05-21 04:54:40','2026-05-21 04:54:40'),(305,'NASIR ULLAH KHAN',62,'Father','03469429431',1,'2026-05-21 04:57:21','2026-05-21 04:57:21'),(306,'RAHMAT ALI KHAN',58,'Father','03449800691',1,'2026-05-21 04:57:33','2026-05-21 04:57:33'),(307,'FAZAL AKBAR',69,'Father','03489506502',1,'2026-05-21 05:00:23','2026-05-21 05:00:23'),(308,'ADIL SHAH',74,'Father','03429624664',1,'2026-05-21 05:02:36','2026-05-21 05:02:36'),(309,'MUHAMMAD SAMI UL HAQ',80,'Father','03449881544',1,'2026-05-21 05:05:39','2026-05-21 05:05:39'),(311,'SARFARAZ KHAN',82,'Father','03438986147',1,'2026-05-21 05:09:08','2026-05-21 05:09:08'),(312,'UMAR HAYAT',78,'Father','03469734734',1,'2026-05-21 05:10:54','2026-05-21 05:10:54'),(313,'ANWAR UL HAQ',84,'Father','03449708305',1,'2026-05-21 05:14:33','2026-05-21 05:14:33'),(314,'MUJEEB ULLAH',88,'Father','034694599321',1,'2026-05-21 05:16:35','2026-05-21 05:16:35'),(315,'MEHBOOB ALI',90,'Father','03475011374',1,'2026-05-21 05:23:00','2026-05-21 05:23:00'),(316,'FAZAL RAHMAT',92,'Father','03462341737',1,'2026-05-21 05:27:13','2026-05-21 05:27:13'),(317,'MUHAMMAD IQBAL',95,'Father','03469693592',1,'2026-05-21 08:21:47','2026-05-21 08:21:47'),(319,'ZABARDAST KHAN',100,'Father','03449652272',1,'2026-05-21 08:27:02','2026-05-21 08:27:02'),(320,'FAZAL RAHMAN',103,'Father','03441987771',1,'2026-05-21 08:28:58','2026-05-21 08:28:58'),(321,'KHAISTA RAHMAN',97,'Father','03449652272',1,'2026-05-21 08:30:00','2026-05-21 08:30:00'),(322,'SHAH IRAN BACHA',18,'Father','03449815394',1,'2026-05-21 08:32:06','2026-05-21 08:32:06'),(324,'BASHIR AHMAD',16,'Father','03449992500',1,'2026-05-21 08:36:10','2026-05-21 08:36:10'),(325,'MUHAMMAD RAFIQ',17,'Father','03469693615',1,'2026-05-21 08:48:02','2026-05-21 08:48:02'),(326,NULL,34,'Father','03400915323',1,'2026-05-23 06:02:37','2026-05-23 06:02:37'),(327,NULL,36,'Father','03439589891',1,'2026-05-23 06:03:11','2026-05-23 06:03:11'),(328,NULL,38,'Father','03412443448',1,'2026-05-23 06:03:35','2026-05-23 06:03:35'),(329,'SHAFI UDDIN',50,'Father','03400965489',1,'2026-05-23 06:04:17','2026-05-23 06:04:17'),(330,NULL,59,'Father','034530622018',1,'2026-05-23 06:05:21','2026-05-23 06:05:21'),(331,'SARDAR NAWAB',154,'Father','03469383590',1,'2026-05-23 06:06:26','2026-05-23 06:06:26'),(332,'MUHAMMAD SADIQ',177,'Father','03444345919',1,'2026-05-25 06:14:45','2026-05-25 06:14:45'),(333,'WHATSAPP',177,'Father','03451952724',0,'2026-05-25 06:14:45','2026-05-25 06:14:45'),(334,'ARAB NAWAZ KHAN',138,'Father','03433033272',1,'2026-05-25 06:28:37','2026-05-25 06:28:37'),(335,'FAZAL RABBANI',141,'Father','03469408043',1,'2026-05-25 06:29:55','2026-05-25 06:29:55'),(336,'NIAMAT KHAN',128,'Father','031727771689',1,'2026-05-25 10:07:21','2026-05-25 10:07:21'),(337,'AFSAR WALI',5,'Father','03415300620',1,'2026-05-25 11:25:51','2026-05-25 11:25:51'),(338,'WALEED KHAN',149,'Father','03449688507',1,'2026-05-25 11:37:30','2026-05-25 11:37:30'),(339,'MUHAMMAD AZAM KHAN',150,'Father','03431320093',1,'2026-05-25 11:38:39','2026-05-25 11:38:39'),(340,'UNCLE',43,'UNCLE','03469734734',1,'2026-05-25 11:39:32','2026-05-25 11:39:32'),(341,'IZAT KHAN',12,'Father','03481095596',1,'2026-05-25 11:41:14','2026-05-25 11:41:14'),(342,'SHAMS UL HAQ',11,'Father','03412443448',1,'2026-05-25 11:43:35','2026-05-25 11:43:35'),(343,'NASAR ALI',178,'Father','030',1,'2026-06-02 07:18:00','2026-06-02 07:18:00'),(344,'GHAZI KHAN',179,'Father','03',1,'2026-06-02 07:24:38','2026-06-02 07:24:38'),(345,'IMRAN ALI',137,'Father','03469342455',1,'2026-06-02 07:25:50','2026-06-02 07:25:50'),(346,'MUHAMMAD PARVAIZ KHAN',180,'Father','03',1,'2026-06-02 07:31:09','2026-06-02 07:31:09'),(347,'A',181,'Father','03',1,'2026-06-02 07:34:02','2026-06-02 07:34:02'),(348,'USMAN KHAN',182,'Father','03',1,'2026-06-02 07:35:40','2026-06-02 07:35:40'),(349,'MUHAMMAD PARVAIZ KHAN',183,'Father','03',1,'2026-06-02 07:39:36','2026-06-02 07:39:36');
/*!40000 ALTER TABLE `student_contacts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `student_register_entries`
--

DROP TABLE IF EXISTS `student_register_entries`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `student_register_entries` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `student_id` int unsigned NOT NULL,
  `register_level` enum('pre_primary','primary','middle','secondary','higher_secondary') NOT NULL,
  `admission_no` varchar(50) NOT NULL COMMENT 'Serial number from the government hard register for this education level',
  `entry_date` date DEFAULT NULL COMMENT 'Date this entry was made in the hard register',
  `class_of_admission` varchar(100) DEFAULT NULL COMMENT 'Class the student was in when first admitted to this register level — free text, not linked to class_groups',
  `notes` text COMMENT 'e.g. correction entry, re-admission',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_student_register_level` (`student_id`,`register_level`),
  UNIQUE KEY `uq_level_admission_no` (`register_level`,`admission_no`),
  KEY `idx_register_entry_student_id` (`student_id`),
  CONSTRAINT `student_register_entries_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=159 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student_register_entries`
--

LOCK TABLES `student_register_entries` WRITE;
/*!40000 ALTER TABLE `student_register_entries` DISABLE KEYS */;
INSERT INTO `student_register_entries` VALUES (1,162,'primary','1600','2020-01-01',NULL,NULL,'2026-05-19 05:58:27','2026-05-19 05:58:27'),(2,23,'primary','1606','2020-01-01',NULL,NULL,'2026-05-19 06:05:38','2026-05-19 06:05:38'),(3,23,'middle','1784','2026-01-01',NULL,NULL,'2026-05-19 06:05:52','2026-05-19 06:05:52'),(4,24,'primary','1612','2020-01-01',NULL,NULL,'2026-05-19 06:12:12','2026-05-19 06:12:12'),(5,24,'middle','1787','2026-01-01',NULL,NULL,'2026-05-19 06:12:13','2026-05-19 06:12:13'),(6,25,'primary','1613','2020-01-01',NULL,NULL,'2026-05-19 06:14:31','2026-05-19 06:14:31'),(7,25,'middle','1788','2026-01-01',NULL,NULL,'2026-05-19 06:14:32','2026-05-19 06:14:32'),(8,26,'primary','1617','2020-01-01',NULL,NULL,'2026-05-19 06:19:39','2026-05-19 06:19:39'),(9,26,'middle','1789','2026-01-01',NULL,NULL,'2026-05-19 06:19:39','2026-05-19 06:19:39'),(10,27,'middle','1791','2026-01-01',NULL,NULL,'2026-05-19 06:24:36','2026-05-19 06:24:36'),(11,27,'primary','1625','2020-01-01',NULL,NULL,'2026-05-19 06:25:27','2026-05-19 06:25:27'),(12,28,'middle','1792','2026-01-01',NULL,NULL,'2026-05-19 06:29:14','2026-05-19 06:29:14'),(13,28,'primary','1626','2020-01-01',NULL,NULL,'2026-05-19 06:29:15','2026-05-19 06:29:15'),(14,29,'primary','1630','2020-01-01',NULL,NULL,'2026-05-19 07:11:08','2026-05-19 07:11:08'),(15,29,'middle','1793','2026-01-01',NULL,NULL,'2026-05-19 07:11:09','2026-05-19 07:11:09'),(16,30,'primary','1633','2020-01-01',NULL,NULL,'2026-05-19 07:13:45','2026-05-19 07:13:45'),(17,30,'middle','1794','2026-01-01',NULL,NULL,'2026-05-19 07:13:58','2026-05-19 07:13:58'),(18,55,'primary','1637','2020-02-01',NULL,NULL,'2026-05-19 07:16:48','2026-05-19 07:16:48'),(19,55,'middle','1573','2022-01-25',NULL,NULL,'2026-05-19 07:18:46','2026-05-19 07:18:46'),(20,55,'secondary','1687','2025-02-02',NULL,NULL,'2026-05-19 07:19:53','2026-05-19 07:19:53'),(21,154,'primary','1648','2020-02-18',NULL,NULL,'2026-05-19 07:23:02','2026-05-19 07:23:02'),(22,154,'middle','1759','2025-01-10',NULL,NULL,'2026-05-19 07:23:15','2026-05-19 07:23:15'),(23,136,'primary','1654','2020-11-11',NULL,NULL,'2026-05-19 07:26:23','2026-05-19 07:26:23'),(24,136,'middle','1704','2024-01-26',NULL,NULL,'2026-05-19 07:26:43','2026-05-19 07:26:43'),(25,163,'primary','1661','2021-01-01',NULL,NULL,'2026-05-19 07:29:26','2026-05-19 07:29:26'),(26,164,'primary','1662','2021-01-01',NULL,NULL,'2026-05-19 07:30:34','2026-05-19 07:30:34'),(27,165,'primary','1664','2021-01-01',NULL,NULL,'2026-05-19 07:32:07','2026-05-19 07:32:07'),(28,166,'primary','1666','2021-01-01',NULL,NULL,'2026-05-19 07:33:53','2026-05-19 07:33:53'),(29,167,'primary','1667','2021-01-01',NULL,NULL,'2026-05-19 07:37:11','2026-05-19 07:37:11'),(30,168,'primary','1668','2021-01-01',NULL,NULL,'2026-05-19 07:42:03','2026-05-19 07:42:03'),(31,169,'primary','1669','2021-01-01',NULL,NULL,'2026-05-19 07:43:26','2026-05-19 07:43:26'),(32,170,'primary','1671','2021-01-01',NULL,NULL,'2026-05-19 07:45:16','2026-05-19 07:45:16'),(33,171,'primary','1674','2021-01-01',NULL,NULL,'2026-05-19 07:47:10','2026-05-19 07:47:10'),(34,4,'primary','1732','2022-03-02',NULL,NULL,'2026-05-19 07:48:29','2026-05-19 08:18:22'),(35,172,'primary','1676','2021-01-01',NULL,NULL,'2026-05-19 07:50:01','2026-05-19 07:50:01'),(36,173,'primary','1678','2021-01-01',NULL,NULL,'2026-05-19 07:51:13','2026-05-19 07:51:13'),(37,174,'primary','1679','2021-01-01',NULL,NULL,'2026-05-19 07:53:48','2026-05-19 07:53:48'),(38,175,'primary','1680','2021-01-01',NULL,NULL,'2026-05-19 07:55:04','2026-05-19 07:55:04'),(39,82,'middle','1643','2023-01-28',NULL,NULL,'2026-05-19 07:59:39','2026-05-19 07:59:39'),(40,82,'primary','1697','2021-08-25',NULL,NULL,'2026-05-19 07:59:40','2026-05-19 07:59:40'),(41,1,'primary','1701','2022-01-01',NULL,NULL,'2026-05-19 08:00:52','2026-05-19 08:00:52'),(42,6,'primary','1702','2022-01-01',NULL,NULL,'2026-05-19 08:02:13','2026-05-19 08:02:13'),(43,7,'primary','1703','2022-01-01',NULL,NULL,'2026-05-19 08:03:38','2026-05-19 08:03:38'),(44,8,'primary','1706','2022-01-01',NULL,NULL,'2026-05-19 08:05:06','2026-05-19 08:05:06'),(45,9,'primary','1709','2022-01-01',NULL,NULL,'2026-05-19 08:06:28','2026-05-19 08:06:28'),(46,10,'primary','1710','2022-01-01',NULL,NULL,'2026-05-19 08:08:01','2026-05-19 08:08:01'),(47,81,'primary','1715','2022-01-01',NULL,NULL,'2026-05-19 08:09:26','2026-05-19 08:09:26'),(48,83,'primary','1716','2022-01-01',NULL,NULL,'2026-05-19 08:10:40','2026-05-19 08:10:40'),(49,132,'primary','1727','2022-02-10',NULL,NULL,'2026-05-19 08:13:47','2026-05-19 08:13:47'),(50,132,'middle','1711','2024-01-28',NULL,NULL,'2026-05-19 08:13:48','2026-05-19 08:13:48'),(51,131,'middle','1712','2024-01-28',NULL,NULL,'2026-05-19 08:15:35','2026-05-19 08:15:35'),(52,4,'middle','1799','2026-01-10',NULL,NULL,'2026-05-19 08:18:36','2026-05-19 08:18:36'),(53,156,'middle','1762','2025-01-10',NULL,NULL,'2026-05-19 08:20:10','2026-05-19 08:20:10'),(54,156,'primary','1734','2022-03-07',NULL,NULL,'2026-05-19 08:20:11','2026-05-19 08:20:11'),(55,49,'primary','1736','2022-04-06',NULL,NULL,'2026-05-19 08:21:51','2026-05-19 08:21:51'),(56,52,'primary','1737','2022-04-07',NULL,NULL,'2026-05-19 08:23:05','2026-05-19 08:23:05'),(57,47,'primary','1739','2022-04-14',NULL,NULL,'2026-05-19 08:24:20','2026-05-19 08:24:20'),(58,84,'middle','1647','2023-01-28',NULL,NULL,'2026-05-19 08:26:20','2026-05-19 08:26:20'),(59,84,'primary','1740','2022-04-14',NULL,NULL,'2026-05-19 08:26:21','2026-05-19 08:26:21'),(60,133,'middle','1709','2024-01-26',NULL,NULL,'2026-05-19 08:29:03','2026-05-19 08:29:03'),(61,133,'primary','1744','2022-07-31',NULL,NULL,'2026-05-19 08:29:03','2026-05-19 08:29:03'),(62,157,'primary','1749','2022-09-09',NULL,NULL,'2026-05-19 08:31:48','2026-05-19 08:31:48'),(63,157,'middle','1763','2025-01-10',NULL,NULL,'2026-05-19 08:32:16','2026-05-19 08:32:16'),(64,2,'primary','1756','2023-01-01',NULL,NULL,'2026-05-19 08:34:28','2026-05-19 08:34:28'),(65,13,'primary','1759','2023-01-01',NULL,NULL,'2026-05-19 08:36:14','2026-05-19 08:36:14'),(66,31,'primary','1766','2023-01-01',NULL,NULL,'2026-05-19 08:38:05','2026-05-19 08:38:05'),(67,32,'primary','1773','2023-01-01',NULL,NULL,'2026-05-19 08:42:23','2026-05-19 08:42:23'),(68,35,'primary','1774','2023-01-01',NULL,NULL,'2026-05-19 08:43:37','2026-05-19 08:43:37'),(69,105,'primary','1777','2023-01-01',NULL,NULL,'2026-05-19 08:44:59','2026-05-19 08:44:59'),(70,41,'primary','1780','2023-01-01',NULL,NULL,'2026-05-19 08:46:28','2026-05-19 08:46:28'),(71,134,'middle','1707','2024-01-26',NULL,NULL,'2026-05-19 08:48:25','2026-05-19 08:48:25'),(72,134,'primary','1784','2023-02-07',NULL,NULL,'2026-05-19 08:48:26','2026-05-19 08:48:26'),(73,14,'primary','1786','2023-02-13',NULL,NULL,'2026-05-19 08:52:56','2026-05-19 08:52:56'),(74,14,'middle','1800','2026-01-10',NULL,NULL,'2026-05-19 08:53:16','2026-05-19 08:53:16'),(75,161,'primary','1787','2023-02-13',NULL,NULL,'2026-05-19 08:55:30','2026-05-19 08:55:30'),(76,101,'primary','1791','2023-03-29',NULL,NULL,'2026-05-19 08:58:39','2026-05-19 08:58:39'),(77,22,'primary','1792','2023-06-15',NULL,NULL,'2026-05-19 09:00:51','2026-05-19 09:00:51'),(78,22,'middle','1801','2026-01-10',NULL,NULL,'2026-05-19 09:01:03','2026-05-19 09:01:03'),(79,104,'primary','1794','2023-11-07',NULL,NULL,'2026-05-19 09:03:04','2026-05-19 09:03:04'),(80,158,'middle','1766','2025-01-10',NULL,NULL,'2026-05-19 09:06:32','2026-05-19 09:06:32'),(81,158,'primary','1825','2024-02-14',NULL,NULL,'2026-05-19 09:06:33','2026-05-19 09:06:33'),(82,63,'primary','1831','2024-08-05',NULL,NULL,'2026-05-19 09:08:59','2026-05-19 09:08:59'),(83,76,'primary','1832','2024-09-07',NULL,NULL,'2026-05-19 09:10:31','2026-05-19 09:10:31'),(84,19,'secondary','1720','2026-01-02',NULL,NULL,'2026-05-20 06:20:26','2026-05-20 06:20:26'),(85,19,'middle','1611','2023-01-28',NULL,NULL,'2026-05-20 06:20:27','2026-05-20 06:20:27'),(86,19,'primary','1405','2017-01-01',NULL,NULL,'2026-05-20 06:20:28','2026-05-20 06:20:28'),(87,20,'secondary','1721','2026-01-02',NULL,NULL,'2026-05-20 06:22:39','2026-05-20 06:22:39'),(88,20,'middle','1612','2023-01-28',NULL,NULL,'2026-05-20 06:22:40','2026-05-20 06:22:40'),(89,20,'primary','1407','2017-01-01',NULL,NULL,'2026-05-20 06:22:41','2026-05-20 06:22:41'),(90,21,'secondary','1722','2026-01-02',NULL,NULL,'2026-05-20 06:24:36','2026-05-20 06:24:36'),(91,21,'middle','1615','2023-01-28',NULL,NULL,'2026-05-20 06:24:37','2026-05-20 06:24:37'),(92,21,'primary','1414','2017-01-01',NULL,NULL,'2026-05-20 06:24:38','2026-05-20 06:24:38'),(93,48,'secondary','1723','2026-01-02',NULL,NULL,'2026-05-20 06:26:30','2026-05-20 06:26:30'),(94,48,'middle','1616','2023-01-28',NULL,NULL,'2026-05-20 06:26:31','2026-05-20 06:26:31'),(95,48,'primary','1418','2017-01-01',NULL,NULL,'2026-05-20 06:26:32','2026-05-20 06:26:32'),(96,51,'secondary','1724','2026-01-02',NULL,NULL,'2026-05-20 06:28:23','2026-05-20 06:28:23'),(97,51,'middle','1618','2023-01-28',NULL,NULL,'2026-05-20 06:28:24','2026-05-20 06:28:24'),(98,51,'primary','1420','2017-01-01',NULL,NULL,'2026-05-20 06:28:25','2026-05-20 06:28:25'),(99,54,'secondary','1725','2026-01-02',NULL,NULL,'2026-05-20 06:30:58','2026-05-20 06:30:58'),(100,54,'middle','1620','2023-01-28',NULL,NULL,'2026-05-20 06:30:59','2026-05-20 06:30:59'),(101,54,'primary','1432','2017-01-01',NULL,NULL,'2026-05-20 06:31:00','2026-05-20 06:31:00'),(102,56,'secondary','1726','2026-01-02',NULL,NULL,'2026-05-20 07:16:17','2026-05-20 07:16:17'),(103,56,'middle','1624','2023-01-28',NULL,NULL,'2026-05-20 07:16:18','2026-05-20 07:16:18'),(104,56,'primary','1438','2017-01-01',NULL,NULL,'2026-05-20 07:16:19','2026-05-20 07:16:19'),(105,62,'secondary','1730','2026-01-02',NULL,NULL,'2026-05-20 07:19:02','2026-05-20 07:19:02'),(106,62,'middle','1630','2023-01-28',NULL,NULL,'2026-05-20 07:19:02','2026-05-20 07:19:02'),(107,62,'primary','1448','2017-01-01',NULL,NULL,'2026-05-20 07:19:03','2026-05-20 07:19:03'),(108,65,'secondary','1733','2026-01-02',NULL,NULL,'2026-05-20 07:27:10','2026-05-20 07:27:10'),(109,65,'middle','1634','2023-01-28',NULL,NULL,'2026-05-20 07:27:11','2026-05-20 07:27:11'),(110,65,'primary','1581','2019-02-07',NULL,NULL,'2026-05-20 07:40:10','2026-05-20 07:40:10'),(111,68,'secondary','1734','2026-01-02',NULL,NULL,'2026-05-21 04:55:25','2026-05-21 04:55:25'),(112,68,'middle','1635','2023-01-28',NULL,NULL,'2026-05-21 04:55:25','2026-05-21 04:55:25'),(113,68,'primary','1583','2019-02-09',NULL,NULL,'2026-05-21 04:55:26','2026-05-21 04:55:26'),(114,58,'secondary','1731','2026-01-02',NULL,NULL,'2026-05-21 04:59:04','2026-05-21 04:59:04'),(115,58,'middle','1629','2023-01-28',NULL,NULL,'2026-05-21 04:59:04','2026-05-21 04:59:04'),(116,58,'primary','1447','2017-01-01',NULL,NULL,'2026-05-21 04:59:05','2026-05-21 04:59:05'),(117,69,'secondary','1736','2026-01-02',NULL,NULL,'2026-05-21 05:01:33','2026-05-21 05:01:33'),(118,69,'middle','1637','2023-01-28',NULL,NULL,'2026-05-21 05:01:34','2026-05-21 05:01:34'),(119,69,'primary','1589','2019-02-22',NULL,NULL,'2026-05-21 05:01:35','2026-05-21 05:01:35'),(120,74,'secondary','1737','2026-01-02',NULL,NULL,'2026-05-21 05:03:26','2026-05-21 05:03:26'),(121,74,'middle','1638','2023-01-28',NULL,NULL,'2026-05-21 05:03:27','2026-05-21 05:03:27'),(122,74,'primary','1591','2019-02-23',NULL,NULL,'2026-05-21 05:03:28','2026-05-21 05:03:28'),(123,80,'secondary','1739','2026-01-02',NULL,NULL,'2026-05-21 05:07:09','2026-05-21 05:07:09'),(124,80,'middle','1641','2023-01-28',NULL,NULL,'2026-05-21 05:07:09','2026-05-21 05:07:09'),(125,80,'primary','1641','2020-02-04',NULL,NULL,'2026-05-21 05:07:10','2026-05-21 05:07:10'),(126,82,'secondary','1740','2026-01-02',NULL,NULL,'2026-05-21 05:08:59','2026-05-21 05:08:59'),(127,78,'secondary','1738','2026-01-02',NULL,NULL,'2026-05-21 05:13:01','2026-05-21 05:13:01'),(128,78,'middle','1639','2023-01-28',NULL,NULL,'2026-05-21 05:13:02','2026-05-21 05:13:02'),(129,78,'primary','1592','2019-04-15',NULL,NULL,'2026-05-21 05:13:04','2026-05-21 05:13:04'),(130,84,'secondary','1743','2026-01-02',NULL,NULL,'2026-05-21 05:14:45','2026-05-21 05:14:45'),(131,88,'secondary','1746','2026-01-02',NULL,NULL,'2026-05-21 05:21:22','2026-05-21 05:21:22'),(132,90,'secondary','1747','2026-01-02',NULL,NULL,'2026-05-21 05:25:34','2026-05-21 05:25:34'),(133,90,'middle','1664','2023-01-28',NULL,'Revised from 1617','2026-05-21 05:25:35','2026-05-21 05:25:35'),(134,90,'primary','1419','2017-01-01',NULL,NULL,'2026-05-21 05:25:36','2026-05-21 05:25:36'),(135,92,'secondary','1748','2026-01-02',NULL,NULL,'2026-05-21 05:28:20','2026-05-21 05:28:20'),(136,92,'middle','1671',NULL,NULL,NULL,'2026-05-21 05:28:21','2026-05-21 05:28:21'),(137,88,'middle','1663',NULL,NULL,NULL,'2026-05-21 06:14:04','2026-05-21 06:14:04'),(138,95,'secondary','1749','2026-01-02',NULL,NULL,'2026-05-21 08:22:47','2026-05-21 08:22:47'),(139,95,'middle','1727',NULL,NULL,NULL,'2026-05-21 08:22:47','2026-05-21 08:22:47'),(140,97,'secondary','1751','2026-01-02',NULL,NULL,'2026-05-21 08:25:40','2026-05-21 08:25:40'),(141,97,'middle','1768','2025-02-25',NULL,NULL,'2026-05-21 08:26:10','2026-05-21 08:26:10'),(142,100,'secondary','1752','2026-01-02',NULL,NULL,'2026-05-21 08:27:32','2026-05-21 08:27:32'),(143,100,'middle','1769','2025-02-03',NULL,NULL,'2026-05-21 08:27:44','2026-05-21 08:27:44'),(144,103,'secondary','1753','2026-01-02',NULL,NULL,'2026-05-21 08:29:27','2026-05-21 08:29:27'),(145,103,'middle','1770','2025-02-03',NULL,NULL,'2026-05-21 08:29:28','2026-05-21 08:29:28'),(146,18,'secondary','1754','2026-01-02',NULL,NULL,'2026-05-21 08:33:05','2026-05-21 08:33:05'),(147,18,'middle','1779',NULL,NULL,NULL,'2026-05-21 08:33:06','2026-05-21 08:33:06'),(148,18,'primary','1688','2021-02-18',NULL,NULL,'2026-05-21 08:33:07','2026-05-21 08:33:07'),(149,17,'secondary','1759','2026-01-02',NULL,NULL,'2026-05-21 08:35:08','2026-05-21 08:35:08'),(150,16,'secondary','1760','2026-02-14',NULL,NULL,'2026-05-21 08:36:27','2026-05-21 08:36:27'),(151,177,'secondary','1763','2026-04-13',NULL,NULL,'2026-05-25 06:14:45','2026-05-25 06:15:08'),(152,12,'middle','1802','2026-01-10',NULL,NULL,'2026-05-25 11:41:48','2026-05-25 11:41:48'),(153,12,'primary','1793',NULL,NULL,NULL,'2026-05-25 11:41:49','2026-05-25 11:41:49'),(154,11,'middle','1803','2026-01-10',NULL,NULL,'2026-05-25 11:44:19','2026-05-25 11:44:19'),(155,178,'primary','1760',NULL,NULL,NULL,'2026-06-02 07:18:00','2026-06-02 07:18:00'),(156,179,'primary','1775',NULL,NULL,NULL,'2026-06-02 07:24:38','2026-06-02 07:24:38'),(157,180,'middle','1810',NULL,NULL,NULL,'2026-06-02 07:31:09','2026-06-02 07:31:09'),(158,183,'secondary','1764',NULL,NULL,NULL,'2026-06-02 07:39:36','2026-06-02 07:39:36');
/*!40000 ALTER TABLE `student_register_entries` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `students`
--

DROP TABLE IF EXISTS `students`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `students` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int unsigned DEFAULT NULL COMMENT 'Null until student portal access is granted. Managed by a dedicated account-linking flow, not the student create/update endpoints.',
  `gr_no` varchar(50) NOT NULL COMMENT 'GR number, unique school-wide, assigned at registration, write-once',
  `full_name` varchar(160) NOT NULL,
  `date_of_birth` date DEFAULT NULL,
  `gender` enum('male','female') NOT NULL,
  `b_form_no` varchar(20) DEFAULT NULL COMMENT 'NADRA child registration certificate number (B-Form)',
  `religion` varchar(50) DEFAULT NULL,
  `nationality` varchar(50) DEFAULT NULL,
  `blood_group` varchar(5) DEFAULT NULL COMMENT 'e.g. A+, B-, O+',
  `address` text,
  `admission_date` date DEFAULT NULL,
  `father_name` varchar(100) NOT NULL,
  `father_cnic` varchar(15) DEFAULT NULL COMMENT 'Pakistani national identity card number of father',
  `father_occupation` varchar(100) DEFAULT NULL,
  `domicile_district` varchar(100) DEFAULT NULL COMMENT 'District of domicile, required for board exam registration',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_gr_no` (`gr_no`),
  UNIQUE KEY `uq_b_form_no` (`b_form_no`),
  KEY `idx_student_user_id` (`user_id`),
  CONSTRAINT `students_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=184 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `students`
--

LOCK TABLES `students` WRITE;
/*!40000 ALTER TABLE `students` DISABLE KEYS */;
INSERT INTO `students` VALUES (1,NULL,'1701-0','ZARAK BACHA','2018-01-15','male',NULL,'ISLAM','PAKISTANI',NULL,'TEGDARAI, KHWAZA KHELA, SWAT','2022-01-01','FAZAL BACHA','15602-1034393-3','OVERSEAS','SWAT','2026-05-11 04:57:32','2026-05-19 08:00:36'),(2,NULL,'1756-0','AIMAL KHAN','2019-02-01','male',NULL,'ISLAM','PAKISTANI',NULL,'LANGAR K KHELA SWAT','2022-01-01','SADAR NAWAB',NULL,'OVERSEAS','SWAT','2026-05-11 05:09:28','2026-05-19 08:34:12'),(3,NULL,'115-N','RIZWAN ULLAH','2015-01-05','male',NULL,'ISLAM','PAKISTANI',NULL,'KHWAZA KHELA SWAT',NULL,'ATIQ ULLAH',NULL,NULL,NULL,'2026-05-11 05:11:20','2026-05-11 05:11:20'),(4,NULL,'1799-1','NIAZ KHAN','2014-03-10','male',NULL,'ISLAM','PAKISTANI',NULL,'BANDAI, KHWAZA KHELA, SWAT','2026-01-10','SHAH NOORAQ','15602-7745311-5','BUSINESS','SWAT','2026-05-11 05:13:15','2026-05-19 08:18:03'),(5,NULL,'1806-1','UMAR FAROOQ','2015-03-31','male',NULL,'ISLAM','PAKISTANI',NULL,'MASHKOMAI, KHWAZA KHELA, SWAT','2026-01-10','AFSAR WALI',NULL,NULL,'SWAT','2026-05-11 05:15:23','2026-05-25 11:25:51'),(6,NULL,'1702-0','MALAK NABHAN','2017-12-15','male',NULL,'ISLAM','PAKISTANI',NULL,'BARA ASALA KHWAZA KHELA SWAT','2022-01-01','IMRAN ALI','15602-5068105-9','OVERSEAS','SWAT','2026-05-11 05:15:24','2026-05-19 08:02:00'),(7,NULL,'1703-0','MUHAMMAD QASIM','2017-12-31','male',NULL,'ISLAM','PAKISTANI',NULL,'TIGDARAI KHWAZA KHELA SWAT','2022-01-01','MUHAMMAD ZARNOSH','15602-5871445-9','BUSINESS','SWAT','2026-05-11 05:19:36','2026-05-19 08:03:23'),(8,NULL,'1706-0','ARBAZ KHAN','2017-12-15','male',NULL,'ISLAM','PAKISTANI',NULL,'LANGER KHWAZA KHELA SWAT','2022-01-01','MALAK SARDAR','15602-3156848-5','BUSINESS','SWAT','2026-05-11 05:23:08','2026-05-19 08:04:51'),(9,NULL,'1709-0','AZAN KHAN','2018-02-05','male',NULL,'ISLAM','PAKISTANI',NULL,'MANPITAY KHWAZA KHELA SWAT','2022-01-01','SAID NAWAB','15602-8880858-1','FARMER','SWAT','2026-05-11 05:26:34','2026-05-19 09:12:17'),(10,NULL,'1710-0','AZAN KHAN','2018-03-20','male',NULL,'ISLAM','PAKISTANI',NULL,'ALAMGHANJ KHWAZA KHELA SWAT','2022-01-01','YOUSAF KHAN','15602-6391408-5','SERVICE','SWAT','2026-05-11 05:31:46','2026-05-19 08:07:44'),(11,NULL,'1803-1','ZARYAB UL HAQ','2016-04-06','male',NULL,'ISLAM','PAKISTANI',NULL,'CHALYAR, KHWAZA KHELA, SWAT','2026-01-10','SHAMS UL HAQ',NULL,'GOVT. SERVANT','SWAT','2026-05-11 05:32:06','2026-05-25 11:43:35'),(12,NULL,'1802-1','ABBAS KHAN',NULL,'male',NULL,'ISLAM','PAKISTANI',NULL,'GHAR SHIN, KHWAZA KHELA, SWAT','2026-01-10','IZAT KHAN',NULL,'OVERSEAS','SWAT','2026-05-11 05:53:03','2026-05-25 11:41:14'),(13,NULL,'1759-0','MUHAMMAD AMAAR','2019-01-05','male',NULL,'ISLAM','PAKISTANI',NULL,'CHAMTALAI K KHELA SWAT','2023-01-01','MUHAMMAD SAMI UL HAQ',NULL,'OVERSEAS','SWAT','2026-05-11 05:53:48','2026-05-19 08:35:59'),(14,NULL,'1800-1','MUHAMMAD SOHAIB','2015-02-10','male',NULL,'ISLAM','PAKISTANI',NULL,'DANDO, CHAMTALAI, KHWAZA KHELA, SWAT','2026-01-10','ZIA UR REHMAN',NULL,'OVERSEAS','SWAT','2026-05-11 05:58:07','2026-05-19 08:49:49'),(15,NULL,'1675-2','MANSOOR KHAN','2011-12-05','male',NULL,'ISLAM','PAKISTANI',NULL,'BANDAI KHWAZA KHELA SWAT',NULL,'HAKIM ZADA',NULL,NULL,NULL,'2026-05-11 06:01:27','2026-05-11 06:01:27'),(16,NULL,'1760-2','NIZAM AHMAD','2012-01-10','male',NULL,'ISLAM','PAKISTANI',NULL,'GASHKOR KHWAZAKHILA SWAT','2026-02-14','BASHIR AHMAD',NULL,'SERVICE','SWAT','2026-05-11 06:04:03','2026-05-21 08:36:10'),(17,NULL,'1759-2','HASSAN KHAN','2013-03-01','male',NULL,'ISLAM','PAKISTANI',NULL,'BANDAI KHWAZAKHILA SWAT','2026-01-02','MUHAMMAD RAFIQ',NULL,'SERVICE','SWAT','2026-05-11 06:07:15','2026-05-21 08:48:02'),(18,NULL,'1754-2','SYED MUZAKKIR SHAH','2012-04-02','male',NULL,'ISLAM','PAKISTANI',NULL,'FARHAT ABAD KHWAZAKHILA SWAT','2026-01-02','SHAH IRAN BACHA',NULL,'BUSINESS','SWAT','2026-05-11 06:10:21','2026-05-21 08:32:06'),(19,NULL,'1720-2','SABIR ULLAH','2011-08-18','male',NULL,'ISLAM','PAKISTANI',NULL,'SHIN NAWY KALY','2026-01-02','MAJEEDULLAH KHAN',NULL,'BUSINESS','SWAT','2026-05-11 06:15:30','2026-05-20 06:19:36'),(20,NULL,'1721-2','ANAS AHMAD','2012-11-21','male',NULL,'ISLAM','PAKISTANI',NULL,'QALA KHWAZAKHILA SWAT','2026-01-02','IJAZ AHMAD',NULL,'OVERSEAS','SWAT','2026-05-11 06:17:29','2026-05-20 06:21:58'),(21,NULL,'1722-2','MURTAZA KHAN','2013-01-01','male',NULL,'ISLAM','PAKISTANI',NULL,'CHAMTALAI KHWAZAKHILA SWAT','2026-01-02','MUSTAAN',NULL,'OVERSEAS','SWAT','2026-05-11 06:21:15','2026-05-20 06:23:49'),(22,NULL,'1801-1','MUHAMMAD FARHAN UDDIN','2016-03-10','male',NULL,'ISLAM','PAKISTANI',NULL,'JANO, KHWAZA KHELA, SWAT','2026-01-10','MISBAH UDDIN',NULL,'GOVT. SERVANT','SWAT','2026-05-11 06:31:08','2026-05-19 09:01:18'),(23,NULL,'1784-1','ABD ULLAH','2015-01-25','male',NULL,'ISLAM','PAKISTANI',NULL,'BABO, KHWAZA KHELA, SWAT','2020-01-01','FAZAL RAHMAN',NULL,'OVERSEAS','SWAT','2026-05-11 06:34:05','2026-05-19 06:05:19'),(24,NULL,'1787-1','MUHAMMAD NIZAM KHAN','2016-01-01','male',NULL,'ISLAM','PAKISTANI',NULL,'GULDERAI, KHWAZA KHELA, SWAT','2026-01-01','DINDAR KHAN',NULL,'OVERSEAS','SWAT','2026-05-11 06:37:57','2026-05-19 06:11:34'),(25,NULL,'1788-1','TALAL KHAN','2016-02-20','male',NULL,'ISLAM','PAKISTANI',NULL,'CHAMTALAI, KHWAZA KHELA, SWAT','2026-01-01','ADIL SHAH',NULL,'GOVT. CONTRACTOR','SWAT','2026-05-11 06:43:16','2026-05-19 06:13:39'),(26,NULL,'1789-1','MUHAMMAD ZOHAIR KHAN','2016-01-01','male',NULL,'ISLAM','PAKISTANI',NULL,'TEGDARAI, KHWAZA KHELA, SWAT','2026-01-01','IQBAL ALI','15602-0324801-5','BUSINESS','SWAT','2026-05-11 06:49:14','2026-05-19 06:19:09'),(27,NULL,'1791-1','ABASIN QASIMI','2016-03-11','male',NULL,'ISLAM','PAKISTANI',NULL,'KHWAZA KHELA, SWAT','2026-01-01','HAJI QASIM','15602-9367418-3','RETIRED GOVT. SERVANT','SWAT','2026-05-11 06:53:51','2026-05-19 06:23:55'),(28,NULL,'1792-1','TALHA KHAN','2016-02-15','male',NULL,'ISLAM','PAKISTANI',NULL,'CHAMTALAI, KHWAZA KHELA, SWAT','2026-01-01','SHABIR KHAN',NULL,'BUSINESS','SWAT','2026-05-11 06:55:55','2026-05-19 06:28:23'),(29,NULL,'1793-1','MUHAMMAD FAIZAN','2016-02-15','male',NULL,'ISLAM','PAKISTANI',NULL,'CHALYAR, KHWAZA KHELA, SWAT','2026-01-01','FAZAL RAHMAN','15602-0269665-1','GOVT. SERVANT','SWAT','2026-05-11 06:59:07','2026-05-19 07:10:39'),(30,NULL,'1794-1','IZHAR ALI KHAN','2016-02-27','male',NULL,'ISLAM','PAKISTANI',NULL,'TEGDARAI, KHWAZA KHELA, SWAT','2026-01-01','RAHMAT ALI KHAN','15602-8175275-3','ADVOCATE','SWAT','2026-05-11 07:01:16','2026-05-19 07:13:15'),(31,NULL,'1766-0','MUHEEB NAWAB KHAN','2019-03-05','male',NULL,'ISLAM','PAKISTANI',NULL,'LANGAR K KHELA SWAT','2023-01-01','MALAK NAWAB',NULL,'OVERSEAS','SWAT','2026-05-11 07:16:18','2026-05-19 08:37:47'),(32,NULL,'1773-0','MUHAMMAD BILAL','2019-02-03','male',NULL,'ISLAM','PAKISTANI',NULL,'WALA K KHELA SWAT','2023-01-01','MUHAMMAD USMAN',NULL,'BUSINESS','SWAT','2026-05-11 07:18:29','2026-05-19 08:39:45'),(33,NULL,'1676-2','RIZWAN ASHRAF','2012-01-03','male',NULL,'ISLAM','PAKISTANI',NULL,'TIGDARI',NULL,'ASHRAF ALI',NULL,NULL,NULL,'2026-05-11 07:21:51','2026-05-11 07:21:51'),(34,NULL,'018-N','SAIF ULLAH','2016-07-21','male',NULL,'ISLAM','PAKISTANI',NULL,'GERO QALA K KHELA SWAT',NULL,'AMIN ULLAH',NULL,NULL,NULL,'2026-05-11 07:22:04','2026-05-23 06:02:37'),(35,NULL,'1774-0','MALAK SAAD','2019-01-05','male',NULL,'ISLAM','PAKISTANI',NULL,'TITABAT K KHELA SWAT','2023-01-01','AKBAR ZADA',NULL,'OVERSEAS','SWAT','2026-05-11 07:24:25','2026-05-19 08:43:24'),(36,NULL,'019-N','MUHAMMAD AFFAN','2018-09-03','male',NULL,'ISLAM','PAKISTANI',NULL,'CHALYAR K KHELA SWAT',NULL,'FAZAL RAHMAN',NULL,NULL,NULL,'2026-05-11 07:26:58','2026-05-23 06:03:11'),(37,NULL,'1677-2','NAQIB Ullah','2012-02-20','male',NULL,'ISLAM','PAKISTANI',NULL,NULL,NULL,'MUHAMMAD FAYOON',NULL,NULL,NULL,'2026-05-11 07:27:30','2026-05-11 07:27:30'),(38,NULL,'020-N','AIZAZ UL HAQ','2018-08-04','male',NULL,'ISLAM','PAKISTANI',NULL,'CHALYAR K KHELA SWAT',NULL,'SHAMS UL HAQ',NULL,NULL,NULL,'2026-05-11 07:28:32','2026-05-23 06:03:35'),(39,NULL,'1678-2','TALHA KHAN','2011-10-01','male',NULL,'ISLAM','PAKISTANI',NULL,'QALA KHWAZA KHELA SWAT',NULL,'RAZA KHAN',NULL,NULL,NULL,'2026-05-11 07:31:07','2026-05-11 07:31:07'),(40,NULL,'1681-2','SAJID KHAN','2012-02-13','male',NULL,'ISLAM','PAKISTANI',NULL,NULL,NULL,'SHABIR KHAN',NULL,NULL,NULL,'2026-05-11 07:34:13','2026-05-11 08:10:56'),(41,NULL,'1780-0','MUHAMMAD TALHA','2019-01-15','male',NULL,'ISLAM','PAKISTANI',NULL,'LANGAR K KHELA SWAT','2023-01-01','MUHAMMAD FAYUN',NULL,'FARMER','SWAT','2026-05-11 07:37:14','2026-05-19 08:46:16'),(42,NULL,'1682-2','WAQAS KHAN','2012-03-01','male',NULL,'ISLAM','PAKISTANI',NULL,'KOTANI KHWAZA KHELA SWAT',NULL,'MASUD UR RAHMAN',NULL,NULL,NULL,'2026-05-11 07:42:53','2026-05-11 08:10:34'),(43,NULL,'1809-1','FAIZAN HAYAT','2015-07-01','male',NULL,'ISLAM','PAKISTANI',NULL,'QALA, KHWAZA KHELA, SWAT','2026-01-10','UMAR HAYAT',NULL,NULL,NULL,'2026-05-11 07:55:22','2026-05-25 11:39:32'),(44,NULL,'1681-1','MUHAMMAD SAAD','2012-04-28','male',NULL,'ISLAM','PAKISTANI',NULL,'BANDAI, KHWAZA KHELA, SWAT',NULL,'MUHAMMAD IKRAM',NULL,NULL,NULL,'2026-05-11 08:02:25','2026-05-11 08:02:25'),(45,NULL,'1741-1','AWAIS AHMAD SHAH','2014-05-28','male',NULL,'ISLAM','PAKISTANI',NULL,'QALA, KHWAZA KHELA, SWAT',NULL,'RAHMAT SHAH','15602-0262587-3','OVERSEAS',NULL,'2026-05-11 08:06:22','2026-05-11 08:06:22'),(46,NULL,'1743-1','HASHAM KHAN','2015-02-10','male',NULL,'ISLAM','PAKISTANI',NULL,'JANO, KHWAZA KHELA, SWAT',NULL,'SHAH NAMDAR KHAN','15602-0321308-3',NULL,NULL,'2026-05-11 08:08:48','2026-05-11 08:08:48'),(47,NULL,'1739-0','HISHAM KHAN','2017-01-01','male',NULL,'ISLAM','PAKISTANI',NULL,'BABU, KHWAZA KHELA, SWAT','2022-04-14','SHAH KHALID','15602-0340886-9','OVERSEAS','SWAT','2026-05-11 08:36:05','2026-05-19 08:23:59'),(48,NULL,'1723-2','HUZAIFA NASIR','2013-01-01','male',NULL,'ISLAM','PAKISTANI',NULL,'CHAMTALAI KHWAZAKHILA SWAT','2026-01-02','NASIR ULLAH KHAN',NULL,'GOVT. SERVANT','SWAT','2026-05-12 03:07:14','2026-05-20 06:25:49'),(49,NULL,'1736-0','BAHLOL YOUSAFZAI','2016-03-18','male',NULL,'ISLAM','PAKISTANI',NULL,'BINKAT FATEHPUR K KHELA SWAT','2022-04-06','AJMAL KHAN','15605-0342527-1','OVERSEAS','SWAT','2026-05-12 03:09:25','2026-05-19 08:21:38'),(50,NULL,'1683-2','MUHAMMAD','2010-07-01','male',NULL,'ISLAM','PAKISTANI',NULL,'KOTANI KHWAZA KHELA SWAT',NULL,'SHAFI UDDIN',NULL,NULL,NULL,'2026-05-12 03:10:17','2026-05-23 06:04:17'),(51,NULL,'1724-2','TANVEER NAWAB','2013-02-06','male',NULL,'ISLAM','PAKISTANI',NULL,'LANGER KHWAZAKHILA SWAT','2026-01-02','SADAR NAWAB',NULL,'OVERSEAS','SWAT','2026-05-12 03:11:16','2026-05-20 06:27:26'),(52,NULL,'1737-0','BARYALAY YOUSAFZAI','2017-03-04','male',NULL,'ISLAM','PAKISTANI',NULL,'BINKAT FATEHPUR K KHELA SWAT','2022-04-07','AJMAL KHAN','15605-0342527-1','OVERSEAS','SWAT','2026-05-12 03:13:16','2026-05-19 08:22:50'),(53,NULL,'1686-2','MAJID KHAN','2011-12-20','male',NULL,'ISLAM','PAKISTANI',NULL,'CHAMTALAI KHWAZA KHELA SWAT',NULL,'MUSTAN',NULL,NULL,NULL,'2026-05-12 03:13:38','2026-05-12 03:13:38'),(54,NULL,'1725-2','MUHAMMAD SAAD','2013-01-01','male',NULL,'ISLAM','PAKISTANI',NULL,'TITABAT KHWAZA KHILA','2026-01-02','AKBAR ZADA',NULL,'OVERSEAS','SWAT','2026-05-12 03:16:28','2026-05-20 06:29:49'),(55,NULL,'1687-2','ABBAS KHAN','2011-01-01','male',NULL,'ISLAM','PAKISTANI',NULL,'KOTANAI KHWAZA KHELA SWAT',NULL,'KHKWALAY KHAN',NULL,'BUSINESS','SWAT','2026-05-12 03:17:11','2026-05-19 07:16:24'),(56,NULL,'1726-2','ABDULLAH KHAN','2013-01-10','male',NULL,'ISLAM','PAKISTANI',NULL,'QALA KHWAZAKHILA SWAT','2026-01-02','RAHMAT ALI',NULL,'BUSINESS','SWAT','2026-05-12 03:19:38','2026-05-20 07:14:52'),(57,NULL,'1690-2','MUHAMMAD SUDAIS','2011-03-06','male',NULL,'ISLAM','PAKISTANI',NULL,'SHALPIN KHWAZA KHELA SWAT',NULL,'MUHAMMAD KARIM',NULL,NULL,NULL,'2026-05-12 03:20:45','2026-05-12 03:20:45'),(58,NULL,'1731-2','NIZAR ALI KHAN','2013-01-01','male',NULL,'ISLAM','PAKISTANI',NULL,'TEKDARAI KHWAZA KHILA','2026-01-02','RAHMAT ALI KHAN',NULL,'ADVOCATE','SWAT','2026-05-12 03:22:26','2026-05-21 04:57:33'),(59,NULL,'0116-N','SALIM ULLAH','2015-01-05','male',NULL,'ISLAM','PAKISTANI',NULL,'KHWAZAKHELA SWAT',NULL,'ATIQ ULLAH',NULL,NULL,NULL,'2026-05-12 03:23:21','2026-05-23 06:05:21'),(60,NULL,'1693-2','AIZAZ ALI KHAN','2011-01-16','male',NULL,'ISLAM','PAKISTANI',NULL,'GASHOKOR KHWAZA KHELA SWAT',NULL,'MIAN SAID ALI BACHA',NULL,NULL,NULL,'2026-05-12 03:24:23','2026-05-12 03:24:23'),(61,NULL,'1694-2','UZAIR KHAN','2012-03-01','male',NULL,'ISLAM','PAKISTANI',NULL,'JANO KHWAZA KHELA SWAT',NULL,'ANWAR ALI',NULL,NULL,NULL,'2026-05-12 03:26:56','2026-05-12 03:26:56'),(62,NULL,'1730-2','NAWAB NASIR','2013-01-01','male',NULL,'ISLAM','PAKISTANI',NULL,'TEKDARAI KHWAZA KHILA','2026-01-02','NASIR ULLAH KHAN',NULL,'GOVT. SERVANT','SWAT','2026-05-12 03:28:24','2026-05-21 04:57:21'),(63,NULL,'1831-0','ABUZAR KHAN','2015-09-18','male',NULL,'ISLAM','PAKISTANI',NULL,'SHALPIN KHWAZAKHELA SWAT','2024-08-05','HABIB UR RAHIM',NULL,'BUSINESS','SWAT','2026-05-12 03:28:28','2026-05-19 09:08:47'),(64,NULL,'1708-2','MUDASSAR KHAN','2010-03-07','male',NULL,'ISLAM','PAKISTANI',NULL,'CHALYAR KHWAZA KHELA SWAT',NULL,'IKRAM',NULL,NULL,NULL,'2026-05-12 03:29:16','2026-05-12 03:29:16'),(65,NULL,'1733-2','YASIR KHAN','2012-02-27','male',NULL,'ISLAM','PAKISTANI',NULL,'MASHKOMAI KHWAZAKHILA SWAT','2026-01-02','HUSSAIN ALI',NULL,'OVERSEAS','SWAT','2026-05-12 03:31:12','2026-05-20 07:21:59'),(66,NULL,'0021-N','WASIF KHAN','2026-02-19','male',NULL,'ISLAM','PAKISTANI',NULL,'BANDAI KHWAZAKHELA SWAT',NULL,'AZMAT ULLAH',NULL,NULL,NULL,'2026-05-12 03:31:49','2026-05-12 03:31:49'),(67,NULL,'1709-2','ABID ALI','2010-03-07','male',NULL,'ISLAM','PAKISTANI',NULL,'KANDARO KHWAZA KHELA SWAT',NULL,'RAHMAT ALI',NULL,NULL,NULL,'2026-05-12 03:31:50','2026-05-12 03:31:50'),(68,NULL,'1734-2','SAMI ULLAH','2011-12-26','male',NULL,'ISLAM','PAKISTANI',NULL,'KHWAZA KHILA SWAT','2026-01-02','FAZAL WAHAB',NULL,'BUSINESS','SWAT','2026-05-12 03:32:36','2026-05-21 04:54:40'),(69,NULL,'1736-2','TALHA AKBAR','2013-01-01','male',NULL,'ISLAM','PAKISTANI',NULL,'BANDAI KHWAZAKHILA SWAT','2026-01-02','FAZAL AKBAR',NULL,'BUSINESS','SWAT','2026-05-12 03:34:28','2026-05-21 05:00:23'),(70,NULL,'0024-N','TANVEER NAWAB','2026-02-19','male',NULL,'ISLAM','PAKISTANI',NULL,'CHALYAR KHWAZAKHELA SWAT',NULL,'KARAM ZADA',NULL,NULL,NULL,'2026-05-12 03:34:37','2026-05-12 03:34:37'),(71,NULL,'1711-2','IZHAR Ullah','2010-03-12','male',NULL,'ISLAM','PAKISTANI',NULL,'BADALAI TEH BAHRAIN SWAT',NULL,'SAMI ULLAH',NULL,NULL,NULL,'2026-05-12 03:34:41','2026-05-12 03:34:41'),(72,NULL,'1712-2','HAZRAT BILAL KHAN','2012-05-12','male',NULL,'ISLAM','PAKISTANI',NULL,'FATEH PURTEH KHWAZA KHELA SWAT',NULL,'DOST MUHAMMAD',NULL,NULL,NULL,'2026-05-12 03:37:29','2026-05-12 03:37:29'),(73,NULL,'0025-N','RAHEEL SHAFIQ','2013-07-05','male',NULL,'ISLAM','PAKISTANI',NULL,'CHINAAR BABA KHWAZAKHELA SWAT',NULL,'MUHAMMAD SHAFIQ',NULL,NULL,NULL,'2026-05-12 03:37:43','2026-05-12 03:37:43'),(74,NULL,'1737-2','MASHAL KHAN','2013-02-21','male',NULL,'ISLAM','PAKISTANI',NULL,'CHAMTALAI KHWAZAKHILA','2026-01-02','ADIL SHAH',NULL,'BUSINESS','SWAT','2026-05-12 03:40:08','2026-05-21 05:02:36'),(75,NULL,'1715-2','SAMI ULLAH KHAN','2012-01-01','male',NULL,'ISLAM','PAKISTANI',NULL,'KOTANI KHWAZA KHELA SWAT',NULL,'SHER ALAM KHAN',NULL,NULL,NULL,'2026-05-12 03:40:13','2026-05-12 03:40:13'),(76,NULL,'1832-0','ABD ULLAH','2016-01-25','male',NULL,'ISLAM','PAKISTANI',NULL,'ASALA KHWAZAKHELA SWAT','2024-09-07','AMAN ULLAH KHAN',NULL,'OVERSEAS','SWAT','2026-05-12 03:40:28','2026-05-19 09:10:11'),(77,NULL,'1716-2','MUHAMMAD SAMEER KHAN','2011-03-05','male',NULL,'ISLAM','PAKISTANI',NULL,'CHALYAR KHWAZA KHELA SWAT',NULL,'NASARULLAH KHAN',NULL,NULL,NULL,'2026-05-12 03:42:55','2026-05-12 03:42:55'),(78,NULL,'1738-2','AZLAN HAYAT','2012-02-10','male',NULL,'ISLAM','PAKISTANI',NULL,'KHWAZA KHILA SWAT','2026-01-02','UMAR HAYAT',NULL,'OVERSEAS','SWAT','2026-05-12 03:43:11','2026-05-21 05:10:54'),(79,NULL,'1776-1','YASIR HAMEED KHAN','2012-04-08','male',NULL,'ISLAM','PAKISTANI',NULL,'ZWALA CHAMTALAI KHWAZA KHELA',NULL,'INAYAT ULLAH',NULL,NULL,NULL,'2026-05-12 03:48:19','2026-05-12 03:48:19'),(80,NULL,'1739-2','MUHAMMAD ZESHAN','2013-03-08','male',NULL,'ISLAM','PAKISTANI',NULL,'CHAMTALAI KHWAZAKHILA SWAT','2026-01-02','MUHAMMAD SAMI UL HAQ',NULL,'BUSINESS','SWAT','2026-05-12 04:25:10','2026-05-21 05:05:39'),(81,NULL,'1715-0','SHAH FAHAD','2018-01-10','male',NULL,'ISLAM','PAKISTANI',NULL,'CHAMTALAI KHWAZA KHELA SWAT','2022-01-01','SARFARAZ KHAN','15602-0516113-5','OVERSEAS','SWAT','2026-05-12 04:26:54','2026-05-19 08:09:13'),(82,NULL,'1740-2','MAAZ KHAN','2013-02-05','male',NULL,'ISLAM','PAKISTANI',NULL,'CHAMTALAI KHWAZAKHILA SWAT','2026-01-02','SARFARAZ KHAN',NULL,'OVERSEAS','SWAT','2026-05-12 04:27:51','2026-05-21 05:09:08'),(83,NULL,'1716-0','ZAKARYA KHAN','2018-01-01','male',NULL,'ISLAM','PAKISTANI',NULL,'QALA KHWAZA KHELA SWAT',NULL,'ASHRAF ALI',NULL,'BUSINESS','SWAT','2026-05-12 04:29:27','2026-05-19 08:10:27'),(84,NULL,'1743-2','MUHAMMAD SOBAN','2013-02-03','male',NULL,'ISLAM','PAKISTANI',NULL,'CHAMTALAI KHWAZAKHILA SWAT','2026-01-02','ANWAR UL HAQ',NULL,'BUSINESS','SWAT','2026-05-12 04:30:37','2026-05-21 05:14:33'),(85,NULL,'1718-2','AIZAZ KHAN','2013-03-04','male',NULL,'ISLAM','PAKISTANI',NULL,'Da sar spray school system khwaza khela',NULL,'ABDUL BARI',NULL,NULL,NULL,'2026-05-12 04:30:55','2026-05-12 04:30:55'),(86,NULL,'111-N','SOHAIL KHAN','2015-09-18','male',NULL,'ISLAM','PAKISTANI',NULL,'MASHKOMAI',NULL,'AFSAR ALI',NULL,NULL,NULL,'2026-05-12 04:31:37','2026-05-12 04:31:37'),(88,NULL,'1746-2','HAMZA KHAN','2012-10-09','male',NULL,'ISLAM','PAKISTANI',NULL,'BANDAI KHWAZAKHILA SWAT','2026-01-02','MUJEEB ULLAH',NULL,'OVERSEAS','SWAT','2026-05-12 04:34:04','2026-05-21 05:16:35'),(90,NULL,'1747-2','ZAKIR MEHBOOB','2013-03-19','male',NULL,'ISLAM','PAKISTANI',NULL,'TEKDARAI KHWAZA KHILA SWAT','2026-01-02','MEHBOOB ALI',NULL,'BUSINESS','SWAT','2026-05-12 04:36:03','2026-05-21 05:23:00'),(91,NULL,'0113-N','MUHAMMAD ZAID','2009-04-02','male',NULL,'ISLAM','PAKISTANI',NULL,'KHWAZA KHELA',NULL,'HABIB UR RAHIM',NULL,NULL,NULL,'2026-05-12 04:36:36','2026-05-13 06:52:07'),(92,NULL,'1748-2','ABUBAKAR KHAN','2011-12-11','male',NULL,'ISLAM','PAKISTANI',NULL,'KHWAZA KHILA SWAT','2026-01-02','FAZAL RAHMAT',NULL,'BUSINESS','SWAT','2026-05-12 04:38:40','2026-05-21 05:27:13'),(93,NULL,'028-N','ABUBAKAR SADEEQ','2022-06-27','male',NULL,'ISLAM','PAKISTANI',NULL,'GASHKOR KHWAZA KHELA SWAT',NULL,'BAKHT ZADA',NULL,NULL,NULL,'2026-05-12 04:39:16','2026-05-12 04:39:16'),(94,NULL,'1672-2','ABDUR RAHMAN','2012-03-11','male',NULL,'ISLAM','PAKISTANI',NULL,'QALA KHWAZA KHELA SWAT',NULL,'MUHAMMAD HANIF',NULL,NULL,NULL,'2026-05-12 04:40:42','2026-05-12 04:40:42'),(95,NULL,'1749-2','YASAR IQBAL','2012-02-02','male',NULL,'ISLAM','PAKISTANI',NULL,'BATAI KHWAZA KHILA SWAT','2026-01-02','MUHAMMAD IQBAL',NULL,'BUSINESS','SWAT','2026-05-12 04:40:51','2026-05-21 08:21:47'),(96,NULL,'038-N','MUHAMMAD YOUNAS','2022-06-27','male',NULL,'ISLAM','PAKISTANI',NULL,'GASHKOR KHWAZA KHELA SWAT',NULL,'BAKHT ZADA',NULL,NULL,NULL,'2026-05-12 04:42:21','2026-05-19 08:35:00'),(97,NULL,'1751-2','MANSOOR KHAN','2012-03-14','male',NULL,'ISLAM','PAKISTANI',NULL,'GUDERAI KHWAZA KHILA SWAT','2026-01-02','KHAISTA RAHMAN',NULL,'GOVT. SERVANT','SWAT','2026-05-12 04:43:11','2026-05-21 08:30:00'),(98,NULL,'1680-2','MUHAMMAD ILYAS','2012-01-15','male',NULL,'ISLAM','PAKISTANI',NULL,'KOZ KALY KHWAZA KHELA',NULL,'BAKHT AKBAR',NULL,NULL,NULL,'2026-05-12 04:43:44','2026-05-12 04:43:44'),(99,NULL,'045-N','MUHAMMAD Essa','2022-06-27','male',NULL,'ISLAM','PAKISTANI',NULL,'GASHKOR KHWAZA KHELA SWAT',NULL,'BAKHT ZADA',NULL,NULL,NULL,'2026-05-12 04:43:44','2026-05-12 04:43:44'),(100,NULL,'1752-2','FAIZAN ULLAH KHAN','2012-12-12','male',NULL,'ISLAM','PAKISTANI',NULL,'BANDAI KHWAZAKHILA SWAT','2026-01-02','ZABARDAST KHAN',NULL,'BUSINESS','SWAT','2026-05-12 04:45:30','2026-05-21 08:27:02'),(101,NULL,'1791-0','ABUZAR KHAN','2018-01-20','male',NULL,'ISLAM','PAKISTANI',NULL,'KHWAZA KHELA SWAT','2023-03-29','FAZAL RAHMAT','15602-0402449-1','BUSINESS','SWAT','2026-05-12 04:45:56','2026-05-19 08:58:18'),(102,NULL,'1685-2','AZIZ ULLAH','2010-12-29','male',NULL,'ISLAM','PAKISTANI',NULL,'KOZ KALY KHWAZA KHELA',NULL,'YOUSAF KHAN',NULL,NULL,NULL,'2026-05-12 04:46:17','2026-05-12 04:46:17'),(103,NULL,'1753-2','ASAD ALI KHAN','2013-01-01','male',NULL,'ISLAM','PAKISTANI',NULL,'BANDAI KHWAZAKHILA SWAT','2026-01-02','FAZAL RAHMAN',NULL,'LATE','SWAT','2026-05-12 04:47:50','2026-05-21 08:28:58'),(104,NULL,'1794-0','ZEESHAN FAROOQ','2018-01-30','male',NULL,'ISLAM','PAKISTANI',NULL,'CHAMTALAI KHWAZA KHELA SWAT','2023-11-07','FAROOQ KHAN',NULL,'SERVICE','SWAT','2026-05-12 04:50:08','2026-05-19 09:02:46'),(105,NULL,'1777-O','SAMEER KHAN','2019-01-05','male',NULL,'ISLAM','PAKISTANI',NULL,'QALA KHWAZA KHELA SWAT','2023-01-01','AMJAD KHAN',NULL,'OVERSEAS','SWAT','2026-05-12 04:52:07','2026-05-19 08:44:44'),(106,NULL,'1695-2','SOHAIB KHAN',NULL,'male',NULL,'ISLAM','PAKISTANI',NULL,'BARA ASLA',NULL,'BAKHT SAHIB KHAN',NULL,NULL,NULL,'2026-05-12 05:37:53','2026-05-12 05:37:53'),(107,NULL,'1696-2','HILAL KHAN','2012-01-01','male',NULL,'ISLAM','PAKISTANI',NULL,'BANDAI KHWAZA KHELA',NULL,'ABAD KHAN',NULL,NULL,NULL,'2026-05-12 05:41:07','2026-05-12 05:41:07'),(108,NULL,'1697-2','BILAL KHAN','2012-01-03','male',NULL,'ISLAM','PAKISTANI',NULL,'BANDAI KHWAZA KHELA',NULL,'WAHAB KHAN',NULL,NULL,NULL,'2026-05-12 05:46:47','2026-05-14 08:33:49'),(109,NULL,'1698-2','SUDAIS KHAN','2011-03-07','male',NULL,'ISLAM','PAKISTANI',NULL,'CHAMTALAI KHWAZA KHELA',NULL,'ALAM SHER',NULL,NULL,NULL,'2026-05-12 05:50:00','2026-05-12 05:50:00'),(110,NULL,'1774-1','AWAIS KHAN','2013-12-25','male',NULL,'ISLAM','PAKISTANI',NULL,'KANDARO KHWAZAKHILA SWAT',NULL,'AMAN ULLAH',NULL,NULL,NULL,'2026-05-12 06:14:15','2026-05-12 06:14:15'),(111,NULL,'1773-1','ZAID UL HAQ','2014-01-04','male',NULL,'ISLAM','PAKISTANI',NULL,'CHALYAR KHWAZAKHILA SWAT',NULL,'SHAMS UL HAQ',NULL,NULL,NULL,'2026-05-12 06:17:56','2026-05-12 06:17:56'),(112,NULL,'1772-1','MUHAMMAD ILYAS KHAN',NULL,'male',NULL,'ISLAM','PAKISTANI',NULL,'BANDAI KHWAZAKHILA SWAT',NULL,'MUHIB ULLAH',NULL,NULL,NULL,'2026-05-12 06:19:47','2026-05-12 06:19:47'),(113,NULL,'1771-1','HIDAYAT ULLAH KHAN','2014-01-01','male',NULL,'ISLAM','PAKISTANI',NULL,'BANDAI KHWAZAKHILA SWAT',NULL,'ABDULLAH KHAN',NULL,NULL,NULL,'2026-05-12 06:24:09','2026-05-12 06:24:09'),(114,NULL,'1750-1','TALHA KHAN','2015-01-12','male',NULL,'ISLAM','PAKISTANI',NULL,'CHALYAR, KHWAZA KHELA, SWAT',NULL,'ABDUL MAULA','15602-0490402-7',NULL,NULL,'2026-05-12 06:26:29','2026-05-12 06:26:29'),(115,NULL,'1738-1','ASAD ULLAH','2015-02-02','male',NULL,'ISLAM','PAKISTANI',NULL,'SHALPIN KHWAZA KHELA SWAT',NULL,'MUHAMMAD KARIM',NULL,NULL,NULL,'2026-05-12 06:26:46','2026-05-12 06:26:46'),(116,NULL,'1733-1','AZAZ ALI KHAN','2014-03-02','male',NULL,'ISLAM','PAKISTANI',NULL,'LANGAR KHWAZAKHILA',NULL,'ZAFAR ALI KHAN',NULL,NULL,NULL,'2026-05-12 06:28:38','2026-05-12 06:28:38'),(117,NULL,'1699-2','MUHAMMAD AHMAD MEHMOOD',NULL,'male',NULL,'ISLAM','PAKISTANI',NULL,'JANO KHWAZA KHELA',NULL,'ABDULLAH',NULL,NULL,NULL,'2026-05-12 06:29:20','2026-05-12 06:29:20'),(118,NULL,'1753-1','HAMZA KHAN','2015-01-01','male',NULL,'ISLAM','PAKISTANI',NULL,'QALA, KHWAZA KHELA, SWAT',NULL,'RAZA KHAN',NULL,NULL,NULL,'2026-05-12 06:32:52','2026-05-12 06:32:52'),(119,NULL,'1700-2','SYED FARHAN AHMAD','2013-03-20','male',NULL,'ISLAM','PAKISTANI',NULL,'CHAMTALAI KHWAZA KHELA',NULL,'GUL MAIN',NULL,NULL,NULL,'2026-05-12 06:33:16','2026-05-12 06:33:16'),(120,NULL,'1754-1','BARAK ULLAH','2015-02-20','male',NULL,'ISLAM','PAKISTANI',NULL,'TEHSIL MOHALLA, KHWAZA KHELA SWAT',NULL,'RAHMAT ALI','15602-5120608-7',NULL,NULL,'2026-05-12 06:35:53','2026-05-12 06:35:53'),(121,NULL,'1701-2','ARBAZ KHAN','2012-02-20','male',NULL,'ISLAM','PAKISTANI',NULL,'SHALPIN KHWAZA KHELA',NULL,'BAIDAR BAKHT KHAN',NULL,NULL,NULL,'2026-05-12 06:36:13','2026-05-12 06:36:13'),(122,NULL,'1755-1','AYAN KHAN',NULL,'male',NULL,'ISLAM','PAKISTANI',NULL,'QALA, KHWAZA KHELA, SWAT',NULL,'JAVED',NULL,NULL,NULL,'2026-05-12 06:38:48','2026-05-12 06:38:48'),(123,NULL,'1702-2','SAHIL KHAN','2011-01-10','male',NULL,'ISLAM','PAKISTANI',NULL,'ASALA KHWAZA KHELA',NULL,'AFZAL KHAN',NULL,NULL,NULL,'2026-05-12 06:38:49','2026-05-12 06:38:49'),(124,NULL,'1704-2','FAISAL KHAN',NULL,'male',NULL,'ISLAM','PAKISTANI',NULL,'FATEHPUR SWAT',NULL,'ZAMIR KHAN',NULL,NULL,NULL,'2026-05-12 06:41:11','2026-05-12 06:41:11'),(125,NULL,'1705-2','SOHAIL HUSSAIN','2012-03-20','male',NULL,'ISLAM','PAKISTANI',NULL,'KHWAZA KHELA',NULL,'HAZRAT HUSSAIN',NULL,NULL,NULL,'2026-05-12 06:43:33','2026-05-12 06:43:33'),(126,NULL,'1706-2','UMAR WAHID','2010-03-02','female',NULL,'ISLAM','PAKISTANI',NULL,'CHALYAR KHWAZA KH\r\nELA',NULL,'DAWOOD KHAN',NULL,NULL,NULL,'2026-05-12 06:46:03','2026-05-12 06:46:03'),(127,NULL,'1713-2','MUHAMMAD SOHAIL KHAN','2012-03-10','male',NULL,'ISLAM','PAKISTANI',NULL,'JANO KHWAZA KHELA SWAT',NULL,'WATAN SHER',NULL,NULL,NULL,'2026-05-12 06:48:46','2026-05-12 06:48:46'),(128,NULL,'1717-2','ZAKIR ULLAH','2012-03-01','male',NULL,'ISLAM','PAKISTANI',NULL,NULL,NULL,'NIAMAT KHAN',NULL,NULL,NULL,'2026-05-12 06:51:03','2026-05-25 10:07:21'),(129,NULL,'1719-2','SAEED KHAN','2012-04-01','male',NULL,'ISLAM','PAKISTANI',NULL,'SHIN BARGIN SWAT',NULL,'ABDULLAH',NULL,NULL,NULL,'2026-05-12 06:52:56','2026-05-12 06:52:56'),(130,NULL,'1714-1','MUHAMMAD FAWZAN','2014-03-01','male',NULL,'ISLAM','PAKISTANI',NULL,'JANO KHWAZA KHELA',NULL,'KIFAYAT ULLAH',NULL,NULL,NULL,'2026-05-13 03:01:03','2026-05-13 03:01:03'),(131,NULL,'1712-1','ASHFAQ ALI SHAH','2013-02-15','male',NULL,'ISLAM','PAKISTANI',NULL,'QALA KHWAZAKHILA SWAT','2024-01-28','ALAFAIQ',NULL,'DOCTOR','SWAT','2026-05-13 03:07:45','2026-05-19 08:15:01'),(132,NULL,'1711-1','SYED NAJAM AHMAD','2014-03-20','male',NULL,'ISLAM','PAKISTANI',NULL,'KUZ KILY KHWAZAKHILA SWAT','2024-01-28','SYED KHALID SHAH',NULL,NULL,'SWAT','2026-05-13 03:10:02','2026-05-19 08:13:12'),(133,NULL,'1709-1','WAQAS KHAN','2012-03-04','male',NULL,'ISLAM','PAKISTANI',NULL,'CHALYAR KHWAZAKHILA SWAT','2024-01-26','SAEED ULLAH KHAN',NULL,'OVERSEAS','SWAT','2026-05-13 03:12:35','2026-05-19 08:28:23'),(134,NULL,'1707-1','FAWAD KHAN','2014-02-03','male',NULL,'ISLAM','PAKISTANI',NULL,'CHAMTALAI KHWAZAKHILA SWAT','2024-01-26','UMAR DAIR',NULL,'OVERSEAS','SWAT','2026-05-13 03:14:43','2026-05-19 08:47:54'),(135,NULL,'1705-1','ABDUL JABBAR','2013-12-31','male',NULL,'ISLAM','PAKISTANI',NULL,'LANGAR KHWAZAKHILA SWAT',NULL,'MALAK SARDAR',NULL,NULL,NULL,'2026-05-13 03:17:06','2026-05-13 03:17:06'),(136,NULL,'1704-1','HAROON BACHA','2012-05-07','male',NULL,'ISLAM','PAKISTANI',NULL,'TIKDARAI KHWAZA KHELA SWAT','2024-01-26','FAZAL BACHA',NULL,'BUSINESS','SWAT','2026-05-13 03:19:30','2026-05-19 07:26:02'),(137,NULL,'1703-1','SAIM KHAN','2014-01-16','male',NULL,'ISLAM','PAKISTANI',NULL,'ASALA KHWAZA KHELA',NULL,'IMRAN ALI',NULL,NULL,NULL,'2026-05-13 03:21:43','2026-06-02 07:25:50'),(138,NULL,'1700-1','MALAK AHMAD SAAD KHAN','2014-03-07','male',NULL,'ISLAM','PAKISTANI',NULL,'BANDAI KHWAZAKHILA SWAT',NULL,'ARAB NAWAZ KHAN',NULL,'DOCTOR','SWAT','2026-05-13 03:23:44','2026-05-25 06:28:37'),(139,NULL,'1696-1','BABAR KHAN','2014-02-17','male',NULL,'ISLAM','PAKISTANI',NULL,'TIKDARAI KHWAZA KHELA',NULL,'LIAQAT ALI KHAN',NULL,NULL,NULL,'2026-05-13 03:25:27','2026-05-13 03:25:27'),(140,NULL,'1694-1','MAOOZ MIAN','2013-12-26','male',NULL,'ISLAM','PAKISTANI',NULL,'LANGAR KHWAZAKHILA SWAT',NULL,'ZAHIR SHAH MIAN',NULL,NULL,NULL,'2026-05-13 03:27:20','2026-05-13 03:27:20'),(141,NULL,'1693-1','KALEEM ULLAH','2014-01-05','male',NULL,'ISLAM','PAKISTANI',NULL,'DANDOO CHAMTALAI KHWAZAKHILA SWAT',NULL,'FAZAL RABBANI',NULL,'TEACHER','SWAT','2026-05-13 03:29:17','2026-05-25 06:29:55'),(142,NULL,'1692-1','REHAN KHAN','2014-01-01','male',NULL,'ISLAM','PAKISTANI',NULL,'QALA KHWAZA KHELA SWAT',NULL,'USMAN GHANI',NULL,NULL,NULL,'2026-05-13 03:31:40','2026-05-13 03:31:40'),(143,NULL,'1691-1','AWAIS SHAH','2014-03-02','male',NULL,'ISLAM','PAKISTANI',NULL,'TEGDARAI KHWAZAKHILA SWAT',NULL,'MEHBOOB ALI',NULL,NULL,NULL,'2026-05-13 03:34:35','2026-05-13 03:34:35'),(144,NULL,'1690-1','SAHIL KHAN','2014-02-20','male',NULL,'ISLAM','PAKISTANI',NULL,'CHALYAR KHWAZAKHILA SWAT',NULL,'ABDUL MABOOD',NULL,NULL,NULL,'2026-05-13 03:36:28','2026-05-13 03:36:28'),(145,NULL,'1686-1','BURHAN KHAN','2013-12-05','male',NULL,'ISLAM','PAKISTANI',NULL,'MANPITAI KHWAZAKHILA SWAT',NULL,'SAID NAWAB',NULL,NULL,NULL,'2026-05-13 03:38:54','2026-05-13 03:38:54'),(146,NULL,'1685-1','HASNAIN KHAN','2014-03-10','male',NULL,'ISLAM','PAKISTANI',NULL,'ALAMGANJ TEHSILE CHARBAGH SWAT',NULL,'YOUSAF KHAN',NULL,NULL,NULL,'2026-05-13 03:41:16','2026-05-13 03:41:16'),(147,NULL,'1682-1','FAJAR ZADA','2011-01-04','male',NULL,'ISLAM','PAKISTANI',NULL,'CHALYAR KHWAZAKHILA SWAT',NULL,'FAZAL ZADA',NULL,NULL,NULL,'2026-05-13 03:44:10','2026-05-13 03:44:10'),(148,NULL,'0056-N','FAWAD KHAN','2026-05-04','male',NULL,'ISLAM','PAKISTANI',NULL,'DANDI ZWALA KHWAZA KHELA SWAT',NULL,'ATTA ULLAH SHAH',NULL,NULL,NULL,'2026-05-13 03:46:16','2026-05-13 03:46:16'),(149,NULL,'1807-1','MUHAMMAD ZOHAIB KHAN','2014-12-12','male',NULL,'ISLAM','PAKISTANI',NULL,'FARHAT ABAD KHWAZAKHILA SWAT','2026-02-02','WALEED KHAN',NULL,NULL,'SWAT','2026-05-13 03:48:24','2026-05-25 11:37:30'),(150,NULL,'1808-1','MUHAMMAD ANSAR KHAN','2014-01-01','male',NULL,'ISLAM','PAKISTANI',NULL,'BANDAI KHWAZAKHILA SWAT','2026-02-01','MUHAMMAD AZAM KHAN',NULL,'LATE','SWAT','2026-05-13 03:50:29','2026-05-25 11:38:39'),(151,NULL,'0120-N','UMAIR ULLAH',NULL,'male',NULL,'ISLAM','PAKISTANI',NULL,'KHWAZAKHILA SWAT',NULL,'HASHMAT ULLAH',NULL,NULL,NULL,'2026-05-13 03:54:42','2026-05-13 06:50:14'),(152,NULL,'1756-1','AQIB KHAN','2015-02-15','male',NULL,'ISLAM','PAKISTANI',NULL,'QALA KHWAZA KHELA SWAT',NULL,'NASAR ALI',NULL,NULL,NULL,'2026-05-13 06:17:00','2026-05-13 06:17:00'),(153,NULL,'1758-1','BABAR KHAN','2015-06-19','male',NULL,'ISLAM','PAKISTANI',NULL,'QALA KHWAZA KHELA SWAT',NULL,'NADAR KHAN',NULL,NULL,NULL,'2026-05-13 06:18:25','2026-05-13 06:18:25'),(154,NULL,'1759-1','SAMEER KHAN','2015-01-25','male',NULL,'ISLAM','PAKISTANI',NULL,'LANGAR KHWAZA KHELA SWAT','2025-01-10','SARDAR NAWAB',NULL,'OVERSEAS','SWAT','2026-05-13 06:21:31','2026-05-23 06:06:26'),(155,NULL,'1760-1','AWAIS KHAN','2014-12-02','male',NULL,'ISLAM','PAKISTANI',NULL,'QALA KHWAZA KHELA SWAT',NULL,'ASHRAF ALI',NULL,NULL,NULL,'2026-05-13 06:23:00','2026-05-13 06:23:00'),(156,NULL,'1762-1','FARID KHAN','2014-03-01','male',NULL,'ISLAM','PAKISTANI',NULL,'BINKAT KHWAZA KHELA SWAT','2025-01-10','HAFIZ UL AMIN',NULL,'OVERSEAS','SWAT','2026-05-13 06:24:37','2026-05-19 08:19:38'),(157,NULL,'1763-1','SUDAIS KHAN','2012-04-10','male',NULL,'ISLAM','PAKISTANI',NULL,'CHAMTALAI KHWAZAKHILA SWAT','2025-01-10','SAID ALI KHAN',NULL,'OVERSEAS','SWAT','2026-05-13 06:25:57','2026-05-19 08:31:27'),(158,NULL,'1766-1','SUDAIS HAFIZ','2014-01-20','male',NULL,'ISLAM','PAKISTANI',NULL,'BERARAI KHWAZA KHELA SWAT','2025-01-10','JAMAL UD DIN',NULL,'SERVICE','SWAT','2026-05-13 06:27:12','2026-05-19 09:06:00'),(159,NULL,'0094-N','MUHAMMAD MAUZ','2025-05-16','male',NULL,'ISLAM','PAKISTANI',NULL,'Tigdary k khela swat',NULL,'JAN KHITAB',NULL,NULL,NULL,'2026-05-13 06:44:04','2026-05-13 06:44:04'),(160,NULL,'0095-N','FARHAN KHAN','2025-05-16','male',NULL,'ISLAM','PAKISTANI',NULL,'Qala k khela swat',NULL,'NASIR UDDIN',NULL,NULL,NULL,'2026-05-13 06:46:11','2026-05-13 06:46:11'),(161,NULL,'1787-0','MUHAMMAD HASNAIN','2017-02-08','male',NULL,'ISLAM','PAKISTANI',NULL,'DANDO CHAMTALAI K KHELA SWAT','2023-02-13','ZAI UR REHMAN',NULL,'OVERSEAS','SWAT','2026-05-13 06:48:46','2026-05-19 08:55:02'),(162,NULL,'1600-0','ADNAN SHAH','2016-03-21','male',NULL,'ISLAM','PAKISTANI',NULL,'CHALYAR K KHELA SWAT','2020-01-01','MUHAMMAD AMIN',NULL,'LATE','SWAT','2026-05-13 06:50:47','2026-05-19 05:57:56'),(163,NULL,'1661-0','MUHAMMAD HASHAM','2017-01-15','male',NULL,'ISLAM','PAKISTANI',NULL,'KOZ KALAY K KHELA SWAT','2021-01-01','ABDUL WAHAB',NULL,'BUSINESS','SWAT','2026-05-13 06:53:59','2026-05-19 07:29:06'),(164,NULL,'1662-0','AYAN KHAN','2017-01-05','male',NULL,'ISLAM','PAKISTANI',NULL,'K KHELA SWAT','2021-01-01','UMAR HAYAT',NULL,'OVERSEAS','SWAT','2026-05-13 06:56:07','2026-05-19 07:30:21'),(165,NULL,'1664-0','LUQMAN HAKIM','2017-01-10','male',NULL,'ISLAM','PAKISTANI',NULL,'CHAMTALAI K KHELA SWAT','2021-01-01','SHAFI UL HAQ',NULL,'GOVT. SERVANT','SWAT','2026-05-13 06:58:04','2026-05-19 07:31:50'),(166,NULL,'1666-0','FAWAD AHMAD','2016-12-01','male',NULL,'ISLAM','PAKISTANI',NULL,'DANDY CHAMTALAI K KHELA SWAT','2021-01-01','MUHAMMAD ZADA',NULL,'OVERSEAS','SWAT','2026-05-13 07:00:44','2026-05-19 07:33:38'),(167,NULL,'1667-0','SHAH SAUD MIAN','2017-01-01','male',NULL,'ISLAM','PAKISTANI',NULL,'LANGAR K KHELA SWAT','2021-01-01','ZAHIR SHAH MIAN',NULL,'FARMER','SWAT','2026-05-13 07:06:16','2026-05-19 07:36:36'),(168,NULL,'1668-0','ATIF KHAN','2017-03-15','male',NULL,'ISLAM','PAKISTANI',NULL,'TIGDARY K KHELA SWAT','2021-01-01','SAFDAR ALI KHAN',NULL,'ADVOCATE','SWAT','2026-05-13 07:08:24','2026-05-19 07:41:42'),(169,NULL,'1669-0','MUZAFAR SHAH MIAN','2026-01-15','male',NULL,'ISLAM','PAKISTANI',NULL,'FARHAT ABAD K KHELA SWAT','2021-01-01','SHAFI ULLAH',NULL,'SERVICE','SWAT','2026-05-13 07:57:45','2026-05-19 07:43:09'),(170,NULL,'1671-0','MAOOZ KHAN','2016-12-20','male',NULL,'ISLAM','PAKISTANI',NULL,'CHAMTALAI K KHELA SWAT','2021-01-01','SARFARAZ KHAN',NULL,'OVERSEAS','SWAT','2026-05-13 08:00:36','2026-05-19 07:44:56'),(171,NULL,'1674-0','ABUZAR YOUSAF','2017-01-25','male',NULL,'ISLAM','PAKISTANI',NULL,'TIGDARAI K KHELA SWAT','2021-01-01','YOUSAF ALI',NULL,'LATE','SWAT','2026-05-13 08:03:48','2026-05-19 07:46:56'),(172,NULL,'1676-0','MUHAMMAD FARHAN','2017-01-02','male',NULL,'ISLAM','PAKISTANI',NULL,'CHAMTALAI K KHELA SWAT','2021-01-01','MUHAMMAD SAMI UL HAQ',NULL,'OVERSEAS','SWAT','2026-05-13 08:08:30','2026-05-19 07:49:44'),(173,NULL,'1678-0','RAFI ULLAH','2017-01-15','male',NULL,'ISLAM','PAKISTANI',NULL,'KHWAZAKHELA SWAT','2021-10-01','FAZAL WAHAB',NULL,'BUSINESS','SWAT','2026-05-13 08:14:24','2026-05-19 07:50:59'),(174,NULL,'1679-0','AZAN KHAN','2017-02-15','male',NULL,'ISLAM','PAKISTANI',NULL,'CHALYAR K KHELA SWAT','2021-01-01','RAHIM ZADA',NULL,'BUSINESS','SWAT','2026-05-13 08:17:31','2026-05-19 07:53:33'),(175,NULL,'1680-0','AYAN KHAN','2017-02-20','male',NULL,'ISLAM','PAKISTANI',NULL,'TIGDARY K KHELA SWAT','2021-01-01','SAID ANWAR',NULL,'BUSINESS','SWAT','2026-05-13 08:20:23','2026-05-19 07:54:46'),(176,NULL,'1682-0','MUHAMMAD AYAN','2017-03-05','male',NULL,'ISLAM','PAKISTANI',NULL,'Qala k khela swat',NULL,'MUHAMMAD HAYAT',NULL,NULL,NULL,'2026-05-13 08:23:33','2026-05-13 08:23:33'),(177,NULL,'1763-2','UBAID ULLAH','2012-04-09','male','15605-0418150-9','ISLAM','PAKISTANI',NULL,'QALA, KHWAZA KHELA, SWAT','2026-04-13','MUHAMMAD SADIQ','15602-4088958-9','BUSINESS','SWAT','2026-05-25 06:14:45','2026-05-25 06:14:45'),(178,NULL,'1760-0','OSAMA KHAN','2019-02-01','male',NULL,'ISLAM','PAKISTANI',NULL,NULL,'2023-01-01','NASAR ALI',NULL,'BUSINESS','SWAT','2026-06-02 07:18:00','2026-06-02 07:18:00'),(179,NULL,'1775-0','IHSAN ULLAH','2019-01-01','male',NULL,'ISLAM','PAKISTANI',NULL,NULL,'2023-01-01','GHAZI KHAN',NULL,'BUSINESS','SWAT','2026-06-02 07:24:38','2026-06-02 07:24:38'),(180,NULL,'1810-1','MUHAMMAD MUSTAFA','2016-01-05','male',NULL,'ISLAM','PAKISTANI',NULL,'BANDAI, KHWAZA KHELA, SWAT','2026-01-10','MUHAMMAD PARVAIZ KHAN',NULL,'BUSINESS','SWAT','2026-06-02 07:31:09','2026-06-02 07:31:09'),(181,NULL,'0019-N','MUHAMMAD SAAD',NULL,'male',NULL,NULL,NULL,NULL,NULL,NULL,'A',NULL,NULL,NULL,'2026-06-02 07:34:02','2026-06-02 07:34:02'),(182,NULL,'0027-N','GULAN KHAN',NULL,'male',NULL,NULL,NULL,NULL,'BINKAT, KHWAZA KHELA, SWAT',NULL,'USMAN KHAN',NULL,NULL,NULL,'2026-06-02 07:35:40','2026-06-02 07:35:40'),(183,NULL,'1764-2','MEKAYAL KHAN','2013-01-20','male',NULL,'ISLAM','PAKISTANI',NULL,'BANDAI, KHWAZA KHELA, SWAT','2026-01-10','MUHAMMAD PARVAIZ KHAN',NULL,'BUSINESS','SWAT','2026-06-02 07:39:36','2026-06-02 07:39:36');
/*!40000 ALTER TABLE `students` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `subjects`
--

DROP TABLE IF EXISTS `subjects`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `subjects` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `name_initials` varchar(20) DEFAULT NULL,
  `category` enum('science','arts','commerce','general') NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_subject_name` (`name`),
  UNIQUE KEY `uq_subject_name_initials` (`name_initials`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `subjects`
--

LOCK TABLES `subjects` WRITE;
/*!40000 ALTER TABLE `subjects` DISABLE KEYS */;
INSERT INTO `subjects` VALUES (1,'English','ENG','arts','2026-06-06 09:35:30','2026-06-08 08:47:32'),(2,'Urdu','URD','arts','2026-06-06 09:35:30','2026-06-08 08:48:44'),(3,'Islamyat','ISL','arts','2026-06-06 09:35:30','2026-06-08 08:48:03'),(4,'Mathematics','MATH','science','2026-06-06 09:35:30','2026-06-08 08:49:13'),(5,'Science','SCI','science','2026-06-06 09:35:30','2026-06-06 09:35:30'),(6,'Social Studies','SS','arts','2026-06-06 09:35:30','2026-06-08 08:48:37'),(7,'History','HIST','arts','2026-06-06 09:35:30','2026-06-08 08:47:55'),(8,'General Knowledge','GK','science','2026-06-06 09:35:30','2026-06-08 08:49:23'),(9,'Geography','GEO','arts','2026-06-06 09:35:30','2026-06-08 08:47:49'),(10,'Computer Science','CS','science','2026-06-06 09:35:30','2026-06-06 09:35:30'),(11,'Pushto','PSH','arts','2026-06-06 09:35:30','2026-06-08 08:48:25'),(12,'Physics','PHY','science','2026-06-06 09:35:30','2026-06-06 09:35:30'),(13,'Chemistry','CHEM','science','2026-06-06 09:35:30','2026-06-06 09:35:30'),(14,'Biology','BIO','science','2026-06-06 09:35:30','2026-06-06 09:35:30'),(15,'Mutalia e Quran','MQ','arts','2026-06-06 09:35:30','2026-06-08 08:48:15'),(18,'Pakistan Studies','PS','arts','2026-06-20 08:40:46','2026-06-20 08:40:46');
/*!40000 ALTER TABLE `subjects` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `timetable_period_timings`
--

DROP TABLE IF EXISTS `timetable_period_timings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `timetable_period_timings` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `period_id` int unsigned NOT NULL,
  `config` enum('full_day','half_day') NOT NULL,
  `start_time` time DEFAULT NULL,
  `end_time` time DEFAULT NULL,
  `break_duration` tinyint unsigned DEFAULT NULL COMMENT 'Single break duration in minutes within this period. Position (before/after instruction) is per-slot via break_position.',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_period_config` (`period_id`,`config`),
  CONSTRAINT `timetable_period_timings_ibfk_1` FOREIGN KEY (`period_id`) REFERENCES `timetable_periods` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `timetable_period_timings`
--

LOCK TABLES `timetable_period_timings` WRITE;
/*!40000 ALTER TABLE `timetable_period_timings` DISABLE KEYS */;
INSERT INTO `timetable_period_timings` VALUES (1,1,'full_day','07:25:00','07:45:00',NULL,'2026-06-20 06:23:06','2026-06-27 08:56:45'),(2,1,'half_day','07:25:00','07:45:00',NULL,'2026-06-20 06:23:06','2026-06-27 08:58:02'),(3,2,'full_day','07:45:00','08:30:00',NULL,'2026-06-20 06:23:10','2026-06-27 08:56:45'),(4,2,'half_day','07:45:00','08:30:00',NULL,'2026-06-20 06:23:10','2026-06-27 08:58:02'),(5,3,'full_day','08:30:00','09:10:00',NULL,'2026-06-20 06:23:13','2026-06-27 08:56:45'),(6,3,'half_day','08:30:00','09:05:00',NULL,'2026-06-20 06:23:13','2026-06-27 08:58:02'),(7,4,'full_day','09:10:00','09:45:00',NULL,'2026-06-20 06:23:34','2026-06-27 08:56:45'),(8,4,'half_day','09:05:00','09:40:00',NULL,'2026-06-20 06:23:34','2026-06-27 08:58:02'),(9,5,'full_day','09:45:00','10:20:00',NULL,'2026-06-20 06:23:36','2026-06-27 08:56:45'),(10,5,'half_day','09:40:00','10:15:00',NULL,'2026-06-20 06:23:36','2026-06-27 08:58:02'),(11,6,'full_day','10:20:00','11:20:00',20,'2026-06-20 06:23:38','2026-06-27 08:56:45'),(12,6,'half_day','10:15:00','10:50:00',NULL,'2026-06-20 06:23:38','2026-06-27 08:58:02'),(13,7,'full_day','11:20:00','11:55:00',NULL,'2026-06-20 06:23:40','2026-06-27 08:56:45'),(14,7,'half_day','10:50:00','11:25:00',NULL,'2026-06-20 06:23:40','2026-06-27 08:58:02'),(15,8,'full_day','11:55:00','12:24:00',NULL,'2026-06-20 06:23:42','2026-06-27 08:56:45'),(16,8,'half_day','11:25:00','11:40:00',NULL,'2026-06-20 06:23:42','2026-06-27 08:58:02'),(17,9,'full_day','12:24:00','12:59:00',NULL,'2026-06-20 06:23:44','2026-06-27 08:56:45'),(18,9,'half_day',NULL,NULL,NULL,'2026-06-20 06:23:44','2026-06-20 06:23:44');
/*!40000 ALTER TABLE `timetable_period_timings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `timetable_periods`
--

DROP TABLE IF EXISTS `timetable_periods`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `timetable_periods` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `campus_id` int unsigned NOT NULL,
  `period_number` int unsigned NOT NULL COMMENT 'Display order of this period in the day (1, 2, 3...)',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_campus_period` (`campus_id`,`period_number`),
  CONSTRAINT `timetable_periods_ibfk_1` FOREIGN KEY (`campus_id`) REFERENCES `campuses` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `timetable_periods`
--

LOCK TABLES `timetable_periods` WRITE;
/*!40000 ALTER TABLE `timetable_periods` DISABLE KEYS */;
INSERT INTO `timetable_periods` VALUES (1,1,1,'2026-06-20 06:23:06','2026-06-20 06:23:06'),(2,1,2,'2026-06-20 06:23:10','2026-06-20 06:23:10'),(3,1,3,'2026-06-20 06:23:13','2026-06-20 06:23:13'),(4,1,4,'2026-06-20 06:23:34','2026-06-20 06:23:34'),(5,1,5,'2026-06-20 06:23:36','2026-06-20 06:23:36'),(6,1,6,'2026-06-20 06:23:38','2026-06-20 06:23:38'),(7,1,7,'2026-06-20 06:23:40','2026-06-20 06:23:40'),(8,1,8,'2026-06-20 06:23:42','2026-06-20 06:23:42'),(9,1,9,'2026-06-20 06:23:44','2026-06-20 06:23:44');
/*!40000 ALTER TABLE `timetable_periods` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `timetable_slots`
--

DROP TABLE IF EXISTS `timetable_slots`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `timetable_slots` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `class_group_id` int unsigned NOT NULL,
  `section_id` int unsigned NOT NULL,
  `period_id` int unsigned NOT NULL,
  `label` varchar(100) DEFAULT NULL,
  `subject_id_1` int unsigned DEFAULT NULL,
  `subject_id_2` int unsigned DEFAULT NULL,
  `staff_id_1` int unsigned DEFAULT NULL,
  `staff_id_2` int unsigned DEFAULT NULL,
  `break_position` enum('before','after') DEFAULT NULL COMMENT 'Which side of the instructional window this class/section takes their break',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_slot` (`period_id`,`class_group_id`,`section_id`),
  KEY `class_group_id` (`class_group_id`),
  KEY `section_id` (`section_id`),
  KEY `subject_id_1` (`subject_id_1`),
  KEY `subject_id_2` (`subject_id_2`),
  KEY `staff_id_1` (`staff_id_1`),
  KEY `staff_id_2` (`staff_id_2`),
  CONSTRAINT `timetable_slots_ibfk_1` FOREIGN KEY (`class_group_id`) REFERENCES `class_groups` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `timetable_slots_ibfk_2` FOREIGN KEY (`section_id`) REFERENCES `sections` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `timetable_slots_ibfk_3` FOREIGN KEY (`period_id`) REFERENCES `timetable_periods` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `timetable_slots_ibfk_4` FOREIGN KEY (`subject_id_1`) REFERENCES `subjects` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `timetable_slots_ibfk_5` FOREIGN KEY (`subject_id_2`) REFERENCES `subjects` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `timetable_slots_ibfk_6` FOREIGN KEY (`staff_id_1`) REFERENCES `staff` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `timetable_slots_ibfk_7` FOREIGN KEY (`staff_id_2`) REFERENCES `staff` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=136 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `timetable_slots`
--

LOCK TABLES `timetable_slots` WRITE;
/*!40000 ALTER TABLE `timetable_slots` DISABLE KEYS */;
INSERT INTO `timetable_slots` VALUES (1,11,11,6,NULL,4,NULL,1,NULL,'before','2026-06-20 06:28:40','2026-06-24 06:32:14'),(2,12,12,6,NULL,3,18,3,7,'before','2026-06-20 06:28:40','2026-07-13 08:02:25'),(3,13,13,6,NULL,12,NULL,11,NULL,'before','2026-06-20 06:28:40','2026-06-24 06:32:17'),(4,13,16,6,NULL,NULL,NULL,NULL,NULL,'before','2026-06-20 06:28:40','2026-06-24 06:32:04'),(5,6,6,6,NULL,2,NULL,10,NULL,'after','2026-06-20 06:28:40','2026-06-24 06:32:06'),(6,7,7,6,NULL,5,NULL,12,NULL,'after','2026-06-20 06:28:40','2026-06-24 06:32:08'),(7,8,8,6,NULL,3,NULL,2,NULL,'after','2026-06-20 06:28:40','2026-06-24 06:32:09'),(8,9,9,6,NULL,2,NULL,9,NULL,'after','2026-06-20 06:28:40','2026-06-24 06:32:10'),(9,10,10,6,NULL,1,NULL,16,NULL,'after','2026-06-20 06:28:40','2026-06-24 06:32:11'),(10,6,6,1,NULL,NULL,NULL,NULL,NULL,NULL,'2026-06-20 06:30:42','2026-06-27 08:58:05'),(12,6,6,3,NULL,8,NULL,12,NULL,NULL,'2026-06-20 06:32:29','2026-06-24 06:32:37'),(14,7,7,3,NULL,4,NULL,8,NULL,NULL,'2026-06-20 06:32:49','2026-06-24 06:32:38'),(17,6,6,2,NULL,4,NULL,8,NULL,NULL,'2026-06-20 08:17:40','2026-06-27 08:58:05'),(18,6,6,5,NULL,1,NULL,12,NULL,NULL,'2026-06-20 08:17:59','2026-06-24 06:32:26'),(19,6,6,7,'ABL',NULL,NULL,1,NULL,NULL,'2026-06-20 08:18:36','2026-06-24 06:31:54'),(20,6,6,8,NULL,3,NULL,2,NULL,NULL,'2026-06-20 08:18:51','2026-06-24 06:31:52'),(21,6,6,9,'WSD',NULL,NULL,12,NULL,NULL,'2026-06-20 08:19:01','2026-06-24 06:31:36'),(22,6,6,4,'DRILL',NULL,NULL,17,NULL,NULL,'2026-06-20 08:20:07','2026-07-13 08:00:28'),(23,7,7,2,NULL,1,NULL,6,NULL,NULL,'2026-06-20 08:20:19','2026-06-24 06:32:46'),(24,7,7,5,NULL,2,NULL,9,NULL,NULL,'2026-06-20 08:20:42','2026-06-24 06:32:25'),(25,7,7,7,NULL,6,NULL,9,NULL,NULL,'2026-06-20 08:21:23','2026-06-24 06:31:55'),(26,7,7,8,NULL,3,NULL,10,NULL,NULL,'2026-06-20 08:21:34','2026-06-24 06:31:51'),(27,7,7,9,'WSD',NULL,NULL,7,NULL,NULL,'2026-06-20 08:21:43','2026-06-24 06:31:37'),(28,7,7,4,'DRILL',NULL,NULL,17,NULL,NULL,'2026-06-20 08:22:17','2026-07-13 08:00:31'),(29,8,8,2,NULL,6,NULL,9,NULL,NULL,'2026-06-20 08:23:59','2026-06-24 06:32:47'),(30,8,8,3,NULL,2,NULL,10,NULL,NULL,'2026-06-20 08:24:04','2026-06-24 06:32:39'),(31,8,8,5,'WSD',NULL,NULL,7,NULL,NULL,'2026-06-20 08:24:14','2026-06-24 06:32:24'),(32,8,8,7,NULL,4,NULL,8,NULL,NULL,'2026-06-20 08:24:55','2026-06-24 06:31:56'),(33,8,8,8,NULL,5,NULL,12,NULL,NULL,'2026-06-20 08:25:09','2026-06-24 06:31:50'),(34,8,8,9,NULL,1,NULL,9,NULL,NULL,'2026-06-20 08:25:20','2026-06-24 06:31:39'),(35,9,9,2,NULL,5,NULL,12,NULL,NULL,'2026-06-20 08:26:06','2026-06-24 06:32:48'),(36,9,9,3,NULL,7,9,1,NULL,NULL,'2026-06-20 08:26:29','2026-06-24 06:34:10'),(37,9,9,5,'ABL',NULL,NULL,5,NULL,NULL,'2026-06-20 08:27:10','2026-06-24 06:32:23'),(38,10,10,7,NULL,7,9,11,NULL,NULL,'2026-06-20 08:29:04','2026-06-24 06:36:07'),(39,9,9,7,NULL,3,15,2,NULL,NULL,'2026-06-20 08:34:24','2026-06-24 06:35:11'),(40,9,9,8,NULL,1,NULL,16,NULL,NULL,'2026-06-20 08:34:34','2026-06-24 06:31:49'),(41,9,9,9,NULL,4,NULL,8,NULL,NULL,'2026-06-20 08:34:44','2026-06-24 06:31:40'),(42,13,13,2,NULL,15,NULL,3,NULL,NULL,'2026-06-20 08:37:05','2026-06-24 06:33:12'),(43,13,13,3,NULL,1,NULL,16,NULL,NULL,'2026-06-20 08:37:20','2026-06-24 06:32:44'),(44,13,13,4,NULL,4,NULL,1,NULL,NULL,'2026-06-20 08:37:30','2026-06-24 06:32:35'),(45,13,13,5,NULL,13,NULL,6,NULL,NULL,'2026-06-20 08:37:47','2026-06-24 06:32:19'),(48,13,13,7,NULL,2,NULL,7,NULL,NULL,'2026-06-20 08:39:16','2026-06-24 06:32:02'),(49,13,13,8,NULL,3,18,3,7,NULL,'2026-06-20 08:41:09','2026-07-13 08:02:55'),(51,13,13,9,NULL,14,NULL,5,NULL,NULL,'2026-06-20 08:43:13','2026-06-24 06:31:44'),(60,11,11,7,NULL,1,NULL,16,NULL,NULL,'2026-06-20 08:46:22','2026-06-24 06:32:00'),(61,11,11,5,NULL,7,9,10,NULL,NULL,'2026-06-20 08:46:44','2026-06-24 06:34:30'),(62,7,7,1,NULL,NULL,NULL,NULL,NULL,NULL,'2026-06-22 02:22:47','2026-06-24 06:32:46'),(63,9,9,1,NULL,NULL,NULL,NULL,NULL,NULL,'2026-06-22 02:26:40','2026-06-24 06:32:48'),(64,8,8,1,NULL,NULL,NULL,NULL,NULL,NULL,'2026-06-22 03:37:21','2026-06-24 06:32:47'),(65,8,8,4,'DRILL',NULL,NULL,17,NULL,NULL,'2026-06-22 03:42:49','2026-07-13 08:00:40'),(66,9,9,4,'DRILL',NULL,NULL,17,NULL,NULL,'2026-06-22 03:48:20','2026-07-13 08:00:48'),(67,10,10,1,NULL,NULL,NULL,NULL,NULL,NULL,'2026-06-22 03:55:08','2026-06-24 06:32:49'),(68,10,10,2,NULL,3,15,2,NULL,NULL,'2026-06-22 05:54:03','2026-06-24 06:32:49'),(69,10,10,3,NULL,2,NULL,9,NULL,NULL,'2026-06-22 05:54:27','2026-06-24 06:32:41'),(70,10,10,4,'DRILL',NULL,NULL,17,NULL,NULL,'2026-06-22 05:54:44','2026-07-13 08:00:51'),(71,10,10,5,NULL,4,NULL,8,NULL,NULL,'2026-06-22 06:13:26','2026-06-24 06:32:22'),(72,10,10,8,NULL,5,NULL,5,NULL,NULL,'2026-06-22 06:15:11','2026-06-24 06:31:48'),(73,11,11,1,NULL,NULL,NULL,NULL,NULL,NULL,'2026-06-23 03:06:30','2026-06-24 06:32:50'),(74,12,12,1,NULL,NULL,NULL,NULL,NULL,NULL,'2026-06-23 03:06:55','2026-06-24 06:32:51'),(75,13,13,1,NULL,NULL,NULL,NULL,NULL,NULL,'2026-06-23 03:07:24','2026-06-24 06:32:52'),(76,11,11,2,NULL,2,NULL,10,NULL,NULL,'2026-06-23 03:07:53','2026-06-24 06:32:50'),(77,12,12,2,NULL,12,NULL,11,NULL,NULL,'2026-06-23 03:08:15','2026-06-24 06:32:51'),(78,11,11,3,NULL,11,10,2,11,NULL,'2026-06-23 03:08:51','2026-07-13 08:01:42'),(79,12,12,3,NULL,13,NULL,6,NULL,NULL,'2026-06-23 03:09:03','2026-06-24 06:32:43'),(80,11,11,4,'DRILL',NULL,NULL,17,NULL,NULL,'2026-06-23 03:09:51','2026-07-13 08:01:19'),(81,12,12,4,NULL,2,NULL,7,NULL,NULL,'2026-06-23 03:10:24','2026-06-24 06:32:34'),(82,12,12,5,NULL,1,NULL,16,NULL,NULL,'2026-06-23 03:12:26','2026-06-24 06:32:20'),(83,11,11,8,NULL,5,NULL,6,NULL,NULL,'2026-06-23 03:16:58','2026-06-24 06:31:47'),(84,12,12,8,NULL,4,NULL,1,NULL,NULL,'2026-06-23 03:17:36','2026-06-24 06:31:46'),(85,12,12,7,NULL,14,NULL,5,NULL,NULL,'2026-06-23 03:17:47','2026-06-24 06:32:01'),(95,10,10,9,'ABL',NULL,NULL,11,NULL,NULL,'2026-06-24 06:31:41','2026-06-24 06:31:41'),(97,11,11,9,NULL,3,15,2,NULL,NULL,'2026-06-24 06:31:42','2026-06-24 06:36:56'),(99,12,12,9,NULL,15,NULL,3,NULL,NULL,'2026-06-24 06:31:43','2026-06-24 06:36:37'),(135,13,16,7,NULL,NULL,NULL,NULL,NULL,NULL,'2026-06-24 06:32:04','2026-06-24 06:32:04');
/*!40000 ALTER TABLE `timetable_slots` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_global_roles`
--

DROP TABLE IF EXISTS `user_global_roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_global_roles` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int unsigned NOT NULL,
  `role_id` int unsigned NOT NULL,
  `is_active` tinyint NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_global_roles_role_id_user_id_unique` (`user_id`,`role_id`),
  UNIQUE KEY `uq_user_global_role` (`user_id`,`role_id`),
  KEY `idx_ugr_user_id` (`user_id`),
  KEY `idx_ugr_role_id` (`role_id`),
  CONSTRAINT `user_global_roles_ibfk_3` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `user_global_roles_ibfk_4` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_global_roles`
--

LOCK TABLES `user_global_roles` WRITE;
/*!40000 ALTER TABLE `user_global_roles` DISABLE KEYS */;
INSERT INTO `user_global_roles` VALUES (2,1,1,1,'2026-05-25 08:51:50','2026-05-25 08:51:50'),(3,1,12,1,'2026-05-25 08:51:50','2026-05-25 08:51:50');
/*!40000 ALTER TABLE `user_global_roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_role_campuses`
--

DROP TABLE IF EXISTS `user_role_campuses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_role_campuses` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int unsigned NOT NULL,
  `role_id` int unsigned NOT NULL,
  `campus_id` int unsigned NOT NULL,
  `is_active` tinyint NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_role_campuses_role_id_user_id_unique` (`user_id`,`role_id`),
  UNIQUE KEY `uq_user_role_campus` (`user_id`,`role_id`,`campus_id`),
  KEY `idx_urc_user_id` (`user_id`),
  KEY `idx_urc_campus_id` (`campus_id`),
  KEY `idx_urc_role_id` (`role_id`),
  CONSTRAINT `user_role_campuses_ibfk_4` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `user_role_campuses_ibfk_5` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `user_role_campuses_ibfk_6` FOREIGN KEY (`campus_id`) REFERENCES `campuses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_role_campuses`
--

LOCK TABLES `user_role_campuses` WRITE;
/*!40000 ALTER TABLE `user_role_campuses` DISABLE KEYS */;
INSERT INTO `user_role_campuses` VALUES (1,1,3,1,1,'2026-05-05 11:57:49','2026-05-05 11:57:54');
/*!40000 ALTER TABLE `user_role_campuses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `first_name` varchar(80) NOT NULL,
  `last_name` varchar(80) NOT NULL,
  `username` varchar(50) NOT NULL,
  `email` varchar(150) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `password_hash` varchar(255) NOT NULL,
  `profile_photo` varchar(500) DEFAULT NULL,
  `is_active` tinyint NOT NULL DEFAULT '1',
  `last_login_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `username_2` (`username`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `email_2` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'KPS','COLLEGE','kps','kps.college1962@gmail.com',NULL,'$2b$12$mmCKaKA3V6waygUQqe5xK.pxD3rIJZ9S7nOA1LUFRHJQJjMszTc7G',NULL,1,'2026-07-13 07:53:42','2026-05-05 06:55:40','2026-07-13 07:53:42',NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'edusphere'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-07-13 14:03:36
