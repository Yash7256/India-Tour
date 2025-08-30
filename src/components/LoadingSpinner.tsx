import { FC } from 'react';

type LoadingSpinnerProps = {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
};

const sizeClasses = {
  sm: 'w-6 h-6',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
};

const LoadingSpinner: FC<LoadingSpinnerProps> = ({ 
  size = 'md',
  color = 'text-orange-500',
}) => {
  return (
    <div className="flex justify-center items-center">
      <div
        className={`animate-spin rounded-full border-t-2 border-b-2 border-current ${color} ${sizeClasses[size]}`}
        role="status"
      >
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );
};

export default LoadingSpinner;
