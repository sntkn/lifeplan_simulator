/**
 * InputPanel Additional Coverage Tests
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

describe('InputPanel Additional Coverage', () => {
  const mockSetParams = jest.fn();
  const mockOnSimulate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('handles initial age change and adjusts end age', () => {
    render(<InputPanel params={mockParams} setParams={mockSetParams} onSimulate={mockOnSimulate} />);
    const inputs = screen.getAllByDisplayValue('30');
    const initialAgeInput = inputs[0];

    fireEvent.change(initialAgeInput, { target: { value: '70' } });

    expect(mockSetParams).toHaveBeenCalledWith(expect.objectContaining({
      initialAge: 70,
      endAge: 71 // Should be adjusted to initialAge + 1
    }));
  });

  test('handles liquidation priority change to stock', () => {
    render(<InputPanel params={mockParams} setParams={mockSetParams} onSimulate={mockOnSimulate} />);
    const select = screen.getByDisplayValue('仮想通貨');

    fireEvent.change(select, { target: { value: 'stock' } });

    expect(mockSetParams).toHaveBeenCalledWith(expect.objectContaining({
      liquidationPriority: 'stock'
    }));
  });

  test('handles liquidation priority change to random', () => {
    render(<InputPanel params={mockParams} setParams={mockSetParams} onSimulate={mockOnSimulate} />);
    const select = screen.getByDisplayValue('仮想通貨');

    fireEvent.change(select, { target: { value: 'random' } });

    expect(mockSetParams).toHaveBeenCalledWith(expect.objectContaining({
      liquidationPriority: 'random'
    }));
  });

  test('handles stock region change', () => {
    const historicalParams = { ...mockParams, simulationMethod: 'historical' as const };
    render(<InputPanel params={historicalParams} setParams={mockSetParams} onSimulate={mockOnSimulate} />);

    const select = screen.getByDisplayValue('S&P500（アメリカ）');
    fireEvent.change(select, { target: { value: 'nikkei' } });

    expect(mockSetParams).toHaveBeenCalledWith(expect.objectContaining({
      stockRegion: 'nikkei'
    }));
  });

  test('handles inflation region change', () => {
    const historicalParams = { ...mockParams, simulationMethod: 'historical' as const };
    render(<InputPanel params={historicalParams} setParams={mockSetParams} onSimulate={mockOnSimulate} />);

    const select = screen.getByDisplayValue('日本');
    fireEvent.change(select, { target: { value: 'us' } });

    expect(mockSetParams).toHaveBeenCalledWith(expect.objectContaining({
      inflationRegion: 'us'
    }));
  });

  test('handles all numeric input fields', () => {
    render(<InputPanel params={mockParams} setParams={mockSetParams} onSimulate={mockOnSimulate} />);

    // Test retirement age
    const retirementAgeInput = screen.getByDisplayValue('60');
    fireEvent.change(retirementAgeInput, { target: { value: '62' } });
    expect(mockSetParams).toHaveBeenCalled();

    // Test loan duration - there are multiple inputs with value 30
    const inputs30 = screen.getAllByDisplayValue('30');
    const loanDurationInput = inputs30[1]; // Second input with value 30
    fireEvent.change(loanDurationInput, { target: { value: '25' } });
    expect(mockSetParams).toHaveBeenCalled();
  });

  test('handles man yen input fields', () => {
    render(<InputPanel params={mockParams} setParams={mockSetParams} onSimulate={mockOnSimulate} />);

    // Test cash upper limit (displayed as 500 万円 from 5000000)
    const cashUpperLimitInput = screen.getByDisplayValue('500');
    fireEvent.change(cashUpperLimitInput, { target: { value: '600' } });
    expect(mockSetParams).toHaveBeenCalledWith(expect.objectContaining({
      cashUpperLimit: 6000000
    }));
  });

  test('handles monte carlo specific inputs', () => {
    render(<InputPanel params={mockParams} setParams={mockSetParams} onSimulate={mockOnSimulate} />);

    // Test inflation rate
    const inflationRateInput = screen.getByDisplayValue('0.02');
    fireEvent.change(inflationRateInput, { target: { value: '0.03' } });
    expect(mockSetParams).toHaveBeenCalled();

    // Test investment return rate
    const returnRateInput = screen.getByDisplayValue('0.07');
    fireEvent.change(returnRateInput, { target: { value: '0.08' } });
    expect(mockSetParams).toHaveBeenCalled();
  });

  test('closes settings modal', () => {
    render(<InputPanel params={mockParams} setParams={mockSetParams} onSimulate={mockOnSimulate} />);

    // Open modal
    const settingsButton = screen.getByRole('button', { name: '設定を開く' });
    fireEvent.click(settingsButton);
    expect(screen.getByText('設定管理')).toBeInTheDocument();

    // Close modal
    const closeButton = screen.getByRole('button', { name: 'モーダルを閉じる' });
    fireEvent.click(closeButton);
    expect(screen.queryByText('設定管理')).not.toBeInTheDocument();
  });

  test('handles end age below initial age', () => {
    render(<InputPanel params={mockParams} setParams={mockSetParams} onSimulate={mockOnSimulate} />);
    const inputs = screen.getAllByDisplayValue('65');
    const endAgeInput = inputs[0];

    fireEvent.change(endAgeInput, { target: { value: '25' } });

    // Should clamp to initialAge + 1
    expect(mockSetParams).toHaveBeenCalledWith(expect.objectContaining({
      endAge: 31 // initialAge (30) + 1
    }));
  });
});
