-- CreateTable
CREATE TABLE "DailyStockPrice" (
    "id" SERIAL NOT NULL,
    "date" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "closingPrice" DOUBLE PRECISION NOT NULL,
    "change" DOUBLE PRECISION NOT NULL,
    "tradeVolume" INTEGER NOT NULL,
    "industry" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DailyStockPrice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DailyStockPrice_date_idx" ON "DailyStockPrice"("date");

-- CreateIndex
CREATE INDEX "DailyStockPrice_code_idx" ON "DailyStockPrice"("code");

-- CreateIndex
CREATE UNIQUE INDEX "DailyStockPrice_date_code_key" ON "DailyStockPrice"("date", "code");
