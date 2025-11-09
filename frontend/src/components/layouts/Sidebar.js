'use client'

import React from 'react';
import { useAppContext } from '@/context/AppContext';
import { Icon, Logo } from '@/components/common/UIComponents';
import { COLORS } from '@/utils/config';

const Sidebar = ({ navItems = [], userRole }) => {
  const { dispatch, state } = useAppContext();
  const handleNavigation = (pageId) => {
    dispatch({ type: 'SET_PAGE', payload: pageId });
  };

  return (
    <div style={{ backgroundColor: COLORS.primary }} className="w-64 flex-shrink-0 text-white min-h-screen hidden md:block">
      <div className="p-4 border-b border-gray-700">
        <Logo className="text-xl text-white" color="white" />
      </div>
      <nav className="p-4 space-y-2">
        {(Array.isArray(navItems) ? navItems : []).map(item => (
          <button
            key={item.id}
            type="button"
            onClick={() => handleNavigation(item.id)}
            className={`flex items-center space-x-3 p-3 rounded-lg transition duration-150 text-sm 
              ${state.page === item.id ? 'bg-white text-primary font-semibold shadow-md' : 'text-gray-300 hover:bg-gray-700'}
            `}
          >
            <Icon path={item.path} className="w-5 h-5" color={state.page === item.id ? COLORS.primary : 'currentColor'} />
            <span>{item.label}</span>
          </button>
        ))}
        {/* Logout button at the bottom for dashboards */}
        <div className="pt-4 border-t border-gray-700">
          <button
            type="button"
            onClick={() => dispatch({ type: 'LOGOUT' })}
            className="flex items-center space-x-3 p-3 rounded-lg transition duration-150 text-sm text-red-400 hover:bg-gray-700"
          >
            <Icon path="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3v-3m6-4V7a3 3 0 013-3h3" className="w-5 h-5" color="currentColor" />
            <span>Logout</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;