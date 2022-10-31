/*
  Warnings:

  - Added the required column `accountId` to the `Hunt` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Hunt" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "accountId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "editedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Hunt" ("editedAt", "id", "name") SELECT "editedAt", "id", "name" FROM "Hunt";
DROP TABLE "Hunt";
ALTER TABLE "new_Hunt" RENAME TO "Hunt";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
