CREATE TABLE `vpn_conexoes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nomeUsuario` varchar(128) NOT NULL,
	`matricula` varchar(32),
	`diretoria` varchar(256),
	`servidor` varchar(128) NOT NULL,
	`ipAtribuido` varchar(45),
	`status` enum('conectado','desconectado','bloqueado') NOT NULL DEFAULT 'desconectado',
	`ultimaConexao` bigint,
	`bytesEnviados` bigint DEFAULT 0,
	`bytesRecebidos` bigint DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `vpn_conexoes_id` PRIMARY KEY(`id`)
);
