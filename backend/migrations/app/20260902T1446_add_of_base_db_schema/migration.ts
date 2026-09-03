#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/b9167d79eb88f7c4d28b8fc10ccd0fc351dad70b9676f8f10154beabedfe6a4d/contract';
import endContract from '../../snapshots/b9167d79eb88f7c4d28b8fc10ccd0fc351dad70b9676f8f10154beabedfe6a4d/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, primaryKey } from '@prisma/orm-postgres/migration';

export default class M extends Migration<never, End> {
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createSchema({ schema: 'public' }),
      this.createNativeEnumType({
        schema: 'public',
        typeName: 'user_role',
        members: ['jobseeker', 'recruiter', 'admin'],
      }),
      this.createTable({
        schema: 'public',
        table: 'answers',
        columns: [
          col('id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('option_id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('question_id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('user_id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
        ],
        constraints: [primaryKey(['id'], { name: 'answers_pkey' })],
      }),
      this.createTable({
        schema: 'public',
        table: 'favorites',
        columns: [
          col('user_id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('video_id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
        ],
        constraints: [primaryKey(['video_id', 'user_id'], { name: 'favorites_pkey' })],
      }),
      this.createTable({
        schema: 'public',
        table: 'likes',
        columns: [
          col('user_id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('video_id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
        ],
        constraints: [primaryKey(['video_id', 'user_id'], { name: 'likes_pkey' })],
      }),
      this.createTable({
        schema: 'public',
        table: 'options',
        columns: [
          col('id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('option', 'character varying(255)', {
            notNull: true,
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 255 } },
          }),
          col('question_id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
        ],
        constraints: [primaryKey(['id'], { name: 'options_pkey' })],
      }),
      this.createTable({
        schema: 'public',
        table: 'questions',
        columns: [
          col('id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('label', 'character varying(255)', {
            notNull: true,
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 255 } },
          }),
          col('survey_id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
        ],
        constraints: [primaryKey(['id'], { name: 'questions_pkey' })],
      }),
      this.createTable({
        schema: 'public',
        table: 'surveys',
        columns: [
          col('created_by', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('date', 'timestamp(0)', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamp-temporal@1', typeParams: { precision: 0 } },
          }),
          col('description', 'character varying(255)', {
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 255 } },
          }),
          col('id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('title', 'character varying(255)', {
            notNull: true,
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 255 } },
          }),
        ],
        constraints: [primaryKey(['id'], { name: 'surveys_pkey' })],
      }),
      this.createTable({
        schema: 'public',
        table: 'users',
        columns: [
          col('birthdate', 'timestamp(0)', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamp-temporal@1', typeParams: { precision: 0 } },
          }),
          col('created_at', 'timestamp(0)', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamp-temporal@1', typeParams: { precision: 0 } },
          }),
          col('email', 'character varying(255)', {
            notNull: true,
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 255 } },
          }),
          col('firstname', 'character varying(255)', {
            notNull: true,
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 255 } },
          }),
          col('id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('lastname', 'character varying(255)', {
            notNull: true,
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 255 } },
          }),
          col('password', 'character varying(255)', {
            notNull: true,
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 255 } },
          }),
          col('role', '"user_role"', {
            notNull: true,
            codecRef: { codecId: 'pg/enum@1', typeParams: { typeName: 'user_role' } },
          }),
        ],
        constraints: [primaryKey(['id'], { name: 'users_pkey' })],
      }),
      this.createTable({
        schema: 'public',
        table: 'videos',
        columns: [
          col('id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('user_id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('video_link', 'character varying(255)', {
            notNull: true,
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 255 } },
          }),
        ],
        constraints: [primaryKey(['id'], { name: 'videos_pkey' })],
      }),
      this.addUnique({
        schema: 'public',
        table: 'answers',
        constraint: 'answers_question_id_user_id_key',
        columns: ['question_id', 'user_id'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'videos',
        constraint: 'videos_user_id_key',
        columns: ['user_id'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'answers',
        foreignKey: {
          name: 'answers_option_id_fkey',
          columns: ['option_id'],
          references: { schema: 'public', table: 'options', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'answers',
        foreignKey: {
          name: 'answers_question_id_fkey',
          columns: ['question_id'],
          references: { schema: 'public', table: 'questions', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'answers',
        foreignKey: {
          name: 'answers_user_id_fkey',
          columns: ['user_id'],
          references: { schema: 'public', table: 'users', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'favorites',
        foreignKey: {
          name: 'favorites_user_id_fkey',
          columns: ['user_id'],
          references: { schema: 'public', table: 'users', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'favorites',
        foreignKey: {
          name: 'favorites_video_id_fkey',
          columns: ['video_id'],
          references: { schema: 'public', table: 'videos', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'likes',
        foreignKey: {
          name: 'likes_user_id_fkey',
          columns: ['user_id'],
          references: { schema: 'public', table: 'users', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'likes',
        foreignKey: {
          name: 'likes_video_id_fkey',
          columns: ['video_id'],
          references: { schema: 'public', table: 'videos', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'options',
        foreignKey: {
          name: 'options_question_id_fkey',
          columns: ['question_id'],
          references: { schema: 'public', table: 'questions', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'questions',
        foreignKey: {
          name: 'questions_survey_id_fkey',
          columns: ['survey_id'],
          references: { schema: 'public', table: 'surveys', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'surveys',
        foreignKey: {
          name: 'surveys_created_by_fkey',
          columns: ['created_by'],
          references: { schema: 'public', table: 'users', columns: ['id'] },
          onDelete: 'restrict',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'videos',
        foreignKey: {
          name: 'videos_user_id_fkey',
          columns: ['user_id'],
          references: { schema: 'public', table: 'users', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
