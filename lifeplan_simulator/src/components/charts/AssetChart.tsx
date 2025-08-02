import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { YearlyData } from '../../types/simulation';

interface AssetChartProps {
  data: YearlyData[];
}

/**
 * 資産推移のグラフコンポーネントです。
 * @param data グラフに表示するデータ
 */
export const AssetChart = ({ data }: AssetChartProps) => {
  /**
   * Y軸の目盛りを万円単位でフォーマットする関数
   * @param tick 目盛りの値
   * @returns フォーマットされた文字列
   */
  const formatYAxis = (tick: number) => `${(tick / 1000000).toLocaleString()}`;

  return (
    <div className="w-full h-[500px] mb-5">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="age" name="年齢" />
          <YAxis tickFormatter={formatYAxis} />
          <Tooltip formatter={(value: number) => `${Math.floor(value / 10000).toLocaleString()}万円`} />
          <Legend />
          <Line type="monotone" dataKey="median" stroke="#8884d8" name="資産額中央値" dot={false} strokeWidth={2} />
          <Line type="monotone" dataKey="p90" stroke="#82ca9d" name="上位10%" dot={false} />
          <Line type="monotone" dataKey="p75" stroke="#a4de6c" name="上位25%" dot={false} strokeDasharray="5 5" />
          <Line type="monotone" dataKey="p25" stroke="#ffb347" name="下位25%" dot={false} strokeDasharray="5 5" />
          <Line type="monotone" dataKey="p10" stroke="#ffc658" name="下位10%" dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};