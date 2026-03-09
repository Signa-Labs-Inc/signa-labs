CREATE TABLE "learning_paths" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" uuid NOT NULL,
	"title" text NOT NULL,
	"user_prompt" text NOT NULL,
	"starting_level" text NOT NULL,
	"language" text NOT NULL,
	"detected_framework" text,
	"plan" jsonb NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"current_milestone_index" integer DEFAULT 0 NOT NULL,
	"total_milestones" integer NOT NULL,
	"total_exercises_completed" integer DEFAULT 0 NOT NULL,
	"estimated_total_exercises" integer NOT NULL,
	"llm_model" text NOT NULL,
	"plan_generation_time_ms" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone,
	CONSTRAINT "learning_paths_status_check" CHECK ("status" IN ('active', 'completed', 'paused', 'abandoned')),
	CONSTRAINT "learning_paths_starting_level_check" CHECK ("starting_level" IN ('beginner', 'some_experience', 'intermediate', 'advanced')),
	CONSTRAINT "learning_paths_language_check" CHECK ("language" IN ('python', 'typescript', 'javascript', 'ruby', 'go', 'sql'))
);
--> statement-breakpoint
CREATE TABLE "path_exercises" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"path_id" uuid NOT NULL,
	"milestone_id" uuid NOT NULL,
	"exercise_id" uuid NOT NULL,
	"exercise_index" integer NOT NULL,
	"generation_context" jsonb DEFAULT '{}' NOT NULL,
	"is_completed" boolean DEFAULT false NOT NULL,
	"tests_passed" integer,
	"tests_total" integer,
	"time_spent_seconds" integer,
	"hints_used" integer,
	"attempts_count" integer DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "path_milestones" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"path_id" uuid NOT NULL,
	"milestone_index" integer NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"skills" jsonb DEFAULT '[]' NOT NULL,
	"skill_gates" jsonb DEFAULT '[]' NOT NULL,
	"topics" jsonb DEFAULT '[]' NOT NULL,
	"target_difficulty" text NOT NULL,
	"min_exercises" integer DEFAULT 3 NOT NULL,
	"max_exercises" integer DEFAULT 8 NOT NULL,
	"status" text DEFAULT 'locked' NOT NULL,
	"exercises_completed" integer DEFAULT 0 NOT NULL,
	"unlocked_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	CONSTRAINT "path_milestones_status_check" CHECK ("status" IN ('locked', 'active', 'completed')),
	CONSTRAINT "path_milestones_difficulty_check" CHECK ("target_difficulty" IN ('beginner', 'easy', 'medium', 'hard', 'expert'))
);
--> statement-breakpoint
CREATE TABLE "path_skill_assessments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"path_id" uuid NOT NULL,
	"milestone_id" uuid NOT NULL,
	"exercise_id" uuid NOT NULL,
	"skill_name" text NOT NULL,
	"demonstrated" boolean NOT NULL,
	"confidence" real DEFAULT 0 NOT NULL,
	"evidence" jsonb DEFAULT '{}' NOT NULL,
	"assessed_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "idx_learning_paths_user" ON "learning_paths" ("user_id");--> statement-breakpoint
CREATE INDEX "idx_learning_paths_active" ON "learning_paths" ("user_id") WHERE "status" = 'active';--> statement-breakpoint
CREATE INDEX "idx_path_exercises_path" ON "path_exercises" ("path_id");--> statement-breakpoint
CREATE INDEX "idx_path_exercises_milestone" ON "path_exercises" ("milestone_id");--> statement-breakpoint
CREATE INDEX "idx_path_exercises_exercise" ON "path_exercises" ("exercise_id");--> statement-breakpoint
CREATE UNIQUE INDEX "path_milestones_unique_index" ON "path_milestones" ("path_id","milestone_index");--> statement-breakpoint
CREATE INDEX "idx_path_milestones_path" ON "path_milestones" ("path_id");--> statement-breakpoint
CREATE INDEX "idx_skill_assessments_path" ON "path_skill_assessments" ("path_id");--> statement-breakpoint
CREATE INDEX "idx_skill_assessments_skill" ON "path_skill_assessments" ("path_id","skill_name");--> statement-breakpoint
ALTER TABLE "learning_paths" ADD CONSTRAINT "learning_paths_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "path_exercises" ADD CONSTRAINT "path_exercises_path_id_learning_paths_id_fkey" FOREIGN KEY ("path_id") REFERENCES "learning_paths"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "path_exercises" ADD CONSTRAINT "path_exercises_milestone_id_path_milestones_id_fkey" FOREIGN KEY ("milestone_id") REFERENCES "path_milestones"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "path_exercises" ADD CONSTRAINT "path_exercises_exercise_id_exercises_id_fkey" FOREIGN KEY ("exercise_id") REFERENCES "exercises"("id");--> statement-breakpoint
ALTER TABLE "path_milestones" ADD CONSTRAINT "path_milestones_path_id_learning_paths_id_fkey" FOREIGN KEY ("path_id") REFERENCES "learning_paths"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "path_skill_assessments" ADD CONSTRAINT "path_skill_assessments_path_id_learning_paths_id_fkey" FOREIGN KEY ("path_id") REFERENCES "learning_paths"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "path_skill_assessments" ADD CONSTRAINT "path_skill_assessments_milestone_id_path_milestones_id_fkey" FOREIGN KEY ("milestone_id") REFERENCES "path_milestones"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "path_skill_assessments" ADD CONSTRAINT "path_skill_assessments_exercise_id_exercises_id_fkey" FOREIGN KEY ("exercise_id") REFERENCES "exercises"("id");