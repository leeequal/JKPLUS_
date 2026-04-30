import React from 'react';

interface TooltipProps {
  text: string;
  children: React.ReactNode;
}

export const Tooltip: React.FC<TooltipProps> = ({ text, children }) => {
  return (
    <div className="relative flex items-center group">
      {children}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-max max-w-xs
                      invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-opacity duration-300
                      bg-slate-600 text-white text-xs rounded-md py-1.5 px-3 z-10 shadow-lg">
        {text}
        <svg className="absolute text-slate-600 h-2 w-full left-0 top-full" x="0px" y="0px" viewBox="0 0 255 255" xmlSpace="preserve">
          <polygon className="fill-current" points="0,0 127.5,127.5 255,0"/>
        </svg>
      </div>
    </div>
  );
};