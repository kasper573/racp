/*
  Warnings:

  - Added the required column `itemId` to the `HuntedItem` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_HuntedItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "amount" INTEGER NOT NULL,
    "itemId" INTEGER NOT NULL,
    "targetMonsterIds" TEXT NOT NULL,
    "huntId" INTEGER NOT NULL,
    CONSTRAINT "HuntedItem_huntId_fkey" FOREIGN KEY ("huntId") REFERENCES "Hunt" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_HuntedItem" ("amount", "huntId", "id", "targetMonsterIds") SELECT "amount", "huntId", "id", "targetMonsterIds" FROM "HuntedItem";
DROP TABLE "HuntedItem";
ALTER TABLE "new_HuntedItem" RENAME TO "HuntedItem";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
