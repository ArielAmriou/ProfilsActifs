/*
  Warnings:

  - You are about to drop the column `option_id` on the `answers` table. All the data in the column will be lost.
  - You are about to drop the column `question_id` on the `answers` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `surveys` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `surveys` table. All the data in the column will be lost.
  - You are about to drop the column `version` on the `surveys` table. All the data in the column will be lost.
  - You are about to drop the `options` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `questions` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[survey_id,user_id]` on the table `answers` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `survey_id` to the `answers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `value` to the `answers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `questionnaire_file` to the `surveys` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "answers" DROP CONSTRAINT "answers_option_id_fkey";

-- DropForeignKey
ALTER TABLE "answers" DROP CONSTRAINT "answers_question_id_fkey";

-- DropForeignKey
ALTER TABLE "options" DROP CONSTRAINT "options_question_id_fkey";

-- DropForeignKey
ALTER TABLE "questions" DROP CONSTRAINT "questions_survey_id_fkey";

-- DropIndex
DROP INDEX "answers_question_id_user_id_key";

-- AlterTable
ALTER TABLE "answers" DROP COLUMN "option_id",
DROP COLUMN "question_id",
ADD COLUMN     "survey_id" UUID NOT NULL,
ADD COLUMN     "value" VARCHAR(255) NOT NULL;

-- AlterTable
ALTER TABLE "surveys" DROP COLUMN "description",
DROP COLUMN "title",
DROP COLUMN "version",
ADD COLUMN     "questionnaire_file" VARCHAR(255) NOT NULL;

-- DropTable
DROP TABLE "options";

-- DropTable
DROP TABLE "questions";

-- CreateIndex
CREATE UNIQUE INDEX "answers_survey_id_user_id_key" ON "answers"("survey_id", "user_id");

-- AddForeignKey
ALTER TABLE "answers" ADD CONSTRAINT "answers_survey_id_fkey" FOREIGN KEY ("survey_id") REFERENCES "surveys"("id") ON DELETE CASCADE ON UPDATE CASCADE;
