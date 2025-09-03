-- Add img_url column to events table
ALTER TABLE events
ADD COLUMN img_url TEXT;

-- Add comment to describe the column
COMMENT ON COLUMN events.img_url IS 'URL for the event image';

-- Update the updated_at column to refresh the table schema
UPDATE events SET updated_at = now() WHERE false;
