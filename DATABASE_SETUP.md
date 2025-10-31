# Database Setup for Child Profiles

## Overview

This document explains how to set up the `child_profiles` table in Supabase for storing child profile data.

## Table Structure

The `child_profiles` table has the following structure:

| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| `id` | BIGSERIAL | Primary key | AUTO INCREMENT |
| `created_at` | TIMESTAMP WITH TIME ZONE | Creation timestamp | DEFAULT NOW() |
| `first_name` | TEXT | Child's first name | NOT NULL |
| `age_group` | TEXT | Age group (e.g., "3-5", "6-7") | NOT NULL |
| `relationship` | TEXT | Relationship to parent | NOT NULL |
| `parent_id` | UUID | Reference to auth.users | NOT NULL, FOREIGN KEY |
| `avatar_url` | TEXT | URL to child's avatar image | NOT NULL, DEFAULT placeholder |

## Setup Instructions

### 1. Run the SQL Script

Execute the `database_setup.sql` file in your Supabase SQL Editor:

1. Go to your Supabase dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `database_setup.sql`
4. Click "Run" to execute the script

### 2. Verify Table Creation

After running the script, verify that:

- The `child_profiles` table exists
- Row Level Security (RLS) is enabled
- All policies are created
- Indexes are in place

### 3. Test the Setup

You can test the setup by:

1. Creating a child profile through the application
2. Checking the data in the Supabase table viewer
3. Verifying that RLS policies work correctly

## Row Level Security (RLS)

The table uses RLS to ensure data security:

- **SELECT**: Users can only view their own child profiles
- **INSERT**: Users can only create child profiles for themselves
- **UPDATE**: Users can only update their own child profiles
- **DELETE**: Users can only delete their own child profiles

## API Functions

The following functions are available in `src/lib/database/childProfiles.ts`:

- `insertChildProfile(profile)` - Insert a single child profile
- `insertChildProfiles(profiles)` - Insert multiple child profiles
- `getChildProfiles(parentId)` - Get all child profiles for a parent
- `deleteChildProfile(profileId, parentId)` - Delete a specific child profile

## Usage Example

```typescript
import { insertChildProfiles } from '../lib/database/childProfiles';

const profiles = [
  {
    first_name: "Alice",
    age_group: "6-7",
    relationship: "parent",
    parent_id: "user-uuid-here",
    avatar_url: "https://example.com/avatar.jpg"
  }
];

const result = await insertChildProfiles(profiles);
if (result.success) {
  console.log("Profiles saved:", result.data);
} else {
  console.error("Error:", result.error);
}
```

## Troubleshooting

### Common Issues

1. **Permission Denied**: Ensure RLS policies are correctly set up
2. **Foreign Key Constraint**: Make sure the `parent_id` exists in `auth.users`
3. **Missing Required Fields**: All NOT NULL fields must be provided

### Debugging

- Check the Supabase logs for detailed error messages
- Use the table editor to manually inspect data
- Test policies by switching between different authenticated users
