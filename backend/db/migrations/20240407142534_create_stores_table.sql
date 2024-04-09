-- migrate:up
CREATE TABLE IF NOT EXISTS
    stores (
        store_id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        formatted_name TEXT NOT NULL,
        category INTEGER NOT NULL,
        address TEXT NOT NULL,
        city TEXT NOT NULL,
        zip TEXT NOT NULL,
        lon TEXT NOT NULL,
        lat TEXT NOT NULL
    );

-- migrate:down
DROP TABLE stores;