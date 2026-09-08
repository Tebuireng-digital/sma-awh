import React, { useState } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f8faf7] flex flex-col font-sans text-slate-800 antialiased selection:bg-emerald-100 selection:text-emerald-900">
      <Navbar onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)} />
      <div className="flex flex-1">
        <Sidebar 
          mobileOpen={mobileMenuOpen} 
          onCloseMobile={() => setMobileMenuOpen(false)} 
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
