-- CreateTable
CREATE TABLE "Produto" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "tamanho" INTEGER NOT NULL,
    "referencia" TEXT NOT NULL,
    "cor" TEXT NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "preco" REAL NOT NULL,
    "genero" TEXT NOT NULL,
    "modelo" TEXT NOT NULL,
    "marca" TEXT NOT NULL,
    "disponivel" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Venda" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "produtoId" INTEGER NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "precoVenda" REAL NOT NULL,
    "data" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "observacao" TEXT,
    CONSTRAINT "Venda_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "Produto" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Produto_nome_referencia_idx" ON "Produto"("nome", "referencia");

-- CreateIndex
CREATE INDEX "Venda_produtoId_data_idx" ON "Venda"("produtoId", "data");
