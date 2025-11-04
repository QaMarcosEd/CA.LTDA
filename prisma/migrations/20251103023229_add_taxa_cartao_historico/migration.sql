-- DropEnum
DROP TYPE "public"."Genero";

-- DropEnum
DROP TYPE "public"."Modelo";

-- CreateTable
CREATE TABLE "public"."TaxaCartaoHistorico" (
    "id" SERIAL NOT NULL,
    "taxaCartaoId" INTEGER NOT NULL,
    "bandeira" TEXT NOT NULL,
    "modalidade" TEXT NOT NULL,
    "taxaAntiga" DOUBLE PRECISION NOT NULL,
    "taxaNova" DOUBLE PRECISION NOT NULL,
    "alteradoPor" TEXT,
    "alteradoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TaxaCartaoHistorico_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."TaxaCartaoHistorico" ADD CONSTRAINT "TaxaCartaoHistorico_taxaCartaoId_fkey" FOREIGN KEY ("taxaCartaoId") REFERENCES "public"."TaxaCartao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
