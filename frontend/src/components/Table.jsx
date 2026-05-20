import React from 'react';
import './components.css';

export const Table = ({ headers, children }) => {
  return (
    <div className="table-container">
      <table className="radia-table">
        <thead>
          <tr>
            {headers.map((h, i) => <th key={i}>{h}</th>)}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
};