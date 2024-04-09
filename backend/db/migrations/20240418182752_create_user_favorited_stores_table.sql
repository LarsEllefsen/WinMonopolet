-- migrate:up
CREATE TABLE IF NOT EXISTS
    user_favorited_stores (
        user_id text NOT NULL,
        store_id text NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users (id),
        FOREIGN KEY (store_id) REFERENCES stores (store_id),
        PRIMARY KEY (user_id, store_id)
    );

-- migrate:down
DROP TABLE user_favorited_stores;