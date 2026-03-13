/**
 * Exercise Categories
 *
 * Maps display categories to underlying exercise tags.
 * Each category defines a label, description, icon key, and the tags
 * used to query matching exercises.
 */

export type ExerciseCategory = {
  slug: string;
  label: string;
  description: string;
  /** lucide-react icon name — resolved in the UI layer */
  icon: string;
  /** Exercises matching ANY of these tags belong to this category */
  tags: string[];
};

/**
 * Ordered list of categories shown on the exercises page.
 * The order here determines display order.
 */
export const EXERCISE_CATEGORIES: ExerciseCategory[] = [
  {
    slug: 'interview-prep',
    label: 'Interview Prep',
    description: 'Classic problems you will encounter in technical interviews.',
    icon: 'BriefcaseBusiness',
    tags: ['algorithms', 'hash-map', 'two-pointers', 'binary-search', 'interview'],
  },
  {
    slug: 'data-structures',
    label: 'Data Structures & Algorithms',
    description: 'Master fundamental data structures and algorithmic patterns.',
    icon: 'Layers',
    tags: ['linked-list', 'stack', 'data-structures', 'arrays', 'recursion', 'sorting', 'trees', 'graphs'],
  },
  {
    slug: 'web-fundamentals',
    label: 'Web Fundamentals',
    description: 'Core JavaScript and TypeScript patterns every developer should know.',
    icon: 'Globe',
    tags: ['closures', 'timers', 'javascript-patterns', 'promises', 'async', 'dom', 'web-apis'],
  },
  {
    slug: 'react',
    label: 'React & Frontend',
    description: 'Build interactive UIs with React hooks, state, and component patterns.',
    icon: 'Atom',
    tags: ['react', 'hooks', 'state-management', 'components', 'frontend'],
  },
  {
    slug: 'python',
    label: 'Python Essentials',
    description: 'From basics to advanced patterns in Python.',
    icon: 'Terminal',
    tags: ['loops', 'conditionals', 'beginner', 'python-patterns', 'comprehensions', 'decorators'],
  },
];

/** Look up a category by slug */
export function getCategoryBySlug(slug: string): ExerciseCategory | undefined {
  return EXERCISE_CATEGORIES.find((c) => c.slug === slug);
}
