import type { SimulationParams, YearlyData } from '../types/simulation';

/**
 * AI設定インターフェース
 */
export interface AIConfig {
  provider: 'ollama' | 'openai' | 'gemini' | 'local';
  model: string;
  endpoint?: string;
  apiKey?: string;
}

/**
 * AIアドバイス結果の型定義
 */
export interface AIAdvice {
  summary: string;
  risks: string[];
  recommendations: string[];
  optimizations: string[];
  confidence: number;
}

/**
 * AIアドバイザーサービス
 */
export class AIAdvisorService {
  private config: AIConfig;

  constructor(config: AIConfig) {
    this.config = config;
  }

  /**
   * シミュレーション結果を分析してアドバイスを生成
   */
  async generateAdvice(
    params: SimulationParams,
    results: YearlyData[]
  ): Promise<AIAdvice> {
    const prompt = this.buildAnalysisPrompt(params, results);
    console.log(prompt);

    switch (this.config.provider) {
      case 'ollama':
        return this.callOllama(prompt);
      case 'openai':
        return this.callOpenAI(prompt);
      case 'gemini':
        return this.callGemini(prompt);
      case 'local':
        return this.callLocalModel(prompt);
      default:
        throw new Error(`Unsupported AI provider: ${this.config.provider}`);
    }
  }

  /**
   * 分析用プロンプトを構築
   */
  private buildAnalysisPrompt(params: SimulationParams, results: YearlyData[]): string {
    const finalResult = results[results.length - 1];
    const midResult = results[Math.floor(results.length / 2)];
    const initialResult = results[0];

    // シミュレーション方法の表示名
    const simulationMethodName = params.simulationMethod === 'montecarlo' ? 'モンテカルロ法' : 'ヒストリカル法';

    // 地域名の表示
    const getRegionName = (region: string) => {
      switch (region) {
        case 'japan': return '日本';
        case 'us': return '米国';
        case 'world': return '世界';
        case 'sp500': return 'S&P500';
        case 'nikkei': return '日経平均';
        default: return region;
      }
    };

    // シミュレーション設定の表示内容を条件分岐
    let simulationSettings = '';
    if (params.simulationMethod === 'montecarlo') {
      simulationSettings = `
【シミュレーション設定】
- シミュレーション方法: ${simulationMethodName}
- 実行回数: ${params.numSimulations}回
- インフレ率: ${(params.inflationRate * 100).toFixed(1)}%
- 株式期待リターン: ${(params.investmentReturnRate * 100).toFixed(1)}%
- 仮想通貨期待リターン: ${(params.cryptoReturnRate * 100).toFixed(1)}%`;
    } else {
      simulationSettings = `
【シミュレーション設定】
- シミュレーション方法: ${simulationMethodName}
- インフレ率地域: ${getRegionName(params.inflationRegion)}の過去データを使用
- 株式リターン地域: ${getRegionName(params.stockRegion)}の過去データを使用
- 実行回数: ${params.numSimulations}回（モンテカルロ法に基づく）`;
    }

    return `
あなたは経験豊富な日本のファイナンシャルプランナーです。以下のライフプランシミュレーション結果を分析し、日本語で具体的で実用的なアドバイスを提供してください。

${simulationSettings}

【基本情報】
- 現在年齢: ${params.initialAge}歳
- 退職年齢: ${params.retirementAge}歳
- シミュレーション終了年齢: ${params.endAge}歳
- 初期資産: ${(params.initialStockValue + params.initialCryptoValue + params.initialCashValue).toLocaleString()}円
- ${params.entertainmentExpensesDeclineStartAge}歳以上は年間${(params.entertainmentExpensesDeclineRate * 100).toFixed(1)}%で年間娯楽費が減少
- ※年金は考慮していません

【収支情報】
- 年収: ${params.salary.toLocaleString()}円
- 年間生活費: ${params.livingExpenses.toLocaleString()}円
- 年間娯楽費: ${params.entertainmentExpenses.toLocaleString()}円
- 年間住宅維持費: ${params.housingMaintenance.toLocaleString()}円
- 年間医療・介護費: ${params.medicalCare.toLocaleString()}円

【資産配分の推移】
■初期時点（${initialResult.age}歳）
- 株式: ${params.initialStockValue.toLocaleString()}円
- 仮想通貨: ${params.initialCryptoValue.toLocaleString()}円
- 現金: ${params.initialCashValue.toLocaleString()}円

■中間時点（${midResult.age}歳）
- 株式: ${Math.round(midResult.medianStock).toLocaleString()}円
- 仮想通貨: ${Math.round(midResult.medianCrypto).toLocaleString()}円
- 現金: ${Math.round(midResult.medianCash).toLocaleString()}円

■最終時点（${finalResult.age}歳）
- 株式: ${Math.round(finalResult.medianStock).toLocaleString()}円
- 仮想通貨: ${Math.round(finalResult.medianCrypto).toLocaleString()}円
- 現金: ${Math.round(finalResult.medianCash).toLocaleString()}円

【シミュレーション結果（3パターン）】
■最高パターン（90%タイル値）
- ${midResult.age}歳時点: ${Math.round(midResult.p90).toLocaleString()}円
- ${finalResult.age}歳時点: ${Math.round(finalResult.p90).toLocaleString()}円

■中央値パターン（50%タイル値）
- ${midResult.age}歳時点: ${Math.round(midResult.median).toLocaleString()}円
- ${finalResult.age}歳時点: ${Math.round(finalResult.median).toLocaleString()}円

■最低パターン（10%タイル値）
- ${midResult.age}歳時点: ${Math.round(midResult.p10).toLocaleString()}円
- ${finalResult.age}歳時点: ${Math.round(finalResult.p10).toLocaleString()}円

【リスク評価】
- 最終時点での資産枯渇リスク: ${finalResult.p10 <= 0 ? '高リスク' : finalResult.p25 <= 0 ? '中リスク' : '低リスク'}

【分析指針】
- 日本の税制、社会保障制度を考慮してください
- 具体的で実行可能なアドバイスを提供してください
- リスクは具体的に説明し、対策も含めてください
- 最適化案は数値的な根拠を含めてください

必ず以下のJSON形式で日本語で回答してください：
{
  "summary": "このライフプランの全体的な評価を400文字以内で簡潔に",
  "risks": [
    "具体的なリスク要因1（例：インフレによる購買力低下）",
    "具体的なリスク要因2（例：医療費の急激な増加）",
    "具体的なリスク要因3（例：市場暴落時の資産減少）"
  ],
  "recommendations": [
    "具体的な推奨事項1（例：緊急資金として現金200万円を確保）",
    "具体的な推奨事項2（例：iDeCoで年間27.6万円の節税投資）",
    "具体的な推奨事項3（例：生活費の見直しで年間50万円削減）"
  ],
  "optimizations": [
    "最適化案1（例：株式比率を60%に調整して安定性向上）",
    "最適化案2（例：退職年齢を2年延長して資産寿命を延ばす）"
  ],
  "confidence": 0.85
}
`;
  }

  /**
   * Ollama APIを呼び出し
   */
  private async callOllama(prompt: string): Promise<AIAdvice> {
    try {
      const response = await fetch(`${this.config.endpoint || 'http://localhost:11434'}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.config.model,
          prompt: prompt,
          stream: false,
          format: 'json'
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status}`);
      }

      const data = await response.json();

      try {
        return JSON.parse(data.response);
      } catch {
        // JSONパースに失敗した場合はフォールバック
        return this.getFallbackAdvice();
      }
    } catch (error) {
      console.error('Ollama API call failed:', error);
      return this.getFallbackAdvice();
    }
  }

  /**
   * OpenAI APIを呼び出し
   */
  private async callOpenAI(prompt: string): Promise<AIAdvice> {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          model: this.config.model,
          messages: [
            {
              role: 'system',
              content: 'あなたは経験豊富なファイナンシャルプランナーです。ライフプランシミュレーション結果を分析し、実用的なアドバイスを提供してください。'
            },
            {
              role: 'user',
              content: prompt
            }
          ]
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0].message.content;

      try {
        return JSON.parse(content);
      } catch {
        // JSONパースに失敗した場合はフォールバック
        return this.getFallbackAdvice();
      }
    } catch (error) {
      console.error('OpenAI API call failed:', error);
      return this.getFallbackAdvice();
    }
  }

  /**
   * Google Gemini APIを呼び出し
   */
  private async callGemini(prompt: string): Promise<AIAdvice> {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${this.config.model}:generateContent?key=${this.config.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            responseMimeType: "application/json"
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.candidates[0].content.parts[0].text;

      try {
        return JSON.parse(content);
      } catch {
        // JSONパースに失敗した場合はフォールバック
        return this.getFallbackAdvice();
      }
    } catch (error) {
      console.error('Gemini API call failed:', error);
      return this.getFallbackAdvice();
    }
  }

  /**
   * ローカルモデルを呼び出し（簡易実装）
   */
  private async callLocalModel(_prompt: string): Promise<AIAdvice> {
    // 実際の実装では、Hugging Face Transformers.jsなどを使用
    // ここでは簡易的なルールベースの分析を実装
    return this.getFallbackAdvice();
  }

  /**
   * フォールバック用の基本的なアドバイス
   */
  private getFallbackAdvice(): AIAdvice {
    return {
      summary: "AIサービスが利用できないため、一般的なライフプラン分析結果を表示しています。",
      risks: [
        "インフレによる購買力低下（年2-3%の物価上昇リスク）",
        "市場暴落時の資産価値大幅減少（株式・仮想通貨の高ボラティリティ）",
        "医療・介護費の予想以上の増加（高齢化に伴う支出増）"
      ],
      recommendations: [
        "緊急資金として生活費6ヶ月分の現金を確保する",
        "iDeCoやNISAを活用した節税投資を検討する",
        "定期的な家計見直しで無駄な支出を削減する"
      ],
      optimizations: [
        "リスク資産（株式・仮想通貨）の比率を年齢に応じて調整",
        "退職年齢の延長や副収入の確保で資産寿命を延ばす"
      ],
      confidence: 0.6
    };
  }
}

/**
 * デフォルトのAI設定を取得
 */
export const getDefaultAIConfig = (): AIConfig => {
  // 環境変数やローカルストレージから設定を読み込み
  const savedConfig = localStorage.getItem('ai-config');
  if (savedConfig) {
    return JSON.parse(savedConfig);
  }

  // デフォルトはOllamaのllama3を使用
  return {
    provider: 'ollama',
    model: 'llama3',
    endpoint: 'http://localhost:11434'
  };
};

/**
 * AI設定を保存
 */
export const saveAIConfig = (config: AIConfig): void => {
  localStorage.setItem('ai-config', JSON.stringify(config));
};