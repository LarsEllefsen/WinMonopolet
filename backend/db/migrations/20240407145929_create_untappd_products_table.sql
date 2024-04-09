-- migrate:up
CREATE TABLE IF NOT EXISTS
    untappd_products (
        untappd_id TEXT NOT NULL,
        vmp_id TEXT PRIMARY KEY NOT NULL,
        untappd_name TEXT NOT NULL,
        abv REAL NOT NULL,
        rating REAL NOT NULL,
        num_ratings INTEGER NOT NULL,
        untappd_url TEXT NOT NULL,
        picture_url TEXT,
        style TEXT NOT NULL,
        brewery TEXT NOT NULL,
        last_updated TIMESTAMPTZ NOT NULL,
        FOREIGN KEY (vmp_id) REFERENCES vinmonopolet_products (vmp_id)
    );

CREATE
OR REPLACE FUNCTION set_untappd_product_modified_date () RETURNS trigger AS $$
BEGIN
    NEW.last_updated := current_timestamp;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE
OR REPLACE TRIGGER untappd_product_modified BEFORE INSERT
OR
UPDATE ON untappd_products FOR EACH ROW
EXECUTE FUNCTION set_untappd_product_modified_date ();

-- migrate:down
DROP TABLE untappd_products;