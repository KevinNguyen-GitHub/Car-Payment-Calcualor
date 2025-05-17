import React from 'react';
import Calculator from './Calculator';
import './CarPaymentForm.css';

export default function CarPayment() {
  return (
    <div className="page-wrapper">
      <header className="page-header">
        <h1>Car Payment Estimator</h1>
      </header>
      <main className="page-main">
        <Calculator />
      </main>
    </div>
  );
}