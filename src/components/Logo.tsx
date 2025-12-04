import React, { useState } from 'react';
import { Droplets } from 'lucide-react';
// @ts-ignore - Ignores type error if PNG declaration is missing
import logoSrc from '../logo.png'; 

export const Logo: React.FC<{ className?: string }> = ({ className = "h-12 w-12" }) => {
  const [error, setError] = useState(false);

  // If image fails to load or is missing, show the default icon
  if (error) {
    return (
      <div className={`flex items-center justify-center rounded-full bg-blue-600 text-white ${className}`}>
         <Droplets className="p-2 w-full h-full" fill="currentColor" />
      </div>
    );
  }

  return (
    <img 
      src={logoSrc} 
      alt="BWD Logo" 
      className={`object-contain ${className}`}
      onError={() => setError(true)}
    />
  );
};