/**
 * Settings Components Unit Tests
 * 
 * This test file verifies the individual settings components
 * work correctly in isolation.
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SettingsIcon } from '../components/settings/SettingsIcon';
import { SettingsModal } from '../components/settings/SettingsModal';
import { SettingsManager } from '../components/settings/SettingsManager';
import type { SimulationParams } from '../types/simulation';

// Mock simulation parameters for testing
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
  stockRegion: 'nikkei',
  inflationRegion: 'japan'
};

describe('SettingsIcon Component', () => {
  test('renders gear icon with proper attributes', () => {
    const mockOnClick = jest.fn();
    render(<SettingsIcon onClick={mockOnClick} />);

    const button = screen.getByRole('button', { name: '設定を開く' });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('aria-label', '設定を開く');
    expect(button).toHaveAttribute('title', '設定を開く');
  });

  test('calls onClick when clicked', () => {
    const mockOnClick = jest.fn();
    render(<SettingsIcon onClick={mockOnClick} />);

    const button = screen.getByRole('button', { name: '設定を開く' });
    fireEvent.click(button);

    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  test('has proper CSS classes for styling', () => {
    const mockOnClick = jest.fn();
    render(<SettingsIcon onClick={mockOnClick} />);

    const button = screen.getByRole('button', { name: '設定を開く' });
    expect(button).toHaveClass('settings-icon');
    expect(button).toHaveClass('cursor-pointer');
  });
});

describe('SettingsModal Component', () => {
  test('does not render when isOpen is false', () => {
    const mockOnClose = jest.fn();
    const mockOnLoadSetting = jest.fn();

    render(
      <SettingsModal
        isOpen={false}
        onClose={mockOnClose}
        params={mockParams}
        onLoadSetting={mockOnLoadSetting}
      />
    );

    expect(screen.queryByText('設定管理')).not.toBeInTheDocument();
  });

  test('renders when isOpen is true', () => {
    const mockOnClose = jest.fn();
    const mockOnLoadSetting = jest.fn();

    render(
      <SettingsModal
        isOpen={true}
        onClose={mockOnClose}
        params={mockParams}
        onLoadSetting={mockOnLoadSetting}
      />
    );

    expect(screen.getByText('設定管理')).toBeInTheDocument();
  });

  test('calls onClose when close button is clicked', () => {
    const mockOnClose = jest.fn();
    const mockOnLoadSetting = jest.fn();

    render(
      <SettingsModal
        isOpen={true}
        onClose={mockOnClose}
        params={mockParams}
        onLoadSetting={mockOnLoadSetting}
      />
    );

    const closeButton = screen.getByRole('button', { name: 'モーダルを閉じる' });
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  test('calls onClose when ESC key is pressed', () => {
    const mockOnClose = jest.fn();
    const mockOnLoadSetting = jest.fn();

    render(
      <SettingsModal
        isOpen={true}
        onClose={mockOnClose}
        params={mockParams}
        onLoadSetting={mockOnLoadSetting}
      />
    );

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  test('calls onClose when background overlay is clicked', () => {
    const mockOnClose = jest.fn();
    const mockOnLoadSetting = jest.fn();

    render(
      <SettingsModal
        isOpen={true}
        onClose={mockOnClose}
        params={mockParams}
        onLoadSetting={mockOnLoadSetting}
      />
    );

    // Find the overlay div (the outermost div with fixed positioning)
    const overlay = document.querySelector('.fixed.inset-0');
    if (overlay) {
      fireEvent.click(overlay);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    }
  });
});

describe('SettingsManager Component', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  test('renders save settings section', () => {
    const mockOnLoadSetting = jest.fn();

    render(
      <SettingsManager
        params={mockParams}
        onLoadSetting={mockOnLoadSetting}
      />
    );

    expect(screen.getByText('現在の設定を保存')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('設定名を入力')).toBeInTheDocument();
    expect(screen.getByText('保存')).toBeInTheDocument();
  });

  test('shows "no saved settings" message when localStorage is empty', () => {
    const mockOnLoadSetting = jest.fn();

    render(
      <SettingsManager
        params={mockParams}
        onLoadSetting={mockOnLoadSetting}
      />
    );

    expect(screen.getByText('保存された設定はありません')).toBeInTheDocument();
  });

  test('saves setting when valid name is provided', async () => {
    const mockOnLoadSetting = jest.fn();

    render(
      <SettingsManager
        params={mockParams}
        onLoadSetting={mockOnLoadSetting}
      />
    );

    const input = screen.getByPlaceholderText('設定名を入力');
    const saveButton = screen.getByText('保存');

    fireEvent.change(input, { target: { value: 'Test Setting' } });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('設定を保存しました');
    });

    // Check if setting was saved to localStorage
    const saved = JSON.parse(localStorage.getItem('lifeplan-simulator-settings') || '[]');
    expect(saved).toHaveLength(1);
    expect(saved[0].name).toBe('Test Setting');
  });

  test('shows error when trying to save with empty name', async () => {
    const mockOnLoadSetting = jest.fn();

    render(
      <SettingsManager
        params={mockParams}
        onLoadSetting={mockOnLoadSetting}
      />
    );

    const saveButton = screen.getByText('保存');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('設定名を入力してください');
    });
  });

  test('loads setting when load button is clicked', async () => {
    const mockOnLoadSetting = jest.fn();

    // Pre-populate localStorage with a setting
    const testSetting = {
      name: 'Test Setting',
      params: mockParams,
      createdAt: new Date().toISOString()
    };
    localStorage.setItem('lifeplan-simulator-settings', JSON.stringify([testSetting]));

    render(
      <SettingsManager
        params={mockParams}
        onLoadSetting={mockOnLoadSetting}
      />
    );

    const loadButton = screen.getByText('読込');
    fireEvent.click(loadButton);

    await waitFor(() => {
      expect(mockOnLoadSetting).toHaveBeenCalledWith(mockParams);
      expect(window.alert).toHaveBeenCalledWith('設定「Test Setting」を読み込みました');
    });
  });

  test('deletes setting when delete button is clicked and confirmed', async () => {
    const mockOnLoadSetting = jest.fn();

    // Pre-populate localStorage with a setting
    const testSetting = {
      name: 'Test Setting',
      params: mockParams,
      createdAt: new Date().toISOString()
    };
    localStorage.setItem('lifeplan-simulator-settings', JSON.stringify([testSetting]));

    // Mock confirm to return true
    (window.confirm as jest.Mock).mockReturnValue(true);

    render(
      <SettingsManager
        params={mockParams}
        onLoadSetting={mockOnLoadSetting}
      />
    );

    const deleteButton = screen.getByText('削除');
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(window.confirm).toHaveBeenCalledWith('設定「Test Setting」を削除しますか？');
      expect(window.alert).toHaveBeenCalledWith('設定を削除しました');
    });

    // Check if setting was removed from localStorage
    const remaining = JSON.parse(localStorage.getItem('lifeplan-simulator-settings') || '[]');
    expect(remaining).toHaveLength(0);
  });

  test('does not delete setting when delete is cancelled', async () => {
    const mockOnLoadSetting = jest.fn();

    // Pre-populate localStorage with a setting
    const testSetting = {
      name: 'Test Setting',
      params: mockParams,
      createdAt: new Date().toISOString()
    };
    localStorage.setItem('lifeplan-simulator-settings', JSON.stringify([testSetting]));

    // Mock confirm to return false
    (window.confirm as jest.Mock).mockReturnValue(false);

    render(
      <SettingsManager
        params={mockParams}
        onLoadSetting={mockOnLoadSetting}
      />
    );

    const deleteButton = screen.getByText('削除');
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(window.confirm).toHaveBeenCalledWith('設定「Test Setting」を削除しますか？');
    });

    // Check if setting is still in localStorage
    const remaining = JSON.parse(localStorage.getItem('lifeplan-simulator-settings') || '[]');
    expect(remaining).toHaveLength(1);
    expect(remaining[0].name).toBe('Test Setting');
  });
});