DROP INDEX "idx_attempts_active";--> statement-breakpoint
CREATE UNIQUE INDEX "idx_attempts_one_active_per_exercise" ON "exercise_attempts" ("user_id","exercise_id") WHERE "status" = 'in_progress';