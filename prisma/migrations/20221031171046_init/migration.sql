-- CreateTable
CREATE TABLE "Hunt" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "accountId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "editedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "HuntedItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "amount" INTEGER NOT NULL,
    "itemId" INTEGER NOT NULL,
    "targetMonsterIds" TEXT NOT NULL,
    "huntId" INTEGER NOT NULL,
    CONSTRAINT "HuntedItem_huntId_fkey" FOREIGN KEY ("huntId") REFERENCES "Hunt" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "HuntedMonster" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "monsterId" INTEGER NOT NULL,
    "spawnId" TEXT,
    "killsPerUnit" INTEGER NOT NULL,
    "huntId" INTEGER NOT NULL,
    CONSTRAINT "HuntedMonster_huntId_fkey" FOREIGN KEY ("huntId") REFERENCES "Hunt" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
