export type TourStep = {
  id: string;
  targetSelector: string;
  title: string;
  description: string;
  side: 'top' | 'bottom' | 'left' | 'right';
};

export type PageHintDef = {
  id: string;
  targetSelector: string;
  title: string;
  description: string;
  side: 'top' | 'bottom' | 'left' | 'right';
};

export const TOUR_STEPS: TourStep[] = [
  {
    id: 'discover-hero',
    targetSelector: '[data-onboarding="discover-hero"]',
    title: 'Welcome to Signa Labs!',
    description:
      'Explore exercises, learning paths, and tools to level up your coding skills.',
    side: 'bottom',
  },
  {
    id: 'nav-exercises',
    targetSelector: '[data-onboarding="nav-exercises"]',
    title: 'Practice Exercises',
    description:
      'Browse and practice coding exercises across multiple languages and difficulty levels.',
    side: 'bottom',
  },
  {
    id: 'nav-paths',
    targetSelector: '[data-onboarding="nav-paths"]',
    title: 'Learning Paths',
    description:
      'AI-generated curricula that adapt as you improve — from beginner to advanced.',
    side: 'bottom',
  },
  {
    id: 'nav-craft',
    targetSelector: '[data-onboarding="nav-craft"]',
    title: 'Craft Exercises',
    description:
      'Generate custom exercises on any topic — just describe what you want to practice.',
    side: 'bottom',
  },
];

export const PAGE_HINTS: Record<string, PageHintDef> = {
  'exercises-craft': {
    id: 'exercises-craft',
    targetSelector: '[data-onboarding="exercises-craft"]',
    title: 'Craft an Exercise',
    description: 'Generate a custom exercise on any topic you want to practice.',
    side: 'bottom',
  },
  'paths-create': {
    id: 'paths-create',
    targetSelector: '[data-onboarding="paths-create"]',
    title: 'Create a Learning Path',
    description:
      'Create a personalized learning path that adapts to your skill level.',
    side: 'bottom',
  },
};
