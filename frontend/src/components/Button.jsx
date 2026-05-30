import './components.css';

export const Button = ({
  children,
  variant = 'primary',
  type = 'button',
  onClick,
  className = '',
  ...props
}) => {
  return (
    <button 
      type={type} 
      onClick={onClick} 
      className={`radia-btn radia-btn-${variant} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
