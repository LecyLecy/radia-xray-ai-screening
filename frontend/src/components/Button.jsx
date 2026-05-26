import './components.css';

export const Button = ({ children, variant = 'primary', type = 'button', onClick, className = '' }) => {
  return (
    <button 
      type={type} 
      onClick={onClick} 
      className={`radia-btn radia-btn-${variant} ${className}`}
    >
      {children}
    </button>
  );
};