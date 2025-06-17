
import { QrCode, Bell, Settings, BarChart3, LogOut, User, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  const { user, logout } = useAuth();

  const handleLogoClick = () => {
    onTabChange('generator');
  };

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
                onClick={() => onTabChange('generator')}
                className={`text-sm font-medium transition-colors px-3 py-2 rounded-md ${
                  activeTab === 'generator' 
                    ? 'bg-accent text-accent-foreground' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                QR Generator
              </button>
              <button
                onClick={() => onTabChange('analysis')}
                className={`text-sm font-medium transition-colors px-3 py-2 rounded-md ${
                  activeTab === 'analysis' 
                    ? 'bg-accent text-accent-foreground' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                AI Analysis
              </button>
              <button
                onClick={() => onTabChange('analytics')}
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
              <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs">
                2
              </Badge>
            </Button>

            {/* User Avatar Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2 hover:bg-muted">
                  {user?.businessLogo ? (
                    <img 
                      src={user.businessLogo} 
                      alt="User Avatar" 
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
                      <User className="w-4 h-4 text-accent-foreground" />
                    </div>
                  )}
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium text-foreground">{user?.businessName}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 bg-popover">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <div className="px-2 py-1.5 text-sm">
                  <p className="font-medium">{user?.businessName}</p>
                  <p className="text-muted-foreground text-xs">{user?.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onTabChange('settings')}>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onTabChange('analytics')}>
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Analytics
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-destructive">
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
              onClick={() => onTabChange('generator')}
              className={`text-sm font-medium transition-colors px-3 py-2 rounded-md whitespace-nowrap ${
                activeTab === 'generator' 
                  ? 'bg-accent text-accent-foreground' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              QR Generator
            </button>
            <button
              onClick={() => onTabChange('analysis')}
              className={`text-sm font-medium transition-colors px-3 py-2 rounded-md whitespace-nowrap ${
                activeTab === 'analysis' 
                  ? 'bg-accent text-accent-foreground' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              AI Analysis
            </button>
            <button
              onClick={() => onTabChange('analytics')}
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
