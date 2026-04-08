import React, { useState } from 'react';
import './App.css';

const BUTTONS = [
  { label: 'Clear', type: 'function', wide: false },
  { label: '+/-',   type: 'function', wide: false },
  { label: '%',     type: 'operator', wide: false },
  { label: '÷',     type: 'operator', wide: false },

  { label: '7', type: 'number' },
  { label: '8', type: 'number' },
  { label: '9', type: 'number' },
  { label: 'x', type: 'operator' },

  { label: '4', type: 'number' },
  { label: '5', type: 'number' },
  { label: '6', type: 'number' },
  { label: '-', type: 'operator' },

  { label: '1', type: 'number' },
  { label: '2', type: 'number' },
  { label: '3', type: 'number' },
  { label: '+', type: 'operator' },

  { label: '⌫',  type: 'function', wide: false },
  { label: '0',  type: 'number',   wide: false },
  { label: '.',  type: 'number',   wide: false },
  { label: '=',  type: 'equals',   wide: false },
];

// Operators that can appear between operands
const OPERATORS = new Set(['+', '-', 'x', '÷', '%']);

export default function App() {
  const [expression, setExpression] = useState('');
  const [justCalculated, setJustCalculated] = useState(false);

  // Returns the last number token in the expression string
  function getLastNumber(expr) {
    const match = expr.match(/(-?\d*\.?\d+)([+\-x÷%]?)$/);
    return match ? match[1] : null;
  }

  function handleButton(label) {
    switch (label) {
      case 'Clear':
        setExpression('');
        setJustCalculated(false);
        break;

      case '⌫':
        setExpression(prev => prev.slice(0, -1));
        setJustCalculated(false);
        break;

      case '+/-': {
        // Negate the last number in the expression
        setExpression(prev => {
          if (!prev) return '-';
          // Find last operator position
          const opIndex = Math.max(
            prev.lastIndexOf('+', prev.length - 1),
            prev.lastIndexOf('-', prev.length - 1),
            prev.lastIndexOf('x'),
            prev.lastIndexOf('÷'),
            prev.lastIndexOf('%'),
          );
          const lastNum = prev.slice(opIndex + 1);
          const prefix  = prev.slice(0, opIndex + 1);
          if (!lastNum) return prev;
          if (lastNum.startsWith('-')) {
            return prefix + lastNum.slice(1);
          } else {
            return prefix + '-' + lastNum;
          }
        });
        setJustCalculated(false);
        break;
      }

      case '=':
        if (!expression) return;
        fetchCalculate(expression);
        break;

      default: {
        // After a completed calculation, pressing an operator continues the
        // result; pressing a number starts fresh.
        if (justCalculated) {
          if (OPERATORS.has(label)) {
            setExpression(prev => prev + label);
          } else {
            setExpression(label);
          }
          setJustCalculated(false);
          break;
        }

        // Prevent two operators in a row (replace the last operator instead)
        if (OPERATORS.has(label)) {
          setExpression(prev => {
            if (!prev) return label === '-' ? label : '';
            const lastChar = prev[prev.length - 1];
            if (OPERATORS.has(lastChar)) {
              return prev.slice(0, -1) + label;
            }
            return prev + label;
          });
        } else {
          setExpression(prev => prev + label);
        }
        break;
      }
    }
  }

  async function fetchCalculate(expr) {
    try {
      const response = await fetch('/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ expression: expr }),
      });
      const data = await response.json();
      setExpression(data.result);
      setJustCalculated(true);
    } catch (err) {
      setExpression('Error');
      setJustCalculated(true);
    }
  }

  // Display: show placeholder when empty
  const displayText = expression || '0';

  return (
    <div className="calculator">
      <div className="display">
        <span className="display-text">{displayText}</span>
      </div>
      <div className="buttons">
        {BUTTONS.map(({ label, type }) => (
          <button
            key={label}
            className={`btn btn-${type}`}
            onClick={() => handleButton(label)}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
