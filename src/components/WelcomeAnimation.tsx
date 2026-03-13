import React, { useState, useEffect } from 'react';
import { HeartHandshake } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const WelcomeAnimation = () => {
  const { user, profile } = useAuth();
  const [show, setShow] = useState(false);
  const [isAnimatingIn, setIsAnimatingIn] = useState(false);
  const [fadingOut, setFadingOut] = useState(false);

  useEffect(() => {
    if (user && profile) {
      const hasSeenWelcome = sessionStorage.getItem(`welcome_${user.id}`);
      const isDisabled = localStorage.getItem('welcome_animation_disabled') === 'true';
      if (!hasSeenWelcome && !isDisabled) {
        setShow(true);
        sessionStorage.setItem(`welcome_${user.id}`, 'true');
        
        // Trigger animation in after mount
        setTimeout(() => {
          setIsAnimatingIn(true);
        }, 50);
        
        // Start fade out after 2.5 seconds
        setTimeout(() => {
          setFadingOut(true);
        }, 2500);
        
        // Remove from DOM after 3.5 seconds
        setTimeout(() => {
          setShow(false);
        }, 3500);
      }
    }
  }, [user, profile]);

  if (!show) return null;

  return (
    <div className={`fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md transition-opacity duration-1000 ${isAnimatingIn && !fadingOut ? 'opacity-100' : 'opacity-0'}`}>
      <div className={`text-center transform transition-all duration-1000 ${isAnimatingIn && !fadingOut ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-4'}`}>
        <div className="w-24 h-24 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_40px_rgba(79,70,229,0.4)]">
          <HeartHandshake className="w-12 h-12 text-indigo-400 animate-pulse" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
          Bem-vindo, <span className="text-gradient">Colaborador/Ajudaí!</span>
        </h1>
        <p className="text-xl text-zinc-400 max-w-md mx-auto mb-8">
          {profile?.name ? `Olá, ${profile.name}. ` : ''}Que bom ter você aqui com a gente.
        </p>
        <button 
          onClick={() => setShow(false)}
          className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-full font-medium transition-all border border-white/20"
        >
          Pular Introdução
        </button>
      </div>
    </div>
  );
};
