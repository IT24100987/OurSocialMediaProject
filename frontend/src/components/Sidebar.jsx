import { useState, useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import {
  MdDashboard,
  MdPeople,
  MdBusinessCenter,
  MdCardGiftcard,
  MdEvent,
  MdAssignment,
  MdFeedback,
  MdAttachMoney,
  MdAnalytics,
  MdAutoGraph,
  MdMenu,
  MdClose
} from 'react-icons/md';

const Sidebar = () => {
  const { user } = useContext(AuthContext);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // If no user is logged in, don't show the sidebar
  if (!user) return null;

  const getLinksForRole = (role) => {
    const adminLinks = [
      { path: '/admin', label: 'Dashboard', icon: MdDashboard },
      { path: '/users', label: 'User Management', icon: MdPeople },
      { path: '/clients', label: 'Client Management', icon: MdBusinessCenter },
      { path: '/packages', label: 'Package Mgt', icon: MdCardGiftcard },
      { path: '/tasks/calendar', label: 'Task Calendar', icon: MdEvent },
      { path: '/tasks', label: 'Task Management', icon: MdAssignment },
      { path: '/feedback', label: 'Feedback History', icon: MdFeedback },
      { path: '/payments', label: 'Payments', icon: MdAttachMoney },
      { path: '/analytics', label: 'Analytics', icon: MdAnalytics },
      { path: '/ai-insights', label: 'AI Insights', icon: MdAutoGraph },
    ];

    const managerLinks = [
      { path: '/manager', label: 'Dashboard', icon: MdDashboard },
      { path: '/clients', label: 'Client Management', icon: MdBusinessCenter },
      { path: '/tasks/calendar', label: 'Task Calendar', icon: MdEvent },
      { path: '/tasks', label: 'Task Management', icon: MdAssignment },
      { path: '/feedback', label: 'Feedback History', icon: MdFeedback },
      { path: '/payments', label: 'Payments', icon: MdAttachMoney },
      { path: '/analytics', label: 'Analytics', icon: MdAnalytics },
      { path: '/ai-insights', label: 'AI Insights', icon: MdAutoGraph },
    ];

    const staffLinks = [
      { path: '/staff', label: 'Dashboard', icon: MdDashboard },
      { path: '/tasks/calendar', label: 'My Calendar', icon: MdEvent },
    ];

    const clientLinks = [
      { path: '/client', label: 'Dashboard', icon: MdDashboard },
      { path: '/feedback/new', label: 'Submit Feedback', icon: MdFeedback },
      { path: '/feedback', label: 'My Feedback', icon: MdAssignment },
      { path: '/analytics', label: 'My Analytics', icon: MdAnalytics },
    ];

    switch (role) {
      case 'Admin': return adminLinks;
      case 'Manager': return managerLinks;
      case 'Staff': return staffLinks;
      case 'Client': return clientLinks;
      default: return [];
    }
  };

  const links = getLinksForRole(user.role);

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-slate-800 text-white p-3 rounded-lg shadow-lg"
      >
        {isMobileMenuOpen ? <MdClose size={24} /> : <MdMenu size={24} />}
      </button>

      {/* Sidebar */}
      <div className={`w-[250px] bg-slate-800 text-white min-h-screen fixed left-0 top-0 flex flex-col shadow-xl transform transition-transform duration-300 z-40
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-6 border-b border-slate-700 flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-wider text-blue-400">Intelligent CMS</h1>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="lg:hidden text-slate-400 hover:text-white"
          >
            <MdClose size={20} />
          </button>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {links.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              end={link.path === '/tasks' || link.path === '/feedback' || link.path === '/analytics'}
              onClick={() => setIsMobileMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
                  isActive
                    ? 'bg-blue-600 text-white font-medium'
                    : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                }`
              }
            >
              <link.icon size={20} />
              <span>{link.label}</span>
            </NavLink>
          ))}
        </nav>
        
        {/* 💡 Beginner Note: Showing the logged in role at the bottom */}
        <div className="p-4 border-t border-slate-700 text-center">
          <span className="text-xs text-slate-400 uppercase tracking-wider">Role</span>
          <div className="font-semibold text-blue-300">{user.role}</div>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;
