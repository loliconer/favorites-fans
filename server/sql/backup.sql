PRAGMA foreign_keys=off;

BEGIN TRANSACTION;

CREATE TABLE sites (
    id          INTEGER NOT NULL PRIMARY KEY,
    serialNo    INTEGER,
    title       TEXT    NOT NULL,
    description TEXT,
    url         TEXT,
    categoryId  INTEGER REFERENCES categories (id) ON DELETE SET NULL,
    category    TEXT,
    likers      INTEGER NOT NULL
                        DEFAULT 0,
    createTime  INTEGER NOT NULL
                        DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "categories" (
  "id" INTEGER NOT NULL PRIMARY KEY,
  "serialNo" INTEGER,
  "name" TEXT NOT NULL UNIQUE,
  "parentId" INTEGER,
  "createTime" integer NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "tags" (
  "id" INTEGER NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "type" TEXT,
  "hot" INTEGER NOT NULL DEFAULT 0,
  "color" TEXT,
  "createTime" integer NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX "i_tags_name"
ON "tags" (
  "name"
);

CREATE TABLE "tagSite" (
  "id" INTEGER NOT NULL PRIMARY KEY,
  "tagId" INTEGER NOT NULL,
  "siteId" INTEGER NOT NULL
);
CREATE INDEX "i_tagSite_tag" ON "tagSite" ("tagId");
CREATE INDEX "i_tagSite_site" ON "tagSite" ("siteId");

COMMIT;

PRAGMA foreign_keys=on;
