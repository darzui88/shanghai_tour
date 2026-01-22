-- MySQL dump 10.13  Distrib 9.5.0, for Win64 (x86_64)
--
-- Host: localhost    Database: shanghai_tour
-- ------------------------------------------------------
-- Server version	9.5.0

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
SET @MYSQLDUMP_TEMP_LOG_BIN = @@SESSION.SQL_LOG_BIN;
SET @@SESSION.SQL_LOG_BIN= 0;

--
-- GTID state at the beginning of the backup 
--

SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ '400d8ffb-f39c-11f0-8f3a-145afc874d8a:1-14048';

--
-- Table structure for table `admins`
--

DROP TABLE IF EXISTS `admins`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `admins` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL COMMENT '管理员用户名',
  `password` varchar(255) NOT NULL COMMENT '加密后的密码',
  `email` varchar(100) DEFAULT NULL COMMENT '管理员邮箱',
  `phone` varchar(20) DEFAULT NULL COMMENT '管理员手机号',
  `role` enum('admin','super_admin','editor') DEFAULT 'admin' COMMENT '管理员角色：admin-普通管理员, super_admin-超级管理员, editor-编辑',
  `permissions` json DEFAULT NULL COMMENT '权限列表（预留字段，用于未来权限细分）',
  `isActive` tinyint(1) DEFAULT '1' COMMENT '是否激活',
  `lastLogin` datetime DEFAULT NULL COMMENT '最后登录时间',
  `lastLoginIp` varchar(50) DEFAULT NULL COMMENT '最后登录IP',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `username_2` (`username`),
  UNIQUE KEY `username_3` (`username`),
  UNIQUE KEY `username_4` (`username`),
  UNIQUE KEY `username_5` (`username`),
  UNIQUE KEY `username_6` (`username`),
  UNIQUE KEY `username_7` (`username`),
  UNIQUE KEY `username_8` (`username`),
  UNIQUE KEY `username_9` (`username`),
  UNIQUE KEY `username_10` (`username`),
  UNIQUE KEY `username_11` (`username`),
  UNIQUE KEY `username_12` (`username`),
  UNIQUE KEY `username_13` (`username`),
  UNIQUE KEY `username_14` (`username`),
  UNIQUE KEY `username_15` (`username`),
  UNIQUE KEY `username_16` (`username`),
  UNIQUE KEY `username_17` (`username`),
  UNIQUE KEY `username_18` (`username`),
  UNIQUE KEY `username_19` (`username`),
  UNIQUE KEY `username_20` (`username`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `phone` (`phone`),
  UNIQUE KEY `email_2` (`email`),
  UNIQUE KEY `phone_2` (`phone`),
  UNIQUE KEY `email_3` (`email`),
  UNIQUE KEY `phone_3` (`phone`),
  UNIQUE KEY `email_4` (`email`),
  UNIQUE KEY `phone_4` (`phone`),
  UNIQUE KEY `email_5` (`email`),
  UNIQUE KEY `phone_5` (`phone`),
  UNIQUE KEY `email_6` (`email`),
  UNIQUE KEY `phone_6` (`phone`),
  UNIQUE KEY `email_7` (`email`),
  UNIQUE KEY `phone_7` (`phone`),
  UNIQUE KEY `email_8` (`email`),
  UNIQUE KEY `phone_8` (`phone`),
  UNIQUE KEY `email_9` (`email`),
  UNIQUE KEY `phone_9` (`phone`),
  UNIQUE KEY `email_10` (`email`),
  UNIQUE KEY `phone_10` (`phone`),
  UNIQUE KEY `email_11` (`email`),
  UNIQUE KEY `phone_11` (`phone`),
  UNIQUE KEY `email_12` (`email`),
  UNIQUE KEY `phone_12` (`phone`),
  UNIQUE KEY `email_13` (`email`),
  UNIQUE KEY `phone_13` (`phone`),
  UNIQUE KEY `email_14` (`email`),
  UNIQUE KEY `phone_14` (`phone`),
  UNIQUE KEY `email_15` (`email`),
  UNIQUE KEY `phone_15` (`phone`),
  UNIQUE KEY `email_16` (`email`),
  UNIQUE KEY `phone_16` (`phone`),
  UNIQUE KEY `email_17` (`email`),
  UNIQUE KEY `phone_17` (`phone`),
  UNIQUE KEY `email_18` (`email`),
  UNIQUE KEY `phone_18` (`phone`),
  UNIQUE KEY `email_19` (`email`),
  UNIQUE KEY `phone_19` (`phone`),
  UNIQUE KEY `email_20` (`email`),
  KEY `admins_username` (`username`),
  KEY `admins_email` (`email`),
  KEY `admins_phone` (`phone`),
  KEY `admins_is_active` (`isActive`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admins`
--

LOCK TABLES `admins` WRITE;
/*!40000 ALTER TABLE `admins` DISABLE KEYS */;
INSERT INTO `admins` VALUES (1,'15618963396','$2a$10$zlnCa0ClnnMFJas/rL.8Q.NSz/dHayJJeHZLnklxJHrKD3zHzfMvG','admin@shanghaitour.com','15618963396','super_admin','[\"all\"]',1,'2026-01-21 10:01:29','127.0.0.1','2026-01-19 07:26:48','2026-01-21 10:01:29');
/*!40000 ALTER TABLE `admins` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `events`
--

DROP TABLE IF EXISTS `events`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `events` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `titleCN` varchar(255) DEFAULT NULL,
  `description` text NOT NULL,
  `descriptionCN` text,
  `category` enum('exhibition','concert','festival','workshop','sports','food','art','music','other') DEFAULT 'other',
  `venueName` varchar(255) DEFAULT NULL COMMENT '地点名称',
  `venueAddress` varchar(500) DEFAULT NULL COMMENT '地点地址',
  `city` varchar(100) DEFAULT NULL COMMENT '城市',
  `district` varchar(100) DEFAULT NULL COMMENT '区',
  `startDate` datetime DEFAULT NULL COMMENT '开始日期（可选）',
  `endDate` datetime DEFAULT NULL COMMENT '结束日期（可选）',
  `startTime` varchar(50) DEFAULT NULL COMMENT '开始时间（如：8:00 PM）',
  `endTime` varchar(50) DEFAULT NULL COMMENT '结束时间（如：10:00 PM）',
  `price` json DEFAULT NULL COMMENT '价格信息',
  `images` json DEFAULT NULL COMMENT '活动图片数组，最多5张',
  `listImage` varchar(500) DEFAULT NULL COMMENT '列表页显示的缩略图',
  `ticketUrl` varchar(500) DEFAULT NULL COMMENT '购票链接URL',
  `notes` text COMMENT '备注信息',
  `source` json DEFAULT NULL COMMENT '数据来源信息',
  `tags` json DEFAULT NULL COMMENT '标签数组',
  `featured` tinyint(1) DEFAULT '0' COMMENT '是否推荐',
  `language` json DEFAULT NULL COMMENT '支持的语言',
  `contact` json DEFAULT NULL COMMENT '联系方式',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `openingHours` json DEFAULT NULL COMMENT '营业时间（格式同Location的openingHours）',
  PRIMARY KEY (`id`),
  KEY `events_start_date_end_date` (`startDate`,`endDate`),
  KEY `events_category` (`category`),
  KEY `events_featured` (`featured`),
  KEY `events_venue_name` (`venueName`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `events`
--

LOCK TABLES `events` WRITE;
/*!40000 ALTER TABLE `events` DISABLE KEYS */;
INSERT INTO `events` VALUES (2,'A Dream of Red Mansions by The National Ballet of China',NULL,'The National Ballet of China is bringing The Dream of Red Mansions to  Shanghai, and it’s a total feast for the eyes. Expect sweeping love  stories, jaw-dropping choreography, and some seriously stunning costumes  that make the Grand View Garden come alive on stage. Whether you’re a  ballet newbie or a longtime fan, this is one of those shows that just  sticks with you.',NULL,'other','Wanping Theater','857 Zhongshan Nan Er Lu',NULL,NULL,NULL,NULL,NULL,NULL,'{\"note\": \"180-880rmb\"}','[\"http://localhost:5000/uploads/events/1-1768824377402-975574470.webp\"]','http://localhost:5000/uploads/events/1-1768824377402-975574470.webp',NULL,NULL,NULL,'[]',0,'[]',NULL,'2026-01-19 12:06:08','2026-01-19 12:13:46','{\"friday\": \"19:30\", \"saturday\": \"19:30\"}'),(3,'[Shanghai] Rival Consoles China Tour 2026',NULL,'Rival Consoles is finally coming to China, bringing a full Live/A/V show that mixes pulsing electronic music with real-time visuals. It’s the kind of  set that feels part concert, part art installation — a deep,  atmospheric trip led by one of the UK’s most respected electronic  producers. Visual artist Sky Ainsbury joins him, with Wu Zhuoling  supporting.',NULL,'other','Bandai Namco Shanghai Base','179 Yichang Lu',NULL,NULL,NULL,NULL,NULL,NULL,'{\"note\": \"198rmb\"}','[\"http://localhost:5000/uploads/events/2-1768824786262-368757182.webp\"]','http://localhost:5000/uploads/events/2-1768824786262-368757182.webp',NULL,NULL,NULL,'[]',0,'[]',NULL,'2026-01-19 12:13:06','2026-01-19 12:13:06','{\"friday\": \"8:00\"}'),(4,'Daniel Kharitonov Piano Recital',NULL,'If you follow the international piano circuit, Daniel Kharitonov is a name that’s hard to miss. The Russian pianist rose to global attention after his standout showing at the Tchaikovsky Competition and has since built areputation for high-energy, emotionally charged performances. This Shanghai recital brings together iconic piano works and virtuosic transcriptions, all performed solo at the Cadillac Shanghai Concert  Hall.',NULL,'music','Shanghai Concert Hall','523 Yan\'an Dong Lu ',NULL,NULL,NULL,NULL,NULL,NULL,'{\"note\": \"80-480rmb\"}','[\"http://localhost:5000/uploads/events/3-1768825131628-468040802.webp\"]','http://localhost:5000/uploads/events/3-1768825131628-468040802.webp',NULL,NULL,NULL,'[]',0,'[]',NULL,'2026-01-19 12:18:51','2026-01-19 12:18:51','{\"saturday\": \"19:30\"}'),(5,'Daniel Kharitonov Piano Recital',NULL,'If you follow the international piano circuit, Daniel Kharitonov is a name that’s hard to miss. The Russian pianist rose to global attention after his standout showing at the Tchaikovsky Competition and has since built areputation for high-energy, emotionally charged performances. This Shanghai recital brings together iconic piano works and virtuosic transcriptions, all performed solo at the Cadillac Shanghai Concert  Hall.',NULL,'music','Shanghai Concert Hall','523 Yan\'an Dong Lu','上海',NULL,'2026-01-23 16:00:00','2026-01-23 16:00:00','19:30',NULL,'{\"note\": \"¥80-480\", \"amount\": 80, \"currency\": \"CNY\"}','[]',NULL,NULL,NULL,'{\"url\": \"https://mp.weixin.qq.com/s/qXQeT6RAggkuWRYxmqIV1Q\", \"source\": \"wechat\", \"scrapedAt\": \"2026-01-19T12:46:27.518Z\"}','[]',0,'[]',NULL,'2026-01-19 12:46:27','2026-01-19 12:46:27',NULL),(6,'Tennisline International Tennis Academy (Xuhui)',NULL,'Tennisline International Tennis Academy Shanghai offers a 9-week tennis clinic  tailored for beginners and those with basic skills. This dynamic and engaging course provides a fast-paced introduction to tennis, balancing ample practice time with learning key techniques and tactics. Players can enjoy a great workout in a fun, social, and stress-free environment. The clinic includes nine one-hour sessions, available Monday through Thursday evenings (7-9pm) and all day Sunday.',NULL,'sports','Tennis Class for Beginners (Xuhui)','Fenyang Garden Hotel, 45 Fenyang Lu','上海',NULL,NULL,NULL,NULL,NULL,'{\"note\": \"¥2880\", \"amount\": 2880, \"currency\": \"CNY\"}','[]',NULL,NULL,'Time: Various Dates','{\"url\": \"https://mp.weixin.qq.com/s/qXQeT6RAggkuWRYxmqIV1Q\", \"source\": \"wechat\", \"scrapedAt\": \"2026-01-19T12:46:27.537Z\"}','[]',0,'[]',NULL,'2026-01-19 12:46:27','2026-01-19 12:46:27',NULL),(7,'Will Griffith is a photographer, videographer, writer, and music promoter living in Shanghai. He’s the founder of LiveChinaMusic - a platform dedicated to China\'s evolving underground music scene.',NULL,'Shanghai’s pro-wrestling scene is getting a serious international boost this  January. The World Pro-Wrestling Exchange Tournament brings wrestlers from five countries to 36space in Xuhui, headlined by IWGP Women’s Champion Sareee and a chaotic four-way title defense featuring Big Sam. Expect hard-hitting action, big personalities, and a night that’s equal parts spectacle and sport.',NULL,'music','Singer Space','Bldg.E, 36 Caobao Lu','上海',NULL,'2026-01-20 16:00:00','2026-01-20 16:00:00','20:30',NULL,'{\"note\": \"¥299-788\", \"amount\": 299, \"currency\": \"CNY\"}','[]',NULL,NULL,NULL,'{\"url\": \"https://mp.weixin.qq.com/s/qXQeT6RAggkuWRYxmqIV1Q\", \"source\": \"wechat\", \"scrapedAt\": \"2026-01-19T12:46:27.548Z\"}','[]',0,'[]',NULL,'2026-01-19 12:46:27','2026-01-19 12:46:27',NULL),(8,'she’s green (US)',NULL,'Enter the glimmering dream world of she\'s green as Minneapolis-based shoegaze band makes their way to Singer Space as part of their China tour. \'An ethereal love letter to visceral dream pop,\' their music pulls listeners in with the angelic and otherworldly vocals of Zofia Smith, its dense layers of swirling guitar feedback, and its organic, natural soundscapes - finding that blissful middle ground between tenderness and blunt force - between atmosphere and rigor. The band has been rising throug',NULL,'music','Singer Space','3/F, Changning Worker\'s Cultural Palace','上海',NULL,'2026-01-20 16:00:00','2026-01-20 16:00:00','20:30',NULL,'{\"note\": \"¥238\", \"amount\": 238, \"currency\": \"CNY\"}','[]',NULL,NULL,NULL,'{\"url\": \"https://mp.weixin.qq.com/s/qXQeT6RAggkuWRYxmqIV1Q\", \"source\": \"wechat\", \"scrapedAt\": \"2026-01-19T12:46:27.558Z\"}','[]',0,'[]',NULL,'2026-01-19 12:46:27','2026-01-19 12:46:27',NULL),(9,'Rival Consoles (UK), Wu Zhuoling',NULL,'Rival Consoles has been concurrently in the foreground and background of electronic music since the late 00s — crafting challenging IDM, neon electro-house, and more minimalist, experimental compositions. Whether it’s conjuring tense melancholia for Black Mirror soundtracks, playing  in front of 10,000 dance fans at Drumsheds, selling out London\'s Barbican Hall, and making synthesizers sound more human, the London-based producer Ryan Lee West is one of the best in the game. His increasingly dyna',NULL,'music','Bandai Namco Shanghai Base','179 Yichang Lu','上海',NULL,NULL,NULL,NULL,NULL,'{\"note\": \"¥198\", \"amount\": 198, \"currency\": \"CNY\"}','[]',NULL,NULL,NULL,'{\"url\": \"https://mp.weixin.qq.com/s/qXQeT6RAggkuWRYxmqIV1Q\", \"source\": \"wechat\", \"scrapedAt\": \"2026-01-19T12:46:27.567Z\"}','[]',0,'[]',NULL,'2026-01-19 12:46:27','2026-01-19 12:46:27',NULL),(10,'Screaming Savior, FalseGods, Guardians of the Night, Airy, BeatGeneration 1980’s, Direwolf',NULL,'The Luyiba Indoor Heavy Metal Music Festival returns for its sixth year - and this time they’re taking over EncoreSpace out by Guilin Park. It’s a hefty lineup featuring some heavy hitters, including FalseGods, who brew a ‘bodacious blend of black metal, death metal, thrash, metalcore, and deathcore\' — with members hailing from Montreal and Jinan. Also on hand, Hangzhou’s Airy — whose sound settles somewhere at the nexus of post rock, shoegaze, and atmospheric black metal; Screaming Savior, know',NULL,'music','Encore Space','S5-L3-G01a, 3/F, Xinyao Halo Live II','上海',NULL,NULL,NULL,NULL,NULL,'{\"note\": \"¥138-168\", \"amount\": 138, \"currency\": \"CNY\"}','[]',NULL,NULL,NULL,'{\"url\": \"https://mp.weixin.qq.com/s/qXQeT6RAggkuWRYxmqIV1Q\", \"source\": \"wechat\", \"scrapedAt\": \"2026-01-19T12:46:27.576Z\"}','[]',0,'[]',NULL,'2026-01-19 12:46:27','2026-01-19 12:46:27',NULL),(11,'Katharnum, HEADIVE, T.O.S, Mini Koala',NULL,'Black metal, sludge, hardcore, and rock’s more defiant offspring reign supreme tonight at Cream Club with a gnarly lineup featuring sludgecore act T.O.S. (or Tornado of Shit if you prefer), who concoct a foamy brew of feedback-soaked filth, disembodied samples, and tortured vocals - hardcore brutality via nails-on-the-wall narcotized slow burn. Joining them are black metal outfit Katharnum (featuring members of Atomic Saman and Conjurer), hardcore ruffians HEADIVE, and Mini Koala - not afraid to',NULL,'other','Cream Club','BF-1, 5230 Binjiang Da Dao','上海',NULL,'2026-01-23 16:00:00','2026-01-23 16:00:00','20:30',NULL,'{\"note\": \"¥60-140\", \"amount\": 60, \"currency\": \"CNY\"}','[]',NULL,NULL,NULL,'{\"url\": \"https://mp.weixin.qq.com/s/qXQeT6RAggkuWRYxmqIV1Q\", \"source\": \"wechat\", \"scrapedAt\": \"2026-01-19T12:46:27.585Z\"}','[]',0,'[]',NULL,'2026-01-19 12:46:27','2026-01-19 12:46:27',NULL),(12,'Dropdown, Mizu2Mizu, Arcky Tang, Ate Autumn, Yellow Wasabi',NULL,'A lush spread of A/V artists and producers takes over trigger for an immersive, atmospheric afternoon of audio-visual art. Acts include offscript label head dropdown, from Hangzhou, who offers something a bit more adventurous and IDM-stricken; Mizu2Mizu - the audiovisual project hailing from Mizu^3; Arcky Tang, who explores ‘surrealism, consciousness, and perception experiments through structural collapse and audiovisual resonance’; Ate Autumn, the multinational electronic music duo whose unique',NULL,'music','trigger','Room 308, Union Mansion, 350 Wuning Lu','上海',NULL,NULL,NULL,NULL,NULL,'{\"note\": \"¥65\", \"amount\": 65, \"currency\": \"CNY\"}','[]',NULL,NULL,NULL,'{\"url\": \"https://mp.weixin.qq.com/s/qXQeT6RAggkuWRYxmqIV1Q\", \"source\": \"wechat\", \"scrapedAt\": \"2026-01-19T12:46:27.594Z\"}','[]',0,'[]',NULL,'2026-01-19 12:46:27','2026-01-19 12:46:27',NULL),(13,'Dirty House (INS)',NULL,'Active since the mid-1990s, YangBing is a central figure in the development of China’s underground electronic music scene, having moved from early DJ work in Beijing’s commercial bars to organizing some of the city’s first  rave-style parties at a time when no dedicated platform existed. His influence later extended to landmark moments such as the Great Wall  parties, international appearances in Europe, the founding of White Rabbit Club in 2008, and the production of the documentary Break The W',NULL,'music','Yang Bing','4/F, INS Fuxing Park, 109 Yandang Lu','上海',NULL,NULL,NULL,NULL,NULL,'{\"note\": \"¥88-108\", \"amount\": 88, \"currency\": \"CNY\"}','[]',NULL,NULL,NULL,'{\"url\": \"https://mp.weixin.qq.com/s/qXQeT6RAggkuWRYxmqIV1Q\", \"source\": \"wechat\", \"scrapedAt\": \"2026-01-19T12:46:27.603Z\"}','[]',0,'[]',NULL,'2026-01-19 12:46:27','2026-01-19 12:46:27',NULL),(14,'Shy People 6th Anniversary pres. Kim Ann Foxman & Cora',NULL,'Shy People marks its sixth anniversary in Shanghai with a club night that  brings together two DJs whose paths have moved between underground  scenes and international dance floors. Kim Ann Foxman, once fronting  Hercules and Love Affair, now focuses on DJ sets shaped by ’90s rave  energy, disco, and house, informed by years spent in New York and  Brooklyn club culture. Sharing the booth is Cora, a Chengdu-born DJ who has worked her way from China’s underground to Berlin, becoming the first Chin',NULL,'music','Heim','B1/F, 154 Nanyang Lu','上海',NULL,NULL,NULL,NULL,NULL,'{\"note\": \"¥88-138\", \"amount\": 88, \"currency\": \"CNY\"}','[]',NULL,NULL,NULL,'{\"url\": \"https://mp.weixin.qq.com/s/qXQeT6RAggkuWRYxmqIV1Q\", \"source\": \"wechat\", \"scrapedAt\": \"2026-01-19T12:46:27.612Z\"}','[]',0,'[]',NULL,'2026-01-19 12:46:27','2026-01-19 12:46:27',NULL),(15,'DJ: Guille Placencia X Labarra',NULL,'Drawing from the Ibiza club circuit, this night centers on Barcelona-based DJ and producer Guille, whose background spans more than a decade in electronic music. As the founder of La Pera Records and a multiple-time  Beatport Global No. 1 artist, his work sits comfortably within the  groove-driven end of house and tech house. Touring experience across  Europe and the Americas has taken him to large-scale festivals and  well-known clubs, where his sets tend to focus on crowd-friendly  momentum ra',NULL,'music','La Barra','No. 110, 319 Jiaozhou Lu','上海',NULL,'2026-01-23 16:00:00','2026-01-23 16:00:00','22:30',NULL,'{\"note\": \"¥168\", \"amount\": 168, \"currency\": \"CNY\"}','[]',NULL,NULL,NULL,'{\"url\": \"https://mp.weixin.qq.com/s/qXQeT6RAggkuWRYxmqIV1Q\", \"source\": \"wechat\", \"scrapedAt\": \"2026-01-19T12:46:27.620Z\"}','[]',0,'[]',NULL,'2026-01-19 12:46:27','2026-01-19 12:46:27',NULL),(16,'Volcanic Wines Tasting at PASS RESIDENCE',NULL,'A themed wine tasting focused on volcanic terroir, featuring five wines  grown in mineral-rich soils shaped by volcanic activity. From Sicily’s  Mount Etna to Spain’s Canary Islands, the selection highlights how  geology leaves its mark on flavor. A relaxed weekend tasting for people curious about wine beyond grape varieties. The tasting is informal and exploratory rather than technical, making it accessible even if volcanic  wine is new territory. Guests can taste through all five wines and  co',NULL,'food','PASS RESIDENCE','318 Julu Lu','上海',NULL,NULL,NULL,NULL,NULL,'{\"note\": \"À la carte (see menu attached)\"}','[]',NULL,NULL,NULL,'{\"url\": \"https://mp.weixin.qq.com/s/qXQeT6RAggkuWRYxmqIV1Q\", \"source\": \"wechat\", \"scrapedAt\": \"2026-01-19T12:46:27.629Z\"}','[]',0,'[]',NULL,'2026-01-19 12:46:27','2026-01-19 12:46:27',NULL),(17,'Baby Enjoys Intangible Cultural Heritage',NULL,'No description available',NULL,'other','< Celadon Ou Music >','','上海',NULL,'2026-01-22 04:00:09','2026-01-23 04:00:09',NULL,NULL,NULL,'[\"https://mmbiz.qpic.cn/mmbiz_png/E9Mn3cqvx1R44ORBnyS1Sl3Q9fRhIs0ficuOUd5TpYib6hf8jiaT3O9uNQXefQljm93kdbicQwTSOEjbn60H8YbLPQ/640?wx_fmt=png&from=appmsg&tp=webp&wxfrom=5&wx_lazy=1#imgIndex=1\"]','https://mmbiz.qpic.cn/mmbiz_png/E9Mn3cqvx1R44ORBnyS1Sl3Q9fRhIs0ficuOUd5TpYib6hf8jiaT3O9uNQXefQljm93kdbicQwTSOEjbn60H8YbLPQ/640?wx_fmt=png&from=appmsg&tp=webp&wxfrom=5&wx_lazy=1#imgIndex=1',NULL,NULL,'{\"platform\": \"smartshanghai_wechat\", \"scrapedAt\": \"2026-01-21T04:00:09.792Z\"}','[]',0,'[\"Chinese\", \"English\"]',NULL,'2026-01-19 12:46:27','2026-01-21 04:00:09',NULL),(18,'Don\'t Miss:',NULL,'No description available',NULL,'other','Baby Enjoys Intangible Cultural Heritage < Celadon Ou Music >','',NULL,NULL,'2026-01-22 04:00:09','2026-01-23 04:00:09',NULL,NULL,NULL,'[\"https://mmbiz.qpic.cn/mmbiz_png/E9Mn3cqvx1Tmd6piaJA8sRGctFczuGC274cucicCaD0juUyHiaQrhLuKbib23qOibukvVkGGFsdYbDZAjOFK1LfpCqQ/640?wx_fmt=png&from=appmsg&tp=webp&wxfrom=5&wx_lazy=1#imgIndex=0\", \"https://mmbiz.qpic.cn/mmbiz_png/E9Mn3cqvx1R44ORBnyS1Sl3Q9fRhIs0ficuOUd5TpYib6hf8jiaT3O9uNQXefQljm93kdbicQwTSOEjbn60H8YbLPQ/640?wx_fmt=png&from=appmsg&tp=webp&wxfrom=5&wx_lazy=1#imgIndex=1\"]','https://mmbiz.qpic.cn/mmbiz_png/E9Mn3cqvx1Tmd6piaJA8sRGctFczuGC274cucicCaD0juUyHiaQrhLuKbib23qOibukvVkGGFsdYbDZAjOFK1LfpCqQ/640?wx_fmt=png&from=appmsg&tp=webp&wxfrom=5&wx_lazy=1#imgIndex=0',NULL,NULL,'{\"platform\": \"smartshanghai_wechat\", \"scrapedAt\": \"2026-01-21T04:00:09.743Z\"}','[]',0,'[\"Chinese\", \"English\"]',NULL,'2026-01-21 04:00:09','2026-01-21 04:00:09',NULL),(19,'< Celadon Ou Music >',NULL,'No description available',NULL,'concert','TBA','',NULL,NULL,'2026-01-22 04:00:09','2026-01-23 04:00:09',NULL,NULL,NULL,'[\"https://mmbiz.qpic.cn/mmbiz_png/E9Mn3cqvx1R44ORBnyS1Sl3Q9fRhIs0ficuOUd5TpYib6hf8jiaT3O9uNQXefQljm93kdbicQwTSOEjbn60H8YbLPQ/640?wx_fmt=png&from=appmsg&tp=webp&wxfrom=5&wx_lazy=1#imgIndex=1\"]','https://mmbiz.qpic.cn/mmbiz_png/E9Mn3cqvx1R44ORBnyS1Sl3Q9fRhIs0ficuOUd5TpYib6hf8jiaT3O9uNQXefQljm93kdbicQwTSOEjbn60H8YbLPQ/640?wx_fmt=png&from=appmsg&tp=webp&wxfrom=5&wx_lazy=1#imgIndex=1',NULL,NULL,'{\"platform\": \"smartshanghai_wechat\", \"scrapedAt\": \"2026-01-21T04:00:09.803Z\"}','[]',0,'[\"Chinese\", \"English\"]',NULL,'2026-01-21 04:00:09','2026-01-21 04:00:09',NULL),(20,'Art shows that won\'t bore the kids — or you. Here are five playful, hands-on exhibitions to check out this month.',NULL,'No description available',NULL,'exhibition','Zootopia JumpFromPaper Pop‑Up','',NULL,NULL,'2026-01-22 04:00:09','2026-01-23 04:00:09',NULL,NULL,NULL,'[\"https://mmbiz.qpic.cn/mmbiz_png/E9Mn3cqvx1R44ORBnyS1Sl3Q9fRhIs0ficuOUd5TpYib6hf8jiaT3O9uNQXefQljm93kdbicQwTSOEjbn60H8YbLPQ/640?wx_fmt=png&from=appmsg&tp=webp&wxfrom=5&wx_lazy=1#imgIndex=1\"]','https://mmbiz.qpic.cn/mmbiz_png/E9Mn3cqvx1R44ORBnyS1Sl3Q9fRhIs0ficuOUd5TpYib6hf8jiaT3O9uNQXefQljm93kdbicQwTSOEjbn60H8YbLPQ/640?wx_fmt=png&from=appmsg&tp=webp&wxfrom=5&wx_lazy=1#imgIndex=1',NULL,NULL,'{\"platform\": \"smartshanghai_wechat\", \"scrapedAt\": \"2026-01-21T04:00:09.812Z\"}','[\"art\", \"exhibition\"]',0,'[\"Chinese\", \"English\"]',NULL,'2026-01-21 04:00:09','2026-01-21 04:00:09',NULL),(21,'Zootopia JumpFromPaper Pop‑Up',NULL,'No description available',NULL,'other','TBA','',NULL,NULL,'2026-01-22 04:00:09','2026-01-23 04:00:09',NULL,NULL,NULL,'[\"https://mmbiz.qpic.cn/mmbiz_png/E9Mn3cqvx1R44ORBnyS1Sl3Q9fRhIs0ficuOUd5TpYib6hf8jiaT3O9uNQXefQljm93kdbicQwTSOEjbn60H8YbLPQ/640?wx_fmt=png&from=appmsg&tp=webp&wxfrom=5&wx_lazy=1#imgIndex=1\"]','https://mmbiz.qpic.cn/mmbiz_png/E9Mn3cqvx1R44ORBnyS1Sl3Q9fRhIs0ficuOUd5TpYib6hf8jiaT3O9uNQXefQljm93kdbicQwTSOEjbn60H8YbLPQ/640?wx_fmt=png&from=appmsg&tp=webp&wxfrom=5&wx_lazy=1#imgIndex=1',NULL,NULL,'{\"platform\": \"smartshanghai_wechat\", \"scrapedAt\": \"2026-01-21T04:00:09.819Z\"}','[]',0,'[\"Chinese\", \"English\"]',NULL,'2026-01-21 04:00:09','2026-01-21 04:00:09',NULL),(22,'\"Letting Go... Holding On...\" Crybaby Exhibition',NULL,'No description available',NULL,'exhibition','TBA','',NULL,NULL,'2026-01-22 04:00:09','2026-01-23 04:00:09',NULL,NULL,NULL,'[\"https://mmbiz.qpic.cn/mmbiz_png/E9Mn3cqvx1R44ORBnyS1Sl3Q9fRhIs0ficuOUd5TpYib6hf8jiaT3O9uNQXefQljm93kdbicQwTSOEjbn60H8YbLPQ/640?wx_fmt=png&from=appmsg&tp=webp&wxfrom=5&wx_lazy=1#imgIndex=1\"]','https://mmbiz.qpic.cn/mmbiz_png/E9Mn3cqvx1R44ORBnyS1Sl3Q9fRhIs0ficuOUd5TpYib6hf8jiaT3O9uNQXefQljm93kdbicQwTSOEjbn60H8YbLPQ/640?wx_fmt=png&from=appmsg&tp=webp&wxfrom=5&wx_lazy=1#imgIndex=1',NULL,NULL,'{\"platform\": \"smartshanghai_wechat\", \"scrapedAt\": \"2026-01-21T04:00:09.827Z\"}','[\"exhibition\"]',0,'[\"Chinese\", \"English\"]',NULL,'2026-01-21 04:00:09','2026-01-21 04:00:09',NULL),(23,'Salvador D',NULL,'No description available',NULL,'other','ali x The Bund City Hall','',NULL,NULL,'2026-01-22 04:00:09','2026-01-23 04:00:09',NULL,NULL,NULL,'[\"https://mmbiz.qpic.cn/mmbiz_png/E9Mn3cqvx1R44ORBnyS1Sl3Q9fRhIs0ficuOUd5TpYib6hf8jiaT3O9uNQXefQljm93kdbicQwTSOEjbn60H8YbLPQ/640?wx_fmt=png&from=appmsg&tp=webp&wxfrom=5&wx_lazy=1#imgIndex=1\"]','https://mmbiz.qpic.cn/mmbiz_png/E9Mn3cqvx1R44ORBnyS1Sl3Q9fRhIs0ficuOUd5TpYib6hf8jiaT3O9uNQXefQljm93kdbicQwTSOEjbn60H8YbLPQ/640?wx_fmt=png&from=appmsg&tp=webp&wxfrom=5&wx_lazy=1#imgIndex=1',NULL,NULL,'{\"platform\": \"smartshanghai_wechat\", \"scrapedAt\": \"2026-01-21T04:00:09.835Z\"}','[]',0,'[\"Chinese\", \"English\"]',NULL,'2026-01-21 04:00:09','2026-01-21 04:00:09',NULL),(24,'Sony Pictures Roadshow',NULL,'No description available',NULL,'other','***','',NULL,NULL,'2026-01-22 04:00:09','2026-01-23 04:00:09',NULL,NULL,NULL,'[\"https://mmbiz.qpic.cn/mmbiz_png/E9Mn3cqvx1R44ORBnyS1Sl3Q9fRhIs0ficuOUd5TpYib6hf8jiaT3O9uNQXefQljm93kdbicQwTSOEjbn60H8YbLPQ/640?wx_fmt=png&from=appmsg&tp=webp&wxfrom=5&wx_lazy=1#imgIndex=1\"]','https://mmbiz.qpic.cn/mmbiz_png/E9Mn3cqvx1R44ORBnyS1Sl3Q9fRhIs0ficuOUd5TpYib6hf8jiaT3O9uNQXefQljm93kdbicQwTSOEjbn60H8YbLPQ/640?wx_fmt=png&from=appmsg&tp=webp&wxfrom=5&wx_lazy=1#imgIndex=1',NULL,NULL,'{\"platform\": \"smartshanghai_wechat\", \"scrapedAt\": \"2026-01-21T04:00:09.842Z\"}','[]',0,'[\"Chinese\", \"English\"]',NULL,'2026-01-21 04:00:09','2026-01-21 04:00:09',NULL);
/*!40000 ALTER TABLE `events` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `guides`
--

DROP TABLE IF EXISTS `guides`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `guides` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL COMMENT '攻略标题',
  `titleCN` varchar(255) DEFAULT NULL COMMENT '中文标题',
  `content` longtext NOT NULL COMMENT '攻略正文（HTML格式）',
  `isPinned` tinyint(1) DEFAULT '0' COMMENT '是否置顶',
  `coverImage` varchar(500) DEFAULT NULL COMMENT '头图URL',
  `tags` json DEFAULT NULL COMMENT '标签数组',
  `category` enum('transport','shopping','food','sightseeing','culture','tips','other') DEFAULT 'tips' COMMENT '攻略分类',
  `viewCount` int DEFAULT '0' COMMENT '浏览量',
  `isPublished` tinyint(1) DEFAULT '1' COMMENT '是否发布',
  `sortOrder` int DEFAULT '0' COMMENT '排序权重',
  `summary` text COMMENT '攻略摘要',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `guides_is_pinned_sort_order` (`isPinned`,`sortOrder`),
  KEY `guides_category` (`category`),
  KEY `guides_is_published` (`isPublished`),
  KEY `guides_created_at` (`createdAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `guides`
--

LOCK TABLES `guides` WRITE;
/*!40000 ALTER TABLE `guides` DISABLE KEYS */;
/*!40000 ALTER TABLE `guides` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `locations`
--

DROP TABLE IF EXISTS `locations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `locations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `nameCN` varchar(255) DEFAULT NULL,
  `address` varchar(500) NOT NULL,
  `addressCN` varchar(500) DEFAULT NULL,
  `city` varchar(100) DEFAULT 'Shanghai' COMMENT '城市',
  `district` varchar(100) NOT NULL,
  `coordinates` json DEFAULT NULL,
  `description` text NOT NULL,
  `descriptionCN` text,
  `categories` json DEFAULT NULL,
  `products` json DEFAULT NULL,
  `openingHours` json DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `website` varchar(500) DEFAULT NULL,
  `images` json DEFAULT NULL,
  `coverImage` varchar(500) DEFAULT NULL COMMENT '封面图（列表页显示）',
  `rating` decimal(3,2) DEFAULT '0.00',
  `transport` json DEFAULT NULL,
  `tips` json DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `locations`
--

LOCK TABLES `locations` WRITE;
/*!40000 ALTER TABLE `locations` DISABLE KEYS */;
INSERT INTO `locations` VALUES (1,'Yuyuan Garden & Bazaar','豫园商城','269 Fangbang Middle Road, Huangpu District, Shanghai','上海市黄浦区方浜中路269号','Shanghai','Huangpu','{\"latitude\": 31.2277, \"longitude\": 121.4925}','Yuyuan Garden Bazaar is one of Shanghai\'s most famous traditional shopping areas, featuring hundreds of souvenir shops selling silk products, jade jewelry, traditional Chinese crafts, tea sets, and calligraphy supplies. This historic area combines shopping with cultural exploration, located near the beautiful Ming Dynasty Yuyuan Garden.','豫园商城是上海最著名的传统购物区之一，拥有数百家纪念品商店，销售丝绸产品、翡翠珠宝、中国传统工艺品、茶具和书法用品。这个历史悠久的区域将购物与文化探索相结合，位于美丽的明代豫园附近。','[\"souvenir\", \"traditional\", \"cultural\", \"shopping\"]','[{\"type\": \"Silk Products\", \"items\": [\"Silk scarves\", \"Silk clothing\", \"Silk accessories\"], \"priceRange\": {\"max\": 1000, \"min\": 100, \"currency\": \"CNY\"}}, {\"type\": \"Jade Jewelry\", \"items\": [\"Jade pendants\", \"Jade bracelets\", \"Jade figurines\"], \"priceRange\": {\"max\": 5000, \"min\": 200, \"currency\": \"CNY\"}}, {\"type\": \"Traditional Crafts\", \"items\": [\"Calligraphy sets\", \"Tea sets\", \"Paper fans\", \"Chinese knots\"], \"priceRange\": {\"max\": 800, \"min\": 50, \"currency\": \"CNY\"}}]','{\"friday\": \"09:00 - 21:00\", \"monday\": \"09:00 - 21:00\", \"sunday\": \"09:00 - 21:00\", \"tuesday\": \"09:00 - 21:00\", \"saturday\": \"09:00 - 21:00\", \"thursday\": \"09:00 - 21:00\", \"wednesday\": \"09:00 - 21:00\"}','+86 21 6328 2430','http://www.yuyuantm.com','[\"https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800\", \"https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=800\"]','https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800',4.50,'{\"bus\": [\"Bus 11, 26, 64, 304, 736 - Get off at Yuyuan Station\"], \"taxi\": \"Tell driver: \\\"豫园商城\\\" or show address\", \"metro\": [\"Line 10 - Yuyuan Garden Station (Exit 1), 5 min walk\"], \"parking\": \"Limited parking available nearby, recommend public transport\"}','[\"Bargaining is expected and encouraged - start at 50-60% of asking price\", \"Visit early morning (9-10am) or late afternoon (5-6pm) to avoid crowds\", \"Check multiple shops before buying - prices vary significantly\", \"Bring cash (RMB) - many small shops don\'t accept cards\", \"Learn basic numbers in Chinese for easier bargaining\", \"Be aware of fake jade - buy from reputable stores if spending big\", \"The area gets very crowded on weekends and holidays\", \"There are good food stalls in the area - try xiaolongbao (soup dumplings)\"]','2026-01-19 08:33:04','2026-01-19 08:52:36'),(2,'Tianzifang Creative Park','田子坊','210 Taikang Road, Huangpu District, Shanghai','上海市黄浦区泰康路210号','Shanghai','Huangpu','{\"latitude\": 31.2174, \"longitude\": 121.4694}','Tianzifang is a trendy arts and crafts area housed in converted lane houses (shikumen). It features unique boutiques, art galleries, handmade craft shops, and cozy cafes. This is the perfect place to find one-of-a-kind souvenirs and support local artists and designers.','田子坊是一个时尚的艺术和工艺品区，位于改建的石库门里弄中。这里有独特的精品店、艺术画廊、手工艺品店和舒适的咖啡馆。这是寻找独一无二的纪念品和支持本地艺术家和设计师的完美场所。','[\"art\", \"craft\", \"unique\", \"boutique\"]','[{\"type\": \"Handmade Crafts\", \"items\": [\"Hand-painted items\", \"Custom jewelry\", \"Artistic home decor\"], \"priceRange\": {\"max\": 800, \"min\": 80, \"currency\": \"CNY\"}}, {\"type\": \"Local Artwork\", \"items\": [\"Paintings\", \"Prints\", \"Photography\", \"Sculptures\"], \"priceRange\": {\"max\": 2000, \"min\": 200, \"currency\": \"CNY\"}}, {\"type\": \"Unique Gifts\", \"items\": [\"Custom T-shirts\", \"Designer accessories\", \"Vintage items\"], \"priceRange\": {\"max\": 1500, \"min\": 100, \"currency\": \"CNY\"}}]','{\"friday\": \"10:00 - 22:00\", \"monday\": \"10:00 - 22:00\", \"sunday\": \"10:00 - 22:00\", \"tuesday\": \"10:00 - 22:00\", \"saturday\": \"10:00 - 22:30\", \"thursday\": \"10:00 - 22:00\", \"wednesday\": \"10:00 - 22:00\"}','+86 21 5465 7788',NULL,'[\"https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?w=800\", \"https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800\"]','https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?w=800',4.30,'{\"bus\": [\"Bus 17, 24, 41, 96, 146 - Get off at Taikang Road Station\"], \"taxi\": \"Tell driver: \\\"田子坊\\\" or \\\"Taikang Road 210\\\"\", \"metro\": [\"Line 9 - Dapuqiao Station (Exit 1), 5 min walk\"], \"parking\": \"Very limited, not recommended - use public transport\"}','[\"Wander through the narrow alleys - explore side streets for hidden gems\", \"Perfect for Instagram photos - many colorful walls and artistic decorations\", \"Many small cafes and restaurants - great place to take a break\", \"Support local artists by buying directly from their studios\", \"Some shops accept WeChat Pay and Alipay\", \"Less crowded on weekday mornings\", \"Watch out for uneven steps and narrow passages\", \"Many shops close around 9-10pm\"]','2026-01-19 08:33:04','2026-01-19 08:52:36'),(3,'Nanjing Road Pedestrian Street','南京路步行街','Nanjing East Road, Huangpu District, Shanghai','上海市黄浦区南京东路','Shanghai','Huangpu','{\"latitude\": 31.2397, \"longitude\": 121.4764}','Nanjing Road is Shanghai\'s most famous shopping street, stretching from the Bund to People\'s Square. It features both modern department stores and traditional shops, offering everything from luxury brands to affordable souvenirs. This pedestrian-only street is always bustling with activity.','南京路是上海最著名的购物街，从外滩延伸至人民广场。这里既有现代化的百货公司，也有传统商店，提供从奢侈品牌到经济实惠纪念品的各种商品。这条步行街总是熙熙攘攘，充满活力。','[\"shopping\", \"department_store\", \"souvenir\", \"retail\"]','[{\"type\": \"Chinese Brand Clothing\", \"items\": [\"Fashionable clothing\", \"Traditional Chinese clothing (qipao)\", \"Casual wear\"], \"priceRange\": {\"max\": 1500, \"min\": 150, \"currency\": \"CNY\"}}, {\"type\": \"Electronics\", \"items\": [\"Chinese brand smartphones\", \"Electronics\", \"Accessories\"], \"priceRange\": {\"max\": 5000, \"min\": 500, \"currency\": \"CNY\"}}, {\"type\": \"Souvenirs\", \"items\": [\"Shanghai-themed items\", \"Postcards\", \"Keychains\", \"Magnets\"], \"priceRange\": {\"max\": 300, \"min\": 20, \"currency\": \"CNY\"}}]','{\"friday\": \"10:00 - 22:30\", \"monday\": \"10:00 - 22:00\", \"sunday\": \"10:00 - 22:00\", \"tuesday\": \"10:00 - 22:00\", \"saturday\": \"10:00 - 22:30\", \"thursday\": \"10:00 - 22:00\", \"wednesday\": \"10:00 - 22:00\"}',NULL,NULL,'[\"https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800\", \"https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=800\"]','https://images.unsplash.com/photo-1559526324-4b87b5e36e36?w=800',4.00,'{\"bus\": [\"Bus 20, 37, 921 - Multiple stops along the street\", \"Tourist Bus Line 1\"], \"taxi\": \"Tell driver: \\\"南京路步行街\\\" or \\\"East Nanjing Road\\\"\", \"metro\": [\"Line 1, 2, 8 - People\'s Square Station (multiple exits)\", \"Line 2, 10 - East Nanjing Road Station\", \"Line 10 - Yuyuan Garden Station (eastern end)\"], \"parking\": \"Limited, recommend public transport\"}','[\"Visit during weekdays to avoid weekend crowds\", \"The street is over 1 km long - wear comfortable shoes\", \"Major department stores: Shanghai First Department Store, New World Department Store\", \"Look for sales and promotions, especially during holidays\", \"Many stores accept international credit cards\", \"Good food options in department store food courts\", \"Street performers and vendors add to the atmosphere\", \"Near the Bund - walk 10 minutes east to see Huangpu River\", \"Some side streets have interesting local shops worth exploring\"]','2026-01-19 08:33:04','2026-01-19 08:52:36'),(4,'Xintiandi','新天地','Xintiandi, Huangpu District, Shanghai','上海市黄浦区新天地','Shanghai','Huangpu','{\"latitude\": 31.2232, \"longitude\": 121.4733}','Xintiandi is an upscale shopping, dining and entertainment complex that seamlessly blends traditional shikumen architecture with modern design. It features international brands, fine dining restaurants, art galleries, and luxury boutiques. A perfect blend of old Shanghai charm and contemporary lifestyle.','新天地是一个高档的购物、餐饮和娱乐综合体，完美地将传统石库门建筑与现代设计融为一体。这里汇集了国际品牌、精致餐厅、艺术画廊和精品店。是旧上海魅力与现代生活方式的完美结合。','[\"luxury\", \"dining\", \"entertainment\", \"boutique\"]','[{\"type\": \"International Brands\", \"items\": [\"Fashion\", \"Luxury goods\", \"Designer items\", \"Cosmetics\"], \"priceRange\": {\"max\": 10000, \"min\": 500, \"currency\": \"CNY\"}}, {\"type\": \"Art & Culture\", \"items\": [\"Art pieces\", \"Cultural items\", \"Designer gifts\"], \"priceRange\": {\"max\": 5000, \"min\": 300, \"currency\": \"CNY\"}}, {\"type\": \"Premium Souvenirs\", \"items\": [\"High-end Shanghai-themed items\", \"Collectibles\"], \"priceRange\": {\"max\": 2000, \"min\": 200, \"currency\": \"CNY\"}}]','{\"friday\": \"10:00 - 23:00\", \"monday\": \"10:00 - 22:00\", \"sunday\": \"10:00 - 22:00\", \"tuesday\": \"10:00 - 22:00\", \"saturday\": \"10:00 - 23:00\", \"thursday\": \"10:00 - 22:00\", \"wednesday\": \"10:00 - 22:00\"}','+86 21 6386 8888','http://www.xintiandi.com','[\"https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=800\", \"https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800\"]','https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=800',4.40,'{\"bus\": [\"Bus 146, 781, 911, 926\", \"Bus 932, 945\"], \"taxi\": \"Tell driver: \\\"新天地\\\" or \\\"Xintiandi\\\"\", \"metro\": [\"Line 1 - South Huangpi Road Station (Exit 3), 5 min walk\", \"Line 10 - Xintiandi Station (Exit 6)\"], \"parking\": \"Underground parking available\"}','[\"Upscale area - prices are higher but quality is excellent\", \"Great for window shopping and people watching\", \"Many excellent restaurants - book ahead for popular ones\", \"Beautiful architecture - take time to appreciate the shikumen design\", \"Some shops may have English-speaking staff\", \"International credit cards widely accepted\", \"Less crowded during weekday afternoons\", \"Visit nearby Taipingqiao Park for a peaceful break\", \"Nightlife is active - bars and clubs open late\"]','2026-01-19 08:33:04','2026-01-19 08:52:36'),(5,'Shanghai Museum Gift Shop','上海博物馆商店','201 People\'s Avenue, Huangpu District, Shanghai','上海市黄浦区人民大道201号','Shanghai','Huangpu','{\"latitude\": 31.2304, \"longitude\": 121.4737}','Located inside the renowned Shanghai Museum, this gift shop offers authentic Chinese cultural items, museum replicas, art books, traditional crafts, and high-quality souvenirs. All items are carefully curated and authentic, making it a reliable place to buy cultural souvenirs with historical significance.','位于著名的上海博物馆内，这家礼品店提供正宗的中国文化物品、博物馆复制品、艺术书籍、传统工艺品和高质量的纪念品。所有物品都经过精心挑选且真实，是购买具有历史意义的文化纪念品的可靠场所。','[\"museum\", \"cultural\", \"authentic\", \"gift\"]','[{\"type\": \"Museum Replicas\", \"items\": [\"Ancient artifact replicas\", \"Bronze ware replicas\", \"Ceramic replicas\"], \"priceRange\": {\"max\": 2000, \"min\": 200, \"currency\": \"CNY\"}}, {\"type\": \"Cultural Books\", \"items\": [\"Art books\", \"History books\", \"Culture guides\", \"Exhibition catalogs\"], \"priceRange\": {\"max\": 500, \"min\": 80, \"currency\": \"CNY\"}}, {\"type\": \"Traditional Crafts\", \"items\": [\"Calligraphy supplies\", \"Seal carving items\", \"Traditional stationery\"], \"priceRange\": {\"max\": 800, \"min\": 100, \"currency\": \"CNY\"}}, {\"type\": \"Authentic Souvenirs\", \"items\": [\"Museum-themed items\", \"Cultural gifts\", \"Educational toys\"], \"priceRange\": {\"max\": 600, \"min\": 50, \"currency\": \"CNY\"}}]','{\"friday\": \"09:00 - 17:00\", \"monday\": \"\", \"sunday\": \"09:00 - 17:00\", \"tuesday\": \"09:00 - 17:00\", \"saturday\": \"09:00 - 17:00\", \"thursday\": \"09:00 - 17:00\", \"wednesday\": \"09:00 - 17:00\"}','+86 21 6372 3500','http://www.shanghaimuseum.net','[\"https://images.unsplash.com/photo-1539650116574-75c0c6d73a6e?w=800\", \"https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800\"]','https://images.unsplash.com/photo-1539650116574-75c0c6d73a6e?w=800',4.60,'{\"bus\": [\"Bus 18, 46, 49, 112, 123, 145\", \"Bus 574, 952, Airport Line 5\"], \"taxi\": \"Tell driver: \\\"上海博物馆\\\" or \\\"Shanghai Museum\\\"\", \"metro\": [\"Line 1, 2, 8 - People\'s Square Station (Exit 1), 2 min walk\"], \"parking\": \"Limited parking, recommend public transport\"}','[\"Free admission to museum - visit the exhibitions first\", \"All items are authentic and officially licensed\", \"Perfect for educational and cultural gifts\", \"Prices are fixed - no bargaining needed\", \"Accepts credit cards and mobile payments\", \"Ask staff for recommendations based on your interests\", \"Some items may be limited edition - check availability\", \"Visit during weekdays for a quieter shopping experience\", \"Combine with museum visit - allow 2-3 hours total\", \"The shop is located on the ground floor near the exit\"]','2026-01-19 08:33:04','2026-01-19 08:52:36');
/*!40000 ALTER TABLE `locations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `orderNumber` varchar(50) NOT NULL,
  `user` json NOT NULL,
  `items` json DEFAULT NULL,
  `shipping` json NOT NULL,
  `totalAmount` decimal(10,2) NOT NULL,
  `status` enum('pending','confirmed','processing','purchased','shipped','delivered','cancelled') DEFAULT 'pending',
  `paymentStatus` enum('pending','paid','failed','refunded') DEFAULT 'pending',
  `taobaoOrderIds` json DEFAULT NULL,
  `pinduoduoOrderIds` json DEFAULT NULL,
  `notes` text,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `userId` int DEFAULT NULL COMMENT '用户ID（如果用户已登录）',
  `paymentDeadline` datetime DEFAULT NULL COMMENT '支付截止时间（订单创建后10分钟）',
  PRIMARY KEY (`id`),
  UNIQUE KEY `orderNumber` (`orderNumber`),
  UNIQUE KEY `orderNumber_2` (`orderNumber`),
  UNIQUE KEY `orderNumber_3` (`orderNumber`),
  UNIQUE KEY `orderNumber_4` (`orderNumber`),
  UNIQUE KEY `orderNumber_5` (`orderNumber`),
  UNIQUE KEY `orderNumber_6` (`orderNumber`),
  UNIQUE KEY `orderNumber_7` (`orderNumber`),
  UNIQUE KEY `orderNumber_8` (`orderNumber`),
  UNIQUE KEY `orderNumber_9` (`orderNumber`),
  UNIQUE KEY `orderNumber_10` (`orderNumber`),
  UNIQUE KEY `orderNumber_11` (`orderNumber`),
  UNIQUE KEY `orderNumber_12` (`orderNumber`),
  UNIQUE KEY `orderNumber_13` (`orderNumber`),
  UNIQUE KEY `orderNumber_14` (`orderNumber`),
  UNIQUE KEY `orderNumber_15` (`orderNumber`),
  UNIQUE KEY `orderNumber_16` (`orderNumber`),
  UNIQUE KEY `orderNumber_17` (`orderNumber`),
  UNIQUE KEY `orderNumber_18` (`orderNumber`),
  UNIQUE KEY `orderNumber_19` (`orderNumber`),
  UNIQUE KEY `orderNumber_20` (`orderNumber`),
  UNIQUE KEY `orderNumber_21` (`orderNumber`),
  UNIQUE KEY `orderNumber_22` (`orderNumber`),
  UNIQUE KEY `orderNumber_23` (`orderNumber`),
  UNIQUE KEY `orderNumber_24` (`orderNumber`),
  UNIQUE KEY `orderNumber_25` (`orderNumber`),
  UNIQUE KEY `orderNumber_26` (`orderNumber`),
  UNIQUE KEY `orderNumber_27` (`orderNumber`),
  UNIQUE KEY `orderNumber_28` (`orderNumber`),
  UNIQUE KEY `orderNumber_29` (`orderNumber`),
  UNIQUE KEY `orderNumber_30` (`orderNumber`),
  UNIQUE KEY `orderNumber_31` (`orderNumber`),
  UNIQUE KEY `orderNumber_32` (`orderNumber`),
  UNIQUE KEY `orderNumber_33` (`orderNumber`),
  UNIQUE KEY `orderNumber_34` (`orderNumber`),
  UNIQUE KEY `orderNumber_35` (`orderNumber`),
  UNIQUE KEY `orderNumber_36` (`orderNumber`),
  UNIQUE KEY `orderNumber_37` (`orderNumber`),
  UNIQUE KEY `orderNumber_38` (`orderNumber`),
  UNIQUE KEY `orderNumber_39` (`orderNumber`),
  UNIQUE KEY `orderNumber_40` (`orderNumber`),
  UNIQUE KEY `orderNumber_41` (`orderNumber`),
  UNIQUE KEY `orderNumber_42` (`orderNumber`),
  UNIQUE KEY `orderNumber_43` (`orderNumber`),
  UNIQUE KEY `orderNumber_44` (`orderNumber`),
  UNIQUE KEY `orderNumber_45` (`orderNumber`),
  UNIQUE KEY `orderNumber_46` (`orderNumber`),
  UNIQUE KEY `orderNumber_47` (`orderNumber`),
  UNIQUE KEY `orderNumber_48` (`orderNumber`),
  UNIQUE KEY `orderNumber_49` (`orderNumber`),
  UNIQUE KEY `orderNumber_50` (`orderNumber`),
  UNIQUE KEY `orderNumber_51` (`orderNumber`),
  UNIQUE KEY `orderNumber_52` (`orderNumber`),
  UNIQUE KEY `orderNumber_53` (`orderNumber`),
  UNIQUE KEY `orderNumber_54` (`orderNumber`),
  UNIQUE KEY `orderNumber_55` (`orderNumber`),
  UNIQUE KEY `orderNumber_56` (`orderNumber`),
  UNIQUE KEY `orderNumber_57` (`orderNumber`),
  UNIQUE KEY `orderNumber_58` (`orderNumber`),
  UNIQUE KEY `orderNumber_59` (`orderNumber`),
  UNIQUE KEY `orderNumber_60` (`orderNumber`),
  UNIQUE KEY `orderNumber_61` (`orderNumber`),
  UNIQUE KEY `orderNumber_62` (`orderNumber`),
  UNIQUE KEY `orderNumber_63` (`orderNumber`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES (1,'STG17689691950356572','{\"name\": \"david liu\", \"email\": \"67079776@qq.com\", \"phone\": \"15618963396\", \"address\": \"Room 1902, Building 37,  NO 88, Jiangwancheng Road\"}','[{\"price\": 28, \"product\": 1, \"quantity\": 2}]','{\"fee\": 0, \"phone\": \"15618963396\", \"method\": \"standard\", \"address\": \"Room 1902, Building 37,  NO 88, Jiangwancheng Road\", \"recipient\": \"david liu\"}',56.00,'pending','pending','[]','[]',NULL,'2026-01-21 04:19:55','2026-01-21 04:19:55',NULL,'2026-01-21 04:29:55'),(2,'STG17689697048589436','{\"name\": \"david liu\", \"email\": \"67079776@qq.com\", \"phone\": \"15618963396\", \"address\": \"Room 1902, Building 37,  NO 88, Jiangwancheng Road\"}','[{\"price\": 28, \"product\": 1, \"quantity\": 1}]','{\"fee\": 0, \"phone\": \"15618963396\", \"method\": \"standard\", \"address\": \"Room 1902, Building 37,  NO 88, Jiangwancheng Road\", \"recipient\": \"david liu\"}',28.00,'pending','pending','[]','[]',NULL,'2026-01-21 04:28:24','2026-01-21 04:28:24',NULL,'2026-01-21 04:38:24'),(3,'STG17689697847306506','{\"name\": \"david\", \"email\": \"67079776@qq.com\", \"phone\": \"15618963396\", \"address\": \"Room 1902, Building 37,  NO 88, Jiangwancheng Road\"}','[{\"price\": 28, \"product\": 1, \"quantity\": 1}, {\"price\": 45, \"product\": 2, \"quantity\": 1}]','{\"fee\": 0, \"phone\": \"15618963396\", \"method\": \"standard\", \"address\": \"Room 1902, Building 37,  NO 88, Jiangwancheng Road\", \"recipient\": \"david liu\"}',73.00,'pending','pending','[]','[]',NULL,'2026-01-21 04:29:44','2026-01-21 04:29:44',1,'2026-01-21 04:39:44'),(4,'STG17689698098481097','{\"name\": \"david\", \"email\": \"67079776@qq.com\", \"phone\": \"15618963396\", \"address\": \"Room 1902, Building 37,  NO 88, Jiangwancheng Road\"}','[{\"price\": 28, \"product\": 1, \"quantity\": 2}]','{\"fee\": 0, \"phone\": \"15618963396\", \"method\": \"standard\", \"address\": \"Room 1902, Building 37,  NO 88, Jiangwancheng Road\", \"recipient\": \"david liu\"}',56.00,'pending','pending','[]','[]',NULL,'2026-01-21 04:30:09','2026-01-21 04:30:09',1,'2026-01-21 04:40:09'),(5,'STG17689787449164446','{\"name\": \"david\", \"email\": \"67079776@qq.com\", \"phone\": \"15618963396\", \"address\": \"Room 1902, Building 37,  NO 88, Jiangwancheng Road\"}','[{\"price\": 28, \"product\": 1, \"quantity\": 1}, {\"price\": 28, \"product\": 1, \"quantity\": 3}]','{\"fee\": 0, \"phone\": \"15618963396\", \"method\": \"standard\", \"address\": \"Room 1902, Building 37,  NO 88, Jiangwancheng Road\", \"recipient\": \"david liu\"}',112.00,'pending','pending','[]','[]',NULL,'2026-01-21 06:59:04','2026-01-21 06:59:04',1,'2026-01-21 07:09:04'),(6,'STG17689798359160050','{\"name\": \"david\", \"email\": \"67079776@qq.com\", \"phone\": \"15618963396\", \"address\": \"Room 1902, Building 37,  NO 88, Jiangwancheng Road\"}','[{\"price\": 28, \"product\": 1, \"quantity\": 1}, {\"price\": 28, \"product\": 1, \"quantity\": 1}]','{\"fee\": 0, \"phone\": \"15618963396\", \"method\": \"standard\", \"address\": \"Room 1902, Building 37,  NO 88, Jiangwancheng Road\", \"recipient\": \"david liu\"}',56.00,'confirmed','paid','[]','[]',NULL,'2026-01-21 07:17:15','2026-01-21 07:17:22',1,'2026-01-21 07:27:15');
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `nameCN` varchar(255) DEFAULT NULL,
  `description` text NOT NULL,
  `descriptionCN` text,
  `category` enum('souvenir','electronics','clothing','food','cosmetics','other') DEFAULT 'souvenir',
  `images` json DEFAULT NULL,
  `coverImage` varchar(500) DEFAULT NULL COMMENT '封面图（列表页显示）',
  `price` decimal(10,2) NOT NULL DEFAULT '0.00',
  `originalPrice` decimal(10,2) DEFAULT NULL,
  `currency` varchar(10) DEFAULT 'CNY',
  `taobaoUrl` varchar(500) DEFAULT NULL,
  `pinduoduoUrl` varchar(500) DEFAULT NULL,
  `stock` int DEFAULT '0',
  `isAvailable` tinyint(1) DEFAULT '1',
  `shippingFee` decimal(10,2) DEFAULT '0.00',
  `expressDeliveryAvailable` tinyint(1) DEFAULT '0',
  `expressDeliveryFee` decimal(10,2) DEFAULT '0.00',
  `tags` json DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `variants` json DEFAULT NULL COMMENT '商品规格列表，如[{name,color,image,price,stock}]',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (1,'Shanghai culture bookmark','上海文化金属书签','<p>A cute and adorable keychain shaped like Shanghai\'s famous Xiaolongbao (soup dumplings). Made from high-quality resin material, perfect as a souvenir or gift. Features intricate details that capture the essence of this beloved local delicacy.</p><p><img src=\"http://localhost:5000/uploads/products/paste_1768977635987-1768977636031-247988992.png\"></p>','<p>以上海著名小笼包为造型的可爱钥匙扣。采用优质树脂材料制作，细节精致，完美呈现这道深受喜爱的本地美食，是理想的纪念品或礼品。</p>','souvenir','[]','',28.00,35.00,'CNY',NULL,NULL,98,1,5.00,1,12.00,'[\"keychain\", \"xiaolongbao\", \"food\", \"cute\", \"gift\"]','2026-01-21 04:07:51','2026-01-21 07:17:22','[{\"name\": \"红色\", \"image\": \"http://localhost:5000/uploads/products/1-1768978055576-172695428.png\", \"price\": \"28.00\", \"stock\": 97}, {\"name\": \"蓝色\", \"image\": \"http://localhost:5000/uploads/products/2-1768978075330-23563395.png\", \"price\": 38, \"stock\": 0}, {\"name\": \"绿色\", \"image\": \"http://localhost:5000/uploads/products/3-1768978091794-141892082.png\", \"price\": 99, \"stock\": 1}]'),(2,'The Bund Night View Postcard Set','外滩夜景明信片套装','A beautiful collection of 12 postcards featuring stunning night views of The Bund, Shanghai\'s iconic waterfront. Each postcard showcases different angles and perspectives of the famous skyline. Perfect for sending to friends and family or keeping as a memory.','精美的12张明信片套装，展现上海标志性外滩的迷人夜景。每张明信片都展示了不同角度和视角的著名天际线。非常适合寄给朋友家人或作为纪念收藏。','souvenir','[]',NULL,45.00,58.00,'CNY',NULL,NULL,80,1,5.00,1,12.00,'[\"postcard\", \"the bund\", \"night view\", \"photography\", \"gift\"]','2026-01-21 04:07:51','2026-01-21 04:07:51',NULL),(3,'Shanghainese Dialect Refrigerator Magnets','上海话冰箱贴','Set of 6 colorful refrigerator magnets featuring common Shanghai dialect phrases with English translations. Learn fun local expressions like \"Nong Hao\" (Hello) and \"Xie Xie\" (Thank you). Made from durable magnetic material with vibrant designs.','一套6个彩色冰箱贴，展示常用上海话短语及英文翻译。学习有趣的本地表达，如\"侬好\"和\"谢谢\"。采用耐用磁性材料，设计生动活泼。','souvenir','[]',NULL,38.00,48.00,'CNY',NULL,NULL,120,1,5.00,1,12.00,'[\"magnet\", \"dialect\", \"language\", \"educational\", \"fun\"]','2026-01-21 04:07:51','2026-01-21 04:07:51',NULL),(4,'Shikumen Architecture Model','石库门建筑模型','A detailed miniature model of Shanghai\'s iconic Shikumen (stone-gated) architecture. This traditional residential building style represents the unique blend of Chinese and Western architectural elements. Perfect for collectors and architecture enthusiasts.','上海标志性石库门建筑的精细微缩模型。这种传统住宅建筑风格体现了中西建筑元素的独特融合。非常适合收藏家和建筑爱好者。','souvenir','[]',NULL,128.00,168.00,'CNY',NULL,NULL,50,1,10.00,1,15.00,'[\"model\", \"architecture\", \"shikumen\", \"traditional\", \"collectible\"]','2026-01-21 04:07:51','2026-01-21 04:07:51',NULL),(5,'Shanghai Qipao Bookmark','上海旗袍书签','Elegant bookmarks inspired by the traditional Chinese Qipao (cheongsam) dress, a symbol of Shanghai\'s fashion culture. Made from high-quality silk-like material with delicate embroidery patterns. Set of 3 bookmarks in different colors.','灵感来自传统中国旗袍的优雅书签，旗袍是上海时尚文化的象征。采用优质丝绸质感材料，配以精美刺绣图案。一套3个不同颜色的书签。','souvenir','[]',NULL,58.00,78.00,'CNY',NULL,NULL,90,1,5.00,1,12.00,'[\"bookmark\", \"qipao\", \"traditional\", \"elegant\", \"gift\"]','2026-01-21 04:07:51','2026-01-21 04:07:51',NULL),(6,'Yuyuan Garden Themed Tea Set','豫园主题茶具','A beautiful tea set inspired by the classical Yuyuan Garden, featuring traditional Chinese tea culture. Includes a teapot, 4 cups, and a tea tray, all decorated with garden motifs. Made from fine porcelain, perfect for tea lovers.','灵感来自古典豫园的精美茶具，展现传统中国茶文化。包含茶壶、4个茶杯和茶盘，均饰有园林图案。采用优质瓷器制作，非常适合茶爱好者。','souvenir','[]',NULL,298.00,398.00,'CNY',NULL,NULL,30,1,15.00,1,25.00,'[\"tea set\", \"yuyuan garden\", \"porcelain\", \"traditional\", \"luxury\"]','2026-01-21 04:07:51','2026-01-21 04:07:51',NULL),(7,'Shanghai Bund Theme T-Shirt','上海滩主题T恤','Comfortable cotton T-shirt featuring a stylish design of The Bund skyline. Available in multiple sizes (S, M, L, XL). Made from 100% cotton, perfect for casual wear or as a souvenir. The design captures the essence of Shanghai\'s modern charm.','舒适棉质T恤，印有时尚的外滩天际线设计。提供多种尺码（S、M、L、XL）。100%纯棉制作，非常适合休闲穿着或作为纪念品。设计体现了上海的现代魅力。','clothing','[]',NULL,88.00,128.00,'CNY',NULL,NULL,150,1,8.00,1,15.00,'[\"t-shirt\", \"the bund\", \"casual\", \"fashion\", \"comfortable\"]','2026-01-21 04:07:51','2026-01-21 04:07:51',NULL),(8,'Lane Culture Hand-drawn Map','弄堂文化手绘地图','A beautifully hand-drawn map showcasing Shanghai\'s traditional lane culture (Longtang). Features famous lanes, historical sites, and cultural landmarks. Printed on high-quality paper, perfect for framing or as a travel guide. Includes English and Chinese annotations.','精美手绘地图，展示上海传统弄堂文化。标注了著名弄堂、历史遗址和文化地标。采用优质纸张印刷，非常适合装裱或作为旅行指南。包含中英文注释。','souvenir','[]',NULL,68.00,88.00,'CNY',NULL,NULL,70,1,5.00,1,12.00,'[\"map\", \"hand-drawn\", \"lane culture\", \"historical\", \"artistic\"]','2026-01-21 04:07:51','2026-01-21 04:07:51',NULL),(9,'Shanghai Old Brand Pastry Gift Box','上海老字号糕点礼盒','A premium gift box featuring traditional Shanghai pastries from famous old brands. Includes classic treats like mooncakes, almond cookies, and sesame cakes. Beautifully packaged in a traditional Chinese gift box, perfect for sharing Shanghai\'s culinary heritage.','精选上海老字号传统糕点的精美礼盒。包含经典美食，如月饼、杏仁饼和芝麻饼。采用传统中式礼盒精美包装，非常适合分享上海的美食文化。','food','[]',NULL,158.00,198.00,'CNY',NULL,NULL,60,1,10.00,1,20.00,'[\"pastry\", \"gift box\", \"traditional\", \"food\", \"luxury\"]','2026-01-21 04:07:51','2026-01-21 04:07:51',NULL),(10,'Oriental Pearl Tower Model','东方明珠塔模型','A detailed scale model of Shanghai\'s iconic Oriental Pearl Tower, one of the city\'s most recognizable landmarks. Made from high-quality materials with LED lights that illuminate the tower. Perfect for collectors and as a decorative piece.','上海标志性建筑东方明珠塔的精细比例模型，是城市最具辨识度的地标之一。采用优质材料制作，配有LED灯光照明。非常适合收藏家和作为装饰品。','souvenir','[]',NULL,188.00,248.00,'CNY',NULL,NULL,40,1,12.00,1,20.00,'[\"model\", \"oriental pearl tower\", \"landmark\", \"LED\", \"collectible\"]','2026-01-21 04:07:51','2026-01-21 04:07:51',NULL);
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(100) NOT NULL COMMENT '用户邮箱（登录账号）',
  `password` varchar(255) NOT NULL COMMENT '加密后的密码',
  `name` varchar(100) DEFAULT NULL COMMENT '用户姓名',
  `phone` varchar(20) DEFAULT NULL COMMENT '手机号码',
  `addresses` json DEFAULT NULL COMMENT '收货地址列表，格式：[{name, phone, address, isDefault}]',
  `defaultAddressIndex` int DEFAULT '0' COMMENT '默认收货地址索引',
  `isActive` tinyint(1) DEFAULT '1' COMMENT '是否激活',
  `lastLogin` datetime DEFAULT NULL COMMENT '最后登录时间',
  `lastLoginIp` varchar(50) DEFAULT NULL COMMENT '最后登录IP',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `users_email` (`email`),
  KEY `users_is_active` (`isActive`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'67079776@qq.com','$2a$10$RntRsGe5JeO7JcMyBLNOf.tJW9iMBvKYcpIkOwYxM6555UZkmvTh2','david',NULL,'[{\"name\": \"david liu\", \"phone\": \"15618963396\", \"address\": \"Room 1902, Building 37,  NO 88, Jiangwancheng Road\"}]',0,1,'2026-01-21 04:44:27','127.0.0.1','2026-01-21 04:29:02','2026-01-21 04:44:27');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-01-22 13:03:28
