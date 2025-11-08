/**
 * AI Advisor Service Additional Coverage Tests
 */

import { AIAdvisorService, type AIConfig } from '../services/aiAdvisor';
import type { SimulationParams, YearlyData } from '../types/simulation';

global.fetch = jest.fn();

const mockParams: SimulationParams = {
  initialAge: 30,
  endAge: 65,
  simulationMethod: 'historical',
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
  stockRegion: 'nikkei',
  inflationRegion: 'us'
};

const mockResults: YearlyData[] = [
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
    year: 35,
    age: 65,
    median: 10000000,
    p90: 12000000,
    p75: 11000000,
    p25: 9000000,
    p10: 8000000,
    medianStock: 6000000,
    medianCrypto: 2000000,
    medianCash: 2000000
  }
];

describe('AI Advisor Service Additional Coverage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  test('builds prompt with historical method and different regions', async () => {
    const config: AIConfig = {
      provider: 'ollama',
      model: 'llama3'
    };

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ response: '{}' })
    });

    const service = new AIAdvisorService(config);
    await service.generateAdvice(mockParams, mockResults);

    const callArgs = (global.fetch as jest.Mock).mock.calls[0][1];
    const body = JSON.parse(callArgs.body);
    expect(body.prompt).toContain('ヒストリカル法');
    expect(body.prompt).toContain('日経平均');
    expect(body.prompt).toContain('米国');
  });

  test('builds prompt with world stock region', async () => {
    const worldParams = { ...mockParams, stockRegion: 'world' as const };
    const config: AIConfig = {
      provider: 'ollama',
      model: 'llama3'
    };

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ response: '{}' })
    });

    const service = new AIAdvisorService(config);
    await service.generateAdvice(worldParams, mockResults);

    const callArgs = (global.fetch as jest.Mock).mock.calls[0][1];
    const body = JSON.parse(callArgs.body);
    expect(body.prompt).toContain('世界');
  });

  test('builds prompt with world inflation region', async () => {
    const worldParams = { ...mockParams, inflationRegion: 'world' as const };
    const config: AIConfig = {
      provider: 'ollama',
      model: 'llama3'
    };

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ response: '{}' })
    });

    const service = new AIAdvisorService(config);
    await service.generateAdvice(worldParams, mockResults);

    const callArgs = (global.fetch as jest.Mock).mock.calls[0][1];
    const body = JSON.parse(callArgs.body);
    expect(body.prompt).toContain('世界');
  });

  test('handles unsupported provider', async () => {
    const config: AIConfig = {
      provider: 'unsupported' as any,
      model: 'test'
    };

    const service = new AIAdvisorService(config);

    await expect(service.generateAdvice(mockParams, mockResults)).rejects.toThrow('Unsupported AI provider');
  });
});
