import { Routes, Route } from 'react-router-dom';
import { useContext } from 'react';

// Layout Components
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import AIChatBubble from './components/AIChatBubble';
import NotificationSystem from './components/NotificationSystem';
import ConfirmDialog from './components/ConfirmDialog';
import { AuthContext } from './context/AuthContext';

// Public Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';

// Admin Dashboards
import AdminDashboard from './pages/AdminDashboard';
import ManagerDashboard from './pages/ManagerDashboard';
import StaffDashboard from './pages/StaffDashboard';
import ClientDashboard from './pages/ClientDashboard';

// Management Pages
import UserManagement from './pages/UserManagement';
import ClientManagement from './pages/ClientManagement';
import ClientProfile from './pages/ClientProfile';
import PackageManagement from './pages/PackageManagement';

// Task & Operations
import TaskCalendar from './pages/TaskCalendar';
import TaskManagement from './pages/TaskManagement';
import FeedbackForm from './pages/FeedbackForm';
import FeedbackHistory from './pages/FeedbackHistory';
import PaymentDashboard from './pages/PaymentDashboard';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import AIInsights from './pages/AIInsights';

function App() {
  const { user } = useContext(AuthContext);
  
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      <Routes>
        {/* PUBLIC ROUTES - No Sidebar/Navbar */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        
        {/* AUTHENTICATED ROUTES - With Sidebar/Navbar */}
        <Route path="/*" element={
          <div className="flex w-full">
            {user && <Sidebar />}
            <div className="flex-1 flex flex-col overflow-hidden lg:ml-[250px]">
              <Navbar />
              <main className="flex-1 overflow-y-auto w-full">
                <Routes>
                  {/* PROTECTED ROUTES */}
                  <Route path="/admin" element={<ProtectedRoute allowedRoles={['Admin']}><AdminDashboard /></ProtectedRoute>} />
                  <Route path="/users" element={<ProtectedRoute allowedRoles={['Admin']}><UserManagement /></ProtectedRoute>} />
                  <Route path="/packages" element={<ProtectedRoute allowedRoles={['Admin']}><PackageManagement /></ProtectedRoute>} />

                  <Route path="/manager" element={<ProtectedRoute allowedRoles={['Manager']}><ManagerDashboard /></ProtectedRoute>} />

                  <Route path="/staff" element={<ProtectedRoute allowedRoles={['Staff']}><StaffDashboard /></ProtectedRoute>} />

                  <Route path="/client" element={<ProtectedRoute allowedRoles={['Client']}><ClientDashboard /></ProtectedRoute>} />
                  <Route path="/feedback/new" element={<ProtectedRoute allowedRoles={['Client']}><FeedbackForm /></ProtectedRoute>} />

                  {/* SHARED PROTECTED ROUTES: Admin + Manager */}
                  <Route path="/clients" element={<ProtectedRoute allowedRoles={['Admin', 'Manager']}><ClientManagement /></ProtectedRoute>} />
                  <Route path="/clients/:id" element={<ProtectedRoute allowedRoles={['Admin', 'Manager']}><ClientProfile /></ProtectedRoute>} />
                  <Route path="/tasks" element={<ProtectedRoute allowedRoles={['Admin', 'Manager']}><TaskManagement /></ProtectedRoute>} />
                  <Route path="/payments" element={<ProtectedRoute allowedRoles={['Admin', 'Manager']}><PaymentDashboard /></ProtectedRoute>} />
                  <Route path="/ai-insights" element={<ProtectedRoute allowedRoles={['Admin', 'Manager']}><AIInsights /></ProtectedRoute>} />

                  {/* SHARED PROTECTED ROUTES: Staff + Admin + Manager */}
                  <Route path="/tasks/calendar" element={<ProtectedRoute allowedRoles={['Admin', 'Manager', 'Staff']}><TaskCalendar /></ProtectedRoute>} />

                  {/* SHARED PROTECTED ROUTES: Client + Admin + Manager */}
                  <Route path="/analytics" element={<ProtectedRoute allowedRoles={['Admin', 'Manager', 'Client']}><AnalyticsDashboard /></ProtectedRoute>} />

                  {/* ALL AUTHENTICATED USERS */}
                  <Route path="/feedback" element={<ProtectedRoute><FeedbackHistory /></ProtectedRoute>} />
                </Routes>
              </main>
            </div>
          </div>
        } />
      </Routes>

      {/* Global UI Components */}
      <NotificationSystem />
      <ConfirmDialog />
      
      {/* AI Chat Bubble - Only show for authenticated users */}
      {user && <AIChatBubble />}
    </div>
  );
}

export default App;
