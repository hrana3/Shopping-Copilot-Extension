// Version: 1.0.1 - Updated for GitHub tracking
// Jest setup file
import 'jsdom/lib/jsdom/living/generated/utils';

// Polyfill TextEncoder/TextDecoder for Node.js environment
import { TextEncoder, TextDecoder } from 'util';

// Make TextEncoder/TextDecoder available globally
Object.assign(global, { TextEncoder, TextDecoder });

// Mock CustomEvent for older environments
if (!global.CustomEvent) {
  global.CustomEvent = class CustomEvent extends Event {
    detail: any;
    
    constructor(type: string, options: CustomEventInit = {}) {
      super(type, options);
      this.detail = options.detail;
    }
  } as any;
}

// Mock fetch if needed
if (!global.fetch) {
  global.fetch = jest.fn();
}

// TEMPORARILY COMMENTED OUT FOR DEBUGGING - ENABLE CONSOLE OUTPUT
// Suppress console output during tests unless explicitly testing it
// const originalConsole = global.console;
// global.console = {
//   ...originalConsole,
//   log: jest.fn(),
//   warn: jest.fn(),
//   error: jest.fn(),
// };

// Restore console for debugging when needed
// (global as any).restoreConsole = () => {
//   global.console = originalConsole;
// };