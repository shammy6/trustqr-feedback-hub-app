import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Privacy = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center">Privacy Policy</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-neutral dark:prose-invert max-w-none">
            <p className="text-muted-foreground mb-6">
              We respect your privacy. TrustQR does not sell your data. Review data is encrypted and stored securely, accessible only to authorized users.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Privacy;