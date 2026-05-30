import './components.css';

export const StatusBadge = ({ status }) => {
  const normalizedStatus = status?.toLowerCase();
  let badgeClass = 'badge-pending';
  if (normalizedStatus === 'reviewed') badgeClass = 'badge-reviewed';
  if (normalizedStatus === 'report_ready' || normalizedStatus === 'report ready') badgeClass = 'badge-ready';

  return <span className={`radia-badge ${badgeClass}`}>{status}</span>;
};
