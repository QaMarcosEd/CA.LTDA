/*
  Warnings:

  - You are about to drop the column `data` on the `Venda` table. All the data in the column will be lost.
  - Added the required column `dataVenda` to the `Venda` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Produto" ADD COLUMN "lote" TEXT;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Venda" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "produtoId" INTEGER NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "precoVenda" REAL NOT NULL,
    "valorTotal" REAL NOT NULL,
    "entrada" REAL NOT NULL DEFAULT 0,
    "clienteId" INTEGER NOT NULL,
    "observacao" TEXT,
    "dataVenda" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Venda_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "Produto" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Venda_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Venda" ("clienteId", "entrada", "id", "observacao", "precoVenda", "produtoId", "quantidade", "valorTotal") SELECT "clienteId", "entrada", "id", "observacao", "precoVenda", "produtoId", "quantidade", "valorTotal" FROM "Venda";
DROP TABLE "Venda";
ALTER TABLE "new_Venda" RENAME TO "Venda";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
