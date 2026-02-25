ALTER TABLE "exercise_events" DROP CONSTRAINT "exercise_events_attempt_id_exercise_attempts_id_fkey";--> statement-breakpoint
ALTER TABLE "exercise_events" DROP CONSTRAINT "exercise_events_user_id_users_id_fkey";--> statement-breakpoint
ALTER TABLE "subscriptions" DROP CONSTRAINT "subscriptions_plan_id_plans_id_fkey";--> statement-breakpoint
ALTER TABLE "subscriptions" DROP CONSTRAINT "subscriptions_plan_price_id_plan_prices_id_fkey";--> statement-breakpoint
ALTER TABLE "payment_records" ALTER COLUMN "paid_at" DROP NOT NULL;--> statement-breakpoint
DROP INDEX "idx_seats_unique";--> statement-breakpoint
CREATE UNIQUE INDEX "idx_seats_unique" ON "subscription_seats" ("subscription_id","user_id") WHERE "removed_at" IS NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "idx_attempts_id_user" ON "exercise_attempts" ("id","user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_plan_prices_id_plan" ON "plan_prices" ("id","plan_id");--> statement-breakpoint
ALTER TABLE "exercise_events" ADD CONSTRAINT "fk_events_attempt_user" FOREIGN KEY ("attempt_id","user_id") REFERENCES "exercise_attempts"("id","user_id");--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "fk_subscriptions_plan" FOREIGN KEY ("plan_id") REFERENCES "plans"("id");--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "fk_subscriptions_price_plan" FOREIGN KEY ("plan_price_id","plan_id") REFERENCES "plan_prices"("id","plan_id");--> statement-breakpoint
ALTER TABLE "exercise_attempts" ADD CONSTRAINT "exercise_attempts_nonnegative_hints" CHECK ("hints_revealed" >= 0);--> statement-breakpoint
ALTER TABLE "exercise_attempts" ADD CONSTRAINT "exercise_attempts_nonnegative_time" CHECK ("time_spent_seconds" >= 0);--> statement-breakpoint
ALTER TABLE "exercise_attempts" ADD CONSTRAINT "exercise_attempts_completed_at_required" CHECK ("status" != 'completed' OR "completed_at" IS NOT NULL);