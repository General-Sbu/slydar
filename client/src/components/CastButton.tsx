import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Monitor, Tv, Loader2, WifiOff, Cast, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useNotification } from "@/hooks/useNotification";

interface CastButtonProps {
  presentationUrl: string;
}

export default function CastButton({ presentationUrl }: CastButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [presentationRequest, setPresentationRequest] = useState<any>(null);
  const [connection, setConnection] = useState<any>(null);
  const { showNotification } = useNotification();

  useEffect(() => {
    if ('PresentationRequest' in window) {
      const PresentationRequestConstructor = (window as any).PresentationRequest;
      const request = new PresentationRequestConstructor([presentationUrl]);
      setPresentationRequest(request);

      request.getAvailability()
        .then((availability: any) => {
          setIsAvailable(availability.value);
          availability.addEventListener('change', () => {
            setIsAvailable(availability.value);
          });
        })
        .catch(() => {
          setIsAvailable(false);
        });
    }
  }, [presentationUrl]);

  const handleStartCasting = async () => {
    if (!presentationRequest) {
      showNotification("Casting is not supported on this device", "error");
      return;
    }

    setIsConnecting(true);
    try {
      const newConnection = await presentationRequest.start();
      setConnection(newConnection);
      
      newConnection.addEventListener('connect', () => {
        showNotification("Successfully connected to display", "success");
        setIsDialogOpen(false);
      });

      newConnection.addEventListener('close', () => {
        showNotification("Casting session ended", "info");
        setConnection(null);
      });

      newConnection.addEventListener('terminate', () => {
        setConnection(null);
      });

    } catch (error: any) {
      if (error.name !== 'NotAllowedError' && error.name !== 'AbortError') {
        showNotification("Failed to connect to display", "error");
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const handleStopCasting = () => {
    if (connection) {
      connection.terminate();
      setConnection(null);
      showNotification("Stopped casting", "info");
    }
  };

  if (!('PresentationRequest' in window)) {
    return null;
  }

  return (
    <>
      {connection ? (
        <Button
          variant="default"
          size="default"
          onClick={handleStopCasting}
          className="gap-2"
          data-testid="button-stop-cast"
        >
          <Cast className="h-4 w-4" />
          <span className="hidden sm:inline">Casting</span>
          <X className="h-3 w-3" />
        </Button>
      ) : (
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsDialogOpen(true)}
          disabled={!isAvailable}
          title={isAvailable ? "Cast to TV" : "No casting devices available"}
          data-testid="button-cast"
        >
          <Cast className="h-4 w-4" />
        </Button>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent data-testid="dialog-cast">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Tv className="h-5 w-5" />
              Cast to Display
            </DialogTitle>
            <DialogDescription>
              Cast this presentation to a TV screen or other compatible display device
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-4">
            {!isAvailable ? (
              <Card className="p-6">
                <div className="flex flex-col items-center text-center gap-3">
                  <WifiOff className="h-12 w-12 text-muted-foreground" />
                  <div>
                    <h3 className="font-semibold mb-1">No Devices Found</h3>
                    <p className="text-sm text-muted-foreground">
                      Make sure your casting device (Chromecast, Smart TV, etc.) is on the same network
                    </p>
                  </div>
                </div>
              </Card>
            ) : (
              <>
                <Card className="p-6">
                  <div className="flex items-start gap-3">
                    <Monitor className="h-10 w-10 text-primary mt-1" />
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">Available Devices</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Click the button below to search for nearby casting devices
                      </p>
                      <Button
                        onClick={handleStartCasting}
                        disabled={isConnecting}
                        className="w-full gap-2"
                        data-testid="button-search-devices"
                      >
                        {isConnecting ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Searching for devices...
                          </>
                        ) : (
                          <>
                            <Cast className="h-4 w-4" />
                            Search & Connect
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </Card>

                <Card className="p-4 bg-muted/50">
                  <div className="text-sm space-y-2">
                    <p className="font-medium">Supported Devices:</p>
                    <ul className="list-disc list-inside text-muted-foreground space-y-1">
                      <li>Google Chromecast</li>
                      <li>Smart TVs with casting support</li>
                      <li>AirPlay-compatible devices</li>
                      <li>Other devices supporting the Presentation API</li>
                    </ul>
                  </div>
                </Card>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
