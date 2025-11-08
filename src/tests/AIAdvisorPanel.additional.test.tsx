/**
 * AIAdvisorPanel Additional Coverage Tests
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AIAdvisorPanel } from '../components/ai/AIAdvisorPanel';
import * as aiAdvisor from '../services/aiAdvisor';
import type { SimulationParams, YearlyData } from '../types/simulation';

jest.mock('../services/aiAdvisor');

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

const mockSimulationData: YearlyData[] = [
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
  }
];

describe('AIAdvisorPanel Additional Coverage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    (aiAdvisor.getDefaultAIConfig as jest.Mock).mockReturnValue({
      provider: 'ollama',
      model: 'llama3',
      endpoint: 'http://localhost:11434'
    });
  });

  test('shows ollama endpoint field when provider is ollama', () => {
    render(<AIAdvisorPanel params={mockParams} simulationData={mockSimulationData} />);
    const settingsButton = screen.getByText('設定');
    fireEvent.click(settingsButton);

    expect(screen.getByText('エンドポイント')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('http://localhost:11434')).toBeInTheDocument();
  });

  test('shows API key field when provider is openai', () => {
    (aiAdvisor.getDefaultAIConfig as jest.Mock).mockReturnValue({
      provider: 'openai',
      model: 'gpt-3.5-turbo',
      apiKey: ''
    });

    render(<AIAdvisorPanel params={mockParams} simulationData={mockSimulationData} />);
    const settingsButton = screen.getByText('設定');
    fireEvent.click(settingsButton);

    expect(screen.getByText('APIキー')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('APIキーを入力')).toBeInTheDocument();
  });

  test('shows API key field when provider is gemini', () => {
    (aiAdvisor.getDefaultAIConfig as jest.Mock).mockReturnValue({
      provider: 'gemini',
      model: 'gemini-pro',
      apiKey: ''
    });

    render(<AIAdvisorPanel params={mockParams} simulationData={mockSimulationData} />);
    const settingsButton = screen.getByText('設定');
    fireEvent.click(settingsButton);

    expect(screen.getByText('APIキー')).toBeInTheDocument();
  });

  test('updates model config', () => {
    const mockSaveAIConfig = jest.fn();
    (aiAdvisor.saveAIConfig as jest.Mock) = mockSaveAIConfig;

    render(<AIAdvisorPanel params={mockParams} simulationData={mockSimulationData} />);

    const settingsButton = screen.getByText('設定');
    fireEvent.click(settingsButton);

    const modelInput = screen.getByPlaceholderText('llama3');
    fireEvent.change(modelInput, { target: { value: 'llama3.2' } });

    expect(mockSaveAIConfig).toHaveBeenCalled();
  });

  test('updates endpoint config for ollama', () => {
    const mockSaveAIConfig = jest.fn();
    (aiAdvisor.saveAIConfig as jest.Mock) = mockSaveAIConfig;

    render(<AIAdvisorPanel params={mockParams} simulationData={mockSimulationData} />);

    const settingsButton = screen.getByText('設定');
    fireEvent.click(settingsButton);

    const endpointInput = screen.getByPlaceholderText('http://localhost:11434');
    fireEvent.change(endpointInput, { target: { value: 'http://localhost:11435' } });

    expect(mockSaveAIConfig).toHaveBeenCalled();
  });

  test('updates API key config', () => {
    (aiAdvisor.getDefaultAIConfig as jest.Mock).mockReturnValue({
      provider: 'openai',
      model: 'gpt-3.5-turbo',
      apiKey: ''
    });

    const mockSaveAIConfig = jest.fn();
    (aiAdvisor.saveAIConfig as jest.Mock) = mockSaveAIConfig;

    render(<AIAdvisorPanel params={mockParams} simulationData={mockSimulationData} />);

    const settingsButton = screen.getByText('設定');
    fireEvent.click(settingsButton);

    const apiKeyInput = screen.getByPlaceholderText('APIキーを入力');
    fireEvent.change(apiKeyInput, { target: { value: 'test-api-key' } });

    expect(mockSaveAIConfig).toHaveBeenCalled();
  });

  test('shows confidence with high value (green)', async () => {
    const mockAdvice = {
      summary: 'テスト',
      risks: [],
      recommendations: [],
      optimizations: [],
      confidence: 0.95
    };

    const mockGenerateAdvice = jest.fn().mockResolvedValue(mockAdvice);
    (aiAdvisor.AIAdvisorService as jest.Mock).mockImplementation(() => ({
      generateAdvice: mockGenerateAdvice
    }));

    render(<AIAdvisorPanel params={mockParams} simulationData={mockSimulationData} />);

    const button = screen.getByText('アドバイス生成');
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('95%')).toBeInTheDocument();
    });
  });

  test('shows confidence with medium value (yellow)', async () => {
    const mockAdvice = {
      summary: 'テスト',
      risks: [],
      recommendations: [],
      optimizations: [],
      confidence: 0.65
    };

    const mockGenerateAdvice = jest.fn().mockResolvedValue(mockAdvice);
    (aiAdvisor.AIAdvisorService as jest.Mock).mockImplementation(() => ({
      generateAdvice: mockGenerateAdvice
    }));

    render(<AIAdvisorPanel params={mockParams} simulationData={mockSimulationData} />);

    const button = screen.getByText('アドバイス生成');
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('65%')).toBeInTheDocument();
    });
  });

  test('shows confidence with low value (red)', async () => {
    const mockAdvice = {
      summary: 'テスト',
      risks: [],
      recommendations: [],
      optimizations: [],
      confidence: 0.45
    };

    const mockGenerateAdvice = jest.fn().mockResolvedValue(mockAdvice);
    (aiAdvisor.AIAdvisorService as jest.Mock).mockImplementation(() => ({
      generateAdvice: mockGenerateAdvice
    }));

    render(<AIAdvisorPanel params={mockParams} simulationData={mockSimulationData} />);

    const button = screen.getByText('アドバイス生成');
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('45%')).toBeInTheDocument();
    });
  });
});
