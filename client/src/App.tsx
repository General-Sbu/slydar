import { useEffect } from "react";
import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { NotificationProvider } from "@/hooks/useNotification";
import { NotificationContainer } from "@/components/NotificationContainer";
import { AuthenticatedLayout } from "@/components/AuthenticatedLayout";
import { handleRedirectResult } from "@/lib/firebase";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import Presentations from "@/pages/presentations";
import Report from "@/pages/report";
import SessionAnalytics from "@/pages/session-analytics";
import SlideResponses from "@/pages/slide-responses";
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
import Education from "@/pages/education";
import Business from "@/pages/business";
import Checkout from "@/pages/checkout";
import Templates from "@/pages/templates";
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

function ProtectedRouteWithSidebar({ component: Component }: { component: any }) {
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

  return (
    <AuthenticatedLayout>
      <Component />
    </AuthenticatedLayout>
  );
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
        <ProtectedRouteWithSidebar component={Dashboard} />
      </Route>
      <Route path="/presentations">
        <ProtectedRouteWithSidebar component={Presentations} />
      </Route>
      <Route path="/report">
        <ProtectedRouteWithSidebar component={Report} />
      </Route>
      <Route path="/session/:id">
        <ProtectedRouteWithSidebar component={SessionAnalytics} />
      </Route>
      <Route path="/session/:sessionId/slide/:slideId">
        <ProtectedRouteWithSidebar component={SlideResponses} />
      </Route>
      <Route path="/pricing" component={Pricing} />
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
      <Route path="/library" component={Library} />
      <Route path="/view/:id" component={View} />
      <Route path="/education" component={Education} />
      <Route path="/business" component={Business} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/templates">
        <ProtectedRouteWithSidebar component={Templates} />
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function FirebaseRedirectHandler() {
  useEffect(() => {
    handleRedirectResult().then((user) => {
      if (user) {
        queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      }
    });
  }, []);
  return null;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <NotificationProvider>
        <TooltipProvider>
          <FirebaseRedirectHandler />
          <NotificationContainer />
          <Router />
        </TooltipProvider>
      </NotificationProvider>
    </QueryClientProvider>
  );
}

export default App;
