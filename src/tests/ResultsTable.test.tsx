/**
 * ResultsTable Component Tests
 */

import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ResultsTable } from '../components/results/ResultsTable';
import type { YearlyData } from '../types/simulation';

const mockData: YearlyData[] = [
  {
    year: 0,
    age: 30,
    median: 5000000,
    p90: 6000000,
    p75: 5500000,
    p25: 4500000,
    p10: 4000000,
    medianStock: 3000000,
    medianCrypto: 1000000,
    medianCash: 1000000
  },
  {
    year: 5,
    age: 35,
    median: 6000000,
    p90: 7200000,
    p75: 6600000,
    p25: 5400000,
    p10: 4800000,
    medianStock: 3600000,
    medianCrypto: 1200000,
    medianCash: 1200000
  },
  {
    year: 10,
    age: 40,
    median: 7000000,
    p90: 8400000,
    p75: 7700000,
    p25: 6300000,
    p10: 5600000,
    medianStock: 4200000,
    medianCrypto: 1400000,
    medianCash: 1400000
  }
];

describe('ResultsTable Component', () => {
  test('renders table title', () => {
    render(<ResultsTable data={mockData} simulationPeriod={10} />);
    expect(screen.getByText('シミュレーション結果（5年ごと）')).toBeInTheDocument();
  });

  test('renders table headers', () => {
    render(<ResultsTable data={mockData} simulationPeriod={10} />);
    expect(screen.getByText('年齢')).toBeInTheDocument();
    expect(screen.getByText('上位10%')).toBeInTheDocument();
    expect(screen.getByText('上位25%')).toBeInTheDocument();
    expect(screen.getByText('資産額中央値')).toBeInTheDocument();
    expect(screen.getByText('下位25%')).toBeInTheDocument();
    expect(screen.getByText('下位10%')).toBeInTheDocument();
  });

  test('renders data rows for 5-year intervals', () => {
    render(<ResultsTable data={mockData} simulationPeriod={10} />);
    expect(screen.getByText('30歳')).toBeInTheDocument();
    expect(screen.getByText('35歳')).toBeInTheDocument();
    expect(screen.getByText('40歳')).toBeInTheDocument();
  });

  test('formats currency values correctly', () => {
    render(<ResultsTable data={mockData} simulationPeriod={10} />);
    // Check if values are formatted with 万円
    const cells = screen.getAllByText(/万円/);
    expect(cells.length).toBeGreaterThan(0);
  });
});
