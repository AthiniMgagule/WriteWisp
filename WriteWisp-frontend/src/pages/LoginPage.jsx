import { useState } from 'react';
import { useAuth } from '../context/useAuth';
import Button from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { isValidEmail } from '../utils/helpers';

const LoginPage = ({ onNavigate }) => {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
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

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      await login(formData);
      onNavigate('dashboard');
    } catch (error) {
      setErrors({ submit: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center bg-light py-5">
      <div className="col-md-6 col-lg-4">
        <div className="text-center mb-4">
          <h1 
            className="fw-bold text-primary"
            style={{ cursor: 'pointer' }}
            onClick={() => onNavigate('home')}
          >
            WriteWisp
          </h1>
          <p className="text-muted">Welcome back to your writing sanctuary</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="h4 text-center">Sign In</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <Input
                  name="email"
                  type="email"
                  label="Email Address"
                  value={formData.email}
                  onChange={handleChange}
                  error={errors.email}
                  placeholder="Enter your email"
                  disabled={loading}
                  className="form-control"
                />
                {errors.email && <small className="text-danger">{errors.email}</small>}
              </div>

              <div className="mb-3 position-relative">
                <Input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  label="Password"
                  value={formData.password}
                  onChange={handleChange}
                  error={errors.password}
                  placeholder="Enter your password"
                  disabled={loading}
                  className="form-control"
                />
                <button
                  type="button"
                  className="btn btn-link position-absolute top-50 end-0 translate-middle-y text-secondary"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <i className={`bi bi-eye${showPassword ? '-slash' : ''}`}></i>
                </button>
                {errors.password && <small className="text-danger">{errors.password}</small>}
              </div>

              {errors.submit && (
                <div className="alert alert-danger" role="alert">
                  {errors.submit}
                </div>
              )}

              <Button
                type="submit"
                className="btn btn-primary w-100"
                loading={loading}
                disabled={loading}
              >
                Sign In
              </Button>
            </form>

            <div className="mt-4 text-center">
              <p className="small text-muted">
                Don't have an account?{' '}
                <button
                  onClick={() => onNavigate('signup')}
                  className="btn btn-link p-0 text-decoration-none"
                >
                  Sign up here
                </button>
              </p>
              <button
                onClick={() => onNavigate('home')}
                className="btn btn-sm btn-outline-secondary mt-2"
              >
                Back to home
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
