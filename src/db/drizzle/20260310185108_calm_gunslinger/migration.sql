CREATE TABLE "submission_explanations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"submission_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"exercise_id" uuid NOT NULL,
	"attempt_number" integer DEFAULT 1 NOT NULL,
	"explanation" jsonb NOT NULL,
	"llm_model" text NOT NULL,
	"generation_time_ms" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "exercises" ADD COLUMN "lesson_content" jsonb DEFAULT '{}';--> statement-breakpoint
ALTER TABLE "exercises" ADD COLUMN "synthesis_content" jsonb DEFAULT '{}';--> statement-breakpoint
CREATE UNIQUE INDEX "unique_submission_explanation" ON "submission_explanations" ("submission_id");--> statement-breakpoint
CREATE INDEX "idx_submission_explanations_exercise" ON "submission_explanations" ("exercise_id","user_id");--> statement-breakpoint
CREATE INDEX "idx_submission_explanations_user" ON "submission_explanations" ("user_id");--> statement-breakpoint
ALTER TABLE "submission_explanations" ADD CONSTRAINT "submission_explanations_eAevg7qOrjRd_fkey" FOREIGN KEY ("submission_id") REFERENCES "exercise_submissions"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "submission_explanations" ADD CONSTRAINT "submission_explanations_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "submission_explanations" ADD CONSTRAINT "submission_explanations_exercise_id_exercises_id_fkey" FOREIGN KEY ("exercise_id") REFERENCES "exercises"("id");