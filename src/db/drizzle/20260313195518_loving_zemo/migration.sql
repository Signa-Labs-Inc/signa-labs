ALTER TABLE "exercises" ADD COLUMN "slug" text;--> statement-breakpoint
ALTER TABLE "exercises" ADD COLUMN "is_public" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "exercises" ADD COLUMN "shared_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "exercises" ADD COLUMN "public_attempt_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "exercises" ALTER COLUMN "lesson_content" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "exercises" ALTER COLUMN "synthesis_content" DROP DEFAULT;--> statement-breakpoint
CREATE UNIQUE INDEX "idx_exercises_slug_unique" ON "exercises" ("slug") WHERE "slug" IS NOT NULL;--> statement-breakpoint
CREATE INDEX "idx_exercises_is_public" ON "exercises" ("is_public") WHERE "is_public" = true AND "deleted_at" IS NULL;