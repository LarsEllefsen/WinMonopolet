-- migrate:up
CREATE TABLE IF NOT EXISTS
    users (
        id text PRIMARY KEY,
        user_name text NOT NULL,
        user_avatar text NOT NULL,
        user_avatar_hd text,
        first_name text,
        access_token text NOT NULL,
        salt text NOT NULL,
        created timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated timestamptz NOT NULL
    );

CREATE
OR REPLACE FUNCTION set_user_modified_date () RETURNS trigger AS $$
BEGIN
    NEW.updated := current_timestamp;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE
OR REPLACE TRIGGER user_modified BEFORE INSERT
OR
UPDATE ON users FOR EACH ROW
EXECUTE FUNCTION set_user_modified_date ();

-- migrate:down
DROP TABLE users;