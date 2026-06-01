import './components.css';

export const StatusBadge = ({ status }) => {
  const normalizedStatus = status?.toLowerCase();
  const isReady = normalizedStatus === 'ready'
    || normalizedStatus === 'report_ready'
    || normalizedStatus === 'report ready';
  const badgeClass = isReady ? 'badge-ready' : 'badge-pending';
  const label = isReady ? 'READY' : 'NOT READY';

  return <span className={`radia-badge ${badgeClass}`}>{label}</span>;
};
