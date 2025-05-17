import React from 'react';
import './CarPaymentForm.css';

export default function ToggleGroup({ options, selected, onSelect }) {
  return (
    <div className="toggle-group">
      {options.map(option => (
        <div
          key={option}
          className={`toggle-button ${selected === option ? 'active' : ''}`}
          onClick={() => onSelect(option)}
        >
          {option}
        </div>
      ))}
    </div>
  );
}