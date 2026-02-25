CREATE TABLE "exercise_attempts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" uuid NOT NULL,
	"exercise_id" uuid NOT NULL,
	"status" text DEFAULT 'in_progress' NOT NULL,
	"hints_revealed" integer DEFAULT 0 NOT NULL,
	"solution_viewed" boolean DEFAULT false NOT NULL,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone,
	"time_spent_seconds" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "exercise_attempts_status_check" CHECK ("status" IN ('in_progress', 'completed', 'abandoned'))
);
--> statement-breakpoint
CREATE TABLE "exercise_environments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" text NOT NULL UNIQUE,
	"display_name" text NOT NULL,
	"description" text,
	"base_image" text NOT NULL,
	"preinstalled_packages" jsonb DEFAULT '[]' NOT NULL,
	"setup_commands" text[],
	"supported_languages" text[] NOT NULL,
	"max_execution_seconds" integer DEFAULT 30 NOT NULL,
	"max_files" integer DEFAULT 20 NOT NULL,
	"max_file_size_bytes" integer DEFAULT 1048576 NOT NULL,
	"metadata" jsonb DEFAULT '{}',
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "exercise_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"attempt_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"event_type" text NOT NULL,
	"payload" jsonb DEFAULT '{}' NOT NULL,
	"occurred_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "exercise_events_type_check" CHECK ("event_type" IN ('attempt_started', 'code_submitted', 'tests_run', 'tests_passed', 'tests_failed', 'hint_revealed', 'solution_viewed', 'attempt_completed', 'attempt_abandoned'))
);
--> statement-breakpoint
CREATE TABLE "exercise_files" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"exercise_id" uuid NOT NULL,
	"file_type" text NOT NULL,
	"file_path" text NOT NULL,
	"file_name" text NOT NULL,
	"content" text NOT NULL,
	"is_editable" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "exercise_files_type_check" CHECK ("file_type" IN ('starter', 'solution', 'test', 'support'))
);
--> statement-breakpoint
CREATE TABLE "exercise_submissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"attempt_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"tests_passed" integer DEFAULT 0 NOT NULL,
	"tests_failed" integer DEFAULT 0 NOT NULL,
	"tests_total" integer DEFAULT 0 NOT NULL,
	"test_output" text,
	"execution_time_ms" integer,
	"is_passing" boolean DEFAULT false NOT NULL,
	"submitted_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "exercises" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"origin" text NOT NULL,
	"created_by" uuid,
	"user_prompt" text,
	"prompt_template_id" uuid,
	"environment_id" uuid NOT NULL,
	"llm_model" text NOT NULL,
	"llm_parameters" jsonb DEFAULT '{}' NOT NULL,
	"generation_time_ms" integer,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"difficulty" text DEFAULT 'medium' NOT NULL,
	"language" text NOT NULL,
	"hints" jsonb DEFAULT '[]' NOT NULL,
	"is_validated" boolean DEFAULT false NOT NULL,
	"validation_output" jsonb,
	"tags" text[] DEFAULT '{}'::text[],
	"metadata" jsonb DEFAULT '{}',
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "exercises_origin_check" CHECK ("origin" IN ('platform', 'user')),
	CONSTRAINT "exercises_difficulty_check" CHECK ("difficulty" IN ('beginner', 'easy', 'medium', 'hard', 'expert')),
	CONSTRAINT "exercises_language_check" CHECK ("language" IN ('python', 'typescript', 'javascript', 'ruby', 'go', 'sql')),
	CONSTRAINT "exercises_origin_consistency_check" CHECK (("origin" = 'platform' AND "created_by" IS NULL AND "user_prompt" IS NULL) OR ("origin" = 'user' AND "created_by" IS NOT NULL AND "user_prompt" IS NOT NULL))
);
--> statement-breakpoint
CREATE TABLE "idempotency_keys" (
	"key" text,
	"scope" text,
	"user_id" uuid,
	"status" text DEFAULT 'completed' NOT NULL,
	"response_status" integer,
	"response_body" jsonb,
	"metadata" jsonb DEFAULT '{}',
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	CONSTRAINT "idempotency_keys_pkey" PRIMARY KEY("key","scope"),
	CONSTRAINT "idempotency_keys_status_check" CHECK ("status" IN ('processing', 'completed', 'failed'))
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" uuid NOT NULL,
	"type" text NOT NULL,
	"channel" text DEFAULT 'email' NOT NULL,
	"subject" text,
	"body" text,
	"metadata" jsonb DEFAULT '{}',
	"status" text DEFAULT 'pending' NOT NULL,
	"sent_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "notifications_channel_check" CHECK ("channel" IN ('email', 'push', 'in_app')),
	CONSTRAINT "notifications_status_check" CHECK ("status" IN ('pending', 'sent', 'failed', 'bounced'))
);
--> statement-breakpoint
CREATE TABLE "organizations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" text NOT NULL,
	"slug" text NOT NULL UNIQUE,
	"metadata" jsonb DEFAULT '{}',
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "payment_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" uuid NOT NULL,
	"subscription_id" uuid,
	"stripe_payment_intent_id" text UNIQUE,
	"stripe_invoice_id" text,
	"amount_cents" integer NOT NULL,
	"currency" text DEFAULT 'usd' NOT NULL,
	"status" text NOT NULL,
	"description" text,
	"paid_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "payment_records_status_check" CHECK ("status" IN ('succeeded', 'failed', 'refunded', 'partial_refund'))
);
--> statement-breakpoint
CREATE TABLE "plan_prices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"plan_id" text NOT NULL,
	"stripe_price_id" text NOT NULL UNIQUE,
	"currency" text DEFAULT 'usd' NOT NULL,
	"interval" text DEFAULT 'month' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "plan_prices_interval_check" CHECK ("interval" IN ('month', 'year', 'lifetime'))
);
--> statement-breakpoint
CREATE TABLE "plans" (
	"id" text PRIMARY KEY,
	"name" text NOT NULL,
	"description" text,
	"features" jsonb DEFAULT '{}' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "prompt_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" text NOT NULL,
	"description" text,
	"template_text" text NOT NULL,
	"exercise_type" text NOT NULL,
	"supported_languages" text[] NOT NULL,
	"environment_id" uuid,
	"version" integer DEFAULT 1 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "prompt_templates_exercise_type_check" CHECK ("exercise_type" IN ('algorithm', 'debugging', 'build', 'refactor', 'query', 'api', 'data_pipeline', 'config'))
);
--> statement-breakpoint
CREATE TABLE "submission_files" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"submission_id" uuid NOT NULL,
	"file_path" text NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscription_seats" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"subscription_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"assigned_by" uuid,
	"assigned_at" timestamp with time zone DEFAULT now() NOT NULL,
	"removed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" uuid,
	"org_id" uuid,
	"owner_type" text NOT NULL,
	"plan_id" text NOT NULL,
	"plan_price_id" uuid NOT NULL,
	"stripe_subscription_id" text UNIQUE,
	"stripe_customer_id" text NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"total_seats" integer,
	"current_period_start" timestamp with time zone,
	"current_period_end" timestamp with time zone,
	"trial_end" timestamp with time zone,
	"cancel_at_period_end" boolean DEFAULT false NOT NULL,
	"canceled_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "subscriptions_owner_type_check" CHECK ("owner_type" IN ('user', 'org')),
	CONSTRAINT "subscriptions_status_check" CHECK ("status" IN ('trialing', 'active', 'past_due', 'canceled', 'unpaid', 'paused', 'incomplete')),
	CONSTRAINT "subscriptions_owner_check" CHECK (("owner_type" = 'user' AND "user_id" IS NOT NULL AND "org_id" IS NULL) OR ("owner_type" = 'org' AND "org_id" IS NOT NULL AND "user_id" IS NULL)),
	CONSTRAINT "subscriptions_seats_check" CHECK (("owner_type" = 'user' AND "total_seats" IS NULL) OR ("owner_type" = 'org' AND "total_seats" IS NOT NULL AND "total_seats" > 0))
);
--> statement-breakpoint
CREATE TABLE "user_learning_stats" (
	"user_id" uuid PRIMARY KEY,
	"total_exercises_completed" integer DEFAULT 0 NOT NULL,
	"total_exercises_attempted" integer DEFAULT 0 NOT NULL,
	"total_time_spent_seconds" integer DEFAULT 0 NOT NULL,
	"current_streak_days" integer DEFAULT 0 NOT NULL,
	"longest_streak_days" integer DEFAULT 0 NOT NULL,
	"last_activity_at" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"clerk_id" text NOT NULL UNIQUE,
	"email" text NOT NULL UNIQUE,
	"email_verified_at" timestamp with time zone,
	"role" text DEFAULT 'learner' NOT NULL,
	"org_id" uuid,
	"stripe_customer_id" text UNIQUE,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "users_role_check" CHECK ("role" IN ('learner', 'admin', 'super_admin'))
);
--> statement-breakpoint
CREATE TABLE "users_profiles" (
	"user_id" uuid PRIMARY KEY,
	"display_name" text,
	"username" text UNIQUE,
	"avatar_url" text,
	"bio" text,
	"time_zone" text DEFAULT 'America/New_York' NOT NULL,
	"preferred_language" text DEFAULT 'en' NOT NULL,
	"preferences" jsonb DEFAULT '{"editor_theme":"dark","editor_font_size":14,"preferred_coding_language":"python","daily_goal_minutes":30,"email_notifications":true,"streak_reminders":true}' NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "idx_attempts_user" ON "exercise_attempts" ("user_id");--> statement-breakpoint
CREATE INDEX "idx_attempts_exercise" ON "exercise_attempts" ("exercise_id");--> statement-breakpoint
CREATE INDEX "idx_attempts_active" ON "exercise_attempts" ("user_id") WHERE "status" = 'in_progress';--> statement-breakpoint
CREATE INDEX "idx_attempts_user_exercise" ON "exercise_attempts" ("user_id","exercise_id");--> statement-breakpoint
CREATE INDEX "idx_events_attempt" ON "exercise_events" ("attempt_id");--> statement-breakpoint
CREATE INDEX "idx_events_user" ON "exercise_events" ("user_id");--> statement-breakpoint
CREATE INDEX "idx_events_type" ON "exercise_events" ("event_type");--> statement-breakpoint
CREATE INDEX "idx_events_occurred" ON "exercise_events" ("occurred_at");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_exercise_files_unique" ON "exercise_files" ("exercise_id","file_type","file_path");--> statement-breakpoint
CREATE INDEX "idx_exercise_files_exercise" ON "exercise_files" ("exercise_id");--> statement-breakpoint
CREATE INDEX "idx_submissions_attempt" ON "exercise_submissions" ("attempt_id");--> statement-breakpoint
CREATE INDEX "idx_submissions_user" ON "exercise_submissions" ("user_id");--> statement-breakpoint
CREATE INDEX "idx_exercises_origin" ON "exercises" ("origin") WHERE "deleted_at" IS NULL;--> statement-breakpoint
CREATE INDEX "idx_exercises_created_by" ON "exercises" ("created_by") WHERE "created_by" IS NOT NULL AND "deleted_at" IS NULL;--> statement-breakpoint
CREATE INDEX "idx_exercises_language" ON "exercises" ("language") WHERE "deleted_at" IS NULL;--> statement-breakpoint
CREATE INDEX "idx_exercises_difficulty" ON "exercises" ("difficulty") WHERE "deleted_at" IS NULL;--> statement-breakpoint
CREATE INDEX "idx_exercises_environment" ON "exercises" ("environment_id");--> statement-breakpoint
CREATE INDEX "idx_exercises_prompt_template" ON "exercises" ("prompt_template_id");--> statement-breakpoint
CREATE INDEX "idx_idempotency_expires" ON "idempotency_keys" ("expires_at");--> statement-breakpoint
CREATE INDEX "idx_notifications_user" ON "notifications" ("user_id");--> statement-breakpoint
CREATE INDEX "idx_notifications_pending" ON "notifications" ("created_at") WHERE "status" = 'pending';--> statement-breakpoint
CREATE INDEX "organizations_slug_idx" ON "organizations" ("slug") WHERE "deleted_at" IS NULL;--> statement-breakpoint
CREATE INDEX "idx_payment_records_user" ON "payment_records" ("user_id");--> statement-breakpoint
CREATE INDEX "idx_payment_records_subscription" ON "payment_records" ("subscription_id");--> statement-breakpoint
CREATE INDEX "idx_payment_records_status" ON "payment_records" ("status");--> statement-breakpoint
CREATE INDEX "idx_plan_prices_plan" ON "plan_prices" ("plan_id");--> statement-breakpoint
CREATE INDEX "idx_plan_prices_active" ON "plan_prices" ("plan_id") WHERE "is_active" = true;--> statement-breakpoint
CREATE INDEX "idx_prompt_templates_type" ON "prompt_templates" ("exercise_type") WHERE "is_active" = true;--> statement-breakpoint
CREATE UNIQUE INDEX "idx_submission_files_unique" ON "submission_files" ("submission_id","file_path");--> statement-breakpoint
CREATE INDEX "idx_submission_files_submission" ON "submission_files" ("submission_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_seats_unique" ON "subscription_seats" ("subscription_id","user_id");--> statement-breakpoint
CREATE INDEX "idx_seats_subscription" ON "subscription_seats" ("subscription_id");--> statement-breakpoint
CREATE INDEX "idx_seats_active" ON "subscription_seats" ("subscription_id") WHERE "removed_at" IS NULL;--> statement-breakpoint
CREATE INDEX "idx_seats_user" ON "subscription_seats" ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_one_active_user_sub" ON "subscriptions" ("user_id") WHERE "user_id" IS NOT NULL AND "status" IN ('active', 'trialing', 'past_due');--> statement-breakpoint
CREATE UNIQUE INDEX "idx_one_active_org_sub" ON "subscriptions" ("org_id") WHERE "org_id" IS NOT NULL AND "status" IN ('active', 'trialing', 'past_due');--> statement-breakpoint
CREATE INDEX "idx_subscriptions_user" ON "subscriptions" ("user_id");--> statement-breakpoint
CREATE INDEX "idx_subscriptions_org" ON "subscriptions" ("org_id");--> statement-breakpoint
CREATE INDEX "idx_subscriptions_status" ON "subscriptions" ("status");--> statement-breakpoint
CREATE INDEX "idx_users_clerk" ON "users" ("clerk_id");--> statement-breakpoint
CREATE INDEX "idx_users_active" ON "users" ("email") WHERE "deleted_at" IS NULL;--> statement-breakpoint
CREATE INDEX "idx_users_org" ON "users" ("org_id");--> statement-breakpoint
CREATE INDEX "idx_users_stripe" ON "users" ("stripe_customer_id");--> statement-breakpoint
CREATE INDEX "idx_users_profiles_username" ON "users_profiles" ("username");--> statement-breakpoint
ALTER TABLE "exercise_attempts" ADD CONSTRAINT "exercise_attempts_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "exercise_attempts" ADD CONSTRAINT "exercise_attempts_exercise_id_exercises_id_fkey" FOREIGN KEY ("exercise_id") REFERENCES "exercises"("id");--> statement-breakpoint
ALTER TABLE "exercise_events" ADD CONSTRAINT "exercise_events_attempt_id_exercise_attempts_id_fkey" FOREIGN KEY ("attempt_id") REFERENCES "exercise_attempts"("id");--> statement-breakpoint
ALTER TABLE "exercise_events" ADD CONSTRAINT "exercise_events_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "exercise_files" ADD CONSTRAINT "exercise_files_exercise_id_exercises_id_fkey" FOREIGN KEY ("exercise_id") REFERENCES "exercises"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "exercise_submissions" ADD CONSTRAINT "exercise_submissions_attempt_id_exercise_attempts_id_fkey" FOREIGN KEY ("attempt_id") REFERENCES "exercise_attempts"("id");--> statement-breakpoint
ALTER TABLE "exercise_submissions" ADD CONSTRAINT "exercise_submissions_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "exercises" ADD CONSTRAINT "exercises_created_by_users_id_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "exercises" ADD CONSTRAINT "exercises_prompt_template_id_prompt_templates_id_fkey" FOREIGN KEY ("prompt_template_id") REFERENCES "prompt_templates"("id");--> statement-breakpoint
ALTER TABLE "exercises" ADD CONSTRAINT "exercises_environment_id_exercise_environments_id_fkey" FOREIGN KEY ("environment_id") REFERENCES "exercise_environments"("id");--> statement-breakpoint
ALTER TABLE "idempotency_keys" ADD CONSTRAINT "idempotency_keys_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "payment_records" ADD CONSTRAINT "payment_records_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "payment_records" ADD CONSTRAINT "payment_records_subscription_id_subscriptions_id_fkey" FOREIGN KEY ("subscription_id") REFERENCES "subscriptions"("id");--> statement-breakpoint
ALTER TABLE "plan_prices" ADD CONSTRAINT "plan_prices_plan_id_plans_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "plans"("id");--> statement-breakpoint
ALTER TABLE "prompt_templates" ADD CONSTRAINT "prompt_templates_environment_id_exercise_environments_id_fkey" FOREIGN KEY ("environment_id") REFERENCES "exercise_environments"("id");--> statement-breakpoint
ALTER TABLE "submission_files" ADD CONSTRAINT "submission_files_submission_id_exercise_submissions_id_fkey" FOREIGN KEY ("submission_id") REFERENCES "exercise_submissions"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "subscription_seats" ADD CONSTRAINT "subscription_seats_subscription_id_subscriptions_id_fkey" FOREIGN KEY ("subscription_id") REFERENCES "subscriptions"("id");--> statement-breakpoint
ALTER TABLE "subscription_seats" ADD CONSTRAINT "subscription_seats_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "subscription_seats" ADD CONSTRAINT "subscription_seats_assigned_by_users_id_fkey" FOREIGN KEY ("assigned_by") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_org_id_organizations_id_fkey" FOREIGN KEY ("org_id") REFERENCES "organizations"("id");--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_plan_id_plans_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "plans"("id");--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_plan_price_id_plan_prices_id_fkey" FOREIGN KEY ("plan_price_id") REFERENCES "plan_prices"("id");--> statement-breakpoint
ALTER TABLE "user_learning_stats" ADD CONSTRAINT "user_learning_stats_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_org_id_organizations_id_fkey" FOREIGN KEY ("org_id") REFERENCES "organizations"("id");--> statement-breakpoint
ALTER TABLE "users_profiles" ADD CONSTRAINT "users_profiles_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;