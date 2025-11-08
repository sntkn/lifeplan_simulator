/**
 * InputPanel Component Tests
 */

import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { InputPanel } from '../components/forms/InputPanel';
import type { SimulationParams } from '../types/simulation';

const mockParams: SimulationParams = {
  initialAge: 30,
  endAge: 65,
  simulationMethod: 'montecarlo',
  numSimulations: 1000,
  inflationRate: 0.02,
  investmentReturnRate: 0.07,
  investmentRisk: 0.15,
  cryptoReturnRate: 0.15,
  cryptoRisk: 0.4,
  stockTaxRate: 0.2,
  cryptoTaxRate: 0.55,
  cashUpperLimit: 5000000,
  cashLowerLimit: 1000000,
  cryptoLowerLimit: 0,
  stockLowerLimit: 0,
  liquidationPriority: 'crypto',
  retirementAge: 60,
  loanDuration: 30,
  medicalCareStartAge: 65,
  entertainmentExpensesDeclineStartAge: 70,
  entertainmentExpensesDeclineRate: 0.1,
  initialStockValue: 10000000,
  initialCryptoValue: 1000000,
  initialCashValue: 2000000,
  livingExpenses: 3000000,
  entertainmentExpenses: 1000000,
  housingMaintenance: 500000,
  medicalCare: 500000,
  housingLoan: 1200000,
  salary: 6000000,
  realEstateIncome: 0,
  stockRegion: 'sp500',
  inflationRegion: 'japan'
};

describe('InputPanel Component', () => {
  const mockSetParams = jest.fn();
  const mockOnSimulate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders panel title', () => {
    render(<InputPanel params={mockParams} setParams={mockSetParams} onSimulate={mockOnSimulate} />);
    expect(screen.getByText('シミュレーション設定')).toBeInTheDocument();
  });

  test('renders simulation method selector', () => {
    render(<InputPanel params={mockParams} setParams={mockSetParams} onSimulate={mockOnSimulate} />);
    expect(screen.getByText('シミュレーション方法')).toBeInTheDocument();
  });

  test('renders simulate button', () => {
    render(<InputPanel params={mockParams} setParams={mockSetParams} onSimulate={mockOnSimulate} />);
    expect(screen.getByText('シミュレーション実行')).toBeInTheDocument();
  });

  test('calls onSimulate when button is clicked', () => {
    render(<InputPanel params={mockParams} setParams={mockSetParams} onSimulate={mockOnSimulate} />);
    const button = screen.getByText('シミュレーション実行');
    fireEvent.click(button);
    expect(mockOnSimulate).toHaveBeenCalledTimes(1);
  });

  test('shows monte carlo specific fields', () => {
    render(<InputPanel params={mockParams} setParams={mockSetParams} onSimulate={mockOnSimulate} />);
    expect(screen.getByText('シミュレーション回数')).toBeInTheDocument();
    expect(screen.getByText('株式の期待リターン（年率）')).toBeInTheDocument();
  });

  test('shows historical method specific fields', () => {
    const historicalParams = { ...mockParams, simulationMethod: 'historical' as const };
    render(<InputPanel params={historicalParams} setParams={mockSetParams} onSimulate={mockOnSimulate} />);
    expect(screen.getByText('株式リターンの地域')).toBeInTheDocument();
    expect(screen.getByText('インフレ率の地域')).toBeInTheDocument();
  });

  test('updates simulation method', () => {
    render(<InputPanel params={mockParams} setParams={mockSetParams} onSimulate={mockOnSimulate} />);
    const select = screen.getByDisplayValue('モンテカルロ法');
    fireEvent.change(select, { target: { value: 'historical' } });
    expect(mockSetParams).toHaveBeenCalled();
  });

  test('renders settings icon', () => {
    render(<InputPanel params={mockParams} setParams={mockSetParams} onSimulate={mockOnSimulate} />);
    const settingsButton = screen.getByRole('button', { name: '設定を開く' });
    expect(settingsButton).toBeInTheDocument();
  });

  test('opens settings modal when icon is clicked', () => {
    render(<InputPanel params={mockParams} setParams={mockSetParams} onSimulate={mockOnSimulate} />);
    const settingsButton = screen.getByRole('button', { name: '設定を開く' });
    fireEvent.click(settingsButton);
    // Modal should be rendered
    expect(screen.getByText('設定管理')).toBeInTheDocument();
  });

  test('handles age input changes', () => {
    render(<InputPanel params={mockParams} setParams={mockSetParams} onSimulate={mockOnSimulate} />);
    const inputs = screen.getAllByDisplayValue('30');
    const initialAgeInput = inputs[0]; // First input with value 30
    fireEvent.change(initialAgeInput, { target: { value: '25' } });
    expect(mockSetParams).toHaveBeenCalled();
  });

  test('clamps end age to maximum 120', () => {
    render(<InputPanel params={mockParams} setParams={mockSetParams} onSimulate={mockOnSimulate} />);
    const inputs = screen.getAllByDisplayValue('65');
    const endAgeInput = inputs[0]; // First input with value 65
    fireEvent.change(endAgeInput, { target: { value: '150' } });
    expect(mockSetParams).toHaveBeenCalledWith(expect.objectContaining({
      endAge: 120
    }));
  });

  test('shows warning for long simulation periods', () => {
    const longParams = { ...mockParams, simulationMethod: 'historical' as const, endAge: 100 };
    render(<InputPanel params={longParams} setParams={mockSetParams} onSimulate={mockOnSimulate} />);
    expect(screen.getByText(/30年を超える期間では/)).toBeInTheDocument();
  });
});
