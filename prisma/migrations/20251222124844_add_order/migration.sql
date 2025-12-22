-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Contact" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "lastMessageTime" TEXT,
    "unreadCount" INTEGER NOT NULL DEFAULT 0,
    "order" INTEGER NOT NULL DEFAULT 0,
    "lastMessagePreview" TEXT,
    "status" TEXT NOT NULL DEFAULT 'offline',
    "assignedTo" TEXT,
    "columnId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Contact_columnId_fkey" FOREIGN KEY ("columnId") REFERENCES "Column" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Contact" ("assignedTo", "avatarUrl", "columnId", "createdAt", "id", "lastMessagePreview", "lastMessageTime", "name", "phone", "status", "unreadCount", "updatedAt") SELECT "assignedTo", "avatarUrl", "columnId", "createdAt", "id", "lastMessagePreview", "lastMessageTime", "name", "phone", "status", "unreadCount", "updatedAt" FROM "Contact";
DROP TABLE "Contact";
ALTER TABLE "new_Contact" RENAME TO "Contact";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
