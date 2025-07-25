
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from './auth/AuthProvider';
import { useToast } from '@/hooks/use-toast';
import { Upload, Save, Building2, Mail, Link, ImageIcon } from 'lucide-react';

const Settings = () => {
  const { userProfile, updateProfile } = useAuth();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    business_name: userProfile?.business_name || '',
    alert_email: userProfile?.alert_email || '',
    business_logo: userProfile?.business_logo || ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Save Settings clicked');
    console.log('Form data to save:', formData);

    try {
      const { error } = await updateProfile(formData);

      if (error) {
        console.error('Update failed:', error.message || error);
        toast({
          title: "Error",
          description: "Failed to save settings. Please try again.",
          variant: "destructive"
        });
      } else {
        console.log('Settings saved successfully');
        toast({
          title: "Success",
          description: "Settings saved successfully!",
        });
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real app, this would upload to a storage service
      const reader = new FileReader();
      reader.onload = (e) => {
        const logoUrl = e.target?.result as string;
        console.log('Logo uploaded, setting in form data');
        setFormData({ ...formData, business_logo: logoUrl });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">Settings</h2>
        <p className="text-muted-foreground">
          Manage your business information and notification preferences
        </p>
      </div>

      <Card className="trustqr-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Business Information
          </CardTitle>
          <CardDescription>
            Update your business details and branding
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="businessName">Business Name</Label>
              <Input
                id="businessName"
                value={formData.business_name}
                onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                className="bg-input border-border"
                placeholder="Enter your business name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="businessLogo">Business Logo</Label>
              <div className="flex items-center gap-4">
                {formData.business_logo && (
                  <img
                    src={formData.business_logo}
                    alt="Business Logo"
                    className="w-16 h-16 rounded-lg object-cover border border-border"
                  />
                )}
                <div className="flex-1">
                  <Input
                    id="businessLogo"
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="bg-input border-border"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Upload a square image (recommended: 200x200px)
                  </p>
                </div>
              </div>
            </div>


            <div className="space-y-2">
              <Label htmlFor="alertEmail" className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Alert Email
              </Label>
              <Input
                id="alertEmail"
                type="email"
                value={formData.alert_email}
                onChange={(e) => setFormData({ ...formData, alert_email: e.target.value })}
                className="bg-input border-border"
                placeholder="alerts@yourbusiness.com"
              />
              <p className="text-xs text-muted-foreground">
                Receive notifications for low ratings and issues
              </p>
            </div>

            <Button type="submit" className="trustqr-emerald-gradient text-white hover:opacity-90">
              <Save className="w-4 h-4 mr-2" />
              Save Settings
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
