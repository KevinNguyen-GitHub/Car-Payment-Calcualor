// src/components/Calculator.jsx
import React, {
  useReducer,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import './CarPaymentForm.css';
import PaymentModal from './PaymentModal';
import ToggleGroup from './ToggleGroup';

const initialForm = {
  carPrice: '',
  downPayment: '',
  tradeIn: '',
  taxRate: '',
  apr: 5,
  loanTerm: 60,
  creditScore: 'Good (700-749)',
  bodyStyle: 'Sedan',
  manufacturer: 'Toyota',
  insurance: 150,
  maintenance: 50,
  registration: 20,
};

const creditScoreRates = {
  'Excellent (750-850)': 3.5,
  'Good (700-749)': 5,
  'Fair (650-699)': 7,
  'Poor (600-649)': 10,
  'Very Poor (<600)': 15,
};

const feeModel = {
  manufacturers: {
    Tesla:   { insurance: 300, maintenance: 100, registration: 150 },
    BMW:     { insurance: 250, maintenance: 150, registration: 130 },
    Toyota:  { insurance: 180, maintenance: 80,  registration: 90 },
    Default: { insurance: 200, maintenance: 100, registration: 100 },
  },
  bodyStyles: {
    SUV:     { insurance: 50, maintenance: 30 },
    Sedan:   { insurance: 30, maintenance: 20 },
    Truck:   { insurance: 70, maintenance: 50 },
    Default: { insurance: 40, maintenance: 25 },
  },
};

function formReducer(state, action) {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, [action.field]: action.value };
    case 'ADJUST_FEES': {
      const mf = feeModel.manufacturers[state.manufacturer] || feeModel.manufacturers.Default;
      const bf = feeModel.bodyStyles[state.bodyStyle]     || feeModel.bodyStyles.Default;
      return {
        ...state,
        insurance: mf.insurance + bf.insurance,
        maintenance: mf.maintenance + bf.maintenance,
        registration: mf.registration,
      };
    }
    case 'FORMAT_NUMBER':
      return { ...state, [action.field]: action.value };
    default:
      return state;
  }
}

// fields in two-column grid
const inputFields = [
  { name: 'carPrice',     label: 'Car Price ($)'           },
  { name: 'downPayment',  label: 'Down Payment ($)'        },
  { name: 'tradeIn',      label: 'Trade-in Value ($)'      },
  { name: 'taxRate',      label: 'Tax Rate (%)'            },
  { name: 'apr',          label: 'APR (%)'                 },
];

export default function Calculator() {
  const [form, dispatch] = useReducer(formReducer, initialForm);
  const [result, setResult] = useState(null);
  const [viewMode, setViewMode] = useState('Monthly');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    dispatch({ type: 'ADJUST_FEES' });
  }, [form.manufacturer, form.bodyStyle]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    dispatch({ type: 'SET_FIELD', field: name, value });
  }, []);

  const handleBlur = useCallback((e) => {
    const { name, value } = e.target;
    const num = value.replace(/,/g, '');
    if (!isNaN(num) && num !== '') {
      dispatch({
        type: 'FORMAT_NUMBER',
        field: name,
        value: parseFloat(num).toLocaleString(),
      });
    }
  }, []);

  const parseCurrency = useCallback(
    (v) => parseFloat(v.toString().replace(/,/g, '') || 0),
    []
  );

  const calculatePayment = useCallback(() => {
    const {
      carPrice, downPayment, tradeIn,
      taxRate, apr, loanTerm,
      insurance, maintenance, registration,
    } = form;

    const price   = parseCurrency(carPrice);
    const down    = parseCurrency(downPayment);
    const trade   = parseCurrency(tradeIn);
    const taxPct  = parseFloat(taxRate || 0) / 100;

    const aprMonthly = parseFloat(apr) / 100 / 12;
    const term       = parseFloat(loanTerm);
    const ins        = parseCurrency(insurance);
    const maint      = parseCurrency(maintenance);
    const reg        = parseCurrency(registration);

    const taxable = price - down - trade;
    const taxAmt  = taxable * taxPct;
    const loanAmt = taxable + taxAmt;

    const monthlyLoanPayment = (loanAmt * aprMonthly) /
      (1 - Math.pow(1 + aprMonthly, -term));
    const monthlyTotal = monthlyLoanPayment + ins + maint + reg;

    setResult({
      monthlyLoanPayment: monthlyLoanPayment.toFixed(2),
      insurance: ins.toFixed(2),
      maintenance: maint.toFixed(2),
      registration: reg.toFixed(2),
      monthlyTotal: monthlyTotal.toFixed(2),
      annualTotal: (monthlyTotal * 12).toFixed(2),
      loanAmount: loanAmt.toFixed(2),
      taxAmount: taxAmt.toFixed(2),
      apr, loanTerm,
    });
    setShowModal(true);
  }, [form, parseCurrency]);

  const creditOptions = useMemo(
    () => Object.keys(creditScoreRates).slice().reverse(),
    []
  );

  return (
    <div className="page-wrapper">
      <main className="page-main">
        <div className="card">
          {inputFields.map(({ name, label }) => (
            <div className="form-group" key={name}>
              <label>{label}</label>
              <input
                type="text"
                name={name}
                value={form[name]}
                onChange={handleChange}
                onBlur={handleBlur}
              />
            </div>
          ))}

          {/* Fees grouped */}
          <div className="fees-group">
            {['insurance', 'maintenance', 'registration'].map((name) => (
              <div className="form-group" key={name}>
                <label>{name.charAt(0).toUpperCase() + name.slice(1)}</label>
                <input
                  type="text"
                  name={name}
                  value={form[name]}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
              </div>
            ))}
          </div>

          {/* Loan Term */}
          <div className="form-group full-width">
            <label>Loan Term (Months)</label>
            <ToggleGroup
              options={[36, 48, 60, 72]}
              selected={form.loanTerm}
              onSelect={(val) =>
                dispatch({ type: 'SET_FIELD', field: 'loanTerm', value: val })
              }
            />
          </div>

          {/* Credit Score */}
          <div className="form-group full-width">
            <label>Credit Score</label>
            <div className="toggle-group">
              {creditOptions.map((scoreKey) => {
                const [labelText, range] =
                  scoreKey.match(/^(.+?)\s*\((.+)\)$/)?.slice(1) || [scoreKey, ''];
                return (
                  <div
                    key={scoreKey}
                    className={`toggle-button ${
                      form.creditScore === scoreKey ? 'active' : ''
                    }`}
                    onClick={() =>
                      dispatch({
                        type: 'SET_FIELD',
                        field: 'creditScore',
                        value: scoreKey,
                      })
                    }
                  >
                    <span>{labelText}</span>
                    <small>{range}</small>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Calculate */}
          <div className="form-group full-width">
            <button onClick={calculatePayment}>Calculate Estimate</button>
          </div>
        </div>
      </main>

      {showModal && (
        <PaymentModal
          result={result}
          viewMode={viewMode}
          onToggleMode={() =>
            setViewMode((m) => (m === 'Monthly' ? 'Annual' : 'Monthly'))
          }
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
