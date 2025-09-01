/*
  Warnings:

  - Added the required column `takerId` to the `Attempt` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Attempt" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "startTime" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endTime" DATETIME,
    "score" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'started',
    "testId" TEXT NOT NULL,
    "takerId" TEXT NOT NULL,
    CONSTRAINT "Attempt_testId_fkey" FOREIGN KEY ("testId") REFERENCES "Test" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Attempt_takerId_fkey" FOREIGN KEY ("takerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Attempt" ("endTime", "id", "score", "startTime", "testId") SELECT "endTime", "id", "score", "startTime", "testId" FROM "Attempt";
DROP TABLE "Attempt";
ALTER TABLE "new_Attempt" RENAME TO "Attempt";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
