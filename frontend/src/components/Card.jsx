import './components.css';

export const Card = ({ title, children, className = '' }) => {
  return (
    <div className={`radia-card ${className}`}>
      {title && <div className="radia-card-header"><h3>{title}</h3></div>}
      <div className="radia-card-body">{children}</div>
    </div>
  );
};