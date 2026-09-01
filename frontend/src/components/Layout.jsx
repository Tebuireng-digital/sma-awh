import React, { useState } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      <Navbar onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)} />
      <div className="flex flex-1">
        <Sidebar 
          mobileOpen={mobileMenuOpen} 
          onCloseMobile={() => setMobileMenuOpen(false)} 
        />
        <main className="flex-1 p-4 sm:p-6 overflow-x-hidden">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
