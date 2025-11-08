/**
 * useSimulation Hook Tests
 */

import { renderHook, act } from '@testing-library/react';
import { useSimulation } from '../hooks/useSimulation';
import * as simulationEngine from '../utils/simulationEngine';

jest.mock('../utils/simulationEngine');

describe('useSimulation Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('initializes with default params', () => {
    const { result } = renderHook(() => useSimulation());

    expect(result.current.params.initialAge).toBe(30);
    expect(result.current.params.retirementAge).toBe(65);
    expect(result.current.params.endAge).toBe(100);
    expect(result.current.params.simulationMethod).toBe('montecarlo');
    expect(result.current.simulationData).toBeNull();
  });

  test('updates params', () => {
    const { result } = renderHook(() => useSimulation());

    act(() => {
      result.current.setParams({
        ...result.current.params,
        initialAge: 25
      });
    });

    expect(result.current.params.initialAge).toBe(25);
  });

  test('calculates simulation period correctly', () => {
    const { result } = renderHook(() => useSimulation());

    expect(result.current.simulationPeriod).toBe(70); // 100 - 30
  });

  test('runs monte carlo simulation', () => {
    const mockData = [{ year: 0, age: 30, median: 1000000, p90: 1200000, p75: 1100000, p25: 900000, p10: 800000, medianStock: 500000, medianCrypto: 300000, medianCash: 200000 }];
    (simulationEngine.runMonteCarloSimulation as jest.Mock).mockReturnValue(mockData);

    const { result } = renderHook(() => useSimulation());

    act(() => {
      result.current.runSimulation();
    });

    expect(simulationEngine.runMonteCarloSimulation).toHaveBeenCalledWith(result.current.params);
    expect(result.current.simulationData).toEqual(mockData);
  });

  test('runs historical simulation', () => {
    const mockData = [{ year: 0, age: 30, median: 1000000, p90: 1200000, p75: 1100000, p25: 900000, p10: 800000, medianStock: 500000, medianCrypto: 300000, medianCash: 200000 }];
    (simulationEngine.runHistoricalSimulation as jest.Mock).mockReturnValue(mockData);

    const { result } = renderHook(() => useSimulation());

    act(() => {
      result.current.setParams({
        ...result.current.params,
        simulationMethod: 'historical'
      });
    });

    act(() => {
      result.current.runSimulation();
    });

    expect(simulationEngine.runHistoricalSimulation).toHaveBeenCalledWith(result.current.params);
    expect(result.current.simulationData).toEqual(mockData);
  });
});
