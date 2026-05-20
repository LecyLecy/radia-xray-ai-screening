import React from 'react';
import './components.css';

export const FormInput = ({ label, type = 'text', name, value, onChange, placeholder, required = false, disabled = false }) => {
  return (
    <div className="radia-form-group">
      {label && <label className="radia-label">{label}</label>}
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className="radia-input"
      />
    </div>
  );
};