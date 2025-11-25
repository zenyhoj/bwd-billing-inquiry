import React from 'react';
import { Droplets } from 'lucide-react';

export const Logo: React.FC<{ className?: string }> = ({ className = "h-12 w-12" }) => {
  return (
    <div className={`flex items-center justify-center rounded-full bg-blue-600 text-white ${className}`}>
       <Droplets size={24} fill="currentColor" className="text-blue-100" />
    </div>
  );
};
