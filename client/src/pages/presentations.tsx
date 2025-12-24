import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PresentationCard from "@/components/PresentationCard";
import EmptyState from "@/components/EmptyState";
import { PlusCircle, Search } from "lucide-react";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import type { Presentation } from "@shared/schema";
import { useLocation } from "wouter";
import { useNotification } from "@/hooks/useNotification";

type PresentationWithCount = Presentation & { slideCount: number };

export default function Presentations() {
  const [searchQuery, setSearchQuery] = useState("");
  const [, setLocation] = useLocation();
  const { showNotification } = useNotification();

  const { data: presentations = [], isLoading } = useQuery<PresentationWithCount[]>({
    queryKey: ['/api/presentations'],
  });

  const createMutation = useMutation({
    mutationFn: async (): Promise<Presentation> => {
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
    onSuccess: (data: Presentation) => {
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

  const renameMutation = useMutation({
    mutationFn: async ({ id, title }: { id: string; title: string }) => {
      const res = await fetch(`/api/presentations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title })
      });
      if (!res.ok) throw new Error('Failed to rename');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/presentations'] });
      showNotification("Presentation renamed", "success");
    },
    onError: () => {
      showNotification("Failed to rename presentation", "error");
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
    <div className="p-6 max-w-7xl mx-auto">
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold" data-testid="page-title">My Presentations</h1>
            <p className="text-muted-foreground mt-1">
              Create and manage your interactive presentations
            </p>
          </div>
          <Button 
            className="gap-2"
            data-testid="button-new-presentation"
            onClick={() => createMutation.mutate()}
            disabled={createMutation.isPending}
          >
            <PlusCircle className="h-4 w-4" />
            {createMutation.isPending ? "Creating..." : "New Presentation"}
          </Button>
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
                onAnalytics={() => setLocation(`/analytics/${presentation.id}`)}
                onRename={(newName) => renameMutation.mutate({ id: presentation.id, title: newName })}
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
    </div>
  );
}
