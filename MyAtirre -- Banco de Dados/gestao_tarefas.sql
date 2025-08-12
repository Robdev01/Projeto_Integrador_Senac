-- MySQL dump 10.13  Distrib 8.0.40, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: gestao_tarefas
-- ------------------------------------------------------
-- Server version	5.5.5-10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `setores`
--

DROP TABLE IF EXISTS `setores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `setores` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) NOT NULL,
  `data_criacao` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `setores`
--

LOCK TABLES `setores` WRITE;
/*!40000 ALTER TABLE `setores` DISABLE KEYS */;
INSERT INTO `setores` VALUES (1,'TI','2025-08-12 05:12:50'),(2,'DESENVOLVIMENTO','2025-08-12 18:22:57'),(3,'MARKETING','2025-08-12 18:23:06'),(4,'RH','2025-08-12 18:23:11'),(5,'RH','2025-08-12 19:15:11');
/*!40000 ALTER TABLE `setores` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tarefas`
--

DROP TABLE IF EXISTS `tarefas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tarefas` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `titulo` varchar(255) NOT NULL,
  `descricao` text NOT NULL,
  `funcionario` varchar(100) NOT NULL,
  `setor` varchar(100) NOT NULL,
  `data_criacao` timestamp NOT NULL DEFAULT current_timestamp(),
  `prazo` date NOT NULL,
  `prioridade` int(11) NOT NULL CHECK (`prioridade` between 1 and 4),
  `status` enum('pendente','em progresso','concluída','cancelada') NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tarefas`
--

LOCK TABLES `tarefas` WRITE;
/*!40000 ALTER TABLE `tarefas` DISABLE KEYS */;
INSERT INTO `tarefas` VALUES (1,'1','11qq','aaaa','MARKETING','2025-08-12 20:32:43','2025-08-30',3,'concluída'),(3,'11','11','qq','DESENVOLVIMENTO','2025-08-12 22:49:21','2025-08-12',3,'concluída');
/*!40000 ALTER TABLE `tarefas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `senha_hash` varchar(255) NOT NULL,
  `perfil` varchar(50) NOT NULL,
  `ativo` tinyint(1) DEFAULT 1,
  `criado_em` timestamp NOT NULL DEFAULT current_timestamp(),
  `setor` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES (1,'Teste','teste@example.com','$2b$12$oGAko/Gl757FqwhlAPNCmONQHzntyr9gNa31Do/CQUqTuDOA903rS','comum',1,'2025-08-12 03:31:08',NULL),(2,'Teste','teste01@example.com','$2b$12$0xEQl5G1Qcuk4iJZJO3jOuivloECZxR.H845WVdJo2EX3ddvHagnW','admin',1,'2025-08-12 03:45:13',NULL),(3,'robson','teste@teste.com','$2b$12$5SdWjMVDHFvy/4sZVncWuufwSbdIXNy4rEp3L4/aRSMA9DwQbtFk6','comum',1,'2025-08-12 05:25:35','1'),(4,'AAAAA','testeAAA@teste.com','$2b$12$keAKrXaGaSOdk1utMJc2NODHV3PE4sFUl5exnJjYthynioP7g1WOa','comum',1,'2025-08-12 17:51:06','1'),(5,'2222','2222@222.com','$2b$12$d.4tpN1aUfHO0fZH3vQy9.17Sku4rHZeQO7SaH3Je2P91gMkt9Xn6','comum',1,'2025-08-12 17:57:03','1'),(6,'1111111','test1111e@teste.com','$2b$12$ofiWyp3XBwA6XcO50g3tAO.oXV7ns6m6/tGnfXahiCocau22.H.IG','comum',1,'2025-08-12 18:01:42','1'),(7,'a','a@a.com','$2b$12$1hsRlturJL9XNNQw/nGNLeUMsl91QatAMv6CGuI1xwrgVMoHtQD/i','admin',1,'2025-08-12 18:05:18','1'),(8,'1111','teste12@teste.com','$2b$12$jODOONir2R9bIynQL4Sj7emPjx0Zko1h4slwGjGtB2CxM2HMEZzSO','comum',1,'2025-08-12 18:19:36','1'),(9,'qqqq','qq@aa.com','$2b$12$uSOH2MEQgAjptj0IA7U/pO3aNMjlPM09sjGnFMApK78gN4f8s.s72','comum',1,'2025-08-12 18:24:00','2'),(10,'1111111','robs@teste.com','$2b$12$qYOdY06Zt8uo6wQUcCVfQ.oP3DMUFQFIpRkc3pybvL19QJvhx/i0C','comum',1,'2025-08-12 18:48:34','2'),(11,'Teste','teste012@example.com','$2b$12$Lz56P3WytYEGutnrApwAi.MhFDZ1WeZoXVs/hQbxp.C9HBEYrrki6','admin',1,'2025-08-12 18:50:42','Desenvolvimento'),(12,'Bruna','bru@teste.com','$2b$12$Y73VJ4A4S9QrqeZXO2dEOeA4nNbfr63P4XbS.iKoaVbyRLQYm4Mce','admin',1,'2025-08-12 19:08:14','1'),(13,'aaaaaaa','testeaa@teste.com','$2b$12$HeKALDYuJ3X0nq2eUDfdw.cizAHyvzT.b6PXcxxuSGv0.tbjQWXLG','comum',1,'2025-08-12 19:10:53','1'),(14,'aaaa','teste@teste.coma','$2b$12$lke5oluOT.ddVU74sdSoGeNVN96N7CB4pAPPvo8uy9Cy9mI1SfWuC','comum',1,'2025-08-12 19:25:19','RH'),(15,'qq','teste@teste.comq','$2b$12$UfuxF3qdo.oJk3S6z1cjwOb3Bxt3uOWw0DB34cQQeAmD3LLiW.VkS','comum',1,'2025-08-12 19:26:00','MARKETING');
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-08-12 19:52:57
