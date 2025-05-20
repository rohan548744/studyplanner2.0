import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { BookOpenIcon, HomeIcon, BookIcon, CalendarDaysIcon, ClockIcon, UserIcon, LogOutIcon, MenuIcon, XIcon } from 'lucide-react';
import useAuthStore from '../store/authStore';

const Layout: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  const closeSidebar = () => {
    setSidebarOpen(false);
  };
  
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-20 transition-opacity bg-gray-600 bg-opacity-75 md:hidden"
          onClick={closeSidebar}
        />
      )}
      
      {/* Sidebar */}
      <div 
        className={`
          fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transform 
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0 md:static md:h-screen transition duration-200 ease-in-out
        `}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          <div className="flex items-center">
            <BookOpenIcon className="h-8 w-8 text-indigo-600" />
            <span className="ml-2 text-xl font-bold text-gray-900">StudyPlan</span>
          </div>
          <button 
            type="button"
            className="md:hidden rounded-md text-gray-500 hover:text-gray-600"
            onClick={closeSidebar}
          >
            <XIcon className="h-6 w-6" />
          </button>
        </div>
        
        <nav className="mt-5 px-2 space-y-1">
          <NavLink 
            to="/dashboard" 
            className={({ isActive }) => `
              group flex items-center px-2 py-2 text-base font-medium rounded-md
              ${isActive 
                ? 'bg-indigo-50 text-indigo-700' 
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
            `}
            onClick={closeSidebar}
          >
            <HomeIcon className="mr-3 h-5 w-5" />
            Dashboard
          </NavLink>
          
          <NavLink 
            to="/subjects" 
            className={({ isActive }) => `
              group flex items-center px-2 py-2 text-base font-medium rounded-md
              ${isActive 
                ? 'bg-indigo-50 text-indigo-700' 
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
            `}
            onClick={closeSidebar}
          >
            <BookIcon className="mr-3 h-5 w-5" />
            Subjects
          </NavLink>
          
          <NavLink 
            to="/schedule" 
            className={({ isActive }) => `
              group flex items-center px-2 py-2 text-base font-medium rounded-md
              ${isActive 
                ? 'bg-indigo-50 text-indigo-700' 
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
            `}
            onClick={closeSidebar}
          >
            <CalendarDaysIcon className="mr-3 h-5 w-5" />
            Schedule
          </NavLink>
          
          <NavLink 
            to="/availability" 
            className={({ isActive }) => `
              group flex items-center px-2 py-2 text-base font-medium rounded-md
              ${isActive 
                ? 'bg-indigo-50 text-indigo-700' 
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
            `}
            onClick={closeSidebar}
          >
            <ClockIcon className="mr-3 h-5 w-5" />
            Availability
          </NavLink>
        </nav>
        
        <div className="absolute bottom-0 w-full border-t border-gray-200">
          <div className="px-4 py-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center">
                  <UserIcon className="h-5 w-5 text-white" />
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">{user?.name}</p>
                <p className="text-xs font-medium text-gray-500 truncate">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="mt-3 flex items-center px-2 py-2 text-base font-medium text-red-600 rounded-md hover:bg-red-50 w-full"
            >
              <LogOutIcon className="mr-3 h-5 w-5" />
              Sign out
            </button>
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm z-10">
          <div className="h-16 flex items-center justify-between px-4 md:px-6">
            <button
              type="button"
              className="md:hidden text-gray-500 focus:outline-none"
              onClick={() => setSidebarOpen(true)}
            >
              <MenuIcon className="h-6 w-6" />
            </button>
            <div className="flex-1 md:ml-8">
              <h1 className="text-xl font-semibold text-gray-900">Smart Study Planner</h1>
            </div>
          </div>
        </header>
        
        <main className="flex-1 overflow-auto p-4 md:p-6 bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;