import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";
import PresentationCard from "@/components/PresentationCard";
import EmptyState from "@/components/EmptyState";
import { PlusCircle, Search } from "lucide-react";
import { useState } from "react";

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [presentations] = useState([
    {
      id: "1",
      title: "Product Launch Q4",
      slideCount: 12,
      participantCount: 45,
      lastEdited: "2 hours ago",
      isLive: true
    },
    {
      id: "2",
      title: "Team Feedback Survey",
      slideCount: 8,
      participantCount: 0,
      lastEdited: "Yesterday",
      isLive: false
    },
    {
      id: "3",
      title: "Customer Satisfaction Poll",
      slideCount: 15,
      participantCount: 128,
      lastEdited: "3 days ago",
      isLive: false
    }
  ]);

  const filteredPresentations = presentations.filter(p =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4">
            <Logo />
            
            <div className="flex items-center gap-3">
              <Button 
                variant="default" 
                className="gap-2"
                data-testid="button-new-presentation"
              >
                <PlusCircle className="h-4 w-4" />
                <span className="hidden sm:inline">New Presentation</span>
              </Button>
              <ThemeToggle />
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

          {filteredPresentations.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPresentations.map((presentation) => (
                <PresentationCard key={presentation.id} {...presentation} />
              ))}
            </div>
          ) : presentations.length === 0 ? (
            <EmptyState />
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
