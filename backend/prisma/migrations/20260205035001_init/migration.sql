-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userAddress" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "subscriptionKeyId" TEXT NOT NULL,
    "encryptedPrivateKey" TEXT NOT NULL,
    "nextPaymentDue" BIGINT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "authPayload" TEXT NOT NULL,
    "authSignature" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "PaymentHistory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "subscriptionKey" TEXT NOT NULL,
    "amount" TEXT NOT NULL,
    "txHash" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_subscriptionKeyId_key" ON "Subscription"("subscriptionKeyId");
