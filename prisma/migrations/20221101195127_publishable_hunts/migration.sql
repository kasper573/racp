-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Hunt" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "accountId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "editedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isPublished" BOOLEAN NOT NULL DEFAULT false
);
INSERT INTO "new_Hunt" ("accountId", "editedAt", "id", "name") SELECT "accountId", "editedAt", "id", "name" FROM "Hunt";
DROP TABLE "Hunt";
ALTER TABLE "new_Hunt" RENAME TO "Hunt";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
