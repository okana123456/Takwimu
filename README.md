# Takwimu

Takwimu is a role-based data operations and analytics platform prototype.

It is designed to help organizations move away from spreadsheet-based reporting into a controlled system with:

- dashboards
- data catalog
- upload and sync workflows
- role-based access
- task queues
- M&E reporting
- Supabase backend structure

## What It Shows

- Sign-in and account creation entry flow
- Role-based platform layout
- Dashboard overview
- Data catalog
- Upload and Google Drive sync workflow
- Users and roles matrix
- Task queues for verification and follow-up

## Files

- `index.html`: frontend prototype
- `supabase-config.js`: Supabase frontend configuration
- `supabase_schema_takwimu.sql`: database schema for Supabase SQL Editor

## How To Open

Open `index.html` in a browser.

## Suggested Next Steps

1. Enable Supabase row-level security before using live client data.
2. Connect Supabase authentication.
3. Add organization and role-based permissions.
4. Connect the cleaned master datasets.
5. Add Google Drive sync and import workflows.
6. Add billing and subscription controls.

## Drive Connection Flow

In production, a workspace admin will connect a Google Drive folder through a secure backend connector. Takwimu should request access only to selected folders, validate expected Excel templates, log every import, and publish approved records into Supabase-backed dashboards.

## Supabase

The frontend reads Supabase connection settings from `supabase-config.js`.
