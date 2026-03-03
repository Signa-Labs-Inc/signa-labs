// src/components/exercises/exercise-filters.tsx
'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { type ExerciseCatalogFilters } from '@/lib/services/exercises/exercises.types';
import { ExerciseDifficulty, ExerciseLanguage } from '@/lib/services/exercises/exercises.constants';

const LANGUAGES = [
  { value: ExerciseLanguage.PYTHON, label: 'Python' },
  { value: ExerciseLanguage.TYPESCRIPT, label: 'TypeScript' },
  { value: ExerciseLanguage.JAVASCRIPT, label: 'JavaScript' },
  { value: ExerciseLanguage.GO, label: 'Go' },
  { value: ExerciseLanguage.RUBY, label: 'Ruby' },
  { value: ExerciseLanguage.SQL, label: 'SQL' },
];

const DIFFICULTIES = [
  { value: ExerciseDifficulty.BEGINNER, label: 'Beginner' },
  { value: ExerciseDifficulty.EASY, label: 'Easy' },
  { value: ExerciseDifficulty.MEDIUM, label: 'Medium' },
  { value: ExerciseDifficulty.HARD, label: 'Hard' },
  { value: ExerciseDifficulty.EXPERT, label: 'Expert' },
];

type ExerciseFiltersProps = {
  tags: string[];
  activeFilters: ExerciseCatalogFilters;
};

export function ExerciseFilters({ tags, activeFilters }: ExerciseFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const updateFilter = useCallback(
    (key: string, value: string | undefined) => {
      const params = new URLSearchParams(searchParams.toString());

      if (value && params.get(key) !== value) {
        params.set(key, value);
      } else {
        // Toggle off if clicking the active filter
        params.delete(key);
      }

      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams]
  );

  const clearFilters = useCallback(() => {
    router.push(pathname);
  }, [router, pathname]);

  const hasActiveFilters =
    activeFilters.language || activeFilters.difficulty || activeFilters.tag || activeFilters.search;

  return (
    <div className="mb-8 space-y-4">
      {/* Search */}
      <Input
        placeholder="Search exercises..."
        defaultValue={activeFilters.search ?? ''}
        onChange={(e) => {
          const value = e.target.value;
          // Debounce would be nice here but keeping it simple for now
          if (value.length === 0 || value.length >= 2) {
            updateFilter('search', value || undefined);
          }
        }}
        className="max-w-sm"
      />

      {/* Language filters */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-muted-foreground mr-1 text-sm font-medium">Language:</span>
        {LANGUAGES.map((lang) => (
          <Badge
            key={lang.value}
            variant={activeFilters.language === lang.value ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => updateFilter('language', lang.value)}
          >
            {lang.label}
          </Badge>
        ))}
      </div>

      {/* Difficulty filters */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-muted-foreground mr-1 text-sm font-medium">Difficulty:</span>
        {DIFFICULTIES.map((diff) => (
          <Badge
            key={diff.value}
            variant={activeFilters.difficulty === diff.value ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => updateFilter('difficulty', diff.value)}
          >
            {diff.label}
          </Badge>
        ))}
      </div>

      {/* Tag filters */}
      {tags.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-muted-foreground mr-1 text-sm font-medium">Tags:</span>
          {tags.map((tag) => (
            <Badge
              key={tag}
              variant={activeFilters.tag === tag ? 'default' : 'secondary'}
              className="cursor-pointer"
              onClick={() => updateFilter('tag', tag)}
            >
              {tag}
            </Badge>
          ))}
        </div>
      )}

      {/* Clear filters */}
      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters}>
          Clear filters
        </Button>
      )}
    </div>
  );
}
