-- migrate:up
CREATE TABLE IF NOT EXISTS
    stock (
        store_id TEXT NOT NULL,
        vmp_id TEXT NOT NULL,
        stock_level INTEGER NOT NULL,
        last_updated TIMESTAMPTZ,
        PRIMARY KEY (store_id, vmp_id),
        FOREIGN KEY (store_id) REFERENCES stores (store_id),
        FOREIGN KEY (vmp_id) REFERENCES vinmonopolet_products (vmp_id)
    );

CREATE
OR REPLACE FUNCTION set_stock_modified_date () RETURNS trigger AS $$
BEGIN
    NEW.last_updated := current_timestamp;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE
OR REPLACE TRIGGER stock_modified BEFORE INSERT
OR
UPDATE ON stock FOR EACH ROW
EXECUTE FUNCTION set_stock_modified_date ();

-- migrate:down
DROP TABLE stock;