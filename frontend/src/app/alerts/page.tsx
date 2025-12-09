"use client";

import { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Sidebar } from '@/components/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert } from '@/types';
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    // Simulate loading alerts - in real app, this would be an API call
    setTimeout(() => {
      const mockAlerts: Alert[] = [
        {
          id: '1',
          type: 'error',
          message: 'Failed to sync note with ID 12345',
          timestamp: new Date().toISOString(),
          resolved: false,
        },
        {
          id: '2',
          type: 'warning',
          message: 'API rate limit approaching (80% used)',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          resolved: false,
        },
        {
          id: '3',
          type: 'info',
          message: 'System maintenance scheduled for tomorrow',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          resolved: false,
        },
        {
          id: '4',
          type: 'success',
          message: 'All notes successfully backed up',
          timestamp: new Date(Date.now() - 86400000).toISOString(),
          resolved: true,
        },
      ];
      setAlerts(mockAlerts);
      setLoading(false);
    }, 500);
  };

  const handleResolve = (id: string) => {
    setAlerts(alerts.map(alert => 
      alert.id === id ? { ...alert, resolved: true } : alert
    ));
  };

  const handleDismiss = (id: string) => {
    setAlerts(alerts.filter(alert => alert.id !== id));
  };

  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'error':
        return <AlertCircle className="h-5 w-5 text-destructive" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'success':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getAlertBadge = (type: Alert['type']) => {
    const variants: Record<Alert['type'], string> = {
      error: 'destructive',
      warning: 'default',
      success: 'default',
      info: 'secondary',
    };

    const colors: Record<Alert['type'], string> = {
      error: '',
      warning: 'bg-yellow-500 hover:bg-yellow-600',
      success: 'bg-green-500 hover:bg-green-600',
      info: '',
    };

    return (
      <Badge variant={variants[type] as any} className={colors[type]}>
        {type.toUpperCase()}
      </Badge>
    );
  };

  const unresolvedAlerts = alerts.filter(a => !a.resolved);
  const resolvedAlerts = alerts.filter(a => a.resolved);

  return (
    <ProtectedRoute>
      <div className="flex">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <div className="container py-8">
            <div className="mb-8">
              <h1 className="mb-2 text-3xl font-bold">Alerts</h1>
              <p className="text-muted-foreground">
                Monitor system notifications and API issues
              </p>
            </div>

            <div className="mb-6 grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Total Alerts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{alerts.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Unresolved</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-destructive">{unresolvedAlerts.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Resolved</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-500">{resolvedAlerts.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Critical</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {alerts.filter(a => a.type === 'error' && !a.resolved).length}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <div>
                <h2 className="mb-4 text-xl font-semibold">Unresolved Alerts</h2>
                <div className="space-y-3">
                  {loading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <Card key={i}>
                        <CardContent className="p-4">
                          <div className="flex items-start gap-4">
                            <Skeleton className="h-5 w-5 rounded" />
                            <div className="flex-1 space-y-2">
                              <Skeleton className="h-4 w-3/4" />
                              <Skeleton className="h-3 w-1/2" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : unresolvedAlerts.length === 0 ? (
                    <Card>
                      <CardContent className="p-8 text-center text-muted-foreground">
                        No unresolved alerts
                      </CardContent>
                    </Card>
                  ) : (
                    unresolvedAlerts.map(alert => (
                      <Card key={alert.id}>
                        <CardContent className="p-4">
                          <div className="flex items-start gap-4">
                            {getAlertIcon(alert.type)}
                            <div className="flex-1">
                              <div className="mb-2 flex items-center gap-2">
                                {getAlertBadge(alert.type)}
                                <span className="text-sm text-muted-foreground">
                                  {new Date(alert.timestamp).toLocaleString()}
                                </span>
                              </div>
                              <p className="text-sm">{alert.message}</p>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleResolve(alert.id)}
                              >
                                <CheckCircle2 className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDismiss(alert.id)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </div>

              {resolvedAlerts.length > 0 && (
                <div>
                  <h2 className="mb-4 text-xl font-semibold">Resolved Alerts</h2>
                  <div className="space-y-3">
                    {resolvedAlerts.map(alert => (
                      <Card key={alert.id} className="opacity-60">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-4">
                            {getAlertIcon(alert.type)}
                            <div className="flex-1">
                              <div className="mb-2 flex items-center gap-2">
                                {getAlertBadge(alert.type)}
                                <Badge variant="outline" className="bg-green-500/10">
                                  RESOLVED
                                </Badge>
                                <span className="text-sm text-muted-foreground">
                                  {new Date(alert.timestamp).toLocaleString()}
                                </span>
                              </div>
                              <p className="text-sm">{alert.message}</p>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDismiss(alert.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
