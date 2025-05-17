import React from 'react';
import './CarPaymentForm.css';

export default function PaymentModal({ result, viewMode, onToggleMode, onClose }) {
  const multiplier = viewMode === 'Monthly' ? 1 : 12;
  const displayTotal = viewMode === 'Monthly' ? result.monthlyTotal : result.annualTotal;

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h2>{viewMode} Payment Breakdown</h2>
        <p>Loan Amount: ${result.loanAmount}</p>
        <p>Loan Term: {result.loanTerm} months</p>
        <p>APR: {result.apr}%</p>
        <p>Tax: ${result.taxAmount}</p>
        <p>Loan Payment: ${(result.monthlyLoanPayment * multiplier).toFixed(2)}</p>
        <p>Insurance: ${(result.insurance * multiplier).toFixed(2)}</p>
        <p>Maintenance: ${(result.maintenance * multiplier).toFixed(2)}</p>
        <p>Registration: ${(result.registration * multiplier).toFixed(2)}</p>
        <hr />
        <h3>Total {viewMode} Payment: ${displayTotal}</h3>
        <button onClick={onToggleMode}>
          Switch to {viewMode === 'Monthly' ? 'Annual' : 'Monthly'}
        </button>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
}