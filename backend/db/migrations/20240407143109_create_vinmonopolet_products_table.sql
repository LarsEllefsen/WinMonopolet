-- migrate:up
CREATE TABLE IF NOT EXISTS
    vinmonopolet_products (
        vmp_id TEXT PRIMARY KEY,
        vmp_name TEXT NOT NULL,
        vmp_url TEXT NOT NULL,
        price REAL NOT NULL,
        category TEXT NOT NULL,
        sub_category TEXT,
        product_selection TEXT NOT NULL,
        container_size TEXT NOT NULL,
        country TEXT NOT NULL,
        added_date TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        last_updated TIMESTAMPTZ NOT NULL,
        active boolean NOT NULL,
        buyable boolean NOT NULL DEFAULT TRUE
    );

CREATE
OR REPLACE FUNCTION set_vinmonopolet_product_modified_date () RETURNS trigger AS $$
BEGIN
    NEW.last_updated := current_timestamp;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE
OR REPLACE TRIGGER vinmonopolet_product_modified BEFORE INSERT
OR
UPDATE ON vinmonopolet_products FOR EACH ROW
EXECUTE FUNCTION set_vinmonopolet_product_modified_date ();

-- migrate:down
DROP TABLE vinmonopolet_products;