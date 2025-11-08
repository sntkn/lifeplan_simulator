/**
 * Simulation Engine Additional Coverage Tests
 */

import { runMonteCarloSimulation, runHistoricalSimulation } from '../utils/simulationEngine';
import type { SimulationParams } from '../types/simulation';

const baseParams: SimulationParams = {
  initialAge: 30,
  endAge: 35,
  retirementAge: 65,
  loanDuration: 0,
  medicalCareStartAge: 75,
  entertainmentExpensesDeclineStartAge: 75,
  entertainmentExpensesDeclineRate: 0.1,
  inflationRate: 0.02,
  investmentReturnRate: 0.05,
  investmentRisk: 0.15,
  cryptoReturnRate: 0.10,
  cryptoRisk: 0.30,
  stockTaxRate: 0.10,
  cryptoTaxRate: 0.30,
  cashUpperLimit: 10000000,
  cashLowerLimit: 1000000,
  cryptoLowerLimit: 0,
  stockLowerLimit: 0,
  liquidationPriority: 'crypto',
  initialStockValue: 5000000,
  initialCryptoValue: 1000000,
  initialCashValue: 2000000,
  livingExpenses: 2000000,
  entertainmentExpenses: 500000,
  housingMaintenance: 300000,
  medicalCare: 500000,
  housingLoan: 0,
  salary: 4000000,
  realEstateIncome: 0,
  numSimulations: 100,
  simulationMethod: 'montecarlo',
  inflationRegion: 'japan',
  stockRegion: 'sp500'
};

describe('Simulation Engine Additional Coverage', () => {
  test('handles cash upper limit with random priority and both assets above limit', () => {
    const params = {
      ...baseParams,
      liquidationPriority: 'random' as const,
      initialCashValue: 15000000,
      cashUpperLimit: 10000000,
      stockLowerLimit: 1000000,
      cryptoLowerLimit: 1000000,
      initialStockValue: 5000000,
      initialCryptoValue: 5000000
    };
    const result = runMonteCarloSimulation(params);
    expect(result).toBeInstanceOf(Array);
  });

  test('handles cash upper limit with random priority and only stock above limit', () => {
    const params = {
      ...baseParams,
      liquidationPriority: 'random' as const,
      initialCashValue: 15000000,
      cashUpperLimit: 10000000,
      stockLowerLimit: 1000000,
      cryptoLowerLimit: 5000000,
      initialStockValue: 5000000,
      initialCryptoValue: 500000
    };
    const result = runMonteCarloSimulation(params);
    expect(result).toBeInstanceOf(Array);
  });

  test('handles cash upper limit with random priority and only crypto above limit', () => {
    const params = {
      ...baseParams,
      liquidationPriority: 'random' as const,
      initialCashValue: 15000000,
      cashUpperLimit: 10000000,
      stockLowerLimit: 5000000,
      cryptoLowerLimit: 1000000,
      initialStockValue: 500000,
      initialCryptoValue: 5000000
    };
    const result = runMonteCarloSimulation(params);
    expect(result).toBeInstanceOf(Array);
  });

  test('handles cash upper limit with random priority and both assets below limit', () => {
    const params = {
      ...baseParams,
      liquidationPriority: 'random' as const,
      initialCashValue: 15000000,
      cashUpperLimit: 10000000,
      stockLowerLimit: 5000000,
      cryptoLowerLimit: 5000000,
      initialStockValue: 500000,
      initialCryptoValue: 500000
    };
    const result = runMonteCarloSimulation(params);
    expect(result).toBeInstanceOf(Array);
  });

  test('handles cash lower limit with random priority and both assets above limit', () => {
    const params = {
      ...baseParams,
      liquidationPriority: 'random' as const,
      initialCashValue: 0,
      cashLowerLimit: 2000000,
      salary: 0,
      stockLowerLimit: 1000000,
      cryptoLowerLimit: 1000000,
      initialStockValue: 5000000,
      initialCryptoValue: 5000000
    };
    const result = runMonteCarloSimulation(params);
    expect(result).toBeInstanceOf(Array);
  });

  test('handles cash lower limit with random priority and only stock above limit', () => {
    const params = {
      ...baseParams,
      liquidationPriority: 'random' as const,
      initialCashValue: 0,
      cashLowerLimit: 2000000,
      salary: 0,
      stockLowerLimit: 1000000,
      cryptoLowerLimit: 5000000,
      initialStockValue: 5000000,
      initialCryptoValue: 500000
    };
    const result = runMonteCarloSimulation(params);
    expect(result).toBeInstanceOf(Array);
  });

  test('handles cash lower limit with random priority and only crypto above limit', () => {
    const params = {
      ...baseParams,
      liquidationPriority: 'random' as const,
      initialCashValue: 0,
      cashLowerLimit: 2000000,
      salary: 0,
      stockLowerLimit: 5000000,
      cryptoLowerLimit: 1000000,
      initialStockValue: 500000,
      initialCryptoValue: 5000000
    };
    const result = runMonteCarloSimulation(params);
    expect(result).toBeInstanceOf(Array);
  });

  test('handles cash lower limit with random priority and both assets below limit', () => {
    const params = {
      ...baseParams,
      liquidationPriority: 'random' as const,
      initialCashValue: 0,
      cashLowerLimit: 2000000,
      salary: 0,
      stockLowerLimit: 5000000,
      cryptoLowerLimit: 5000000,
      initialStockValue: 500000,
      initialCryptoValue: 500000
    };
    const result = runMonteCarloSimulation(params);
    expect(result).toBeInstanceOf(Array);
  });

  test('handles invalid tax rate (negative)', () => {
    const params = {
      ...baseParams,
      stockTaxRate: -0.1,
      initialCashValue: 0,
      cashLowerLimit: 2000000,
      salary: 0
    };
    const result = runMonteCarloSimulation(params);
    expect(result).toBeInstanceOf(Array);
  });

  test('handles invalid tax rate (>= 1)', () => {
    const params = {
      ...baseParams,
      stockTaxRate: 1.5,
      initialCashValue: 0,
      cashLowerLimit: 2000000,
      salary: 0
    };
    const result = runMonteCarloSimulation(params);
    expect(result).toBeInstanceOf(Array);
  });

  test('handles crypto liquidation with invalid tax rate', () => {
    const params = {
      ...baseParams,
      cryptoTaxRate: -0.1,
      liquidationPriority: 'crypto' as const,
      initialCashValue: 0,
      cashLowerLimit: 2000000,
      salary: 0
    };
    const result = runMonteCarloSimulation(params);
    expect(result).toBeInstanceOf(Array);
  });

  test('handles crypto liquidation with tax rate >= 1', () => {
    const params = {
      ...baseParams,
      cryptoTaxRate: 1.5,
      liquidationPriority: 'crypto' as const,
      initialCashValue: 0,
      cashLowerLimit: 2000000,
      salary: 0
    };
    const result = runMonteCarloSimulation(params);
    expect(result).toBeInstanceOf(Array);
  });

  test('handles NaN detection in simulation', () => {
    const params = {
      ...baseParams,
      investmentReturnRate: NaN,
      investmentRisk: 0
    };
    const result = runMonteCarloSimulation(params);
    // Should handle NaN gracefully
    expect(result).toBeInstanceOf(Array);
  });

  test('handles historical simulation with very short period', () => {
    const params = {
      ...baseParams,
      initialAge: 30,
      endAge: 32,
      simulationMethod: 'historical' as const
    };
    const result = runHistoricalSimulation(params);
    expect(result).toBeInstanceOf(Array);
    expect(result.length).toBe(3);
  });

  test('handles historical simulation with medium period', () => {
    const params = {
      ...baseParams,
      initialAge: 30,
      endAge: 45,
      simulationMethod: 'historical' as const
    };
    const result = runHistoricalSimulation(params);
    expect(result).toBeInstanceOf(Array);
  });

  test('handles historical simulation with exact 30 year period', () => {
    const params = {
      ...baseParams,
      initialAge: 30,
      endAge: 60,
      simulationMethod: 'historical' as const
    };
    const result = runHistoricalSimulation(params);
    expect(result).toBeInstanceOf(Array);
    expect(result.length).toBe(31);
  });
});
