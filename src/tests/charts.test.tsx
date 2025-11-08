/**
 * Chart Components Tests
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

describe('AssetChart Component', () => {
  test('renders without crashing', () => {
    const { container } = render(<AssetChart data={mockData} />);
    expect(container).toBeInTheDocument();
  });

  test('renders chart container', () => {
    const { container } = render(<AssetChart data={mockData} />);
    const chartDiv = container.querySelector('.w-full.h-\\[500px\\]');
    expect(chartDiv).toBeInTheDocument();
  });
});

describe('AssetBreakdownChart Component', () => {
  test('renders without crashing', () => {
    const { container } = render(<AssetBreakdownChart data={mockData} />);
    expect(container).toBeInTheDocument();
  });

  test('renders chart title', () => {
    const { getByText } = render(<AssetBreakdownChart data={mockData} />);
    expect(getByText('資産別推移（中央値）')).toBeInTheDocument();
  });

  test('renders chart container', () => {
    const { container } = render(<AssetBreakdownChart data={mockData} />);
    const chartDiv = container.querySelector('.w-full.h-\\[500px\\]');
    expect(chartDiv).toBeInTheDocument();
  });
});
