CREATE TABLE `audit_trail` (
	`id` text PRIMARY KEY,
	`entity_type` text NOT NULL,
	`action` text NOT NULL,
	`value` text,
	`user_id` text NOT NULL,
	`entity_id` text NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	CONSTRAINT `fk_audit_trail_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`)
);
--> statement-breakpoint
CREATE TABLE `task` (
	`id` text PRIMARY KEY,
	`name` text NOT NULL,
	`due_on` text NOT NULL,
	`status` text DEFAULT 'open' NOT NULL,
	`finished_at` text,
	`created_by` text NOT NULL,
	`assigned_to` text NOT NULL,
	`updated_by` text NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`is_archived` integer DEFAULT false NOT NULL,
	CONSTRAINT `fk_task_created_by_user_id_fk` FOREIGN KEY (`created_by`) REFERENCES `user`(`id`),
	CONSTRAINT `fk_task_assigned_to_user_id_fk` FOREIGN KEY (`assigned_to`) REFERENCES `user`(`id`),
	CONSTRAINT `fk_task_updated_by_user_id_fk` FOREIGN KEY (`updated_by`) REFERENCES `user`(`id`)
);
--> statement-breakpoint
CREATE INDEX `audit_trail_entity_idx` ON `audit_trail` (`entity_type`,`entity_id`);--> statement-breakpoint
CREATE INDEX `audit_trail_user_idx` ON `audit_trail` (`user_id`);--> statement-breakpoint
CREATE INDEX `task_created_by_due_on_idx` ON `task` (`created_by`,`due_on`);--> statement-breakpoint
CREATE INDEX `task_assigned_to_due_on_idx` ON `task` (`assigned_to`,`due_on`);--> statement-breakpoint
CREATE INDEX `task_status_due_on_idx` ON `task` (`status`,`due_on`);