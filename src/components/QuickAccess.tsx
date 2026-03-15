import React, { useState } from 'react';
import { Plus, HelpCircle, ShoppingBag, Gift, MessageCircle, X, GraduationCap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';

export function QuickAccess() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  const menuItems = [
    { icon: HelpCircle, label: 'Pedir Ajuda', to: '/create-request', color: 'bg-blue-500' },
    { icon: GraduationCap, label: 'Educa', to: '/educa', color: 'bg-indigo-500' },
    { icon: ShoppingBag, label: 'Anunciar', to: '/marketplace', color: 'bg-emerald-500' },
    { icon: Gift, label: 'Indicar App', to: '/invite', color: 'bg-purple-500' },
    { icon: MessageCircle, label: 'Suporte', to: 'https://wa.me/5594991233751', color: 'bg-green-500', external: true },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.8 }}
            className="mb-4 flex flex-col gap-3 items-end"
          >
            {menuItems.map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                {item.external ? (
                  <a
                    href={item.to}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 group"
                    onClick={() => setIsOpen(false)}
                  >
                    <span className="bg-white px-3 py-1.5 rounded-lg shadow-md text-sm font-medium text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity">
                      {item.label}
                    </span>
                    <div className={`p-3 rounded-full text-white shadow-lg ${item.color} hover:brightness-110 transition-all`}>
                      <item.icon className="w-5 h-5" />
                    </div>
                  </a>
                ) : (
                  <Link
                    to={item.to}
                    className="flex items-center gap-3 group"
                    onClick={() => setIsOpen(false)}
                  >
                    <span className="bg-white px-3 py-1.5 rounded-lg shadow-md text-sm font-medium text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity">
                      {item.label}
                    </span>
                    <div className={`p-3 rounded-full text-white shadow-lg ${item.color} hover:brightness-110 transition-all`}>
                      <item.icon className="w-5 h-5" />
                    </div>
                  </Link>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={toggleMenu}
        className={`p-4 rounded-full text-white shadow-xl transition-all duration-300 ${
          isOpen ? 'bg-gray-800 rotate-45' : 'bg-indigo-600 hover:bg-indigo-700 hover:scale-105'
        }`}
      >
        <Plus className="w-6 h-6" />
      </button>
    </div>
  );
}
