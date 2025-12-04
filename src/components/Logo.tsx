import React from 'react';
import { Droplets } from 'lucide-react';

export const Logo: React.FC<{ className?: string }> = ({ className = "h-12 w-12" }) => {
  return (
    <div className={`flex items-center justify-center rounded-full bg-blue-600 text-white shadow-sm ${className}`}>
       <Droplets className="p-[25%] w-full h-full" fill="currentColor" />
    </div>
  );
};
