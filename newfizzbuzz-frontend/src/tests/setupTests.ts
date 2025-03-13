import '@testing-library/jest-dom';  // For extended matchers like .toBeInTheDocument()

// Check and assign TextEncoder and TextDecoder from 'util' if they're not already defined
if (typeof global.TextEncoder === 'undefined') {
  const { TextEncoder, TextDecoder } = require('util');
  global.TextEncoder = TextEncoder;
  global.TextDecoder = TextDecoder;
}
