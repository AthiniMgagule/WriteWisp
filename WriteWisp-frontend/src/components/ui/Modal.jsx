import { useEffect } from 'react';
import { cn } from '../../utils/cn';
import Button from './Button';

const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'md',
  showCloseButton = true,
  className 
}) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizes = {
    sm: 'modal-sm',
    md: 'modal-md',
    lg: 'modal-lg',
    xl: 'modal-xl'
  };

  return (
    <div className="modal show d-block" tabIndex="-1">
      <div className="modal-dialog {sizes[size]}">
        <div className={cn("modal-content", className)}>
          {(title || showCloseButton) && (
            <div className="modal-header">
              {title && <h5 className="modal-title">{title}</h5>}
              {showCloseButton && (
                <button type="button" className="btn-close" aria-label="Close" onClick={onClose}></button>
              )}
            </div>
          )}

          <div className="modal-body">
            {children}
          </div>
        </div>
      </div>

      {/* Backdrop */}
      <div 
        className="modal-backdrop fade show"
        onClick={onClose}
      />
    </div>
  );
};

const ModalFooter = ({ children, className }) => (
  <div className={cn("modal-footer", className)}>
    {children}
  </div>
);

export { Modal, ModalFooter };
