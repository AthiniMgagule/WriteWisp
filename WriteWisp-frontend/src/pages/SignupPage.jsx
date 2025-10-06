import { useState } from 'react';
import { useAuth } from '../context/useAuth';
import Button from '../components/ui/Button';
import { isValidEmail, validatePassword } from '../utils/helpers';

const SignupPage = ({ onNavigate }) => {
  const { signup } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters long';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Use validatePassword here
    const passwordErrors = validatePassword(formData.password);
    if (passwordErrors.length > 0) {
      newErrors.password = passwordErrors.join(', ');
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      await signup({
        username: formData.username,
        email: formData.email,
        password: formData.password
      });
      onNavigate('dashboard');
    } catch (error) {
      setErrors({ submit: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container vh-100 d-flex align-items-center justify-content-center">
      <div className="col-md-6 col-lg-5">
        <div className="text-center mb-4">
          <h1 className="text-primary" style={{ cursor: 'pointer' }} onClick={() => onNavigate('home')}>
            WriteWisp
          </h1>
          <p>Begin your writing journey today</p>
        </div>

        <div className="card shadow-sm">
          <div className="card-body">
            <h3 className="card-title text-center mb-4">Create Account</h3>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Username</label>
                <input
                  type="text"
                  name="username"
                  className={`form-control ${errors.username ? 'is-invalid' : ''}`}
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Choose a username"
                  disabled={loading}
                />
                {errors.username && <div className="invalid-feedback">{errors.username}</div>}
              </div>

              <div className="mb-3">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  name="email"
                  className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  disabled={loading}
                />
                {errors.email && <div className="invalid-feedback">{errors.email}</div>}
              </div>

              <div className="mb-3 position-relative">
                <label className="form-label">Password</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a password"
                  disabled={loading}
                />
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary position-absolute top-0 end-0 mt-2 me-2"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
                {errors.password && <div className="invalid-feedback">{errors.password}</div>}
              </div>

              <div className="mb-3">
                <label className="form-label">Confirm Password</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  disabled={loading}
                />
                {errors.confirmPassword && <div className="invalid-feedback">{errors.confirmPassword}</div>}
              </div>

              {errors.submit && <div className="alert alert-danger">{errors.submit}</div>}

              <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                {loading ? 'Creating...' : 'Create Account'}
              </button>
            </form>

            <div className="mt-3 text-center">
              <p className="small">
                Already have an account?{' '}
                <button className="btn btn-link p-0" onClick={() => onNavigate('login')}>
                  Sign in here
                </button>
              </p>
              <button className="btn btn-link p-0 small text-secondary" onClick={() => onNavigate('home')}>
                Back to home
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
