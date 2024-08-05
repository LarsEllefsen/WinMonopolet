-- migrate:up
CREATE TABLE IF NOT EXISTS
    banner (text TEXT NOT NULL, color TEXT NOT NULL);

CREATE UNIQUE INDEX one_row_only_uidx ON banner ((true));

-- migrate:down
DROP INDEX one_row_only_uidx ON banner;

DROP TABLE banner;