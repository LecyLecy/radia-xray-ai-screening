import React from 'react';
import './components.css';

export const StatusBadge = ({ status }) => {
  let badgeClass = 'badge-pending';
  if (status === 'Reviewed') badgeClass = 'badge-reviewed';
  if (status === 'Report Ready') badgeClass = 'badge-ready';

  return <span className={`radia-badge ${badgeClass}`}>{status}</span>;
};