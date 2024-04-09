-- migrate:up
CREATE TABLE IF NOT EXISTS
    user_notification (
        user_id text PRIMARY KEY NOT NULL,
        email text NOT NULL,
        notification_type text NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users (id)
    );

-- migrate:down
DROP TABLE user_notification;