// src/components/ui/DashboardCard.js
import React from 'react';
import { COLORS } from '../../config/utils';

const DashboardCard = ({ title, actions, children }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-5 py-3 flex items-center justify-between border-b border-gray-100">
        <h3 className="text-lg font-medium" style={{ color: COLORS.text }}>{title}</h3>
        {actions ? <div className="space-x-2">{actions}</div> : null}
      </div>
      <div className="p-5">
        {children}
      </div>
    </div>
  );
};

export default DashboardCard;
