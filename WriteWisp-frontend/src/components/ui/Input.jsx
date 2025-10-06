import { forwardRef } from 'react';
import { cn } from '../../utils/cn';

const Input = forwardRef(({ 
  className, 
  type = 'text', 
  error,
  label,
  helperText,
  ...props 
}, ref) => {
  return (
    <div className="mb-3">
      {label && (
        <label className="form-label">
          {label}
        </label>
      )}
      <input
        type={type}
        className={cn(
          'form-control',
          error && 'is-invalid',
          className
        )}
        ref={ref}
        {...props}
      />
      {(error || helperText) && (
        <div className={cn(error ? 'invalid-feedback' : 'form-text')}>
          {error || helperText}
        </div>
      )}
    </div>
  );
});

Input.displayName = 'Input';

const Textarea = forwardRef(({ 
  className, 
  error,
  label,
  helperText,
  rows = 3,
  ...props 
}, ref) => {
  return (
    <div className="mb-3">
      {label && (
        <label className="form-label">
          {label}
        </label>
      )}
      <textarea
        rows={rows}
        className={cn(
          'form-control',
          error && 'is-invalid',
          className
        )}
        ref={ref}
        {...props}
      />
      {(error || helperText) && (
        <div className={cn(error ? 'invalid-feedback' : 'form-text')}>
          {error || helperText}
        </div>
      )}
    </div>
  );
});

Textarea.displayName = 'Textarea';

const Select = forwardRef(({ 
  className,
  error,
  label,
  helperText,
  children,
  ...props 
}, ref) => {
  return (
    <div className="mb-3">
      {label && (
        <label className="form-label">
          {label}
        </label>
      )}
      <select
        className={cn(
          'form-select',
          error && 'is-invalid',
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </select>
      {(error || helperText) && (
        <div className={cn(error ? 'invalid-feedback' : 'form-text')}>
          {error || helperText}
        </div>
      )}
    </div>
  );
});

Select.displayName = 'Select';

export { Input, Textarea, Select };
