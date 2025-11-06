import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { NotificationProvider } from "@/hooks/useNotification";
import { NotificationContainer } from "@/components/NotificationContainer";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import Editor from "@/pages/editor";
import Presenter from "@/pages/presenter";
import Audience from "@/pages/audience";
import Notes from "@/pages/notes";
import FeedbackView from "@/pages/feedback";
import Analytics from "@/pages/analytics";
import JoinPresentation from "@/components/JoinPresentation";
import Pricing from "@/pages/pricing";
import Library from "@/pages/library";
import View from "@/pages/view";
import Onboarding from "@/pages/onboarding";
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
  const { isAuthenticated, isLoading, user } = useAuth();

  return (
    <Switch>
      <Route path="/">
        {isLoading ? (
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-muted-foreground">Loading...</div>
          </div>
        ) : isAuthenticated ? (
          <Redirect to={!user?.onboardingComplete ? "/onboarding" : "/dashboard"} />
        ) : (
          <Landing />
        )}
      </Route>
      <Route path="/onboarding">
        <ProtectedRoute component={Onboarding} />
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
      <Route path="/feedback/:sessionId">
        <ProtectedRoute component={FeedbackView} />
      </Route>
      <Route path="/analytics/:id">
        <ProtectedRoute component={Analytics} />
      </Route>
      <Route path="/join" component={JoinPresentation} />
      <Route path="/audience/:code" component={Audience} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/library" component={Library} />
      <Route path="/view/:id" component={View} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <NotificationProvider>
        <TooltipProvider>
          <NotificationContainer />
          <Router />
        </TooltipProvider>
      </NotificationProvider>
    </QueryClientProvider>
  );
}

export default App;
