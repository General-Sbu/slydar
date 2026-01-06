import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PresentationCard from "@/components/PresentationCard";
import EmptyState from "@/components/EmptyState";
import { PlusCircle, Search, Presentation, BarChart3, Users } from "lucide-react";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import type { Presentation as PresentationType } from "@shared/schema";
import { useLocation } from "wouter";
import { useNotification } from "@/hooks/useNotification";
import { useAuth } from "@/hooks/useAuth";

type PresentationWithCount = PresentationType & { slideCount: number };

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [, setLocation] = useLocation();
  const { showNotification } = useNotification();
  const { user } = useAuth();

  const { data: presentations = [], isLoading } = useQuery<PresentationWithCount[]>({
    queryKey: ['/api/presentations'],
  });

  const createMutation = useMutation({
    mutationFn: async (): Promise<PresentationType> => {
      const res = await fetch('/api/presentations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title: 'Untitled Presentation'
        })
      });
      if (!res.ok) throw new Error('Failed to create');
      return res.json();
    },
    onSuccess: (data: PresentationType) => {
      queryClient.invalidateQueries({ queryKey: ['/api/presentations'] });
      setLocation(`/editor/${data.id}`);
    },
    onError: () => {
      showNotification("Failed to create presentation", "error");
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
      showNotification("Presentation deleted", "success");
    },
    onError: () => {
      showNotification("Failed to delete presentation", "error");
    }
  });

  const recentPresentations = presentations.slice(0, 6);
  
  const filteredPresentations = recentPresentations.filter(p =>
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

  const firstName = user?.firstName || user?.username || 'there';

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="space-y-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl lg:text-4xl font-bold tracking-tight" data-testid="page-title">
              Welcome back, {firstName}
            </h1>
            <p className="text-muted-foreground text-lg">
              Here's what's happening with your presentations
            </p>
          </div>
          <Button 
            className="gap-2 transition-smooth hover-glow"
            size="lg"
            data-testid="button-new-presentation"
            onClick={() => createMutation.mutate()}
            disabled={createMutation.isPending}
          >
            <PlusCircle className="h-5 w-5" />
            {createMutation.isPending ? "Creating..." : "New Presentation"}
          </Button>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="border-0 bg-gradient-to-br from-primary/10 to-primary/5">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Presentations</CardTitle>
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Presentation className="h-5 w-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold tracking-tight" data-testid="stat-total-presentations">
                {presentations.length}
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 bg-card/50 transition-smooth hover-lift cursor-pointer" onClick={() => setLocation('/presentations')}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">My Presentations</CardTitle>
              <div className="w-10 h-10 rounded-xl bg-chart-2/10 flex items-center justify-center">
                <Presentation className="h-5 w-5 text-chart-2" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-base font-medium">
                View and manage all your presentations
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 bg-card/50 transition-smooth hover-lift cursor-pointer" onClick={() => setLocation('/report')}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Session Reports</CardTitle>
              <div className="w-10 h-10 rounded-xl bg-chart-3/10 flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-chart-3" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-base font-medium">
                View analytics from past sessions
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold tracking-tight">Recent Presentations</h2>
            {presentations.length > 6 && (
              <Button 
                variant="ghost" 
                className="transition-smooth"
                onClick={() => setLocation('/presentations')}
                data-testid="button-view-all"
              >
                View all
              </Button>
            )}
          </div>

          {recentPresentations.length > 3 && (
            <div className="relative max-w-md mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search recent presentations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-11 h-11 bg-card/50 border-0 transition-smooth focus:bg-card"
                data-testid="input-search-presentations"
              />
            </div>
          )}

          {isLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-52 bg-muted/50 animate-pulse rounded-xl" />
              ))}
            </div>
          ) : filteredPresentations.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPresentations.map((presentation, index) => (
                <div key={presentation.id} className="animate-fade-in" style={{ animationDelay: `${index * 0.05}s` }}>
                  <PresentationCard 
                    id={presentation.id}
                    title={presentation.title}
                    slideCount={presentation.slideCount}
                    lastEdited={formatDate(presentation.updatedAt)}
                    onEdit={() => setLocation(`/editor/${presentation.id}`)}
                    onDelete={() => deleteMutation.mutate(presentation.id)}
                    onPresent={() => setLocation(`/presenter/${presentation.id}`)}
                    onAnalytics={() => setLocation(`/analytics/${presentation.id}`)}
                  />
                </div>
              ))}
            </div>
          ) : presentations.length === 0 ? (
            <EmptyState onCreate={() => createMutation.mutate()} />
          ) : (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-lg">No presentations found matching "{searchQuery}"</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
