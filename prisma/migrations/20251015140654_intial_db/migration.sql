-- CreateTable
CREATE TABLE "Cliente" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "apelido" TEXT,
    "telefone" TEXT,
    "dataNascimento" DATETIME,
    "cidade" TEXT,
    "bairro" TEXT,
    "rua" TEXT,
    "ultimaCompra" DATETIME,
    "frequenciaCompras" INTEGER,
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
    "formaPagamentoEntrada" TEXT,
    "clienteId" INTEGER NOT NULL,
    "observacao" TEXT,
    "dataVenda" DATETIME NOT NULL,
    "formaPagamento" TEXT,
    "taxa" REAL DEFAULT 0,
    "valorLiquido" REAL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'ABERTO',
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
    "dataPagamento" DATETIME,
    "pago" BOOLEAN NOT NULL DEFAULT false,
    "observacao" TEXT,
    "formaPagamento" TEXT,
    "taxa" REAL DEFAULT 0,
    "valorLiquido" REAL DEFAULT 0,
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
    "precoCusto" REAL DEFAULT 0.0,
    "precoVenda" REAL NOT NULL,
    "imagem" TEXT,
    "genero" TEXT,
    "modelo" TEXT,
    "marca" TEXT,
    "disponivel" BOOLEAN NOT NULL DEFAULT true,
    "lote" TEXT,
    "dataRecebimento" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "TaxaCartao" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "bandeira" TEXT NOT NULL,
    "modalidade" TEXT NOT NULL,
    "taxaPercentual" REAL NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Cliente_nome_key" ON "Cliente"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "TaxaCartao_bandeira_modalidade_key" ON "TaxaCartao"("bandeira", "modalidade");
