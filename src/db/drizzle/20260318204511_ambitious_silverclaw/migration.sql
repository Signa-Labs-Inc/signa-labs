DROP INDEX "idx_notifications_unread";--> statement-breakpoint
CREATE INDEX "idx_notifications_unread" ON "notifications" ("user_id") WHERE "read_at" IS NULL;--> statement-breakpoint
ALTER TABLE "payment_records" ADD CONSTRAINT "payment_records_stripe_invoice_id_key" UNIQUE("stripe_invoice_id");