-- CreateEnum
CREATE TYPE "public"."Genero" AS ENUM ('MASCULINO', 'FEMININO', 'INFANTIL_MASCULINO', 'INFANTIL_FEMININO');

-- CreateEnum
CREATE TYPE "public"."Modelo" AS ENUM ('TENIS', 'SAPATENIS', 'SANDALIA', 'RASTEIRA', 'TAMANCO', 'SCARPIN', 'BOTA', 'CHINELO', 'MOCASSIM', 'PAPETE', 'CHUTEIRA');

-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('ADMIN', 'FUNCIONARIO');

-- CreateTable
CREATE TABLE "public"."Cliente" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "apelido" TEXT,
    "telefone" TEXT,
    "dataNascimento" TIMESTAMP(3),
    "cidade" TEXT,
    "bairro" TEXT,
    "rua" TEXT,
    "ultimaCompra" TIMESTAMP(3),
    "frequenciaCompras" INTEGER,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Cliente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Venda" (
    "id" SERIAL NOT NULL,
    "produtoId" INTEGER NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "precoVenda" DOUBLE PRECISION NOT NULL,
    "valorTotal" DOUBLE PRECISION NOT NULL,
    "entrada" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "formaPagamentoEntrada" TEXT,
    "clienteId" INTEGER NOT NULL,
    "observacao" TEXT,
    "dataVenda" TIMESTAMP(3) NOT NULL,
    "formaPagamento" TEXT,
    "taxa" DOUBLE PRECISION DEFAULT 0,
    "valorLiquido" DOUBLE PRECISION DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'ABERTO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Venda_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Parcela" (
    "id" SERIAL NOT NULL,
    "vendaId" INTEGER NOT NULL,
    "numeroParcela" INTEGER NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,
    "valorPago" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "dataVencimento" TIMESTAMP(3) NOT NULL,
    "dataPagamento" TIMESTAMP(3),
    "pago" BOOLEAN NOT NULL DEFAULT false,
    "observacao" TEXT,
    "formaPagamento" TEXT,
    "taxa" DOUBLE PRECISION DEFAULT 0,
    "valorLiquido" DOUBLE PRECISION DEFAULT 0,

    CONSTRAINT "Parcela_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Produto" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "tamanho" INTEGER NOT NULL,
    "referencia" TEXT,
    "cor" TEXT NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "precoCusto" DOUBLE PRECISION DEFAULT 0.0,
    "precoVenda" DOUBLE PRECISION NOT NULL,
    "imagem" TEXT,
    "genero" TEXT,
    "modelo" TEXT,
    "marca" TEXT,
    "disponivel" BOOLEAN NOT NULL DEFAULT true,
    "lote" TEXT,
    "dataRecebimento" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Produto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TaxaCartao" (
    "id" SERIAL NOT NULL,
    "bandeira" TEXT NOT NULL,
    "modalidade" TEXT NOT NULL,
    "taxaPercentual" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "TaxaCartao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "public"."Role" NOT NULL DEFAULT 'FUNCIONARIO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Cliente_nome_key" ON "public"."Cliente"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "TaxaCartao_bandeira_modalidade_key" ON "public"."TaxaCartao"("bandeira", "modalidade");

-- CreateIndex
CREATE UNIQUE INDEX "User_name_key" ON "public"."User"("name");

-- AddForeignKey
ALTER TABLE "public"."Venda" ADD CONSTRAINT "Venda_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "public"."Produto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Venda" ADD CONSTRAINT "Venda_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "public"."Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Parcela" ADD CONSTRAINT "Parcela_vendaId_fkey" FOREIGN KEY ("vendaId") REFERENCES "public"."Venda"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
