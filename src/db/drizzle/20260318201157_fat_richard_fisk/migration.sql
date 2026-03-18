ALTER TABLE "notifications" ADD COLUMN "read_at" timestamp with time zone;--> statement-breakpoint
CREATE INDEX "idx_notifications_unread" ON "notifications" ("user_id") WHERE "read_at" IS NULL;