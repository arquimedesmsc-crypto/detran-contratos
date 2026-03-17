CREATE TABLE `instrumentos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`numero` varchar(64) NOT NULL,
	`tipo` varchar(128) NOT NULL,
	`partesEnvolvidas` text NOT NULL,
	`objeto` text NOT NULL,
	`dataInicio` bigint,
	`dataTermino` bigint,
	`processoSei` varchar(128),
	`diretoria` varchar(256) NOT NULL,
	`arquivoOrigem` varchar(512),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `instrumentos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `termos_aditivos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`instrumentoId` int NOT NULL,
	`descricao` text NOT NULL,
	`dataAditivo` bigint,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `termos_aditivos_id` PRIMARY KEY(`id`)
);
