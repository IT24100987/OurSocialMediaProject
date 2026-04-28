import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { MdRocketLaunch, MdEmail, MdLockOutline } from 'react-icons/md';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const Login = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validateLoginForm = () => {
    const trimmedEmail = email.trim().toLowerCase();
    const nextErrors = {};

    if (!trimmedEmail) {
      nextErrors.email = 'Email is required';
    } else if (!EMAIL_REGEX.test(trimmedEmail)) {
      nextErrors.email = 'Please enter a valid email address';
    }

    if (!password) {
      nextErrors.password = 'Password is required';
    }

    setFieldErrors(nextErrors);
    return { isValid: Object.keys(nextErrors).length === 0, trimmedEmail };
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    const { isValid, trimmedEmail } = validateLoginForm();

    if (!isValid) {
      return;
    }

    setLoading(true);

    try {
      // Send credentials to backend
      const { data } = await api.post('/auth/login', { email: trimmedEmail, password });
      
      // Save everything using Context
      login({ _id: data._id, name: data.name, email: data.email, role: data.role }, data.token);

      // 💡 Beginner Note: Redirect user to the correct dashboard based on their role
      switch (data.role) {
        case 'Admin': navigate('/admin'); break;
        case 'Manager': navigate('/manager'); break;
        case 'Staff': navigate('/staff'); break;
        case 'Client': navigate('/client'); break;
        default: navigate('/'); 
      }

    } catch (err) {
      // Show user-friendly error message on screen
      setError(err.response?.data?.message || 'Invalid login details');
    } finally {
      setLoading(false);
    }
  };

  // 💡 Beginner Note: Styling this using a sleek dark background with a centered white card
  return (
    <div className="min-h-screen w-full bg-slate-900 flex items-center justify-center p-4 md:p-8">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md md:max-w-lg overflow-hidden animate-fade-in-up">
        
        {/* Header Block */}
        <div className="bg-blue-600 p-6 md:p-8 text-center text-white">
          <MdRocketLaunch size={48} className="mx-auto mb-4 text-blue-200" />
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">Welcome Back</h2>
          <p className="text-blue-100 mt-2 text-sm md:text-base font-medium tracking-wide">Enter your details to access the system</p>
        </div>

        <div className="p-6 md:p-8">
          {/* Error Alert Box */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded text-sm font-semibold shadow-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="relative">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Email Address</label>
              <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all bg-slate-50">
                <span className="pl-4 text-slate-400"><MdEmail size={20} /></span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (fieldErrors.email) {
                      setFieldErrors((prev) => ({ ...prev, email: undefined }));
                    }
                  }}
                  className="w-full px-4 py-3 bg-transparent focus:outline-none text-slate-800 font-medium"
                  placeholder="admin@system.com"
                />
              </div>
              {fieldErrors.email && <p className="text-red-600 text-xs mt-2 font-medium">{fieldErrors.email}</p>}
            </div>

            <div className="relative">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Password</label>
              <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all bg-slate-50">
                <span className="pl-4 text-slate-400"><MdLockOutline size={20} /></span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (fieldErrors.password) {
                      setFieldErrors((prev) => ({ ...prev, password: undefined }));
                    }
                  }}
                  className="w-full px-4 py-3 bg-transparent focus:outline-none text-slate-800 tracking-widest"
                  placeholder="••••••••"
                />
              </div>
              {fieldErrors.password && <p className="text-red-600 text-xs mt-2 font-medium">{fieldErrors.password}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 rounded-xl text-white font-bold text-lg tracking-wide shadow-lg transition-all transform hover:scale-105 ${
                loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 hover:shadow-xl'
              }`}
            >
              {loading ? 'Authenticating...' : 'Secure Login'}
            </button>
          </form>

          <div className="mt-8 text-center border-t border-slate-100 pt-6">
            <p className="text-slate-500 text-sm">
              New client?{' '}
              <Link to="/" className="text-blue-600 font-bold hover:underline transition-all">
                Register an account
              </Link>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;
