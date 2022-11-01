-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_HuntedItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "amount" INTEGER NOT NULL,
    "itemId" INTEGER NOT NULL,
    "targetMonsterIds" TEXT NOT NULL,
    "huntId" INTEGER NOT NULL,
    CONSTRAINT "HuntedItem_huntId_fkey" FOREIGN KEY ("huntId") REFERENCES "Hunt" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_HuntedItem" ("amount", "huntId", "id", "itemId", "targetMonsterIds") SELECT "amount", "huntId", "id", "itemId", "targetMonsterIds" FROM "HuntedItem";
DROP TABLE "HuntedItem";
ALTER TABLE "new_HuntedItem" RENAME TO "HuntedItem";
CREATE TABLE "new_HuntedMonster" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "monsterId" INTEGER NOT NULL,
    "spawnId" TEXT,
    "killsPerUnit" INTEGER NOT NULL,
    "huntId" INTEGER NOT NULL,
    CONSTRAINT "HuntedMonster_huntId_fkey" FOREIGN KEY ("huntId") REFERENCES "Hunt" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_HuntedMonster" ("huntId", "id", "killsPerUnit", "monsterId", "spawnId") SELECT "huntId", "id", "killsPerUnit", "monsterId", "spawnId" FROM "HuntedMonster";
DROP TABLE "HuntedMonster";
ALTER TABLE "new_HuntedMonster" RENAME TO "HuntedMonster";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
