/**
 * App Component Tests
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import App from '../App';

// Mock child components
vi.mock('../components/charts/AssetChart', () => ({
  AssetChart: () => <div data-testid="asset-chart">AssetChart</div>
}));

vi.mock('../components/charts/AssetBreakdownChart', () => ({
  AssetBreakdownChart: () => <div data-testid="asset-breakdown-chart">AssetBreakdownChart</div>
}));

vi.mock('../components/results/ResultsTable', () => ({
  ResultsTable: () => <div data-testid="results-table">ResultsTable</div>
}));

vi.mock('../components/forms/InputPanel', () => ({
  InputPanel: ({ onSimulate }: any) => (
    <div data-testid="input-panel">
      <button onClick={onSimulate}>シミュレーション実行</button>
    </div>
  )
}));

vi.mock('../components/ai/AIAdvisorPanel', () => ({
  AIAdvisorPanel: () => <div data-testid="ai-advisor-panel">AIAdvisorPanel</div>
}));

vi.mock('../hooks/useSimulation', () => ({
  useSimulation: () => ({
    params: {
      initialAge: 30,
      endAge: 65,
      simulationMethod: 'montecarlo',
      numSimulations: 1000,
    },
    setParams: vi.fn(),
    simulationData: null,
    runSimulation: vi.fn(),
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
