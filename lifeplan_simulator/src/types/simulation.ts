// シミュレーション関連の型定義

export type SavedSetting = {
  name: string;
  params: SimulationParams;
  createdAt: string;
};

export type SimulationParams = {
  /** シミュレーション開始時の年齢 */
  initialAge: number;
  /** 仕事をリタイアする年齢 */
  retirementAge: number;
  /** シミュレーション終了年齢 */
  endAge: number;
  /** ローン年数 */
  loanDuration: number;
  /** 年間医療・介護費が発生する年齢 */
  medicalCareStartAge: number;
  /** 娯楽費が減少し始める年齢 */
  entertainmentExpensesDeclineStartAge: number;
  /** 娯楽費の年間減少率（0.1 = 10%減少） */
  entertainmentExpensesDeclineRate: number;
  /** インフレ率 */
  inflationRate: number;
  /** 株式の期待リターン（年率） */
  investmentReturnRate: number;
  /** 株式のリスク（標準偏差） */
  investmentRisk: number;
  /** 仮想通貨の期待リターン（年率） */
  cryptoReturnRate: number;
  /** 仮想通貨のリスク（標準偏差） */
  cryptoRisk: number;
  /** 株式売却時の税金・手数料率 */
  stockTaxRate: number;
  /** 仮想通貨売却時の税金・手数料率 */
  cryptoTaxRate: number;
  /** 現金保有額の上限 */
  cashUpperLimit: number;
  /** 現金保有額の下限 */
  cashLowerLimit: number;
  /** 仮想通貨保有額の下限 */
  cryptoLowerLimit: number;
  /** 株式保有額の下限 */
  stockLowerLimit: number;
  /** 現金が下限を下回った場合に取り崩す資産の優先順位 */
  liquidationPriority: 'crypto' | 'stock' | 'random';

  /** 初期資産（株式） */
  initialStockValue: number;
  /** 初期資産（仮想通貨） */
  initialCryptoValue: number;
  /** 初期資産（現金） */
  initialCashValue: number;

  /** 年間生活費 */
  livingExpenses: number;
  /** 年間娯楽費 */
  entertainmentExpenses: number;
  /** 年間住宅維持費 */
  housingMaintenance: number;
  /** 年間医療・介護費 */
  medicalCare: number;
  /** 年間住宅ローン返済額 */
  housingLoan: number;

  /** 年間給与所得 */
  salary: number;
  /** 年間不動産所得 */
  realEstateIncome: number;

  /** モンテカルロシミュレーションの実行回数 */
  numSimulations: number;
  /** シミュレーション方法 */
  simulationMethod: 'montecarlo' | 'historical';
  /** インフレ率の地域選択（ヒストリカル法用） */
  inflationRegion: 'japan' | 'us' | 'world';
  /** 株式リターンの地域選択（ヒストリカル法用） */
  stockRegion: 'sp500' | 'nikkei' | 'world';
};

export type YearlyData = {
  /** シミュレーションの年 */
  year: number;
  /** 年齢 */
  age: number;
  /** 資産額の中央値 */
  median: number;
  /** 資産額の上位10% */
  p90: number;
  /** 資産額の上位25% */
  p75: number;
  /** 資産額の下位25% */
  p25: number;
  /** 資産額の下位10% */
  p10: number;
  /** 株式の中央値 */
  medianStock: number;
  /** 仮想通貨の中央値 */
  medianCrypto: number;
  /** 現金の中央値 */
  medianCash: number;
};