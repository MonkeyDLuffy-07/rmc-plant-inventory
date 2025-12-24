"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, AlertTriangle, CheckCircle, Trash2 } from "lucide-react";
import { getAlerts, getMaterials, markAlertAsRead, deleteAlert, isAlertRead, type Alert, type Material } from "@/lib/storage";
import { format } from "date-fns";

export function AlertsList() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [alertsData, materialsData] = await Promise.all([
      getAlerts(),
      getMaterials(),
    ]);
    const alertsWithReadStatus = alertsData.map((a) => ({
      ...a,
      isRead: isAlertRead(a.id),
    }));
    setAlerts(alertsWithReadStatus);
    setMaterials(materialsData);
    setLoading(false);
  };

  const getMaterialName = (materialId: string) => {
    const material = materials.find((m) => m.id === materialId);
    return material?.name || "Unknown Material";
  };

  const getMaterial = (materialId: string) => {
    return materials.find((m) => m.id === materialId);
  };

  const handleMarkAsRead = (id: string) => {
    markAlertAsRead(id);
    loadData();
  };

  const handleDelete = (id: string) => {
    deleteAlert(id);
    loadData();
  };

  const filteredAlerts = alerts.filter((a) => {
    if (filter === "unread") return !a.isRead;
    if (filter === "read") return a.isRead;
    return true;
  });

  const unreadCount = alerts.filter((a) => !a.isRead).length;

  const getAlertIcon = (alert: Alert) => {
    if (alert.type === "out_of_stock") return <AlertCircle className="h-5 w-5 text-destructive" />;
    if (alert.severity === "high") return <AlertTriangle className="h-5 w-5 text-warning" />;
    if (alert.severity === "medium") return <AlertTriangle className="h-5 w-5 text-orange-400" />;
    return <CheckCircle className="h-5 w-5 text-info" />;
  };

  const getAlertColor = (alert: Alert) => {
    if (alert.type === "out_of_stock" || alert.severity === "high")
      return "border-destructive/20 bg-destructive/5";
    if (alert.severity === "medium") return "border-warning/20 bg-warning/5";
    return "border-info/20 bg-info/5";
  };

  if (loading) {
    return <div className="text-center py-8">Loading alerts...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{alerts.length}</p>
            <p className="text-xs text-muted-foreground">All notifications</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Unread Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{unreadCount}</p>
            <p className="text-xs text-muted-foreground">Require attention</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Critical Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {alerts.filter((a) => a.severity === "high" || a.type === "out_of_stock").length}
            </p>
            <p className="text-xs text-muted-foreground">High priority</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          variant={filter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("all")}
        >
          All Alerts
        </Button>
        <Button
          variant={filter === "unread" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("unread")}
        >
          Unread ({unreadCount})
        </Button>
        <Button
          variant={filter === "read" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("read")}
        >
          Read
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredAlerts.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No alerts found. All systems normal!
            </p>
          ) : (
            <div className="space-y-4">
              {filteredAlerts.map((alert) => {
                const material = getMaterial(alert.materialId);
                return (
                  <div key={alert.id} className={`p-4 border rounded-lg ${getAlertColor(alert)}`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        {getAlertIcon(alert)}
                        <div className="flex-1">
                          <h4 className="font-medium">{getMaterialName(alert.materialId)}</h4>
                          <p className="text-sm text-muted-foreground mt-1">{alert.message}</p>
                          {material && (
                            <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                              <div>
                                <p className="text-muted-foreground">Current</p>
                                <p className="font-medium">
                                  {material.currentStock.toFixed(1)} {material.unit}
                                </p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Min</p>
                                <p className="font-medium">{material.minStockLevel} {material.unit}</p>
                              </div>
                            </div>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline">{alert.severity.toUpperCase()}</Badge>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(alert.createdAt), "MMM dd, yyyy HH:mm")}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        {!alert.isRead && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleMarkAsRead(alert.id)}
                            className="h-8 w-8"
                            title="Mark as read"
                          >
                            <CheckCircle className="h-4 w-4 text-success" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(alert.id)}
                          className="h-8 w-8 text-destructive"
                          title="Delete alert"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
