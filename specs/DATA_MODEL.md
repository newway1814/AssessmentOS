# Data Model

## Core Entities

### School

Top-level customer account. Owns campuses, workspaces, users, templates, repositories, and audit logs.

### Campus

Optional school sub-unit for physical or administrative separation.

### Workspace

Collaboration boundary for subjects, grades, teachers, repositories, and papers.

### User

Authenticated person associated with one or more schools/workspaces.

### Role

Permission assignment such as teacher, coordinator, reviewer, or admin.

### Subject, Grade, Chapter, Subtopic

Academic taxonomy used to classify questions and papers.

### Question

Canonical question card. Stores current normalized content, metadata, ownership, rights, and status.

### QuestionVersion

Immutable or append-only version record for significant question changes.

### QuestionSource

Source and usage-rights metadata for teacher-authored or imported questions.

### Upload

File import record for source documents, images, or templates.

### MediaAsset

Stored media reference used by questions, papers, rubrics, or templates.

### Paper

Assessment document draft or published assessment.

### PaperSection

Logical section within a paper.

### PaperQuestion

Placement of a question inside a paper, including order, marks, overrides, and display settings.

### Template

School-specific paper or worksheet template.

### TemplateVersion

Versioned template structure and rendering rules.

### Rubric

Evaluation rubric connected to questions, papers, sections, or assignments.

### AnswerKey

Answer metadata connected to questions or papers.

### ValidationResult

Result of validation rules against a question, paper, template, import, or export target.

### ApprovalRequest

Post-MVP review request for content, paper, template, or export approval.

### Comment

Threaded discussion attached to questions, papers, templates, validation issues, or approval requests.

### AuditLog

Append-only record of important user and system actions.

## Content Rights Rule

Do not design random copyrighted web scraping. External content must be school-owned, teacher-created, licensed, open, public-domain, or verified partner content.

Every imported question must preserve source and usage-rights metadata.

## Isolation Rule

All customer-owned records must include school/workspace scoping either directly or through a required parent relation.
