/**
 * Exercise Categories
 *
 * Maps display categories to underlying exercise tags.
 * Each category defines a label, description, icon key, and the tags
 * used to query matching exercises.
 *
 * Categories are now stored in the `exercise_categories` DB table.
 */

import { db } from '@/index';
import { exerciseCategories } from '@/db/schema/tables/exercise_categories';
import { eq, asc } from 'drizzle-orm';

export type ExerciseCategory = {
  id?: string;
  slug: string;
  label: string;
  description: string;
  /** lucide-react icon name — resolved in the UI layer */
  icon: string;
  /** Exercises matching ANY of these tags belong to this category */
  tags: string[];
};

/** Get all active categories from DB, ordered by sortOrder */
export async function getActiveCategories(): Promise<ExerciseCategory[]> {
  const rows = await db
    .select({
      id: exerciseCategories.id,
      slug: exerciseCategories.slug,
      label: exerciseCategories.label,
      description: exerciseCategories.description,
      icon: exerciseCategories.icon,
      tags: exerciseCategories.tags,
    })
    .from(exerciseCategories)
    .where(eq(exerciseCategories.isActive, true))
    .orderBy(asc(exerciseCategories.sortOrder));

  return rows;
}

/** Look up a category by slug from DB */
export async function getCategoryBySlug(slug: string): Promise<ExerciseCategory | undefined> {
  const [row] = await db
    .select({
      id: exerciseCategories.id,
      slug: exerciseCategories.slug,
      label: exerciseCategories.label,
      description: exerciseCategories.description,
      icon: exerciseCategories.icon,
      tags: exerciseCategories.tags,
    })
    .from(exerciseCategories)
    .where(eq(exerciseCategories.slug, slug));

  return row ?? undefined;
}
