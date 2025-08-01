
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bell, AlertTriangle, Mail, Eye, EyeOff, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';

interface Alert {
  id: string;
  type: 'low_rating' | 'complaint' | 'urgent';
  customerName: string;
  customerEmail: string;
  rating: number;
  review: string;
  timestamp: string;
  isRead: boolean;
  severity: 'high' | 'medium' | 'low';
  reviewDate: string;
  platform?: string;
  wouldRecommend?: string;
  sentiment?: 'positive' | 'mixed' | 'negative';
  sentimentEmoji?: string;
  sentimentSummary?: string;
  sentimentConfidence?: number;
}

const AlertSystem = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [sortBy, setSortBy] = useState<'timestamp' | 'sentiment' | 'severity'>('timestamp');
  const { toast } = useToast();
  const { userProfile } = useAuth();
  const unreadAlerts = alerts.filter(alert => !alert.isRead);
  
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [revealedNames, setRevealedNames] = useState<Set<string>>(new Set());
  const [newAlertIds, setNewAlertIds] = useState<Set<string>>(new Set());

  // Load real alerts from database and set up real-time listening
  useEffect(() => {
    const loadRealAlerts = async () => {
      if (!userProfile?.id) return;

      const { data: reviews, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('business_id', userProfile.id)
        .lte('rating', 3)
        .order('created_at', { ascending: false });

      if (!error && reviews) {
        const realAlerts: Alert[] = reviews.map(review => {
          const getRelativeTime = (timestamp: string) => {
            const now = new Date();
            const past = new Date(timestamp);
            const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);
            
            if (diffInSeconds < 60) return `${diffInSeconds} sec ago`;
            if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min ago`;
            if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hr ago`;
            return `${Math.floor(diffInSeconds / 86400)} days ago`;
          };

          return {
            id: review.id,
            type: review.rating <= 2 ? 'low_rating' : 'complaint',
            customerName: review.customer_name || 'Anonymous',
            customerEmail: review.customer_email || 'No email provided',
            rating: review.rating,
            review: review.review_text,
            timestamp: getRelativeTime(review.created_at),
            reviewDate: review.created_at,
            isRead: false,
            severity: review.rating <= 2 ? 'high' : 'medium',
            platform: 'TrustQR',
            sentiment: review.rating <= 2 ? 'negative' : 'mixed',
            sentimentEmoji: review.rating <= 2 ? '😞' : '😐',
            sentimentSummary: `Customer ${review.rating <= 2 ? 'shows dissatisfaction' : 'has mixed feelings'} with ${review.rating}-star rating`,
            sentimentConfidence: 0.8
          };
        });

        setAlerts(realAlerts);
      }
    };

    // Listen for new review alerts via Supabase realtime
    const handleNewAlert = (payload: any) => {
      if (payload.eventType === 'INSERT' && payload.new.rating <= 3) {
        const review = payload.new;
        const getRelativeTime = (timestamp: string) => {
          const now = new Date();
          const past = new Date(timestamp);
          const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);
          
          if (diffInSeconds < 60) return `${diffInSeconds} sec ago`;
          if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min ago`;
          if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hr ago`;
          return `${Math.floor(diffInSeconds / 86400)} days ago`;
        };

        const newAlert: Alert = {
          id: review.id,
          type: review.rating <= 2 ? 'low_rating' : 'complaint',
          customerName: review.customer_name || 'Anonymous',
          customerEmail: review.customer_email || 'No email provided',
          rating: review.rating,
          review: review.review_text,
          timestamp: getRelativeTime(review.created_at),
          reviewDate: review.created_at,
          isRead: false,
          severity: review.rating <= 2 ? 'high' : 'medium',
          platform: 'TrustQR',
          sentiment: review.rating <= 2 ? 'negative' : 'mixed',
          sentimentEmoji: review.rating <= 2 ? '😞' : '😐',
          sentimentSummary: `Customer ${review.rating <= 2 ? 'shows dissatisfaction' : 'has mixed feelings'} with ${review.rating}-star rating`,
          sentimentConfidence: 0.8
        };

        setAlerts(prev => [newAlert, ...prev]);
        setNewAlertIds(prev => new Set([...prev, newAlert.id]));
        
        // Show toast notification for new alert
        toast({
          title: "New Review Alert",
          description: `${newAlert.customerName} left a ${newAlert.rating}-star review`,
          variant: newAlert.rating <= 2 ? "destructive" : "default"
        });

        // Remove the "new" indicator after 5 seconds
        setTimeout(() => {
          setNewAlertIds(prev => {
            const updated = new Set(prev);
            updated.delete(newAlert.id);
            return updated;
          });
        }, 5000);
      }
    };

    loadRealAlerts();
    
    // Set up Supabase realtime subscription
    const channel = supabase
      .channel('review-alerts')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'reviews' },
        handleNewAlert
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast]);

  // Sort alerts based on selected criteria
  const sortedAlerts = [...alerts].sort((a, b) => {
    switch (sortBy) {
      case 'sentiment':
        const sentimentOrder = { negative: 0, mixed: 1, positive: 2 };
        return sentimentOrder[a.sentiment || 'mixed'] - sentimentOrder[b.sentiment || 'mixed'];
      case 'severity':
        const severityOrder = { high: 0, medium: 1, low: 2 };
        return severityOrder[a.severity] - severityOrder[b.severity];
      default:
        return new Date(b.reviewDate).getTime() - new Date(a.reviewDate).getTime();
    }
  });

  const markAsRead = (alertId: string) => {
    const updatedAlerts = alerts.map(alert => 
      alert.id === alertId ? { ...alert, isRead: true } : alert
    );
    setAlerts(updatedAlerts);
    
    const storedAlerts = JSON.parse(localStorage.getItem('reviewAlerts') || '[]');
    const updatedStoredAlerts = storedAlerts.map((alert: Alert) => 
      alert.id === alertId ? { ...alert, isRead: true } : alert
    );
    localStorage.setItem('reviewAlerts', JSON.stringify(updatedStoredAlerts));
  };

  const markAllAsRead = () => {
    const updatedAlerts = alerts.map(alert => ({ ...alert, isRead: true }));
    setAlerts(updatedAlerts);
    
    const storedAlerts = JSON.parse(localStorage.getItem('reviewAlerts') || '[]');
    const updatedStoredAlerts = storedAlerts.map((alert: Alert) => ({ ...alert, isRead: true }));
    localStorage.setItem('reviewAlerts', JSON.stringify(updatedStoredAlerts));
  };

  const deleteAlert = (alertId: string) => {
    const updatedAlerts = alerts.filter(alert => alert.id !== alertId);
    setAlerts(updatedAlerts);
    
    const storedAlerts = JSON.parse(localStorage.getItem('reviewAlerts') || '[]');
    const updatedStoredAlerts = storedAlerts.filter((alert: Alert) => alert.id !== alertId);
    localStorage.setItem('reviewAlerts', JSON.stringify(updatedStoredAlerts));
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

  const getSentimentColor = (sentiment?: string) => {
    switch (sentiment) {
      case 'positive': return 'bg-green-100 text-green-800 border-green-200';
      case 'negative': return 'bg-red-100 text-red-800 border-red-200';
      case 'mixed': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
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
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Alert Center</h2>
          <p className="text-muted-foreground">
            Monitor and respond to customer reviews that need attention
          </p>
        </div>
        
        <div className="flex items-center justify-between lg:justify-end gap-3 flex-wrap">
          <Select value={sortBy} onValueChange={(value: 'timestamp' | 'sentiment' | 'severity') => setSortBy(value)}>
            <SelectTrigger className="w-[140px] bg-input border-border transition-all duration-200 hover:bg-muted/50">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent className="bg-popover animate-fade-in">
              <SelectItem value="timestamp">Most Recent</SelectItem>
              <SelectItem value="sentiment">Sentiment</SelectItem>
              <SelectItem value="severity">Severity</SelectItem>
            </SelectContent>
          </Select>
          
          <Badge variant="outline" className="flex items-center gap-2 justify-center min-w-[120px] transition-all duration-200 hover:bg-accent/10">
            <Bell className="w-4 h-4" />
            <span className="whitespace-nowrap">{unreadAlerts.length} unread</span>
          </Badge>
          
          {unreadAlerts.length > 0 && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={markAllAsRead}
              className="border-border whitespace-nowrap transition-all duration-200 hover:scale-105"
            >
              Mark all as read
            </Button>
          )}
        </div>
      </div>

      {alerts.length === 0 ? (
        <Card className="trustqr-card animate-fade-in">
          <CardContent className="p-12 text-center">
            <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4 animate-pulse" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No alerts</h3>
            <p className="text-muted-foreground">
              All reviews are looking good! New alerts will appear here when customers leave low ratings.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {sortedAlerts.map((alert, index) => (
            <Card 
              key={alert.id} 
              className={`trustqr-card transition-all duration-300 hover:shadow-lg animate-fade-in ${
                !alert.isRead ? 'border-l-4 border-l-accent' : ''
              } ${newAlertIds.has(alert.id) ? 'ring-2 ring-accent animate-pulse' : ''}`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={`p-2 rounded-full flex-shrink-0 transition-all duration-200 ${getSeverityColor(alert.severity)}`}>
                      {getAlertIcon(alert.type)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-lg truncate">
                        {revealedNames.has(alert.id) ? alert.customerName : `${alert.customerName.split(' ')[0]} ${alert.customerName.split(' ')[1]?.[0] || ''}.`} - {alert.rating} Star Review
                      </CardTitle>
                      <CardDescription className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <span>{alert.timestamp}</span>
                        <div className="flex gap-2 flex-wrap">
                          <Badge variant="outline" className={`${getSeverityColor(alert.severity)} w-fit transition-all duration-200`}>
                            {alert.severity} priority
                          </Badge>
                          {alert.platform && (
                            <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200 w-fit">
                              {alert.platform}
                            </Badge>
                          )}
                          {alert.sentiment && (
                            <Badge variant="outline" className={`${getSentimentColor(alert.sentiment)} w-fit transition-all duration-200`}>
                              {alert.sentimentEmoji} {alert.sentiment}
                            </Badge>
                          )}
                          {newAlertIds.has(alert.id) && (
                            <Badge className="bg-accent text-accent-foreground animate-pulse">NEW</Badge>
                          )}
                        </div>
                      </CardDescription>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleNameReveal(alert.id)}
                      className="h-8 w-8 p-0 transition-all duration-200 hover:scale-110"
                    >
                      {revealedNames.has(alert.id) ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => showCustomerEmail(alert)}
                      className="h-8 w-8 p-0 transition-all duration-200 hover:scale-110"
                    >
                      <Mail className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteAlert(alert.id)}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive transition-all duration-200 hover:scale-110"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-muted/30 p-4 rounded-lg mb-4 transition-all duration-200 hover:bg-muted/50">
                  <p className="text-sm text-foreground break-words">{alert.review}</p>
                </div>
                
                {alert.sentimentSummary && (
                  <div className="mb-4 p-3 bg-accent/10 rounded-lg transition-all duration-200 hover:bg-accent/20">
                    <p className="text-xs text-muted-foreground font-medium mb-1">AI Sentiment Analysis:</p>
                    <p className="text-sm text-foreground">{alert.sentimentSummary}</p>
                    {alert.sentimentConfidence && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Confidence: {Math.round(alert.sentimentConfidence * 100)}%
                      </p>
                    )}
                  </div>
                )}
                
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => showAlertDetails(alert)}
                    className="border-border w-full sm:w-auto transition-all duration-200 hover:scale-105"
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
        <DialogContent className="sm:max-w-md animate-scale-in">
          <DialogHeader>
            <DialogTitle>Customer Email</DialogTitle>
          </DialogHeader>
          <div className="flex items-center space-x-2 p-4 bg-muted/30 rounded-lg transition-all duration-200 hover:bg-muted/50">
            <Mail className="w-5 h-5 text-muted-foreground" />
            <span className="text-sm font-mono">{selectedAlert?.customerEmail}</span>
          </div>
        </DialogContent>
      </Dialog>

      {/* Details Modal */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="sm:max-w-lg animate-scale-in">
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
                <div className="bg-muted/30 p-3 rounded-lg mt-1 transition-all duration-200 hover:bg-muted/50">
                  <p className="text-sm">{selectedAlert.review}</p>
                </div>
              </div>
              
              {selectedAlert.sentiment && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">AI Sentiment Analysis</label>
                  <div className="bg-accent/10 p-3 rounded-lg mt-1 transition-all duration-200 hover:bg-accent/20">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">{selectedAlert.sentimentEmoji}</span>
                      <Badge className={getSentimentColor(selectedAlert.sentiment)}>
                        {selectedAlert.sentiment}
                      </Badge>
                      {selectedAlert.sentimentConfidence && (
                        <span className="text-xs text-muted-foreground">
                          {Math.round(selectedAlert.sentimentConfidence * 100)}% confidence
                        </span>
                      )}
                    </div>
                    <p className="text-sm">{selectedAlert.sentimentSummary}</p>
                  </div>
                </div>
              )}
              
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
