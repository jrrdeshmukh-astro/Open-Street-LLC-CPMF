import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, AlertCircle, Link as LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function AdminView() {
  const { data: publicData, isLoading } = useQuery({
    queryKey: ["/api/admin/public-view"],
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  const { data: adminStats } = useQuery({
    queryKey: ["/api/admin/stats"],
    enabled: false // Only fetch when authenticated
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold font-serif mb-2">CPMF Admin Public View</h1>
            <p className="text-muted-foreground">Integration status and system overview</p>
          </div>
          <Link href="/dashboard">
            <Button variant="outline">Go to Dashboard</Button>
          </Link>
        </div>

        {/* Integrations Status */}
        <Card>
          <CardHeader>
            <CardTitle className="font-serif">Integration Status</CardTitle>
            <CardDescription>Current status of all integrated services</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {publicData?.integrations && Object.entries(publicData.integrations).map(([key, integration]: [string, any]) => (
                <div key={key} className="p-4 border rounded-lg flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium capitalize">{key}</h3>
                      {integration.configured ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{integration.description}</p>
                  </div>
                  <Badge variant={integration.configured ? "default" : "secondary"}>
                    {integration.configured ? "Active" : "Inactive"}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Features Status */}
        <Card>
          <CardHeader>
            <CardTitle className="font-serif">Features</CardTitle>
            <CardDescription>Available features and capabilities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {publicData?.features && Object.entries(publicData.features).map(([key, feature]: [string, any]) => (
                <div key={key} className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</h3>
                    {feature.enabled ? (
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-yellow-600" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Replit Integration */}
        {publicData?.replit && (
          <Card>
            <CardHeader>
              <CardTitle className="font-serif flex items-center gap-2">
                <LinkIcon className="w-5 h-5" />
                Replit Integration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{publicData.replit.description}</p>
                  <p className="text-xs text-muted-foreground">Status: {publicData.replit.connected ? "Connected" : "Not Connected"}</p>
                </div>
                <Badge variant={publicData.replit.connected ? "default" : "secondary"}>
                  {publicData.replit.connected ? "Active" : "Inactive"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {/* System Info */}
        <Card>
          <CardHeader>
            <CardTitle className="font-serif">System Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last Updated:</span>
                <span>{publicData?.timestamp ? new Date(publicData.timestamp).toLocaleString() : "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Environment:</span>
                <span>{process.env.NODE_ENV || "development"}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Visualization Guide */}
        <Card>
          <CardHeader>
            <CardTitle className="font-serif">Visualization Guide</CardTitle>
            <CardDescription>How to interpret the integration status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-medium mb-1">Active Integration</h4>
                  <p className="text-sm text-muted-foreground">Service is configured and ready to use. API credentials are set and the integration is functional.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <XCircle className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <h4 className="font-medium mb-1">Inactive Integration</h4>
                  <p className="text-sm text-muted-foreground">Service is not configured. Configure API credentials in the Dashboard settings to activate.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="font-medium mb-1">Feature Available</h4>
                  <p className="text-sm text-muted-foreground">Feature is enabled and available for use. May require integration setup for full functionality.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

