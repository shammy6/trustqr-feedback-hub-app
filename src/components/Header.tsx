
import { QrCode, Bell, Settings, BarChart3, LogOut, User, ChevronDown, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "./auth/AuthProvider";

interface HeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Header = ({ activeTab, onTabChange }: HeaderProps) => {
  const { userProfile, signOut } = useAuth();

  const handleLogoClick = () => {
    onTabChange('generator');
  };

  const handleNavClick = (tab: string) => {
    onTabChange(tab);
  };

  const getPlanBadgeVariant = (tier: string) => {
    switch (tier?.toLowerCase()) {
      case 'premium': return 'purple';
      case 'vip': return 'gold';
      case 'free':
      default: return 'gray';
    }
  };

  const getPlanUsagePercentage = (start: Date, expiry: Date) => {
    const now = new Date();
    const total = expiry.getTime() - start.getTime();
    const used = now.getTime() - start.getTime();
    return Math.min(100, Math.max(0, (used / total) * 100));
  };

  const getDaysLeft = (expiry: Date) => {
    const now = new Date();
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const formatExpiryDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const planTier = userProfile?.plan_tier || 'free';
  const planExpiry = userProfile?.plan_expiry;
  const isPaidPlan = planTier !== 'free' && planExpiry;
  const expiryDate = isPaidPlan ? new Date(planExpiry) : null;
  const isExpired = expiryDate ? new Date() > expiryDate : false;

  return (
    <header className="bg-card border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 sm:space-x-8">
            {/* Logo - clickable to go home */}
            <button 
              onClick={handleLogoClick}
              className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
            >
              <div className="w-8 h-8 rounded-lg trustqr-gradient flex items-center justify-center">
                <QrCode className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">TrustQR</h1>
              </div>
            </button>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-6">
              <button
                onClick={() => handleNavClick('generator')}
                className={`text-sm font-medium transition-colors px-3 py-2 rounded-md ${
                  activeTab === 'generator' 
                    ? 'bg-accent text-accent-foreground' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                QR Generator
              </button>
              <button
                onClick={() => handleNavClick('analysis')}
                className={`text-sm font-medium transition-colors px-3 py-2 rounded-md ${
                  activeTab === 'analysis' 
                    ? 'bg-accent text-accent-foreground' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                AI Analysis
              </button>
              <button
                onClick={() => handleNavClick('analytics')}
                className={`text-sm font-medium transition-colors px-3 py-2 rounded-md ${
                  activeTab === 'analytics' 
                    ? 'bg-accent text-accent-foreground' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                Analytics
              </button>
            </nav>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Notification Bell */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onTabChange('alerts')}
              className="relative"
            >
              <Bell className="w-5 h-5" />
              <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs flex items-center justify-center">
                2
              </Badge>
            </Button>

            {/* User Avatar Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2 hover:bg-muted">
                  <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
                    <User className="w-4 h-4 text-accent-foreground" />
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium text-foreground">{userProfile?.business_name}</p>
                    <p className="text-xs text-muted-foreground">{userProfile?.email}</p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 bg-popover">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <div className="px-2 py-1.5 text-sm">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-medium">{userProfile?.name}</p>
                      <p className="text-muted-foreground text-xs">{userProfile?.email}</p>
                    </div>
                    <Badge variant={getPlanBadgeVariant(planTier) as any} className="ml-2">
                      {planTier.toUpperCase()}
                    </Badge>
                  </div>
                  
                  {isPaidPlan && !isExpired && (
                    <div className="mt-3 pt-3 border-t border-border">
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                        <span>Expires on: {formatExpiryDate(planExpiry)}</span>
                        <span>{getDaysLeft(expiryDate!)} days left</span>
                      </div>
                      <Progress 
                        value={getPlanUsagePercentage(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), expiryDate!)} 
                        className="h-2 bg-muted"
                      />
                    </div>
                  )}

                  {isPaidPlan && isExpired && (
                    <div className="mt-3 pt-3 border-t border-border">
                      <p className="text-xs text-destructive">Plan expired on {formatExpiryDate(planExpiry)}</p>
                    </div>
                  )}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onTabChange('settings')}>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onTabChange('recent-reviews')}>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Recent Reviews
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut} className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="lg:hidden mt-4 border-t border-border pt-4">
          <div className="flex space-x-4 overflow-x-auto">
            <button
              onClick={() => handleNavClick('generator')}
              className={`text-sm font-medium transition-colors px-3 py-2 rounded-md whitespace-nowrap ${
                activeTab === 'generator' 
                  ? 'bg-accent text-accent-foreground' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              QR Generator
            </button>
            <button
              onClick={() => handleNavClick('analysis')}
              className={`text-sm font-medium transition-colors px-3 py-2 rounded-md whitespace-nowrap ${
                activeTab === 'analysis' 
                  ? 'bg-accent text-accent-foreground' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              AI Analysis
            </button>
            <button
              onClick={() => handleNavClick('analytics')}
              className={`text-sm font-medium transition-colors px-3 py-2 rounded-md whitespace-nowrap ${
                activeTab === 'analytics' 
                  ? 'bg-accent text-accent-foreground' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              Analytics
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
