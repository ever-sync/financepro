CREATE TABLE `company_fixed_costs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`description` varchar(500) NOT NULL,
	`category` varchar(100) NOT NULL,
	`amount` decimal(12,2) NOT NULL,
	`dueDay` int NOT NULL,
	`dueDate` date,
	`status` enum('pago','pendente','atrasado') NOT NULL DEFAULT 'pendente',
	`month` int NOT NULL,
	`year` int NOT NULL,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `company_fixed_costs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `company_variable_costs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`description` varchar(500) NOT NULL,
	`category` varchar(100) NOT NULL,
	`amount` decimal(12,2) NOT NULL,
	`date` date NOT NULL,
	`supplier` varchar(255),
	`status` enum('pago','pendente','atrasado') NOT NULL DEFAULT 'pendente',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `company_variable_costs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `debts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`creditor` varchar(255) NOT NULL,
	`description` varchar(500) NOT NULL,
	`originalAmount` decimal(12,2) NOT NULL,
	`currentBalance` decimal(12,2) NOT NULL,
	`monthlyPayment` decimal(12,2) NOT NULL,
	`interestRate` decimal(5,2) NOT NULL DEFAULT '0.00',
	`totalInstallments` int NOT NULL,
	`paidInstallments` int NOT NULL DEFAULT 0,
	`dueDay` int NOT NULL,
	`status` enum('ativa','quitada','renegociada') NOT NULL DEFAULT 'ativa',
	`priority` enum('alta','media','baixa') NOT NULL DEFAULT 'media',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `debts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `employees` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`role` varchar(255) NOT NULL,
	`salary` decimal(12,2) NOT NULL,
	`fgtsAmount` decimal(12,2) NOT NULL,
	`thirteenthProvision` decimal(12,2) NOT NULL,
	`vacationProvision` decimal(12,2) NOT NULL,
	`totalCost` decimal(12,2) NOT NULL,
	`admissionDate` date,
	`status` enum('ativo','inativo') NOT NULL DEFAULT 'ativo',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `employees_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `investments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`description` varchar(500) NOT NULL,
	`institution` varchar(255) NOT NULL,
	`type` varchar(100) NOT NULL,
	`depositAmount` decimal(12,2) NOT NULL,
	`currentBalance` decimal(12,2) NOT NULL DEFAULT '0.00',
	`yieldAmount` decimal(12,2) NOT NULL DEFAULT '0.00',
	`date` date NOT NULL,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `investments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `personal_fixed_costs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`description` varchar(500) NOT NULL,
	`category` varchar(100) NOT NULL,
	`amount` decimal(12,2) NOT NULL,
	`dueDay` int NOT NULL,
	`dueDate` date,
	`status` enum('pago','pendente','atrasado') NOT NULL DEFAULT 'pendente',
	`month` int NOT NULL,
	`year` int NOT NULL,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `personal_fixed_costs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `personal_variable_costs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`description` varchar(500) NOT NULL,
	`category` varchar(100) NOT NULL,
	`amount` decimal(12,2) NOT NULL,
	`date` date NOT NULL,
	`status` enum('pago','pendente','atrasado') NOT NULL DEFAULT 'pendente',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `personal_variable_costs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reserve_funds` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`type` enum('empresa','pessoal') NOT NULL,
	`depositAmount` decimal(12,2) NOT NULL,
	`date` date NOT NULL,
	`description` varchar(500),
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `reserve_funds_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `revenues` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`description` varchar(500) NOT NULL,
	`category` varchar(100) NOT NULL,
	`grossAmount` decimal(12,2) NOT NULL,
	`taxAmount` decimal(12,2) NOT NULL,
	`netAmount` decimal(12,2) NOT NULL,
	`client` varchar(255),
	`dueDate` date NOT NULL,
	`receivedDate` date,
	`status` enum('pendente','recebido','atrasado') NOT NULL DEFAULT 'pendente',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `revenues_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`taxPercent` decimal(5,2) NOT NULL DEFAULT '6.00',
	`tithePercent` decimal(5,2) NOT NULL DEFAULT '10.00',
	`investmentPercent` decimal(5,2) NOT NULL DEFAULT '10.00',
	`proLaboreGross` decimal(12,2) NOT NULL DEFAULT '0.00',
	`companyReserveMonths` int NOT NULL DEFAULT 3,
	`personalReserveMonths` int NOT NULL DEFAULT 6,
	`companyName` varchar(255) DEFAULT 'Minha Empresa',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `settings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `supplier_purchases` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`supplierId` int NOT NULL,
	`description` varchar(500) NOT NULL,
	`amount` decimal(12,2) NOT NULL,
	`dueDate` date NOT NULL,
	`paidDate` date,
	`status` enum('pago','pendente','atrasado') NOT NULL DEFAULT 'pendente',
	`paymentMethod` varchar(100),
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `supplier_purchases_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `suppliers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`cnpj` varchar(20),
	`category` varchar(100),
	`contact` varchar(255),
	`phone` varchar(20),
	`email` varchar(320),
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `suppliers_id` PRIMARY KEY(`id`)
);
