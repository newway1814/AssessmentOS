CREATE TABLE `answer_keys` (
	`id` text PRIMARY KEY NOT NULL,
	`question_id` text,
	`question_version_id` text,
	`paper_id` text,
	`content` text NOT NULL,
	`is_complete` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`question_id`) REFERENCES `questions`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`question_version_id`) REFERENCES `question_versions`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`paper_id`) REFERENCES `papers`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `answer_keys_question_version_unique` ON `answer_keys` (`question_version_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `answer_keys_paper_unique` ON `answer_keys` (`paper_id`);--> statement-breakpoint
CREATE INDEX `answer_keys_question_idx` ON `answer_keys` (`question_id`);--> statement-breakpoint
CREATE TABLE `approval_requests` (
	`id` text PRIMARY KEY NOT NULL,
	`school_id` text NOT NULL,
	`workspace_id` text NOT NULL,
	`requested_by_id` text NOT NULL,
	`decided_by_id` text,
	`target_type` text NOT NULL,
	`target_id` text NOT NULL,
	`status` text DEFAULT 'REQUESTED' NOT NULL,
	`requested_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`decided_at` text,
	FOREIGN KEY (`school_id`) REFERENCES `schools`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`workspace_id`) REFERENCES `workspaces`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`requested_by_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`decided_by_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE INDEX `approval_requests_tenant_idx` ON `approval_requests` (`school_id`,`workspace_id`);--> statement-breakpoint
CREATE INDEX `approval_requests_target_idx` ON `approval_requests` (`target_type`,`target_id`);--> statement-breakpoint
CREATE TABLE `audit_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`school_id` text NOT NULL,
	`workspace_id` text,
	`actor_id` text,
	`action` text NOT NULL,
	`target_type` text NOT NULL,
	`target_id` text NOT NULL,
	`metadata` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`school_id`) REFERENCES `schools`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`workspace_id`) REFERENCES `workspaces`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`actor_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `audit_logs_tenant_idx` ON `audit_logs` (`school_id`,`workspace_id`);--> statement-breakpoint
CREATE INDEX `audit_logs_target_idx` ON `audit_logs` (`target_type`,`target_id`);--> statement-breakpoint
CREATE TABLE `campuses` (
	`id` text PRIMARY KEY NOT NULL,
	`school_id` text NOT NULL,
	`name` text NOT NULL,
	`status` text DEFAULT 'ACTIVE' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`school_id`) REFERENCES `schools`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `campuses_school_idx` ON `campuses` (`school_id`);--> statement-breakpoint
CREATE TABLE `chapters` (
	`id` text PRIMARY KEY NOT NULL,
	`school_id` text NOT NULL,
	`workspace_id` text NOT NULL,
	`subject_id` text NOT NULL,
	`name` text NOT NULL,
	`order` integer NOT NULL,
	`status` text DEFAULT 'ACTIVE' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`workspace_id`) REFERENCES `workspaces`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`subject_id`) REFERENCES `subjects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `chapters_subject_name_unique` ON `chapters` (`subject_id`,`name`);--> statement-breakpoint
CREATE INDEX `chapters_tenant_idx` ON `chapters` (`school_id`,`workspace_id`);--> statement-breakpoint
CREATE TABLE `comments` (
	`id` text PRIMARY KEY NOT NULL,
	`school_id` text NOT NULL,
	`workspace_id` text NOT NULL,
	`author_id` text NOT NULL,
	`approval_request_id` text,
	`target_type` text NOT NULL,
	`target_id` text NOT NULL,
	`body` text NOT NULL,
	`resolved_at` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`school_id`) REFERENCES `schools`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`workspace_id`) REFERENCES `workspaces`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`author_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`approval_request_id`) REFERENCES `approval_requests`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `comments_tenant_idx` ON `comments` (`school_id`,`workspace_id`);--> statement-breakpoint
CREATE INDEX `comments_target_idx` ON `comments` (`target_type`,`target_id`);--> statement-breakpoint
CREATE TABLE `export_requests` (
	`id` text PRIMARY KEY NOT NULL,
	`school_id` text NOT NULL,
	`workspace_id` text NOT NULL,
	`paper_id` text NOT NULL,
	`template_version_id` text NOT NULL,
	`requested_by_id` text NOT NULL,
	`format` text NOT NULL,
	`copy_type` text NOT NULL,
	`status` text DEFAULT 'PLACEHOLDER' NOT NULL,
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
CREATE INDEX `export_requests_tenant_idx` ON `export_requests` (`school_id`,`workspace_id`);--> statement-breakpoint
CREATE INDEX `export_requests_paper_idx` ON `export_requests` (`paper_id`);--> statement-breakpoint
CREATE TABLE `grades` (
	`id` text PRIMARY KEY NOT NULL,
	`school_id` text NOT NULL,
	`workspace_id` text NOT NULL,
	`name` text NOT NULL,
	`order` integer NOT NULL,
	`status` text DEFAULT 'ACTIVE' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`school_id`) REFERENCES `schools`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`workspace_id`) REFERENCES `workspaces`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `grades_workspace_name_unique` ON `grades` (`workspace_id`,`name`);--> statement-breakpoint
CREATE INDEX `grades_tenant_idx` ON `grades` (`school_id`,`workspace_id`);--> statement-breakpoint
CREATE TABLE `import_batches` (
	`id` text PRIMARY KEY NOT NULL,
	`school_id` text NOT NULL,
	`workspace_id` text NOT NULL,
	`upload_id` text,
	`submitted_by_id` text NOT NULL,
	`title` text NOT NULL,
	`source_option` text NOT NULL,
	`status` text DEFAULT 'UPLOADED' NOT NULL,
	`raw_text` text,
	`normalization_metadata` text,
	`rights_acknowledged_at` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`school_id`) REFERENCES `schools`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`workspace_id`) REFERENCES `workspaces`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`upload_id`) REFERENCES `uploads`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`submitted_by_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE INDEX `import_batches_tenant_idx` ON `import_batches` (`school_id`,`workspace_id`);--> statement-breakpoint
CREATE INDEX `import_batches_upload_idx` ON `import_batches` (`upload_id`);--> statement-breakpoint
CREATE TABLE `import_candidates` (
	`id` text PRIMARY KEY NOT NULL,
	`import_batch_id` text NOT NULL,
	`approved_question_id` text,
	`reviewed_by_id` text,
	`prompt` text NOT NULL,
	`subject_name` text NOT NULL,
	`grade_name` text NOT NULL,
	`chapter_name` text,
	`subtopic_name` text,
	`type` text NOT NULL,
	`marks` integer NOT NULL,
	`difficulty` text,
	`answer_key_draft` text,
	`source_type` text NOT NULL,
	`rights_status` text DEFAULT 'NEEDS_REVIEW' NOT NULL,
	`source_title` text NOT NULL,
	`source_reference` text NOT NULL,
	`usage_rights` text NOT NULL,
	`confidence` real,
	`review_status` text DEFAULT 'NEEDS_REVIEW' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`import_batch_id`) REFERENCES `import_batches`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`approved_question_id`) REFERENCES `questions`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`reviewed_by_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `import_candidates_batch_idx` ON `import_candidates` (`import_batch_id`);--> statement-breakpoint
CREATE INDEX `import_candidates_question_idx` ON `import_candidates` (`approved_question_id`);--> statement-breakpoint
CREATE TABLE `media_assets` (
	`id` text PRIMARY KEY NOT NULL,
	`school_id` text NOT NULL,
	`workspace_id` text NOT NULL,
	`upload_id` text,
	`filename` text NOT NULL,
	`content_type` text NOT NULL,
	`byte_size` integer NOT NULL,
	`storage_key` text NOT NULL,
	`source_type` text,
	`rights_status` text,
	`usage_rights` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`school_id`) REFERENCES `schools`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`workspace_id`) REFERENCES `workspaces`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`upload_id`) REFERENCES `uploads`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `media_assets_tenant_idx` ON `media_assets` (`school_id`,`workspace_id`);--> statement-breakpoint
CREATE TABLE `paper_questions` (
	`id` text PRIMARY KEY NOT NULL,
	`paper_section_id` text NOT NULL,
	`question_id` text NOT NULL,
	`question_version_id` text NOT NULL,
	`order` integer NOT NULL,
	`marks_override` integer,
	`prompt_override` text,
	`display_settings` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`paper_section_id`) REFERENCES `paper_sections`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`question_id`) REFERENCES `questions`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`question_version_id`) REFERENCES `question_versions`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE UNIQUE INDEX `paper_questions_order_unique` ON `paper_questions` (`paper_section_id`,`order`);--> statement-breakpoint
CREATE INDEX `paper_questions_question_idx` ON `paper_questions` (`question_id`);--> statement-breakpoint
CREATE INDEX `paper_questions_version_idx` ON `paper_questions` (`question_version_id`);--> statement-breakpoint
CREATE TABLE `paper_sections` (
	`id` text PRIMARY KEY NOT NULL,
	`paper_id` text NOT NULL,
	`title` text NOT NULL,
	`instructions` text,
	`order` integer NOT NULL,
	`marks` integer,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`paper_id`) REFERENCES `papers`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `paper_sections_order_unique` ON `paper_sections` (`paper_id`,`order`);--> statement-breakpoint
CREATE TABLE `papers` (
	`id` text PRIMARY KEY NOT NULL,
	`school_id` text NOT NULL,
	`workspace_id` text NOT NULL,
	`subject_id` text NOT NULL,
	`grade_id` text NOT NULL,
	`template_version_id` text,
	`created_by_id` text NOT NULL,
	`title` text NOT NULL,
	`duration_minutes` integer,
	`total_marks_target` integer,
	`status` text DEFAULT 'DRAFT' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`school_id`) REFERENCES `schools`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`workspace_id`) REFERENCES `workspaces`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`subject_id`) REFERENCES `subjects`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`grade_id`) REFERENCES `grades`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`template_version_id`) REFERENCES `template_versions`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`created_by_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE INDEX `papers_tenant_idx` ON `papers` (`school_id`,`workspace_id`);--> statement-breakpoint
CREATE TABLE `question_sources` (
	`id` text PRIMARY KEY NOT NULL,
	`school_id` text NOT NULL,
	`workspace_id` text NOT NULL,
	`upload_id` text,
	`created_by_id` text NOT NULL,
	`source_type` text NOT NULL,
	`title` text NOT NULL,
	`author` text,
	`owner` text,
	`license` text,
	`rights_status` text DEFAULT 'NEEDS_REVIEW' NOT NULL,
	`usage_rights` text NOT NULL,
	`attribution_text` text,
	`original_url` text,
	`verified_at` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`school_id`) REFERENCES `schools`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`workspace_id`) REFERENCES `workspaces`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`upload_id`) REFERENCES `uploads`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`created_by_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE INDEX `question_sources_tenant_idx` ON `question_sources` (`school_id`,`workspace_id`);--> statement-breakpoint
CREATE INDEX `question_sources_upload_idx` ON `question_sources` (`upload_id`);--> statement-breakpoint
CREATE TABLE `question_versions` (
	`id` text PRIMARY KEY NOT NULL,
	`question_id` text NOT NULL,
	`edited_by_id` text NOT NULL,
	`version_number` integer NOT NULL,
	`prompt_snapshot` text NOT NULL,
	`metadata_snapshot` text NOT NULL,
	`source_snapshot` text NOT NULL,
	`answer_key_snapshot` text,
	`change_reason` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`question_id`) REFERENCES `questions`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`edited_by_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE UNIQUE INDEX `question_versions_number_unique` ON `question_versions` (`question_id`,`version_number`);--> statement-breakpoint
CREATE TABLE `questions` (
	`id` text PRIMARY KEY NOT NULL,
	`school_id` text NOT NULL,
	`workspace_id` text NOT NULL,
	`source_id` text NOT NULL,
	`subject_id` text NOT NULL,
	`grade_id` text NOT NULL,
	`chapter_id` text,
	`subtopic_id` text,
	`created_by_id` text NOT NULL,
	`type` text NOT NULL,
	`prompt` text NOT NULL,
	`marks` integer NOT NULL,
	`difficulty` text,
	`status` text DEFAULT 'DRAFT' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`school_id`) REFERENCES `schools`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`workspace_id`) REFERENCES `workspaces`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`source_id`) REFERENCES `question_sources`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`subject_id`) REFERENCES `subjects`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`grade_id`) REFERENCES `grades`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`chapter_id`) REFERENCES `chapters`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`subtopic_id`) REFERENCES `subtopics`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`created_by_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE INDEX `questions_tenant_idx` ON `questions` (`school_id`,`workspace_id`);--> statement-breakpoint
CREATE INDEX `questions_subject_grade_idx` ON `questions` (`subject_id`,`grade_id`);--> statement-breakpoint
CREATE INDEX `questions_rights_source_idx` ON `questions` (`source_id`);--> statement-breakpoint
CREATE TABLE `roles` (
	`id` text PRIMARY KEY NOT NULL,
	`school_id` text NOT NULL,
	`workspace_id` text,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`status` text DEFAULT 'ACTIVE' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`school_id`) REFERENCES `schools`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`workspace_id`) REFERENCES `workspaces`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `roles_assignment_unique` ON `roles` (`school_id`,`workspace_id`,`user_id`,`name`);--> statement-breakpoint
CREATE INDEX `roles_user_idx` ON `roles` (`user_id`);--> statement-breakpoint
CREATE TABLE `rubrics` (
	`id` text PRIMARY KEY NOT NULL,
	`school_id` text NOT NULL,
	`workspace_id` text NOT NULL,
	`paper_id` text,
	`question_id` text,
	`title` text NOT NULL,
	`criteria` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`school_id`) REFERENCES `schools`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`workspace_id`) REFERENCES `workspaces`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`paper_id`) REFERENCES `papers`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`question_id`) REFERENCES `questions`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `rubrics_tenant_idx` ON `rubrics` (`school_id`,`workspace_id`);--> statement-breakpoint
CREATE TABLE `schools` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`status` text DEFAULT 'ACTIVE' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `schools_slug_unique` ON `schools` (`slug`);--> statement-breakpoint
CREATE TABLE `subjects` (
	`id` text PRIMARY KEY NOT NULL,
	`school_id` text NOT NULL,
	`workspace_id` text NOT NULL,
	`name` text NOT NULL,
	`code` text,
	`status` text DEFAULT 'ACTIVE' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`school_id`) REFERENCES `schools`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`workspace_id`) REFERENCES `workspaces`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `subjects_workspace_name_unique` ON `subjects` (`workspace_id`,`name`);--> statement-breakpoint
CREATE INDEX `subjects_tenant_idx` ON `subjects` (`school_id`,`workspace_id`);--> statement-breakpoint
CREATE TABLE `subtopics` (
	`id` text PRIMARY KEY NOT NULL,
	`school_id` text NOT NULL,
	`workspace_id` text NOT NULL,
	`chapter_id` text NOT NULL,
	`name` text NOT NULL,
	`order` integer NOT NULL,
	`status` text DEFAULT 'ACTIVE' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`workspace_id`) REFERENCES `workspaces`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`chapter_id`) REFERENCES `chapters`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `subtopics_chapter_name_unique` ON `subtopics` (`chapter_id`,`name`);--> statement-breakpoint
CREATE INDEX `subtopics_tenant_idx` ON `subtopics` (`school_id`,`workspace_id`);--> statement-breakpoint
CREATE TABLE `template_versions` (
	`id` text PRIMARY KEY NOT NULL,
	`template_id` text NOT NULL,
	`version_number` integer NOT NULL,
	`structure` text NOT NULL,
	`change_reason` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`template_id`) REFERENCES `templates`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `template_versions_number_unique` ON `template_versions` (`template_id`,`version_number`);--> statement-breakpoint
CREATE TABLE `templates` (
	`id` text PRIMARY KEY NOT NULL,
	`school_id` text NOT NULL,
	`workspace_id` text,
	`created_by_id` text NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`status` text DEFAULT 'DRAFT' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`school_id`) REFERENCES `schools`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`workspace_id`) REFERENCES `workspaces`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`created_by_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE INDEX `templates_tenant_idx` ON `templates` (`school_id`,`workspace_id`);--> statement-breakpoint
CREATE TABLE `uploads` (
	`id` text PRIMARY KEY NOT NULL,
	`school_id` text NOT NULL,
	`workspace_id` text NOT NULL,
	`uploaded_by_id` text NOT NULL,
	`filename` text NOT NULL,
	`content_type` text NOT NULL,
	`byte_size` integer NOT NULL,
	`storage_key` text NOT NULL,
	`source_type` text NOT NULL,
	`rights_status` text DEFAULT 'NEEDS_REVIEW' NOT NULL,
	`usage_rights` text NOT NULL,
	`processing_status` text DEFAULT 'PENDING' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`school_id`) REFERENCES `schools`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`workspace_id`) REFERENCES `workspaces`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`uploaded_by_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE INDEX `uploads_tenant_idx` ON `uploads` (`school_id`,`workspace_id`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`status` text DEFAULT 'ACTIVE' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE TABLE `validation_results` (
	`id` text PRIMARY KEY NOT NULL,
	`school_id` text NOT NULL,
	`workspace_id` text NOT NULL,
	`target_type` text NOT NULL,
	`target_id` text NOT NULL,
	`target_version_id` text,
	`severity` text NOT NULL,
	`code` text NOT NULL,
	`message` text NOT NULL,
	`field` text,
	`suggested_fix` text,
	`resolved_at` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`school_id`) REFERENCES `schools`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`workspace_id`) REFERENCES `workspaces`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `validation_results_tenant_idx` ON `validation_results` (`school_id`,`workspace_id`);--> statement-breakpoint
CREATE INDEX `validation_results_target_idx` ON `validation_results` (`target_type`,`target_id`);--> statement-breakpoint
CREATE TABLE `workspaces` (
	`id` text PRIMARY KEY NOT NULL,
	`school_id` text NOT NULL,
	`campus_id` text,
	`name` text NOT NULL,
	`default_locale` text DEFAULT 'en' NOT NULL,
	`status` text DEFAULT 'ACTIVE' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`school_id`) REFERENCES `schools`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`campus_id`) REFERENCES `campuses`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `workspaces_school_idx` ON `workspaces` (`school_id`);--> statement-breakpoint
CREATE INDEX `workspaces_campus_idx` ON `workspaces` (`campus_id`);