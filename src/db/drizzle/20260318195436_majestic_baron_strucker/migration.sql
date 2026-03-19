CREATE TABLE "subscription_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" uuid NOT NULL,
	"subscription_id" uuid,
	"type" text NOT NULL,
	"description" text NOT NULL,
	"metadata" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "subscription_events_type_check" CHECK ("type" IN ('created', 'upgraded', 'downgraded', 'cancelled', 'reactivated', 'renewed', 'payment_failed'))
);
--> statement-breakpoint
CREATE INDEX "idx_subscription_events_user" ON "subscription_events" ("user_id");--> statement-breakpoint
CREATE INDEX "idx_subscription_events_sub" ON "subscription_events" ("subscription_id");--> statement-breakpoint
CREATE INDEX "idx_subscription_events_created" ON "subscription_events" ("created_at");--> statement-breakpoint
ALTER TABLE "subscription_events" ADD CONSTRAINT "subscription_events_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "subscription_events" ADD CONSTRAINT "subscription_events_subscription_id_subscriptions_id_fkey" FOREIGN KEY ("subscription_id") REFERENCES "subscriptions"("id");