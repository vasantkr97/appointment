/*
  Warnings:

  - A unique constraint covering the columns `[slotId]` on the table `Appointment` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Appointment" ALTER COLUMN "date" SET DATA TYPE TEXT,
ALTER COLUMN "startTime" SET DATA TYPE TEXT,
ALTER COLUMN "endTime" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Availability" ALTER COLUMN "startTime" SET DATA TYPE TEXT,
ALTER COLUMN "endTime" SET DATA TYPE TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Appointment_slotId_key" ON "Appointment"("slotId");

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
