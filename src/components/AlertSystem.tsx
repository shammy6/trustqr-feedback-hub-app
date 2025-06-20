
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Bell, AlertTriangle, Mail, Eye, EyeOff, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Alert {
  id: string;
  type: 'low_rating' | 'complaint' | 'urgent';
  customerName: string;
  customerEmail: string;
  rating: number;
  feedback: string;
  timestamp: string;
  isRead: boolean;
  severity: 'high' | 'medium' | 'low';
  reviewDate: string;
  wouldRecommend?: string;
}

const AlertSystem = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const { toast } = useToast();
  const unreadAlerts = alerts.filter(alert => !alert.isRead);
  
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [revealedNames, setRevealedNames] = useState<Set<string>>(new Set());

  // Load alerts from localStorage and set up polling
  useEffect(() => {
    const loadAlerts = () => {
      const storedAlerts = JSON.parse(localStorage.getItem('feedbackAlerts') || '[]');
      const defaultAlerts: Alert[] = [
        {
          id: 'default-1',
          type: 'low_rating',
          customerName: 'John Davis',
          customerEmail: 'john.davis@email.com',
          rating: 2,
          feedback: 'Service was extremely slow and the food was cold when it arrived.',
          timestamp: '5 minutes ago',
          reviewDate: '2024-06-18 14:30:00',
          isRead: false,
          severity: 'high'
        },
        {
          id: 'default-2',
          type: 'complaint',
          customerName: 'Sarah Mitchell',
          customerEmail: 'sarah.mitchell@email.com',
          rating: 1,
          feedback: 'Very disappointed with the cleanliness of the restaurant.',
          timestamp: '2 hours ago',
          reviewDate: '2024-06-18 12:15:00',
          isRead: false,
          severity: 'high'
        }
      ];
      
      // Combine stored alerts with default ones, removing duplicates
      const allAlerts = [...storedAlerts, ...defaultAlerts.filter(
        defaultAlert => !storedAlerts.some(stored => stored.id === defaultAlert.id)
      )];
      
      setAlerts(allAlerts);
    };

    loadAlerts();
    
    // Poll for new alerts every 2 seconds
    const interval = setInterval(loadAlerts, 2000);
    return () => clearInterval(interval);
  }, []);

  const markAsRead = (alertId: string) => {
    const updatedAlerts = alerts.map(alert => 
      alert.id === alertId ? { ...alert, isRead: true } : alert
    );
    setAlerts(updatedAlerts);
    
    // Update localStorage
    const storedAlerts = JSON.parse(localStorage.getItem('feedbackAlerts') || '[]');
    const updatedStoredAlerts = storedAlerts.map((alert: Alert) => 
      alert.id === alertId ? { ...alert, isRead: true } : alert
    );
    localStorage.setItem('feedbackAlerts', JSON.stringify(updatedStoredAlerts));
  };

  const markAllAsRead = () => {
    const updatedAlerts = alerts.map(alert => ({ ...alert, isRead: true }));
    setAlerts(updatedAlerts);
    
    // Update localStorage
    const storedAlerts = JSON.parse(localStorage.getItem('feedbackAlerts') || '[]');
    const updatedStoredAlerts = storedAlerts.map((alert: Alert) => ({ ...alert, isRead: true }));
    localStorage.setItem('feedbackAlerts', JSON.stringify(updatedStoredAlerts));
  };

  const deleteAlert = (alertId: string) => {
    const updatedAlerts = alerts.filter(alert => alert.id !== alertId);
    setAlerts(updatedAlerts);
    
    // Update localStorage
    const storedAlerts = JSON.parse(localStorage.getItem('feedbackAlerts') || '[]');
    const updatedStoredAlerts = storedAlerts.filter((alert: Alert) => alert.id !== alertId);
    localStorage.setItem('feedbackAlerts', JSON.stringify(updatedStoredAlerts));
  };

  const showCustomerEmail = (alert: Alert) => {
    setSelectedAlert(alert);
    setShowEmailModal(true);
  };

  const showAlertDetails = (alert: Alert) => {
    setSelectedAlert(alert);
    setShowDetailsModal(true);
    markAsRead(alert.id);
  };

  const toggleNameReveal = (alertId: string) => {
    const newRevealed = new Set(revealedNames);
    if (newRevealed.has(alertId)) {
      newRevealed.delete(alertId);
    } else {
      newRevealed.add(alertId);
    }
    setRevealedNames(newRevealed);
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

  const formatReviewDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Alert Center</h2>
          <p className="text-muted-foreground">
            Monitor and respond to customer feedback that needs attention
          </p>
        </div>
        
        <div className="flex items-center justify-between sm:justify-end gap-3">
          <Badge variant="outline" className="flex items-center gap-2 justify-center min-w-[120px]">
            <Bell className="w-4 h-4" />
            <span className="whitespace-nowrap">{unreadAlerts.length} unread</span>
          </Badge>
          {unreadAlerts.length > 0 && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={markAllAsRead}
              className="border-border whitespace-nowrap"
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
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={`p-2 rounded-full flex-shrink-0 ${getSeverityColor(alert.severity)}`}>
                      {getAlertIcon(alert.type)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-lg truncate">
                        {revealedNames.has(alert.id) ? alert.customerName : `${alert.customerName.split(' ')[0]} ${alert.customerName.split(' ')[1]?.[0] || ''}.`} - {alert.rating} Star Review
                      </CardTitle>
                      <CardDescription className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <span>{alert.timestamp}</span>
                        <Badge variant="outline" className={`${getSeverityColor(alert.severity)} w-fit`}>
                          {alert.severity} priority
                        </Badge>
                      </CardDescription>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleNameReveal(alert.id)}
                      className="h-8 w-8 p-0"
                    >
                      {revealedNames.has(alert.id) ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => showCustomerEmail(alert)}
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
                <div className="bg-muted/30 p-4 rounded-lg mb-4">
                  <p className="text-sm text-foreground break-words">{alert.feedback}</p>
                </div>
                
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => showAlertDetails(alert)}
                    className="border-border w-full sm:w-auto"
                  >
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Email Modal */}
      <Dialog open={showEmailModal} onOpenChange={setShowEmailModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Customer Email</DialogTitle>
          </DialogHeader>
          <div className="flex items-center space-x-2 p-4 bg-muted/30 rounded-lg">
            <Mail className="w-5 h-5 text-muted-foreground" />
            <span className="text-sm font-mono">{selectedAlert?.customerEmail}</span>
          </div>
        </DialogContent>
      </Dialog>

      {/* Details Modal */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Review Details</DialogTitle>
          </DialogHeader>
          {selectedAlert && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Customer Name</label>
                  <p className="text-sm font-semibold">{selectedAlert.customerName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <p className="text-sm font-mono">{selectedAlert.customerEmail}</p>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Review Content</label>
                <div className="bg-muted/30 p-3 rounded-lg mt-1">
                  <p className="text-sm">{selectedAlert.feedback}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Rating</label>
                  <p className="text-sm font-semibold">{selectedAlert.rating} stars</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Date & Time</label>
                  <p className="text-sm">{formatReviewDate(selectedAlert.reviewDate)}</p>
                </div>
              </div>

              {selectedAlert.wouldRecommend && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Would Recommend</label>
                  <p className="text-sm">{selectedAlert.wouldRecommend}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AlertSystem;
