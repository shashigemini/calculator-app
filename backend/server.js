const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

/**
 * Safely evaluates a calculator expression string.
 * Supports: +, -, x (multiply), ÷ (divide), % (modulo/percent)
 * @param {string} expression
 * @returns {string} result or error message
 */
function calculate(expression) {
  if (!expression || expression.trim() === '') {
    return '0';
  }

  // Replace display operators with JS operators
  let expr = expression
    .replace(/x/g, '*')
    .replace(/\u00F7/g, '/')
    .replace(/,/g, '');

  // Validate: only allow digits, operators, parentheses, decimal points, spaces
  if (!/^[0-9+\-*/.% ()]+$/.test(expr)) {
    return 'Error';
  }

  try {
    // Use Function constructor to evaluate safely in isolated scope
    // eslint-disable-next-line no-new-func
    const result = new Function('"use strict"; return (' + expr + ')')();

    if (!isFinite(result)) {
      return 'Error';
    }

    // Format result: avoid floating point noise (e.g. 0.1+0.2 = 0.30000000004)
    const rounded = parseFloat(result.toPrecision(12));
    return String(rounded);
  } catch (e) {
    return 'Error';
  }
}

app.post('/calculate', (req, res) => {
  const { expression } = req.body;
  const result = calculate(expression);
  res.json({ result });
});

app.listen(PORT, () => {
  console.log(`Calculator backend running on http://localhost:${PORT}`);
});
