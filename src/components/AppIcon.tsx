import React from 'react';

export const AppIcon = ({ className = "h-8 w-8" }: { className?: string }) => {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" rx="20" fill="#4F46E5" />
      <path d="M30 50 L45 65 L70 35" stroke="white" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="80" cy="20" r="10" fill="#F59E0B" />
    </svg>
  );
};
