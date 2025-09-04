import { Generator } from '@/components/lesson-forge/Generator';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function GeneratePage() {
  return (
    <main className="container mx-auto max-w-5xl px-4 py-8 md:py-12">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-headline text-3xl font-bold tracking-tight">
          HVscribe
        </h1>
        <Button asChild variant="ghost">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </Button>
      </div>
      <Generator />
    </main>
  );
}
