import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart3, Calendar, Users, ChevronRight, FileText } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { format } from "date-fns";

interface SessionWithPresentation {
  id: string;
  presentationId: string;
  presentationTitle: string;
  code: string;
  startedAt: string;
  isActive: boolean;
  participantCount: number;
  responseCount: number;
}

export default function Report() {
  const [, setLocation] = useLocation();

  const { data: sessions = [], isLoading } = useQuery<SessionWithPresentation[]>({
    queryKey: ['/api/user/sessions'],
  });

  const activeSessions = sessions.filter(s => s.isActive);
  const completedSessions = sessions.filter(s => !s.isActive);
  
  const totalParticipants = sessions.reduce((sum, s) => sum + s.participantCount, 0);
  const totalResponses = sessions.reduce((sum, s) => sum + s.responseCount, 0);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold" data-testid="page-title">Report</h1>
          <p className="text-muted-foreground mt-1">
            View analytics and insights from your presentation sessions
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
              <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="stat-total-sessions">
                {isLoading ? <Skeleton className="h-8 w-12" /> : sessions.length}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
              <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="stat-active-sessions">
                {isLoading ? <Skeleton className="h-8 w-12" /> : activeSessions.length}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
              <CardTitle className="text-sm font-medium">Total Participants</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="stat-total-participants">
                {isLoading ? <Skeleton className="h-8 w-12" /> : totalParticipants}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
              <CardTitle className="text-sm font-medium">Total Responses</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="stat-total-responses">
                {isLoading ? <Skeleton className="h-8 w-12" /> : totalResponses}
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Session History</h2>
          
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : sessions.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No sessions yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start presenting to see your session analytics here
                </p>
                <Button onClick={() => setLocation('/presentations')} data-testid="button-go-presentations">
                  Go to Presentations
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {sessions.map((session) => (
                <Card 
                  key={session.id} 
                  className="hover-elevate cursor-pointer transition-all"
                  onClick={() => setLocation(`/session/${session.id}`)}
                  data-testid={`session-card-${session.id}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium truncate" data-testid={`session-title-${session.id}`}>
                            {session.presentationTitle}
                          </h3>
                          {session.isActive && (
                            <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full">
                              Active
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {format(new Date(session.startedAt), 'MMM d, yyyy h:mm a')}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-3.5 w-3.5" />
                            {session.participantCount} participant{session.participantCount !== 1 ? 's' : ''}
                          </span>
                          <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded">
                            {session.code}
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
