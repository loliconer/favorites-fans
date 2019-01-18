PRAGMA foreign_keys=off;

BEGIN TRANSACTION;

CREATE TABLE "categories" (
  "id" INTEGER NOT NULL PRIMARY KEY,
  "serialNo" INTEGER,
  "name" TEXT NOT NULL UNIQUE,
  "parentId" INTEGER,
  "createTime" integer NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMIT;

PRAGMA foreign_keys=on;
