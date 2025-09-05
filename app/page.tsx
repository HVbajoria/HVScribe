import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { BookOpenCheck } from 'lucide-react';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 text-center">
      <div className="flex flex-col items-center gap-6">
        <div className="rounded-full bg-primary/10 p-4 text-primary">
          <BookOpenCheck className="h-12 w-12" />
        </div>
        <h1 className="font-headline text-5xl font-bold tracking-tight md:text-7xl">
          HVscribe
        </h1>
        <p className="max-w-2xl text-lg text-foreground/80 md:text-xl">
          Welcome to HVscribe, your AI-powered assistant for creating engaging textual lessons. Simply provide your content, and let us handle the rest.
        </p>
        <Button asChild size="lg" className="font-headline text-lg animate-pulse-slow" variant="accent">
          <Link href="/generate">Get Started</Link>
        </Button>
      </div>
      <footer className="absolute bottom-4 text-sm text-foreground/60">
        <p>Powered by Gemini 2.0 Flash Lite</p>
      </footer>
    </main>
  );
}
