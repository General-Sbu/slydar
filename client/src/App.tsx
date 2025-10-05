import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import Editor from "@/pages/editor";
import Presenter from "@/pages/presenter";
import Audience from "@/pages/audience";
import Notes from "@/pages/notes";
import JoinPresentation from "@/components/JoinPresentation";
import NotFound from "@/pages/not-found";

function ProtectedRoute({ component: Component, path }: { component: any; path?: string }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Redirect to="/" />;
  }

  return <Component />;
}

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      <Route path="/">
        {isLoading ? (
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-muted-foreground">Loading...</div>
          </div>
        ) : isAuthenticated ? (
          <Redirect to="/dashboard" />
        ) : (
          <Landing />
        )}
      </Route>
      <Route path="/dashboard">
        <ProtectedRoute component={Dashboard} />
      </Route>
      <Route path="/editor/:id?">
        <ProtectedRoute component={Editor} />
      </Route>
      <Route path="/presenter/:id?">
        <ProtectedRoute component={Presenter} />
      </Route>
      <Route path="/notes">
        <ProtectedRoute component={Notes} />
      </Route>
      <Route path="/join" component={JoinPresentation} />
      <Route path="/audience/:code" component={Audience} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
