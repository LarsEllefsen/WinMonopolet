-- migrate:up
CREATE TABLE IF NOT EXISTS
    upcoming_products (
        vmp_id TEXT PRIMARY KEY NOT NULL,
        release_date DATE NOT NULL,
        FOREIGN KEY (vmp_id) REFERENCES vinmonopolet_products (vmp_id)
    );

-- migrate:down
DROP TABLE upcoming_products;