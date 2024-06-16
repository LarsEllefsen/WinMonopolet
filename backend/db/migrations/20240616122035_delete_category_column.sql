-- migrate:up
ALTER TABLE stores
DROP COLUMN category;

-- migrate:down
ALTER TABLE stores
ADD COLUMN category INTEGER NOT NULL DEFAULT 1;