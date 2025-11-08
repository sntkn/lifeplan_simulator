/**
 * Historical Data Tests
 */

import {
  sp500Returns,
  nikkeiReturns,
  worldStockReturns,
  japanInflationRates,
  usInflationRates,
  worldInflationRates,
  cryptoReturns,
  historicalYears,
  HISTORICAL_DATA_LENGTH,
  MAX_START_YEARS,
  OPTIMAL_PATTERN_COUNT,
  getInflationData,
  getStockData,
  stockOptions,
  inflationOptions,
  validateSimulationPeriod,
  type InflationRegion,
  type StockRegion
} from '../historicalData';

describe('Historical Data Arrays', () => {
  test('all data arrays have correct length', () => {
    expect(sp500Returns).toHaveLength(30);
    expect(nikkeiReturns).toHaveLength(30);
    expect(worldStockReturns).toHaveLength(30);
    expect(japanInflationRates).toHaveLength(30);
    expect(usInflationRates).toHaveLength(30);
    expect(worldInflationRates).toHaveLength(30);
    expect(cryptoReturns).toHaveLength(30);
    expect(historicalYears).toHaveLength(30);
  });

  test('historical years range from 1994 to 2023', () => {
    expect(historicalYears[0]).toBe(1994);
    expect(historicalYears[29]).toBe(2023);
  });

  test('constants have correct values', () => {
    expect(HISTORICAL_DATA_LENGTH).toBe(30);
    expect(MAX_START_YEARS).toBe(30);
    expect(OPTIMAL_PATTERN_COUNT).toBe(30);
  });
});

describe('getInflationData', () => {
  test('returns japan inflation data', () => {
    const data = getInflationData('japan');
    expect(data).toEqual(japanInflationRates);
  });

  test('returns us inflation data', () => {
    const data = getInflationData('us');
    expect(data).toEqual(usInflationRates);
  });

  test('returns world inflation data', () => {
    const data = getInflationData('world');
    expect(data).toEqual(worldInflationRates);
  });

  test('returns japan data as default', () => {
    const data = getInflationData('invalid' as InflationRegion);
    expect(data).toEqual(japanInflationRates);
  });
});

describe('getStockData', () => {
  test('returns sp500 stock data', () => {
    const data = getStockData('sp500');
    expect(data).toEqual(sp500Returns);
  });

  test('returns nikkei stock data', () => {
    const data = getStockData('nikkei');
    expect(data).toEqual(nikkeiReturns);
  });

  test('returns world stock data', () => {
    const data = getStockData('world');
    expect(data).toEqual(worldStockReturns);
  });

  test('returns sp500 data as default', () => {
    const data = getStockData('invalid' as StockRegion);
    expect(data).toEqual(sp500Returns);
  });
});

describe('Options Arrays', () => {
  test('stockOptions has correct structure', () => {
    expect(stockOptions).toHaveLength(3);
    expect(stockOptions[0]).toHaveProperty('value');
    expect(stockOptions[0]).toHaveProperty('label');
  });

  test('inflationOptions has correct structure', () => {
    expect(inflationOptions).toHaveLength(3);
    expect(inflationOptions[0]).toHaveProperty('value');
    expect(inflationOptions[0]).toHaveProperty('label');
  });
});

describe('validateSimulationPeriod', () => {
  test('validates period within 100 years', () => {
    const result = validateSimulationPeriod(30, 80);
    expect(result.isValid).toBe(true);
    expect(result.maxEndAge).toBe(80);
  });

  test('rejects period over 100 years', () => {
    const result = validateSimulationPeriod(30, 131);
    expect(result.isValid).toBe(false);
    expect(result.maxEndAge).toBe(130);
    expect(result.message).toContain('最大100年間');
  });

  test('shows message for period over 30 years', () => {
    const result = validateSimulationPeriod(30, 70);
    expect(result.isValid).toBe(true);
    expect(result.message).toContain('循環使用');
  });

  test('no message for period within 30 years', () => {
    const result = validateSimulationPeriod(30, 50);
    expect(result.isValid).toBe(true);
    expect(result.message).toBe('');
  });
});
