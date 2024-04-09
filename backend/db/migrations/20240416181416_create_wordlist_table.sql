-- migrate:up
CREATE TABLE IF NOT EXISTS
    wordlist (id serial PRIMARY KEY, value text NOT NULL);

-- migrate:down
DROP TABLE wordlist;