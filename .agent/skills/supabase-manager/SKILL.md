---
name: supabase-manager
description: Utilities for managing Supabase integration in Green Hill project. Use when designing database schema, generating types, or configuring RLS policies.
---

# Supabase Manager

This skill aids in the migration and management of the Supabase backend for Green Hill.

## Workflows

### 1. Generate Types

Run this when DB schema changes to update TypeScript interfaces.

```bash
# Requires Supabase CLI installed and logged in
supabase gen types typescript --project-id <PROJECT_ID> > src/types/supabase.ts
```

### 2. Migration Pattern (JSON -> Supabase)

1. **Analyze JSON**: Read `public/data/*.json` to understand structure.
2. **Create Table**: Use SQL editor or Table Editor in Supabase.
   - Use `snake_case` for columns.
   - Add `created_at` (timestamptz, default now()).
   - Add `id` (uuid, default gen_random_uuid()).
3. **Import Data**: Write a Node.js script to read JSON and insert into Supabase using `@supabase/supabase-js`.

### 3. RLS Policies (Row Level Security)

**Public Read:**

```sql
create policy "Public Read" on "table_name"
for select using (true);
```

**Admin Only Write:**

```sql
create policy "Admin Write" on "table_name"
for all using (auth.role() = 'service_role');
```

## References

- See `references/schema_design.md` (to be created) for table definitions.
