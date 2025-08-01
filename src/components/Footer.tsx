import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="mt-auto pt-12 pb-6 border-t border-border">
      <div className="container mx-auto px-4 text-center">
        <div className="flex flex-wrap justify-center gap-6 mb-6">
          <Link to="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Terms
          </Link>
          <Link to="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Privacy
          </Link>
          <Link to="/refunds" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Refunds
          </Link>
        </div>
        <p className="text-xs text-muted-foreground">
          © 2024 TrustQR. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;