-- migrate:up
ALTER TABLE vinmonopolet_products
DROP COLUMN active;

-- migrate:down
ALTER TABLE vinmonopolet_products
ADD COLUMN active boolean;