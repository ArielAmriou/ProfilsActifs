-- CreateEnum
CREATE TYPE "user_role" AS ENUM ('jobseeker', 'recruiter', 'admin');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "firstname" VARCHAR(255) NOT NULL,
    "lastname" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "role" "user_role" NOT NULL,
    "birthdate" TIMESTAMP(0) NOT NULL,
    "created_at" TIMESTAMP(0) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "surveys" (
    "id" UUID NOT NULL,
    "created_by" UUID NOT NULL,
    "date" TIMESTAMP(0) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" VARCHAR(255),

    CONSTRAINT "surveys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "questions" (
    "id" UUID NOT NULL,
    "survey_id" UUID NOT NULL,
    "label" VARCHAR(255) NOT NULL,

    CONSTRAINT "questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "options" (
    "id" UUID NOT NULL,
    "question_id" UUID NOT NULL,
    "option" VARCHAR(255) NOT NULL,

    CONSTRAINT "options_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "answers" (
    "id" UUID NOT NULL,
    "question_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "option_id" UUID NOT NULL,

    CONSTRAINT "answers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "videos" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "video_link" VARCHAR(255) NOT NULL,

    CONSTRAINT "videos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "favorites" (
    "video_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,

    CONSTRAINT "favorites_pkey" PRIMARY KEY ("video_id","user_id")
);

-- CreateTable
CREATE TABLE "likes" (
    "video_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,

    CONSTRAINT "likes_pkey" PRIMARY KEY ("video_id","user_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "videos_user_id_key" ON "videos"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "answers_question_id_user_id_key" ON "answers"("question_id", "user_id");

-- AddForeignKey
ALTER TABLE "surveys" ADD CONSTRAINT "surveys_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_survey_id_fkey" FOREIGN KEY ("survey_id") REFERENCES "surveys"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "options" ADD CONSTRAINT "options_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "answers" ADD CONSTRAINT "answers_option_id_fkey" FOREIGN KEY ("option_id") REFERENCES "options"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "answers" ADD CONSTRAINT "answers_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "answers" ADD CONSTRAINT "answers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "videos" ADD CONSTRAINT "videos_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_video_id_fkey" FOREIGN KEY ("video_id") REFERENCES "videos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "likes" ADD CONSTRAINT "likes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "likes" ADD CONSTRAINT "likes_video_id_fkey" FOREIGN KEY ("video_id") REFERENCES "videos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
