-- migrate:up
CREATE TABLE IF NOT EXISTS
    user_wishlist_products (
        user_id TEXT NOT NULL,
        untappd_id TEXT NOT NULL,
        added TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users (id),
        PRIMARY KEY (user_id, untappd_id)
    );

-- migrate:down
DROP TABLE user_wishlist_products;