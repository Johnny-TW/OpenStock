-- CreateTable
CREATE TABLE "AnalysisCache" (
    "id" SERIAL NOT NULL,
    "date" TEXT NOT NULL,
    "result" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnalysisCache_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AnalysisCache_date_idx" ON "AnalysisCache"("date");

-- CreateIndex
CREATE UNIQUE INDEX "AnalysisCache_date_key" ON "AnalysisCache"("date");
