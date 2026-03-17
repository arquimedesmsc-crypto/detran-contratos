CREATE TABLE `anexos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`entidadeTipo` enum('instrumento','vpn') NOT NULL,
	`entidadeId` int NOT NULL,
	`nomeOriginal` varchar(512) NOT NULL,
	`nomeArquivo` varchar(512) NOT NULL,
	`mimeType` varchar(128) NOT NULL,
	`tamanho` bigint NOT NULL,
	`s3Key` varchar(1024) NOT NULL,
	`s3Url` text NOT NULL,
	`uploadedBy` varchar(64),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `anexos_id` PRIMARY KEY(`id`)
);
