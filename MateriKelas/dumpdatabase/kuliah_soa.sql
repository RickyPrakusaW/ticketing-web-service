CREATE DATABASE `kuliah_soa`;

USE `kuliah_soa`;

/*Table structure for table `api_log` */

DROP TABLE IF EXISTS `api_log`;

CREATE TABLE `api_log` (
  `api_log_id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `pengguna_id` bigint(20) DEFAULT NULL,
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  `deletedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`api_log_id`)
);

/*Data for the table `api_log` */

/*Table structure for table `api_tierlist` */

DROP TABLE IF EXISTS `api_tierlist`;

CREATE TABLE `api_tierlist` (
  `api_tier` enum('free','freemium','premium') NOT NULL,
  `api_limit` int(11) DEFAULT NULL,
  `api_quota` int(11) DEFAULT NULL,
  PRIMARY KEY (`api_tier`)
);

/*Data for the table `api_tierlist` */

insert  into `api_tierlist`(`api_tier`,`api_limit`,`api_quota`) values 
('free',3,6),
('freemium',5,10),
('premium',-1,-1);

/*Table structure for table `buku` */

DROP TABLE IF EXISTS `buku`;

CREATE TABLE `buku` (
  `buku_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `buku_nama` varchar(255) DEFAULT NULL,
  `buku_tahun_terbit` int(4) DEFAULT NULL,
  `kategori_id` bigint(20) DEFAULT NULL,
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  `deletedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`buku_id`),
  UNIQUE KEY `buku_buku_id_uindex` (`buku_id`)
);

/*Data for the table `buku` */

insert  into `buku`(`buku_id`,`buku_nama`,`buku_tahun_terbit`,`kategori_id`,`createdAt`,`updatedAt`,`deletedAt`) values 
(1,'Jojo',2022,1,NULL,NULL,NULL),
(2,'Harry Potter',2021,2,NULL,NULL,NULL),
(3,'Percy Jackson',2020,3,NULL,NULL,NULL),
(4,'Sherlock Holmes',2019,1,NULL,NULL,NULL),
(5,'The Lord of the Rings',2018,2,NULL,NULL,NULL),
(6,'Game of Thrones',2017,3,NULL,NULL,NULL),
(7,'House Of Dragon',2016,1,NULL,NULL,NULL),
(8,'Murder on the Orient Express',2015,2,NULL,NULL,NULL),
(9,'Attack on Titan',2015,3,NULL,NULL,NULL),
(10,'Death Note',2010,1,NULL,NULL,NULL),
(11,'Death on the Nile',2007,2,NULL,NULL,NULL),
(12,'The ABC Murders',2005,3,NULL,NULL,NULL);

/*Table structure for table `kategori_buku` */

DROP TABLE IF EXISTS `kategori_buku`;

CREATE TABLE `kategori_buku` (
  `kategori_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `kategori_nama` varchar(255) DEFAULT NULL,
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  `deletedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`kategori_id`),
  UNIQUE KEY `kategori_buku_kategori_id_uindex` (`kategori_id`)
);

/*Data for the table `kategori_buku` */

insert  into `kategori_buku`(`kategori_id`,`kategori_nama`,`createdAt`,`updatedAt`,`deletedAt`) values 
(1,'Action',NULL,NULL,NULL),
(2,'Comedy',NULL,NULL,NULL),
(3,'Romance',NULL,NULL,NULL);

/*Table structure for table `pengguna` */

DROP TABLE IF EXISTS `pengguna`;

CREATE TABLE `pengguna` (
  `pengguna_id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `pengguna_nama` varchar(255) DEFAULT NULL,
  `pengguna_jk` enum('pria','wanita') DEFAULT NULL,
  `pengguna_password` text,
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  `deletedAt` datetime DEFAULT NULL,
  `api_key` text,
  `refresh_token` text,
  `roles` text,
  `api_level` enum('free','freemium','premium') NOT NULL DEFAULT 'free',
  `api_quota` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`pengguna_id`)
);

/*Data for the table `pengguna` */

insert  into `pengguna`(`pengguna_id`,`pengguna_nama`,`pengguna_jk`,`pengguna_password`,`createdAt`,`updatedAt`,`deletedAt`,`api_key`,`refresh_token`,`roles`,`api_level`,`api_quota`) values 
(1,'esther','wanita','$2b$10$w8.JYGmnZeI9uMu.X3b9wOvrauZp0NBeKnXONn31wJg.vZyvEs9oa',NULL,'2023-03-21 03:27:26',NULL,'c54ba203-fecc-4c6c-b429-73221ddff760','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwZW5nZ3VuYSI6eyJwZW5nZ3VuYV9pZCI6MSwicGVuZ2d1bmFfbmFtYSI6ImVzdGhlciIsInBlbmdndW5hX2prIjoid2FuaXRhIiwicm9sZXMiOiJhZG1pbixtYW5hZ2VyLHZpc2l0b3IiLCJ0b2tvX2lkIjoxLCJ0b2tvX25hbWEiOiJTdW1iZXIgUGludGVyIn0sImlhdCI6MTY3OTM2OTI0NiwiZXhwIjoxNjc5NDU1NjQ2fQ.UNoSznlmBOP0NOBWIR2cmCbmRcLoKozx65kjrZgB_1E','admin,manager,visitor','premium',0),
(2,'evan','pria','$2b$10$w8.JYGmnZeI9uMu.X3b9wOvrauZp0NBeKnXONn31wJg.vZyvEs9oa',NULL,'2023-02-23 10:53:11',NULL,'1bb2a7cb-de18-4354-8cef-515b36936fa4','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwZW5nZ3VuYSI6eyJwZW5nZ3VuYV9pZCI6MiwicGVuZ2d1bmFfbmFtYSI6ImV2YW4iLCJwZW5nZ3VuYV9qayI6InByaWEiLCJyb2xlcyI6Im1hbmFnZXIsdmlzaXRvciIsInRva29faWQiOjIsInRva29fbmFtYSI6IlBva29rZSBMdWx1cyJ9LCJpYXQiOjE2NzcxNDk1OTEsImV4cCI6MTY3NzIzNTk5MX0.M0--uZC3XNPH635J-eD9ggQnRQnq1D9yzLiARH5Wo4o','manager,visitor','freemium',0),
(3,'mimi','pria','$2b$10$w8.JYGmnZeI9uMu.X3b9wOvrauZp0NBeKnXONn31wJg.vZyvEs9oa',NULL,'2023-02-23 10:52:52',NULL,'ec09f7bd-7cdc-4bcf-a7e5-53a873e282d7','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwZW5nZ3VuYSI6eyJwZW5nZ3VuYV9pZCI6MywicGVuZ2d1bmFfbmFtYSI6Im1pbWkiLCJwZW5nZ3VuYV9qayI6InByaWEiLCJyb2xlcyI6InZpc2l0b3IiLCJ0b2tvX2lkIjozLCJ0b2tvX25hbWEiOiJCdWt1IERpbWFzYWsgRGltaW51bSJ9LCJpYXQiOjE2NzcxNDk1NzIsImV4cCI6MTY3NzIzNTk3Mn0.OMyhwkkasCAGe-3nWhA94BVx9bwmpO4_VUUT_wnvJ8g','visitor','free',0);

/*Table structure for table `toko` */

DROP TABLE IF EXISTS `toko`;

CREATE TABLE `toko` (
  `toko_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `toko_nama` varchar(255) DEFAULT NULL,
  `pengguna_id` bigint(20) DEFAULT NULL,
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  `deletedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`toko_id`),
  UNIQUE KEY `toko_toko_id_uindex` (`toko_id`)
);

/*Data for the table `toko` */

insert  into `toko`(`toko_id`,`toko_nama`,`pengguna_id`,`createdAt`,`updatedAt`,`deletedAt`) values 
(1,'Sumber Pinter',1,NULL,NULL,NULL),
(2,'Pokoke Lulus',2,NULL,NULL,NULL),
(3,'Buku Dimasak Diminum',3,NULL,NULL,NULL);

/*Table structure for table `toko_buku` */

DROP TABLE IF EXISTS `toko_buku`;

CREATE TABLE `toko_buku` (
  `tb_id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `toko_id` bigint(20) DEFAULT NULL,
  `buku_id` bigint(20) DEFAULT NULL,
  `tb_stok` bigint(20) DEFAULT NULL,
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  `deletedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`tb_id`)
);

/*Data for the table `toko_buku` */

insert  into `toko_buku`(`tb_id`,`toko_id`,`buku_id`,`tb_stok`,`createdAt`,`updatedAt`,`deletedAt`) values 
(1,1,1,11,NULL,NULL,NULL),
(2,1,3,13,NULL,NULL,NULL),
(3,1,5,15,NULL,NULL,NULL),
(4,2,2,22,NULL,NULL,NULL),
(5,2,4,24,NULL,NULL,NULL),
(6,2,6,26,NULL,NULL,NULL),
(7,3,1,31,NULL,NULL,NULL),
(8,3,5,35,NULL,NULL,NULL),
(9,3,2,32,NULL,NULL,NULL),
(10,3,4,34,NULL,NULL,NULL),
(11,1,10,100,'2023-03-01 03:09:47','2023-03-01 03:12:49','2023-03-01 03:12:49');