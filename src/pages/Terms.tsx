import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Terms = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center">Terms of Service</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-neutral dark:prose-invert max-w-none">
            <p className="text-muted-foreground mb-6">
              By using TrustQR, you agree not to misuse or exploit the platform. All data and QR codes generated must comply with relevant legal and ethical standards.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Terms;