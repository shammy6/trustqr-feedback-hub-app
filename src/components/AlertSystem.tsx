
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, AlertTriangle, Mail, Eye, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Alert {
  id: string;
  type: 'low_rating' | 'complaint' | 'urgent';
  customerName: string;
  rating: number;
  feedback: string;
  timestamp: string;
  isRead: boolean;
  severity: 'high' | 'medium' | 'low';
}

const AlertSystem = () => {
  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: '1',
      type: 'low_rating',
      customerName: 'John D.',
      rating: 2,
      feedback: 'Service was extremely slow and the food was cold when it arrived.',
      timestamp: '5 minutes ago',
      isRead: false,
      severity: 'high'
    },
    {
      id: '2',
      type: 'complaint',
      customerName: 'Sarah M.',
      rating: 1,
      feedback: 'Very disappointed with the cleanliness of the restaurant.',
      timestamp: '2 hours ago',
      isRead: false,
      severity: 'high'
    },
    {
      id: '3',
      type: 'low_rating',
      customerName: 'Mike R.',
      rating: 3,
      feedback: 'Average experience, nothing special.',
      timestamp: '1 day ago',
      isRead: true,
      severity: 'medium'
    }
  ]);

  const { toast } = useToast();
  const unreadAlerts = alerts.filter(alert => !alert.isRead);

  const markAsRead = (alertId: string) => {
    setAlerts(alerts.map(alert => 
      alert.id === alertId ? { ...alert, isRead: true } : alert
    ));
  };

  const markAllAsRead = () => {
    setAlerts(alerts.map(alert => ({ ...alert, isRead: true })));
  };

  const deleteAlert = (alertId: string) => {
    setAlerts(alerts.filter(alert => alert.id !== alertId));
  };

  const sendEmailAlert = (alert: Alert) => {
    toast({
      title: "Email sent!",
      description: `Alert forwarded to management team about ${alert.customerName}'s feedback.`
    });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'urgent': return <AlertTriangle className="w-5 h-5" />;
      default: return <Bell className="w-5 h-5" />;
    }
  };

  // Simulate real-time alerts
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate receiving a new alert occasionally
      if (Math.random() < 0.1) { // 10% chance every 5 seconds
        const newAlert: Alert = {
          id: Date.now().toString(),
          type: 'low_rating',
          customerName: 'Anonymous Customer',
          rating: Math.floor(Math.random() * 3) + 1,
          feedback: 'New feedback requiring attention...',
          timestamp: 'Just now',
          isRead: false,
          severity: 'high'
        };
        
        setAlerts(prev => [newAlert, ...prev]);
        
        toast({
          title: "New Alert!",
          description: `${newAlert.customerName} left a ${newAlert.rating}-star review`,
          variant: "destructive"
        });
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [toast]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Alert Center</h2>
          <p className="text-muted-foreground">
            Monitor and respond to customer feedback that needs attention
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            {unreadAlerts.length} unread
          </Badge>
          {unreadAlerts.length > 0 && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={markAllAsRead}
              className="border-border"
            >
              Mark all as read
            </Button>
          )}
        </div>
      </div>

      {alerts.length === 0 ? (
        <Card className="trustqr-card">
          <CardContent className="p-12 text-center">
            <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No alerts</h3>
            <p className="text-muted-foreground">
              All feedback is looking good! New alerts will appear here when customers leave low ratings.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {alerts.map((alert) => (
            <Card key={alert.id} className={`trustqr-card ${!alert.isRead ? 'border-l-4 border-l-accent' : ''}`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${getSeverityColor(alert.severity)}`}>
                      {getAlertIcon(alert.type)}
                    </div>
                    <div>
                      <CardTitle className="text-lg">
                        {alert.customerName} - {alert.rating} Star Review
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        <span>{alert.timestamp}</span>
                        <Badge variant="outline" className={getSeverityColor(alert.severity)}>
                          {alert.severity} priority
                        </Badge>
                      </CardDescription>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {!alert.isRead && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => markAsRead(alert.id)}
                        className="h-8 w-8 p-0"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => sendEmailAlert(alert)}
                      className="h-8 w-8 p-0"
                    >
                      <Mail className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteAlert(alert.id)}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-muted/30 p-4 rounded-lg">
                  <p className="text-sm text-foreground">"{alert.feedback}"</p>
                </div>
                
                <div className="flex items-center gap-2 mt-4">
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="border-border"
                  >
                    View Details
                  </Button>
                  <Button 
                    size="sm" 
                    className="trustqr-emerald-gradient text-white hover:opacity-90"
                  >
                    Respond to Customer
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AlertSystem;
