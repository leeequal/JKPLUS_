import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 mt-auto transition-colors duration-300">
      <div className="container mx-auto px-4 py-4 text-center text-slate-500 text-sm">
        <p>© 2024 건설 인력 매칭 플랫폼. All rights reserved.</p>
      </div>
    </footer>
  );
};