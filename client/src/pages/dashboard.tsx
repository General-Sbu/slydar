import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";
import PresentationCard from "@/components/PresentationCard";
import EmptyState from "@/components/EmptyState";
import { PlusCircle, Search, LogOut, StickyNote, BookOpen } from "lucide-react";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Presentation } from "@shared/schema";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { logout } from "@/lib/authUtils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();

  type PresentationWithCount = Presentation & { slideCount: number };
  
  const { data: presentations = [], isLoading } = useQuery<PresentationWithCount[]>({
    queryKey: ['/api/presentations'],
  });

  const createMutation = useMutation({
    mutationFn: async (): Promise<Presentation> => {
      const res = await fetch('/api/presentations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Untitled Presentation' })
      });
      if (!res.ok) throw new Error('Failed to create');
      return res.json();
    },
    onSuccess: (data: Presentation) => {
      queryClient.invalidateQueries({ queryKey: ['/api/presentations'] });
      setLocation(`/editor/${data.id}`);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create presentation",
        variant: "destructive"
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/presentations/${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Failed to delete');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/presentations'] });
      toast({
        title: "Success",
        description: "Presentation deleted"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete presentation",
        variant: "destructive"
      });
    }
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
          <div className="flex h-16 items-center justify-between gap-4">
            <Logo />
            
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                className="gap-2"
                data-testid="button-library"
                onClick={() => setLocation('/library')}
              >
                <BookOpen className="h-4 w-4" />
                <span className="hidden sm:inline">Library</span>
              </Button>
              <Button 
                variant="default" 
                className="gap-2"
                data-testid="button-new-presentation"
                onClick={() => createMutation.mutate()}
                disabled={createMutation.isPending}
              >
                <PlusCircle className="h-4 w-4" />
                <span className="hidden sm:inline">New Presentation</span>
              </Button>
              <ThemeToggle />
              <DropdownMenu>
                <DropdownMenuTrigger asChild data-testid="button-user-menu">
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback>
                        {user?.firstName?.[0] ?? user?.username?.[0]?.toUpperCase() ?? "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none" data-testid="text-user-name">
                        {user?.firstName && user?.lastName 
                          ? `${user.firstName} ${user.lastName}` 
                          : user?.firstName ?? user?.username ?? "User"}
                      </p>
                      {user?.email && (
                        <p className="text-xs leading-none text-muted-foreground" data-testid="text-user-email">
                          {user.email}
                        </p>
                      )}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setLocation('/notes')} data-testid="button-my-notes">
                    <StickyNote className="mr-2 h-4 w-4" />
                    <span>My Notes</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={logout} data-testid="button-logout">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">My Presentations</h1>
              <p className="text-muted-foreground mt-1">
                Create and manage your interactive presentations
              </p>
            </div>
          </div>

          {presentations.length > 0 && (
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search presentations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-search-presentations"
              />
            </div>
          )}

          {isLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-48 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          ) : filteredPresentations.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPresentations.map((presentation) => (
                <PresentationCard 
                  key={presentation.id} 
                  id={presentation.id}
                  title={presentation.title}
                  slideCount={presentation.slideCount}
                  lastEdited={formatDate(presentation.updatedAt)}
                  onEdit={() => setLocation(`/editor/${presentation.id}`)}
                  onDelete={() => deleteMutation.mutate(presentation.id)}
                  onPresent={() => setLocation(`/presenter/${presentation.id}`)}
                />
              ))}
            </div>
          ) : presentations.length === 0 ? (
            <EmptyState onCreate={() => createMutation.mutate()} />
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No presentations found matching "{searchQuery}"</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
