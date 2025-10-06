import { useState } from 'react';
import { useAuth } from '../../context/useAuth';

const Navbar = ({ onNavigate }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    onNavigate('home');
    setIsMenuOpen(false);
  };

  return (
    <nav className="navbar navbar-expand-md navbar-light bg-white border-bottom shadow-sm">
      <div className="container">
        {/* Logo */}
        <span
          className="navbar-brand fw-bold text-primary"
          style={{ cursor: 'pointer' }}
          onClick={() => onNavigate(isAuthenticated ? 'dashboard' : 'home')}
        >
          WriteWisp
        </span>

        {/* Mobile toggle */}
        <button
          className="navbar-toggler"
          type="button"
          aria-expanded={isMenuOpen ? 'true' : 'false'}
          aria-label="Toggle navigation"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Collapsible Menu */}
        <div className={`collapse navbar-collapse ${isMenuOpen ? 'show' : ''}`}>
          <ul className="navbar-nav ms-auto align-items-center">
            {isAuthenticated ? (
              <>
                {/* Dashboard link */}
                <li className="nav-item">
                  <button
                    className="btn btn-link nav-link"
                    onClick={() => {
                      onNavigate('dashboard');
                      setIsMenuOpen(false);
                    }}
                  >
                    Dashboard
                  </button>
                </li>

                {/* User dropdown */}
                <li className="nav-item dropdown">
                  <button
                    className="nav-link dropdown-toggle d-flex align-items-center"
                    id="userDropdown"
                    role="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <div
                      className="rounded-circle bg-primary text-white d-flex justify-content-center align-items-center me-2"
                      style={{ width: '32px', height: '32px', fontSize: '0.9rem' }}
                    >
                      {user?.username?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <span className="small">{user?.username}</span>
                  </button>
                  <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
                    <li>
                      <button
                        className="dropdown-item"
                        onClick={() => {
                          onNavigate('profile');
                          setIsMenuOpen(false);
                        }}
                      >
                        Profile
                      </button>
                    </li>
                    <li>
                      <button className="dropdown-item" onClick={handleLogout}>
                        Sign Out
                      </button>
                    </li>
                  </ul>
                </li>
              </>
            ) : (
              <>
                {/* Sign In */}
                <li className="nav-item">
                  <button
                    className="btn btn-link nav-link"
                    onClick={() => {
                      onNavigate('login');
                      setIsMenuOpen(false);
                    }}
                  >
                    Sign In
                  </button>
                </li>

                {/* Get Started */}
                <li className="nav-item">
                  <button
                    className="btn btn-primary"
                    onClick={() => {
                      onNavigate('signup');
                      setIsMenuOpen(false);
                    }}
                  >
                    Get Started
                  </button>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
