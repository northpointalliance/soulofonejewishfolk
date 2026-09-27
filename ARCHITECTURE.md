# Architecture

## Overview

`soulofonejewishfolk` is a repository for Torah teachings by Daniel Rosenthal. The project is currently a minimal content repository, so this document records the intended structure and conventions as the project develops.

## Repository Structure

```text
.
├── README.md
├── ARCHITECTURE.md
└── .gitignore
```

As content and supporting tools are added, organize them by purpose. For example:

```text
.
├── content/        # Torah teachings and related source material
├── media/          # Images, audio, and other media
├── scripts/        # Optional utilities for validation or publishing
├── README.md
├── ARCHITECTURE.md
└── .gitignore
```

## Content Principles

- Keep Torah teachings in a format that is easy to read, review, and preserve.
- Store media separately from written content and use descriptive filenames.
- Keep generated files and local development artifacts out of version control.
- Preserve authorship and source information for every published teaching.

## Change Management

- Update this document when the repository gains a significant new component or workflow.
- Prefer small, focused commits with clear messages.
- Review published content for accuracy, attribution, and formatting before release.

## Current Status

The repository does not yet contain an application runtime or deployment architecture. Any future website, publishing workflow, or automation should be documented here as it is introduced.
