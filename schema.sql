CREATE TYPE user_role AS ENUM ('jobseeker', 'recruiter', 'admin');

CREATE TABLE "users"(
    "id" UUID PRIMARY KEY,
    "username" VARCHAR(255) NOT NULL,
    "role" user_role NOT NULL,
    "created_at" TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
    "birthdate" TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL
);

CREATE TABLE "videos"(
    "id" UUID PRIMARY KEY,
    "user_id" UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    "video_link" VARCHAR(255) NOT NULL
);

CREATE TABLE "surveys"(
    "id" UUID PRIMARY KEY,
    "created_by" UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    "date" TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" VARCHAR(255)
);

CREATE TABLE "questions"(
    "id" UUID PRIMARY KEY,
    "survey_id" UUID NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
    "label" VARCHAR(255) NOT NULL
);

CREATE TABLE "options"(
    "id" UUID PRIMARY KEY,
    "question_id" UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    "option" VARCHAR(255) NOT NULL
);

CREATE TABLE "answers"(
    "id" UUID PRIMARY KEY,
    "question_id" UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    "user_id" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    "option_id" UUID NOT NULL REFERENCES options(id) ON DELETE CASCADE,
    UNIQUE ("question_id", "user_id")
);

CREATE TABLE "favorites"(
    "video_id" UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
    "user_id" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    PRIMARY KEY ("video_id", "user_id")
);

CREATE TABLE "likes"(
    "video_id" UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
    "user_id" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    PRIMARY KEY ("video_id", "user_id")
);