import Link from 'next/link';
import { Search } from 'lucide-react';

export function ExerciseCatalogLink() {
  return (
    <Link
      href="/exercises/catalog"
      className="hover:bg-accent inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium transition-colors"
    >
      <Search className="h-4 w-4" />
      Browse All
    </Link>
  );
}
