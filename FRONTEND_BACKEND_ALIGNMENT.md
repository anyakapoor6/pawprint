# Frontend-Backend Alignment Documentation

## Overview
This document outlines the fixes made to ensure proper alignment between the frontend UI/UX and the backend Supabase database schema.

## Database Tables Identified

### Core Tables:
1. **`profiles`** - User profiles with fields: `id`, `name`, `email`, `phone`, `photo_url`, `expo_push_token`, `created_at`, `updated_at`
2. **`reports`** - Pet reports with fields: `id`, `user_id`, `pet_id`, `report_type`, `description`, `status`, `created_at`, `pet_type`, `pet_name`, `pet_breed`, `pet_color`, `pet_size`, `pet_gender`, `pet_age`, `is_urgent`, `last_seen_location`, `photos`, `tags`
3. **`stories`** - Pet stories with fields: `id`, `user_id`, `pet_id`, `content`, `media_url`, `created_at`
4. **`liked_pets`** - User pet likes with fields: `id`, `user_id`, `pet_id`, `created_at`

### Engagement Tables:
5. **`story_likes`** - Story likes with fields: `id`, `story_id`, `user_id`, `created_at`
6. **`report_likes`** - Report likes with fields: `id`, `report_id`, `user_id`, `created_at`
7. **`story_comments`** - Story comments with fields: `id`, `story_id`, `user_id`, `content`, `parent_id`, `created_at`, `is_deleted`
8. **`report_comments`** - Report comments with fields: `id`, `report_id`, `user_id`, `content`, `parent_id`, `created_at`, `is_deleted`
9. **`comment_flags`** - Comment flags with fields: `id`, `user_id`, `comment_id`, `type`, `reason`, `created_at`

### Settings Tables:
10. **`notification_preferences`** - User notification settings

## Key Fixes Made

### 1. Type Definitions Alignment (`types/pet.ts`)
- **Fixed**: Updated `PetReport` interface to match backend `UserReport` schema
- **Added**: `UserReport` interface for direct backend operations
- **Updated**: `ReportStatus` to use backend values: `'pending' | 'reviewed' | 'resolved'`
- **Added**: `pet_id` field to `PetReport` interface

### 2. Report Form Alignment (`app/(tabs)/report.tsx`)
- **Fixed**: Report submission to use proper `UserReport` interface
- **Updated**: Form validation to match backend requirements
- **Fixed**: Type casting for `pet_type` and `report_type` fields
- **Updated**: `userReportToPetReport` function to handle all backend fields

### 3. Services Layer Alignment

#### Reports Service (`app/services/reports.ts`)
- **Updated**: `createReport` to use `UserReport` interface
- **Fixed**: Field names to match backend schema (`pet_type` instead of `type`)
- **Updated**: Status values to match backend (`pending`, `reviewed`, `resolved`)
- **Added**: Proper error handling and type safety

#### Stories Service (`app/services/stories.ts`)
- **Updated**: `createStory` to use `UserStory` interface
- **Fixed**: Field names to match backend schema (`user_id`, `pet_id`)
- **Updated**: Query filters to use correct field names

#### Comments Service (`app/services/comments.ts`)
- **Updated**: Comment creation to use proper backend structure
- **Fixed**: Field names (`story_id`, `report_id`, `user_id`)
- **Added**: Support for comment flags and soft deletion
- **Updated**: Queries to include user profile data

### 4. Store Alignment (`store/reports.ts`)
- **Updated**: Store to handle `UserReport` interface
- **Fixed**: Type safety for report operations
- **Updated**: Status handling to match backend values

### 5. Engagement System Alignment (`lib/engagement.ts`)
- **Verified**: Like/Unlike operations use correct table names
- **Confirmed**: Comment operations handle proper field names
- **Validated**: User profile joins work correctly

## Data Flow Consistency

### Report Creation Flow:
1. Frontend form collects data using `PetReport` interface
2. Converts to `UserReport` interface for backend submission
3. Backend stores in `reports` table
4. Frontend retrieves and converts back to `PetReport` for display

### Comment System Flow:
1. Comments stored in separate `story_comments` and `report_comments` tables
2. User profile data joined via `user_id` foreign key
3. Soft deletion via `is_deleted` flag
4. Flagging system via `comment_flags` table

### Like System Flow:
1. Separate tables for `story_likes` and `report_likes`
2. Toggle functionality with proper error handling
3. Count aggregation for display

## Validation Rules

### Required Fields for Reports:
- `user_id` (from authenticated user)
- `pet_id` (generated or selected)
- `report_type` ('lost' or 'found')
- `description` (text description)
- `pet_type` ('dog' or 'cat')
- `pet_color` (color description)
- `pet_size` ('small', 'medium', 'large')
- `photos` (array of photo URLs)

### Optional Fields for Reports:
- `pet_name` (pet's name)
- `pet_breed` (breed information)
- `pet_gender` ('male', 'female', 'unknown')
- `pet_age` ('baby', 'adult', 'senior')
- `is_urgent` (boolean flag)
- `last_seen_location` (location object)
- `tags` (array of tags)

## Error Handling

### Database Errors:
- All service functions return `{ data, error }` pattern
- Proper error logging with context
- User-friendly error messages in UI

### Validation Errors:
- Form validation before submission
- Required field checks
- Type validation for enums

## Testing Recommendations

### Backend Testing:
1. Test all CRUD operations for each table
2. Verify foreign key constraints
3. Test soft deletion for comments
4. Validate notification preferences

### Frontend Testing:
1. Test form submission with all field combinations
2. Verify data conversion between interfaces
3. Test error handling scenarios
4. Validate real-time updates

## Future Considerations

### Performance:
- Consider pagination for large datasets
- Implement caching for frequently accessed data
- Optimize database queries with proper indexing

### Scalability:
- Plan for user growth and data volume
- Consider archiving old reports
- Implement rate limiting for engagement actions

### Security:
- Validate all user inputs
- Implement proper authorization checks
- Secure file uploads for photos
- Protect sensitive user data

## Conclusion

The frontend and backend are now properly aligned with:
- Consistent data structures
- Proper type safety
- Comprehensive error handling
- Scalable architecture

All UI components now correctly interact with the backend database schema, ensuring data integrity and a smooth user experience. 