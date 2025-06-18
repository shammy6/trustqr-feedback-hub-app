
import { useEffect, useState } from 'react';
import { QrCode } from 'lucide-react';

interface IntroAnimationProps {
  onComplete: () => void;
}

const IntroAnimation = ({ onComplete }: IntroAnimationProps) => {
  const [showTitle, setShowTitle] = useState(false);
  const [showTagline, setShowTagline] = useState(false);

  useEffect(() => {
    // Start title animation immediately
    setShowTitle(true);
    
    // Show tagline after title animation
    const taglineTimer = setTimeout(() => {
      setShowTagline(true);
    }, 800);

    // Complete animation after tagline appears
    const completeTimer = setTimeout(() => {
      onComplete();
    }, 2500);

    return () => {
      clearTimeout(taglineTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-6">
        <div className={`transition-all duration-1000 transform ${
          showTitle ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}>
          <div className="w-16 h-16 mx-auto mb-6 rounded-full trustqr-gradient flex items-center justify-center">
            <QrCode className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground">
            TrustQR
          </h1>
        </div>
        
        <div className={`transition-all duration-800 transform ${
          showTagline ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}>
          <p className="text-xl md:text-2xl text-accent font-medium">
            Let Your Presence Speak Loud
          </p>
        </div>
      </div>
    </div>
  );
};

export default IntroAnimation;
