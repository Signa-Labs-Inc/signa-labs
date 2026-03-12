'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { type ExerciseCatalogFilters } from '@/lib/services/exercises/exercises.types';
import {
  ExerciseDifficulty,
  ExerciseLanguage,
} from '@/lib/services/exercises/exercises.constants';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { LanguageIcon } from '@/components/ui/language-icon';

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
  resultCount: number;
};

export function ExerciseFilters({
  tags,
  activeFilters,
  resultCount,
}: ExerciseFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(
    !!(activeFilters.language || activeFilters.difficulty || activeFilters.tag)
  );

  const updateFilter = useCallback(
    (key: string, value: string | undefined) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value && params.get(key) !== value) {
        params.set(key, value);
      } else {
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
    activeFilters.language ||
    activeFilters.difficulty ||
    activeFilters.tag ||
    activeFilters.search;

  const activeFilterCount = [
    activeFilters.language,
    activeFilters.difficulty,
    activeFilters.tag,
  ].filter(Boolean).length;

  return (
    <div className="space-y-3">
      {/* Search bar + filter toggle */}
      <div className="flex items-center gap-2">
        <div className="group relative flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
          <Input
            placeholder="Search by title, language, or topic..."
            defaultValue={activeFilters.search ?? ''}
            onChange={(e) => {
              const value = e.target.value;
              if (value.length === 0 || value.length >= 2) {
                updateFilter('search', value || undefined);
              }
            }}
            className="h-11 rounded-xl border-border/60 bg-card pl-10 pr-4 text-base shadow-sm transition-all placeholder:text-muted-foreground/60 focus-visible:border-primary/40 focus-visible:shadow-md focus-visible:shadow-primary/5 md:text-sm"
          />
        </div>
        <Button
          variant={filtersOpen ? 'secondary' : 'outline'}
          onClick={() => setFiltersOpen(!filtersOpen)}
          className="h-11 shrink-0 gap-1.5 rounded-xl px-4"
        >
          <SlidersHorizontal className="h-4 w-4" />
          <span className="hidden sm:inline">Filters</span>
          {activeFilterCount > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
              {activeFilterCount}
            </span>
          )}
        </Button>
      </div>

      {/* Expandable filter panel */}
      {filtersOpen && (
        <div className="animate-fade-in rounded-lg border border-border bg-linear-to-br from-card via-card to-primary/5 p-4 space-y-4">
          {/* Language */}
          <div>
            <span className="text-muted-foreground mb-2 block text-xs font-medium uppercase tracking-wider">
              Language
            </span>
            <div className="flex flex-wrap gap-1.5">
              {LANGUAGES.map((lang) => (
                <Badge
                  key={lang.value}
                  variant={
                    activeFilters.language === lang.value
                      ? 'default'
                      : 'outline'
                  }
                  className="cursor-pointer gap-1.5"
                  onClick={() => updateFilter('language', lang.value)}
                >
                  <LanguageIcon language={lang.value} className="h-3.5 w-3.5" />
                  {lang.label}
                </Badge>
              ))}
            </div>
          </div>

          {/* Difficulty */}
          <div>
            <span className="text-muted-foreground mb-2 block text-xs font-medium uppercase tracking-wider">
              Difficulty
            </span>
            <div className="flex flex-wrap gap-1.5">
              {DIFFICULTIES.map((diff) => (
                <Badge
                  key={diff.value}
                  variant={
                    activeFilters.difficulty === diff.value
                      ? 'default'
                      : 'outline'
                  }
                  className="cursor-pointer"
                  onClick={() => updateFilter('difficulty', diff.value)}
                >
                  {diff.label}
                </Badge>
              ))}
            </div>
          </div>

          {/* Tags */}
          {tags.length > 0 && (
            <div>
              <span className="text-muted-foreground mb-2 block text-xs font-medium uppercase tracking-wider">
                Topics
              </span>
              <div className="flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant={
                      activeFilters.tag === tag ? 'default' : 'secondary'
                    }
                    className="cursor-pointer"
                    onClick={() => updateFilter('tag', tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Result count + clear */}
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">
          {resultCount} {resultCount === 1 ? 'exercise' : 'exercises'}
          {hasActiveFilters ? ' found' : ''}
        </p>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-7 gap-1 px-2 text-xs"
          >
            <X className="h-3 w-3" />
            Clear filters
          </Button>
        )}
      </div>
    </div>
  );
}
