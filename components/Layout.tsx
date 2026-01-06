
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  
  const navItems = [
    { path: '/dashboard', icon: 'fa-home', label: 'الرئيسية' },
    { path: '/community', icon: 'fa-users', label: 'المجتمع' },
    { path: '/chat', icon: 'fa-comment-medical', label: 'المستشار' },
    { path: '/store', icon: 'fa-shopping-bag', label: 'المتجر' },
    { path: '/profile', icon: 'fa-user', label: 'حسابي' }
  ];

  return (
    <div className="pb-24 pt-4 px-4 max-w-md mx-auto min-h-screen relative">
      <header className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <img src="https://i.ibb.co/TM561d6q/image.png" alt="Nestgirl Logo" className="w-10 h-10 object-contain rounded-full bg-white/50 p-1" />
          <h1 className="text-xl font-bold text-pink-600">نست جيرل</h1>
        </div>
        <button className="w-10 h-10 glass rounded-full flex items-center justify-center text-pink-500">
          <i className="fa-solid fa-bell"></i>
        </button>
      </header>
      
      <main className="animate-fadeIn">
        {children}
      </main>

      <nav className="fixed bottom-4 left-4 right-4 max-w-md mx-auto glass-dark rounded-3xl h-16 flex items-center justify-around px-4 shadow-xl border border-white/40 z-50">
        {navItems.map((item) => (
          <Link 
            key={item.path} 
            to={item.path} 
            className={`flex flex-col items-center justify-center transition-all duration-300 ${location.pathname === item.path ? 'text-pink-600 -translate-y-1 scale-110' : 'text-gray-400'}`}
          >
            <i className={`fa-solid ${item.icon} text-xl`}></i>
            <span className="text-[10px] mt-1 font-bold">{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default Layout;
