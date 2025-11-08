/**
 * AIAdvisorPanel Component Tests
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

describe('AIAdvisorPanel Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    (aiAdvisor.getDefaultAIConfig as jest.Mock).mockReturnValue({
      provider: 'ollama',
      model: 'llama3',
      endpoint: 'http://localhost:11434'
    });
  });

  test('renders panel title', () => {
    render(<AIAdvisorPanel params={mockParams} simulationData={mockSimulationData} />);
    expect(screen.getByText('🤖 AIライフプランアドバイザー')).toBeInTheDocument();
  });

  test('renders advice generation button', () => {
    render(<AIAdvisorPanel params={mockParams} simulationData={mockSimulationData} />);
    expect(screen.getByText('アドバイス生成')).toBeInTheDocument();
  });

  test('renders settings button', () => {
    render(<AIAdvisorPanel params={mockParams} simulationData={mockSimulationData} />);
    expect(screen.getByText('設定')).toBeInTheDocument();
  });

  test('shows initial message when no advice', () => {
    render(<AIAdvisorPanel params={mockParams} simulationData={mockSimulationData} />);
    expect(screen.getByText(/シミュレーション実行後/)).toBeInTheDocument();
  });

  test('toggles settings panel', () => {
    render(<AIAdvisorPanel params={mockParams} simulationData={mockSimulationData} />);
    const settingsButton = screen.getByText('設定');

    fireEvent.click(settingsButton);
    expect(screen.getByText('AI設定')).toBeInTheDocument();

    fireEvent.click(settingsButton);
    expect(screen.queryByText('AI設定')).not.toBeInTheDocument();
  });

  test('shows AI provider options in settings', () => {
    render(<AIAdvisorPanel params={mockParams} simulationData={mockSimulationData} />);
    const settingsButton = screen.getByText('設定');
    fireEvent.click(settingsButton);

    expect(screen.getByText('AIプロバイダー')).toBeInTheDocument();
    expect(screen.getByText('モデル')).toBeInTheDocument();
  });

  test('generates advice successfully', async () => {
    const mockAdvice = {
      summary: 'テストサマリー',
      risks: ['リスク1', 'リスク2'],
      recommendations: ['推奨1', '推奨2'],
      optimizations: ['最適化1'],
      confidence: 0.85
    };

    const mockGenerateAdvice = jest.fn().mockResolvedValue(mockAdvice);
    (aiAdvisor.AIAdvisorService as jest.Mock).mockImplementation(() => ({
      generateAdvice: mockGenerateAdvice
    }));

    render(<AIAdvisorPanel params={mockParams} simulationData={mockSimulationData} />);

    const button = screen.getByText('アドバイス生成');
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('テストサマリー')).toBeInTheDocument();
    });

    expect(screen.getByText(/リスク1/)).toBeInTheDocument();
    expect(screen.getByText(/推奨1/)).toBeInTheDocument();
    expect(screen.getByText(/最適化1/)).toBeInTheDocument();
  });

  test('shows loading state during advice generation', async () => {
    const mockGenerateAdvice = jest.fn().mockImplementation(() =>
      new Promise(resolve => setTimeout(resolve, 100))
    );
    (aiAdvisor.AIAdvisorService as jest.Mock).mockImplementation(() => ({
      generateAdvice: mockGenerateAdvice
    }));

    render(<AIAdvisorPanel params={mockParams} simulationData={mockSimulationData} />);

    const button = screen.getByText('アドバイス生成');
    fireEvent.click(button);

    expect(screen.getByText('分析中...')).toBeInTheDocument();
    expect(screen.getByText(/AIがシミュレーション結果を分析中/)).toBeInTheDocument();
  });

  test('shows error message on failure', async () => {
    const mockGenerateAdvice = jest.fn().mockRejectedValue(new Error('API Error'));
    (aiAdvisor.AIAdvisorService as jest.Mock).mockImplementation(() => ({
      generateAdvice: mockGenerateAdvice
    }));

    render(<AIAdvisorPanel params={mockParams} simulationData={mockSimulationData} />);

    const button = screen.getByText('アドバイス生成');
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(/API Error/)).toBeInTheDocument();
    });
  });

  test('disables button when no simulation data', () => {
    render(<AIAdvisorPanel params={mockParams} simulationData={null} />);
    const button = screen.getByText('アドバイス生成');
    expect(button).toBeDisabled();
  });

  test('updates AI config', () => {
    const mockSaveAIConfig = jest.fn();
    (aiAdvisor.saveAIConfig as jest.Mock) = mockSaveAIConfig;

    render(<AIAdvisorPanel params={mockParams} simulationData={mockSimulationData} />);

    const settingsButton = screen.getByText('設定');
    fireEvent.click(settingsButton);

    const providerSelect = screen.getByDisplayValue('Ollama (無料・ローカル)');
    fireEvent.change(providerSelect, { target: { value: 'openai' } });

    expect(mockSaveAIConfig).toHaveBeenCalled();
  });

  test('shows confidence level with correct color', async () => {
    const mockAdvice = {
      summary: 'テスト',
      risks: [],
      recommendations: [],
      optimizations: [],
      confidence: 0.85
    };

    const mockGenerateAdvice = jest.fn().mockResolvedValue(mockAdvice);
    (aiAdvisor.AIAdvisorService as jest.Mock).mockImplementation(() => ({
      generateAdvice: mockGenerateAdvice
    }));

    render(<AIAdvisorPanel params={mockParams} simulationData={mockSimulationData} />);

    const button = screen.getByText('アドバイス生成');
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('85%')).toBeInTheDocument();
    });
  });
});
