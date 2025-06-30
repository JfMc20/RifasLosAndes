import React from 'react';

interface MetricCardProps {
  title: string;
  value: string;
  footerText: string;
  icon: React.ReactNode;
  iconBgColor: string;
  iconColor: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, footerText, icon, iconBgColor, iconColor }) => {
  return (
    <div className="bg-ui-surface p-6 rounded-xl shadow-lg hover:shadow-xl border border-ui-border flex items-start gap-4 transition-all duration-300 transform hover:-translate-y-1">
      <div className={`p-3 ${iconBgColor} rounded-lg`}>
        <div className={`h-6 w-6 ${iconColor}`}>
          {icon}
        </div>
      </div>
      <div className="flex-1">
        <p className="text-sm text-ui-text-secondary font-semibold tracking-wide uppercase">{title}</p>
        <p className="text-2xl font-bold text-ui-text-primary truncate">{value}</p>
        <p className="text-xs text-ui-text-secondary mt-1">{footerText}</p>
      </div>
    </div>
  );
};

export default MetricCard;
