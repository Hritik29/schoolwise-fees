-- Update existing students with null academic_session to use the active session
UPDATE students 
SET academic_session = (
    SELECT session_name 
    FROM academic_sessions 
    WHERE is_active = true 
    LIMIT 1
)
WHERE academic_session IS NULL;

-- Make academic_session NOT NULL going forward
ALTER TABLE students 
ALTER COLUMN academic_session SET NOT NULL;

-- Set default value for new students to use active session
ALTER TABLE students 
ALTER COLUMN academic_session SET DEFAULT (
    SELECT session_name 
    FROM academic_sessions 
    WHERE is_active = true 
    LIMIT 1
);