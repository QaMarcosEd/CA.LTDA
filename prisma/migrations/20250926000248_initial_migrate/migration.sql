-- CreateTable
CREATE TABLE "Cliente" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "apelido" TEXT,
    "telefone" TEXT,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Venda" (
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

-- CreateTable
CREATE TABLE "Parcela" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "vendaId" INTEGER NOT NULL,
    "numeroParcela" INTEGER NOT NULL,
    "valor" REAL NOT NULL,
    "valorPago" REAL NOT NULL DEFAULT 0,
    "dataVencimento" DATETIME NOT NULL,
    "pago" BOOLEAN NOT NULL DEFAULT false,
    "observacao" TEXT,
    CONSTRAINT "Parcela_vendaId_fkey" FOREIGN KEY ("vendaId") REFERENCES "Venda" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Produto" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "tamanho" INTEGER NOT NULL,
    "referencia" TEXT,
    "cor" TEXT NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "preco" REAL NOT NULL,
    "genero" TEXT,
    "modelo" TEXT,
    "marca" TEXT,
    "disponivel" BOOLEAN NOT NULL DEFAULT true,
    "lote" TEXT,
    "dataRecebimento" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Cliente_nome_key" ON "Cliente"("nome");
