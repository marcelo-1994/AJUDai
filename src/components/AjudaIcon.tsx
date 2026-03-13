import React from 'react';

export const AjudaIcon = ({ className = "w-8 h-8" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor" className="text-indigo-600" />
    <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-600" />
    <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-600" />
    <circle cx="18" cy="18" r="4" fill="#F59E0B" />
    <path d="M18 16V20M16 18H20" stroke="white" strokeWidth="2" strokeLinecap="round" />
  </svg>
);
