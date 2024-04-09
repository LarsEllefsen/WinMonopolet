-- migrate:up
CREATE TABLE IF NOT EXISTS
    user_products (
        user_id text NOT NULL,
        untappd_id text NOT NULL,
        user_score real NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users (id),
        PRIMARY KEY (user_id, untappd_id)
    );

-- migrate:down
DROP TABLE user_products;