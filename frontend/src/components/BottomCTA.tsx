import { ReactNode } from 'react';

interface BottomCTAProps {
  children: ReactNode;
  className?: string;
}

export const BottomCTA = ({ children, className = '' }: BottomCTAProps) => {
  return (
    <div className={`
      fixed bottom-0 left-0 right-0 
      bg-white border-t border-border
      px-4 pt-3 pb-6
      safe-area-bottom
      z-30
      ${className}
    `}>
      {children}
    </div>
  );
};

interface CTAButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  fullWidth?: boolean;
  disabled?: boolean;
  type?: 'button' | 'submit';
}

export const CTAButton = ({
  children,
  onClick,
  variant = 'primary',
  fullWidth = false,
  disabled = false,
  type = 'button',
}: CTAButtonProps) => {
  const variantClasses = {
    primary: 'bg-primary-mint text-white hover:bg-primary-mint/90',
    secondary: 'bg-white text-text-primary border-2 border-border hover:bg-gray-50',
    outline: 'bg-white text-primary-mint border-2 border-primary-mint hover:bg-mint-50',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        flex items-center justify-center gap-2
        h-12 px-6 rounded-[16px]
        text-[15px] font-semibold
        transition-all
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variantClasses[variant]}
        ${fullWidth ? 'w-full' : ''}
      `}
    >
      {children}
    </button>
  );
};

