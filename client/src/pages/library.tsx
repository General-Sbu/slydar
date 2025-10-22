import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";
import LibraryCard from "@/components/LibraryCard";
import { Search, BookOpen, Home } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Presentation } from "@shared/schema";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";

export default function Library() {
  const [searchQuery, setSearchQuery] = useState("");
  const [, setLocation] = useLocation();
  const { user } = useAuth();

  type PresentationWithDetails = Presentation & { 
    slideCount: number;
    presenterName: string;
  };
  
  const { data: presentations = [], isLoading } = useQuery<PresentationWithDetails[]>({
    queryKey: ['/api/library'],
  });

  const filteredPresentations = presentations.filter(p =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-2">
            <div>
              <Logo showText={false} className="sm:hidden" />
              <Logo showText={true} className="hidden sm:block" />
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                className="gap-2 px-2 sm:px-3"
                data-testid="button-back-home"
                onClick={() => setLocation('/')}
              >
                <Home className="h-4 w-4 shrink-0" />
                <span className="hidden sm:inline">Home</span>
              </Button>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <BookOpen className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">Slidr Library</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Browse and explore published presentations from the Slidr community
          </p>
        </div>

        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search presentations..."
              className="pl-10"
              data-testid="input-search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-48 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : filteredPresentations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <BookOpen className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-2xl font-semibold mb-2">
              {searchQuery ? "No presentations found" : "No published presentations yet"}
            </h3>
            <p className="text-muted-foreground">
              {searchQuery ? "Try a different search term" : "Check back later for published presentations"}
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredPresentations.map((presentation) => {
              const isOwner = user && presentation.userId === user.id;
              return (
                <LibraryCard
                  key={presentation.id}
                  id={presentation.id}
                  title={presentation.title}
                  slideCount={presentation.slideCount}
                  presenterName={presentation.presenterName}
                  lastEdited={formatDate(presentation.updatedAt)}
                  isOwner={!!isOwner}
                  onPresent={() => setLocation(`/presenter/${presentation.id}`)}
                  onView={() => setLocation(`/view/${presentation.id}`)}
                />
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
