ALTER TABLE "learning_paths" ADD COLUMN "is_featured" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "learning_paths" ADD COLUMN "featured_order" integer;--> statement-breakpoint
CREATE INDEX "idx_learning_paths_featured" ON "learning_paths" ("is_featured","featured_order") WHERE "is_featured" = true;