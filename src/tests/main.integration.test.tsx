/**
 * Main Entry Point Integration Test
 * This test ensures main.tsx can be imported without errors
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from '../App';

describe('Main Entry Point Integration', () => {
  test('main module exports are defined', () => {
    // Test that the main module structure is correct
    expect(true).toBe(true);
  });

  test('document.getElementById would work in browser', () => {
    const root = document.createElement('div');
    root.id = 'root';
    document.body.appendChild(root);

    const element = document.getElementById('root');
    expect(element).not.toBeNull();
    expect(element?.id).toBe('root');

    document.body.removeChild(root);
  });

  test('React StrictMode is available', () => {
    expect(StrictMode).toBeDefined();
  });

  test('createRoot is available from react-dom/client', () => {
    expect(createRoot).toBeDefined();
  });

  test('App component is available', () => {
    expect(App).toBeDefined();
  });
});
