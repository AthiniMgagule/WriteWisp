import { cn } from '../../utils/cn';

const Card = ({ className, children, ...props }) => (
  <div
    className={cn(
      'card shadow-sm rounded',
      className
    )}
    {...props}
  >
    {children}
  </div>
);

const CardHeader = ({ className, children, ...props }) => (
  <div
    className={cn('card-header d-flex flex-column', className)}
    {...props}
  >
    {children}
  </div>
);

const CardTitle = ({ className, children, ...props }) => (
  <h5
    className={cn('card-title mb-1', className)}
    {...props}
  >
    {children}
  </h5>
);

const CardDescription = ({ className, children, ...props }) => (
  <p
    className={cn('card-text text-muted small', className)}
    {...props}
  >
    {children}
  </p>
);

const CardContent = ({ className, children, ...props }) => (
  <div className={cn('card-body pt-0', className)} {...props}>
    {children}
  </div>
);

const CardFooter = ({ className, children, ...props }) => (
  <div
    className={cn('card-footer d-flex align-items-center pt-0', className)}
    {...props}
  >
    {children}
  </div>
);

export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
};
