import { forwardRef } from 'react';
import { cn } from '../../utils/cn';

const Button = forwardRef(({ 
  className, 
  variant = 'primary', 
  size = 'md', 
  loading = false,
  disabled = false,
  children, 
  ...props 
}, ref) => {
  // Bootstrap base classes
  const baseClasses = 'btn d-inline-flex align-items-center justify-content-center fw-medium';

  // Bootstrap variants
  const variants = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    outline: 'btn-outline-primary',
    ghost: 'btn-link text-primary',
    danger: 'btn-danger',
    success: 'btn-success'
  };

  // Bootstrap sizes
  const sizes = {
    sm: 'btn-sm',
    md: '',
    lg: 'btn-lg'
  };

  return (
    <button
      ref={ref}
      className={cn(
        baseClasses,
        variants[variant],
        sizes[size],
        loading && 'disabled opacity-75',
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span 
          className="spinner-border spinner-border-sm me-2" 
          role="status" 
          aria-hidden="true"
        />
      )}
      {children}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;
