import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { MdLogout, MdPerson } from 'react-icons/md';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  // If nobody is logged in, no need for the dashboard top bar
  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="h-14 bg-white shadow-sm flex items-center justify-between px-4 md:px-6 sticky top-0 z-10 border-b border-slate-200">
      {/* Left side - Breadcrumb or page title */}
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-sm">S</span>
        </div>
        <div className="hidden sm:block">
          <div className="text-sm font-semibold text-slate-800">SpotOn CMS</div>
          <div className="text-xs text-slate-500">Management System</div>
        </div>
      </div>
      
      {/* Right side - User profile and logout */}
      <div className="flex items-center space-x-3">
        
        {/* User Profile Area */}
        <div className="flex items-center space-x-2 text-slate-600">
          <div className="bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-600 p-1.5 rounded-full">
            <MdPerson size={18} />
          </div>
          <div className="hidden md:block">
            <div className="text-sm font-semibold text-slate-800">{user.name}</div>
            <div className="text-xs text-slate-500">{user.email}</div>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="flex items-center space-x-1 text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-all duration-200 group"
          title="Logout"
        >
          <MdLogout size={18} className="group-hover:scale-110 transition-transform" />
          <span className="font-medium text-sm hidden sm:inline">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Navbar;
