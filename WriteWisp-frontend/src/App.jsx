import { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthProvider';
import { useAuth } from './context/useAuth';
import Navbar from './components/layout/Navbar';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import Dashboard from './pages/Dashboard';
import EditorPage from './pages/EditorPage';

// Protected Route Component
const ProtectedRoute = ({ children, fallback }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  return isAuthenticated ? children : fallback;
};

// Main App Router Component
const AppRouter = () => {
  const { isAuthenticated, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedNovel, setSelectedNovel] = useState(null);

  // Initialize the current page based on auth status
  useEffect(() => {
    if (!loading) {
      if (isAuthenticated && currentPage === 'home') {
        setCurrentPage('dashboard');
      } else if (!isAuthenticated && ['dashboard', 'editor'].includes(currentPage)) {
        setCurrentPage('home');
      }
    }
  }, [isAuthenticated, loading, currentPage]);

  const navigate = (page, data = null) => {
    setCurrentPage(page);
    if (data) {
      setSelectedNovel(data);
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <LandingPage onNavigate={navigate} />;
      
      case 'login':
        return <LoginPage onNavigate={navigate} />;
      
      case 'signup':
        return <SignupPage onNavigate={navigate} />;
      
      case 'dashboard':
        return (
          <ProtectedRoute fallback={<LandingPage onNavigate={navigate} />}>
            <Dashboard onNavigate={navigate} />
          </ProtectedRoute>
        );
      
      case 'editor':
        return (
          <ProtectedRoute fallback={<LandingPage onNavigate={navigate} />}>
            <EditorPage 
              novel={selectedNovel} 
              onBack={() => navigate('dashboard')} 
            />
          </ProtectedRoute>
        );
      
      default:
        return <LandingPage onNavigate={navigate} />;
    }
  };

  const showNavbar = !['editor'].includes(currentPage);

  return (
    <div className="min-h-screen bg-gray-50">
      {showNavbar && <Navbar onNavigate={navigate} />}
      {renderPage()}
    </div>
  );
};

// Main App Component with Providers
const App = () => {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
};

export default App;