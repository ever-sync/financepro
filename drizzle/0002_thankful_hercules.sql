ALTER TABLE `company_fixed_costs` MODIFY COLUMN `dueDate` varchar(10);--> statement-breakpoint
ALTER TABLE `company_variable_costs` MODIFY COLUMN `date` varchar(10) NOT NULL;--> statement-breakpoint
ALTER TABLE `employees` MODIFY COLUMN `admissionDate` varchar(10);--> statement-breakpoint
ALTER TABLE `investments` MODIFY COLUMN `date` varchar(10) NOT NULL;--> statement-breakpoint
ALTER TABLE `personal_fixed_costs` MODIFY COLUMN `dueDate` varchar(10);--> statement-breakpoint
ALTER TABLE `personal_variable_costs` MODIFY COLUMN `date` varchar(10) NOT NULL;--> statement-breakpoint
ALTER TABLE `reserve_funds` MODIFY COLUMN `date` varchar(10) NOT NULL;--> statement-breakpoint
ALTER TABLE `revenues` MODIFY COLUMN `dueDate` varchar(10) NOT NULL;--> statement-breakpoint
ALTER TABLE `revenues` MODIFY COLUMN `receivedDate` varchar(10);--> statement-breakpoint
ALTER TABLE `supplier_purchases` MODIFY COLUMN `dueDate` varchar(10) NOT NULL;--> statement-breakpoint
ALTER TABLE `supplier_purchases` MODIFY COLUMN `paidDate` varchar(10);--> statement-breakpoint
ALTER TABLE `debts` ADD `debtStatus` enum('ativa','quitada','renegociada') DEFAULT 'ativa' NOT NULL;--> statement-breakpoint
ALTER TABLE `employees` ADD `empRole` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `employees` ADD `empStatus` enum('ativo','inativo') DEFAULT 'ativo' NOT NULL;--> statement-breakpoint
ALTER TABLE `investments` ADD `investType` varchar(100) NOT NULL;--> statement-breakpoint
ALTER TABLE `reserve_funds` ADD `fundType` enum('empresa','pessoal') NOT NULL;--> statement-breakpoint
ALTER TABLE `debts` DROP COLUMN `status`;--> statement-breakpoint
ALTER TABLE `employees` DROP COLUMN `role`;--> statement-breakpoint
ALTER TABLE `employees` DROP COLUMN `status`;--> statement-breakpoint
ALTER TABLE `investments` DROP COLUMN `type`;--> statement-breakpoint
ALTER TABLE `reserve_funds` DROP COLUMN `type`;