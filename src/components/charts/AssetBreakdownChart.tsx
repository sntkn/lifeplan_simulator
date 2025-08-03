import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { YearlyData } from '../../types/simulation';

interface AssetBreakdownChartProps {
  data: YearlyData[];
}

/**
 * 資産別推移のグラフコンポーネントです。
 * @param data グラフに表示するデータ
 */
export const AssetBreakdownChart = ({ data }: AssetBreakdownChartProps) => {
  /**
   * Y軸の目盛りを万円単位でフォーマットする関数
   * @param tick 目盛りの値
   * @returns フォーマットされた文字列
   */
  const formatYAxis = (tick: number) => `${(tick / 1000000).toLocaleString()}`;

  return (
    <div className="w-full h-[500px] mb-5">
      <h2 className="text-xl font-bold mb-3">資産別推移（中央値）</h2>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="age" name="年齢" />
          <YAxis tickFormatter={formatYAxis} />
          <Tooltip formatter={(value: number) => `${Math.floor(value / 10000).toLocaleString()}万円`} />
          <Legend />
          <Line type="monotone" dataKey="medianCash" stroke="#ff7300" name="現金" dot={false} strokeWidth={2} />
          <Line type="monotone" dataKey="medianCrypto" stroke="#00c49f" name="仮想通貨" dot={false} strokeWidth={2} />
          <Line type="monotone" dataKey="medianStock" stroke="#0088fe" name="株式" dot={false} strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};