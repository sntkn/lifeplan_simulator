// S&P500の年次リターン率（1994-2023年の30年間）
// 配当込みの実質リターン
export const sp500Returns = [
  0.0131,  // 1994
  0.3756,  // 1995
  0.2296,  // 1996
  0.3336,  // 1997
  0.2858,  // 1998
  0.2104,  // 1999
  -0.0910, // 2000
  -0.1189, // 2001
  -0.2210, // 2002
  0.2868,  // 2003
  0.1088,  // 2004
  0.0491,  // 2005
  0.1579,  // 2006
  0.0549,  // 2007
  -0.3700, // 2008
  0.2646,  // 2009
  0.1506,  // 2010
  0.0211,  // 2011
  0.1600,  // 2012
  0.3239,  // 2013
  0.1369,  // 2014
  0.0138,  // 2015
  0.1196,  // 2016
  0.2183,  // 2017
  -0.0438, // 2018
  0.3157,  // 2019
  0.1840,  // 2020
  0.2889,  // 2021
  -0.1825, // 2022
  0.2626,  // 2023
];

// 日本のインフレ率（消費者物価指数の前年比、1994-2023年）
export const japanInflationRates = [
  0.007,   // 1994
  -0.001,  // 1995
  0.001,   // 1996
  0.018,   // 1997
  0.007,   // 1998
  -0.003,  // 1999
  -0.007,  // 2000
  -0.007,  // 2001
  -0.009,  // 2002
  -0.003,  // 2003
  0.000,   // 2004
  -0.003,  // 2005
  0.002,   // 2006
  0.001,   // 2007
  0.014,   // 2008
  -0.014,  // 2009
  -0.007,  // 2010
  -0.003,  // 2011
  0.000,   // 2012
  0.004,   // 2013
  0.027,   // 2014
  0.008,   // 2015
  -0.001,  // 2016
  0.005,   // 2017
  0.010,   // 2018
  0.005,   // 2019
  0.000,   // 2020
  -0.002,  // 2021
  0.024,   // 2022
  0.032,   // 2023
];

// 仮想通貨のリターン（ビットコイン、2014-2023年の10年間）
// 2014年以前は株式リターンを使用（仮想通貨が存在しなかったため）
export const cryptoReturns = [
  0.0131,  // 1994 - 株式リターンを使用
  0.3756,  // 1995 - 株式リターンを使用
  0.2296,  // 1996 - 株式リターンを使用
  0.3336,  // 1997 - 株式リターンを使用
  0.2858,  // 1998 - 株式リターンを使用
  0.2104,  // 1999 - 株式リターンを使用
  -0.0910, // 2000 - 株式リターンを使用
  -0.1189, // 2001 - 株式リターンを使用
  -0.2210, // 2002 - 株式リターンを使用
  0.2868,  // 2003 - 株式リターンを使用
  0.1088,  // 2004 - 株式リターンを使用
  0.0491,  // 2005 - 株式リターンを使用
  0.1579,  // 2006 - 株式リターンを使用
  0.0549,  // 2007 - 株式リターンを使用
  -0.3700, // 2008 - 株式リターンを使用
  0.2646,  // 2009 - 株式リターンを使用
  0.1506,  // 2010 - 株式リターンを使用
  0.0211,  // 2011 - 株式リターンを使用
  0.0160,  // 2012 - 株式リターンを使用
  0.3239,  // 2013 - 株式リターンを使用
  -0.5817, // 2014 - ビットコイン実データ
  0.3533,  // 2015 - ビットコイン実データ
  1.2500,  // 2016 - ビットコイン実データ
  1.3318,  // 2017 - ビットコイン実データ
  -0.7269, // 2018 - ビットコイン実データ
  0.8700,  // 2019 - ビットコイン実データ
  3.0017,  // 2020 - ビットコイン実データ
  0.5973,  // 2021 - ビットコイン実データ
  -0.6426, // 2022 - ビットコイン実データ
  1.5648,  // 2023 - ビットコイン実データ
];

// 仮想通貨の実データが利用可能な年（2014年以降）
export const cryptoDataStartYear = 2014;
export const cryptoDataStartIndex = 20; // 1994年から数えて20番目

export const historicalYears = Array.from({ length: 30 }, (_, i) => 1994 + i);

// ヒストリカルデータの統計情報
export const getHistoricalStats = () => {
  const sp500Avg = sp500Returns.reduce((a, b) => a + b, 0) / sp500Returns.length;
  const inflationAvg = japanInflationRates.reduce((a, b) => a + b, 0) / japanInflationRates.length;
  const cryptoRealData = cryptoReturns.slice(cryptoDataStartIndex); // 2014年以降の実データのみ
  const cryptoAvg = cryptoRealData.reduce((a, b) => a + b, 0) / cryptoRealData.length;

  return {
    sp500Average: sp500Avg,
    inflationAverage: inflationAvg,
    cryptoAverage: cryptoAvg,
    dataYears: historicalYears.length,
    maxSimulationYears: historicalYears.length,
    cryptoRealDataYears: cryptoRealData.length
  };
};

// 参考：過去の時代別リターン比較
export const historicalComparison = {
  // 1970年代-1980年代（高インフレ・高金利時代）
  era1970s1980s: {
    period: '1970-1989年',
    sp500Avg: 0.135, // 約13.5%（高インフレ時代）
    inflationAvg: 0.065, // 約6.5%（高インフレ）
    realReturn: 0.07, // 実質リターン約7%
    characteristics: ['高インフレ', '高金利', '石油危機', 'ボルカーショック']
  },

  // 1990年代-2000年代初期（ITバブル時代）
  era1990s2000s: {
    period: '1990-2009年',
    sp500Avg: 0.095, // 約9.5%（ITバブル含む）
    inflationAvg: 0.025, // 約2.5%
    realReturn: 0.07, // 実質リターン約7%
    characteristics: ['ITバブル', 'ドットコムクラッシュ', 'リーマンショック']
  },

  // 現在のデータ期間（低金利・QE時代）
  currentEra: {
    period: '1994-2023年（現在使用）',
    sp500Avg: 0.105, // 約10.5%
    inflationAvg: 0.024, // 約2.4%
    realReturn: 0.081, // 実質リターン約8.1%
    characteristics: ['低金利', '量的緩和', 'テック企業台頭', 'グローバル化']
  }
};

// シミュレーション期間の制限チェック
export const validateSimulationPeriod = (startAge: number, endAge: number) => {
  const simulationPeriod = endAge - startAge;
  const maxPeriod = historicalYears.length;

  if (simulationPeriod > maxPeriod) {
    return {
      isValid: false,
      maxEndAge: startAge + maxPeriod,
      message: `ヒストリカル法では最大${maxPeriod}年間のシミュレーションが可能です。終了年齢を${startAge + maxPeriod}歳以下に設定してください。`
    };
  }

  return {
    isValid: true,
    maxEndAge: endAge,
    message: ''
  };
};