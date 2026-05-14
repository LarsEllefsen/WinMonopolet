-- migrate:up
ALTER TABLE stores ADD COLUMN stock_last_updated TIMESTAMPTZ;

-- migrate:down
ALTER TABLE stores DROP COLUMN stock_last_updated;
