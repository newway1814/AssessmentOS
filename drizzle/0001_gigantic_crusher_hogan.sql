PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_export_requests` (
	`id` text PRIMARY KEY NOT NULL,
	`school_id` text NOT NULL,
	`workspace_id` text NOT NULL,
	`paper_id` text NOT NULL,
	`template_version_id` text NOT NULL,
	`requested_by_id` text NOT NULL,
	`format` text NOT NULL,
	`copy_type` text NOT NULL,
	`status` text DEFAULT 'GENERATED_PLACEHOLDER' NOT NULL,
	`readiness_summary` text NOT NULL,
	`storage_key` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`school_id`) REFERENCES `schools`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`workspace_id`) REFERENCES `workspaces`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`paper_id`) REFERENCES `papers`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`template_version_id`) REFERENCES `template_versions`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`requested_by_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
INSERT INTO `__new_export_requests`("id", "school_id", "workspace_id", "paper_id", "template_version_id", "requested_by_id", "format", "copy_type", "status", "readiness_summary", "storage_key", "created_at", "updated_at") SELECT "id", "school_id", "workspace_id", "paper_id", "template_version_id", "requested_by_id", "format", "copy_type", "status", "readiness_summary", "storage_key", "created_at", "updated_at" FROM `export_requests`;--> statement-breakpoint
DROP TABLE `export_requests`;--> statement-breakpoint
ALTER TABLE `__new_export_requests` RENAME TO `export_requests`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `export_requests_tenant_idx` ON `export_requests` (`school_id`,`workspace_id`);--> statement-breakpoint
CREATE INDEX `export_requests_paper_idx` ON `export_requests` (`paper_id`);