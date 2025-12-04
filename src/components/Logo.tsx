import React from 'react';

export const Logo: React.FC<{ className?: string }> = ({ className = "h-12 w-12" }) => {
  return (
    <img 
      src="/BWD LOGO.JPG" 
      alt="BWD Logo" 
      className={`object-contain ${className}`}
    />
  );
};