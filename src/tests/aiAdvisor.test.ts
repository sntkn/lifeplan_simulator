/**
 * AI Advisor Service Tests
 */

import { AIAdvisorService, getDefaultAIConfig, saveAIConfig, type AIConfig } from '../services/aiAdvisor';
import type { SimulationParams, YearlyData } from '../types/simulation';

global.fetch = jest.fn();

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

describe('AIAdvisorService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    (global.fetch as jest.Mock).mockClear();
  });

  describe('Ollama Provider', () => {
    test('calls Ollama API successfully', async () => {
      const config: AIConfig = {
        provider: 'ollama',
        model: 'llama3',
        endpoint: 'http://localhost:11434'
      };

      const mockResponse = {
        summary: 'テストサマリー',
        risks: ['リスク1'],
        recommendations: ['推奨1'],
        optimizations: ['最適化1'],
        confidence: 0.85
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ response: JSON.stringify(mockResponse) })
      });

      const service = new AIAdvisorService(config);
      const result = await service.generateAdvice(mockParams, mockResults);

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:11434/api/generate',
        expect.objectContaining({
          method: 'POST'
        })
      );
    });

    test('returns fallback on Ollama API error', async () => {
      const config: AIConfig = {
        provider: 'ollama',
        model: 'llama3'
      };

      (global.fetch as jest.Mock).mockRejectedValue(new Error('Connection failed'));

      const service = new AIAdvisorService(config);
      const result = await service.generateAdvice(mockParams, mockResults);

      expect(result.confidence).toBe(0.6);
      expect(result.summary).toContain('AIサービスが利用できない');
    });

    test('returns fallback on invalid JSON response', async () => {
      const config: AIConfig = {
        provider: 'ollama',
        model: 'llama3'
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ response: 'invalid json' })
      });

      const service = new AIAdvisorService(config);
      const result = await service.generateAdvice(mockParams, mockResults);

      expect(result.confidence).toBe(0.6);
    });
  });

  describe('OpenAI Provider', () => {
    test('calls OpenAI API successfully', async () => {
      const config: AIConfig = {
        provider: 'openai',
        model: 'gpt-3.5-turbo',
        apiKey: 'test-key'
      };

      const mockResponse = {
        summary: 'テストサマリー',
        risks: ['リスク1'],
        recommendations: ['推奨1'],
        optimizations: ['最適化1'],
        confidence: 0.85
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
          choices: [{
            message: {
              content: JSON.stringify(mockResponse)
            }
          }]
        })
      });

      const service = new AIAdvisorService(config);
      const result = await service.generateAdvice(mockParams, mockResults);

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.openai.com/v1/chat/completions',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-key'
          })
        })
      );
    });

    test('returns fallback on OpenAI API error', async () => {
      const config: AIConfig = {
        provider: 'openai',
        model: 'gpt-3.5-turbo',
        apiKey: 'test-key'
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 401
      });

      const service = new AIAdvisorService(config);
      const result = await service.generateAdvice(mockParams, mockResults);

      expect(result.confidence).toBe(0.6);
    });
  });

  describe('Gemini Provider', () => {
    test('calls Gemini API successfully', async () => {
      const config: AIConfig = {
        provider: 'gemini',
        model: 'gemini-pro',
        apiKey: 'test-key'
      };

      const mockResponse = {
        summary: 'テストサマリー',
        risks: ['リスク1'],
        recommendations: ['推奨1'],
        optimizations: ['最適化1'],
        confidence: 0.85
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
          candidates: [{
            content: {
              parts: [{
                text: JSON.stringify(mockResponse)
              }]
            }
          }]
        })
      });

      const service = new AIAdvisorService(config);
      const result = await service.generateAdvice(mockParams, mockResults);

      expect(result).toEqual(mockResponse);
    });

    test('returns fallback on Gemini API error', async () => {
      const config: AIConfig = {
        provider: 'gemini',
        model: 'gemini-pro',
        apiKey: 'test-key'
      };

      (global.fetch as jest.Mock).mockRejectedValue(new Error('API Error'));

      const service = new AIAdvisorService(config);
      const result = await service.generateAdvice(mockParams, mockResults);

      expect(result.confidence).toBe(0.6);
    });
  });

  describe('Local Model Provider', () => {
    test('returns fallback for local model', async () => {
      const config: AIConfig = {
        provider: 'local',
        model: 'local-model'
      };

      const service = new AIAdvisorService(config);
      const result = await service.generateAdvice(mockParams, mockResults);

      expect(result.confidence).toBe(0.6);
      expect(result.summary).toContain('AIサービスが利用できない');
    });
  });

  describe('Config Management', () => {
    test('getDefaultAIConfig returns default config', () => {
      const config = getDefaultAIConfig();
      expect(config.provider).toBe('ollama');
      expect(config.model).toBe('llama3');
    });

    test('getDefaultAIConfig loads from localStorage', () => {
      const savedConfig: AIConfig = {
        provider: 'openai',
        model: 'gpt-4',
        apiKey: 'saved-key'
      };
      localStorage.setItem('ai-config', JSON.stringify(savedConfig));

      const config = getDefaultAIConfig();
      expect(config).toEqual(savedConfig);
    });

    test('saveAIConfig saves to localStorage', () => {
      const config: AIConfig = {
        provider: 'gemini',
        model: 'gemini-pro',
        apiKey: 'test-key'
      };

      saveAIConfig(config);

      const saved = JSON.parse(localStorage.getItem('ai-config') || '{}');
      expect(saved).toEqual(config);
    });
  });

  describe('Prompt Building', () => {
    test('builds prompt with monte carlo method', async () => {
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
      expect(body.prompt).toContain('モンテカルロ法');
    });

    test('builds prompt with historical method', async () => {
      const historicalParams = { ...mockParams, simulationMethod: 'historical' as const };
      const config: AIConfig = {
        provider: 'ollama',
        model: 'llama3'
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ response: '{}' })
      });

      const service = new AIAdvisorService(config);
      await service.generateAdvice(historicalParams, mockResults);

      const callArgs = (global.fetch as jest.Mock).mock.calls[0][1];
      const body = JSON.parse(callArgs.body);
      expect(body.prompt).toContain('ヒストリカル法');
    });
  });
});
