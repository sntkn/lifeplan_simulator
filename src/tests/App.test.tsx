/**
 * App Component Tests
 */

import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../App';

// Mock child components
jest.mock('../components/charts/AssetChart', () => ({
  AssetChart: () => <div data-testid="asset-chart">AssetChart</div>
}));

jest.mock('../components/charts/AssetBreakdownChart', () => ({
  AssetBreakdownChart: () => <div data-testid="asset-breakdown-chart">AssetBreakdownChart</div>
}));

jest.mock('../components/results/ResultsTable', () => ({
  ResultsTable: () => <div data-testid="results-table">ResultsTable</div>
}));

jest.mock('../components/forms/InputPanel', () => ({
  InputPanel: ({ onSimulate }: any) => (
    <div data-testid="input-panel">
      <button onClick={onSimulate}>シミュレーション実行</button>
    </div>
  )
}));

jest.mock('../components/ai/AIAdvisorPanel', () => ({
  AIAdvisorPanel: () => <div data-testid="ai-advisor-panel">AIAdvisorPanel</div>
}));

jest.mock('../hooks/useSimulation', () => ({
  useSimulation: () => ({
    params: {
      initialAge: 30,
      endAge: 65,
      simulationMethod: 'montecarlo',
      numSimulations: 1000,
    },
    setParams: jest.fn(),
    simulationData: null,
    runSimulation: jest.fn(),
    simulationPeriod: 35,
  })
}));

describe('App Component', () => {
  test('renders app title', () => {
    render(<App />);
    expect(screen.getByText('資産推移シミュレーター')).toBeInTheDocument();
  });

  test('renders dark mode toggle button', () => {
    render(<App />);
    const button = screen.getByRole('button', { name: 'ダークモード切替' });
    expect(button).toBeInTheDocument();
  });

  test('toggles dark mode when button is clicked', () => {
    render(<App />);
    const button = screen.getByRole('button', { name: 'ダークモード切替' });

    // Initial state should be dark mode
    expect(button).toHaveTextContent('ライトモード');

    // Click to toggle
    fireEvent.click(button);
    expect(button).toHaveTextContent('ダークモード');

    // Click again to toggle back
    fireEvent.click(button);
    expect(button).toHaveTextContent('ライトモード');
  });

  test('renders input panel', () => {
    render(<App />);
    expect(screen.getByTestId('input-panel')).toBeInTheDocument();
  });

  test('shows placeholder message when no simulation data', () => {
    render(<App />);
    expect(screen.getByText(/左のパネルで設定を入力し/)).toBeInTheDocument();
  });
});
