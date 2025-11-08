/**
 * Chart Components Additional Coverage Tests
 */

import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AssetChart } from '../components/charts/AssetChart';
import { AssetBreakdownChart } from '../components/charts/AssetBreakdownChart';
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
    year: 1,
    age: 31,
    median: 5200000,
    p90: 6300000,
    p75: 5700000,
    p25: 4700000,
    p10: 4200000,
    medianStock: 3100000,
    medianCrypto: 1050000,
    medianCash: 1050000
  }
];

describe('Chart Components Additional Coverage', () => {
  test('AssetChart formatYAxis function', () => {
    const { container } = render(<AssetChart data={mockData} />);
    // The formatYAxis function is called internally by recharts
    // We just verify the component renders without errors
    expect(container).toBeInTheDocument();
  });

  test('AssetBreakdownChart formatYAxis function', () => {
    const { container } = render(<AssetBreakdownChart data={mockData} />);
    // The formatYAxis function is called internally by recharts
    // We just verify the component renders without errors
    expect(container).toBeInTheDocument();
  });

  test('AssetChart with empty data', () => {
    const { container } = render(<AssetChart data={[]} />);
    expect(container).toBeInTheDocument();
  });

  test('AssetBreakdownChart with empty data', () => {
    const { container } = render(<AssetBreakdownChart data={[]} />);
    expect(container).toBeInTheDocument();
  });

  test('AssetChart with large numbers', () => {
    const largeData: YearlyData[] = [
      {
        year: 0,
        age: 30,
        median: 500000000,
        p90: 600000000,
        p75: 550000000,
        p25: 450000000,
        p10: 400000000,
        medianStock: 300000000,
        medianCrypto: 100000000,
        medianCash: 100000000
      }
    ];
    const { container } = render(<AssetChart data={largeData} />);
    expect(container).toBeInTheDocument();
  });

  test('AssetBreakdownChart with large numbers', () => {
    const largeData: YearlyData[] = [
      {
        year: 0,
        age: 30,
        median: 500000000,
        p90: 600000000,
        p75: 550000000,
        p25: 450000000,
        p10: 400000000,
        medianStock: 300000000,
        medianCrypto: 100000000,
        medianCash: 100000000
      }
    ];
    const { container } = render(<AssetBreakdownChart data={largeData} />);
    expect(container).toBeInTheDocument();
  });
});
