/**
 * Safely evaluates a calculator expression string.
 * Supports: +, -, x (multiply), ÷ (divide), % (modulo/percent)
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

export const handler = async (event) => {
    console.log('Received event:', JSON.stringify(event, null, 2));
    
    let expression = '';
    
    let body = event.body;
    
    // API Gateway Proxy sends body as a string. Direct Lambda tests might send an object.
    if (typeof body === 'string') {
        try {
            body = JSON.parse(body);
        } catch (e) {
            console.warn('Could not parse body as JSON:', body);
        }
    }

    // Extract expression from body (API/POST) or root event (Direct/GET)
    expression = body?.expression || event.expression || '';

    const result = calculate(expression);

    const response = {
        statusCode: 200,
        headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*" // Required for CORS
        },
        body: JSON.stringify({ result }),
    };
    
    return response;
};

