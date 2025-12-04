import React from 'react';

export const Logo: React.FC<{ className?: string }> = ({ className = "h-12 w-12" }) => {
  return (
    <img 
      src="/logo.png" 
      alt="BWD Logo" 
      className={`object-contain ${className}`}
      onError={(e) => {
        // Fallback if image fails
        e.currentTarget.style.display = 'none';
        e.currentTarget.parentElement?.classList.add('bg-blue-600', 'rounded-full');
      }}
    />
  );
};