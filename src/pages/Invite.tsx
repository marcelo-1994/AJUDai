import React from 'react';
import { InviteFriends } from '../components/InviteFriends';

export const Invite = () => {
  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Convide seus amigos</h1>
        <p className="text-zinc-400 text-lg">
          Ajude a comunidade AJUDAÍ a crescer! Quanto mais pessoas na plataforma, mais rápido você consegue ajuda ou encontra oportunidades de trabalho.
        </p>
      </div>
      
      <InviteFriends />
    </div>
  );
};
