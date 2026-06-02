CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE "NewsEmbedding" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT,
    "source" TEXT NOT NULL,
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "embedding" vector(1536),

    CONSTRAINT "NewsEmbedding_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "NewsEmbedding_fetchedAt_idx" ON "NewsEmbedding"("fetchedAt");
