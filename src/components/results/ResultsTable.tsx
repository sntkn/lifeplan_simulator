import type { YearlyData } from '../../types/simulation';

interface ResultsTableProps {
  data: YearlyData[];
  simulationPeriod: number;
}

/**
 * シミュレーション結果のテーブルコンポーネントです。
 * @param data シミュレーション結果データ
 * @param simulationPeriod シミュレーション期間
 */
export const ResultsTable = ({ data, simulationPeriod }: ResultsTableProps) => {
  // 5年ごとのシミュレーション結果のサマリーデータ
  const summaryData = data.filter(d => d.year % 5 === 0 || d.year === simulationPeriod);

  return (
    <div className="w-full overflow-x-auto">
      <h2 className="text-xl font-bold mb-3">シミュレーション結果（5年ごと）</h2>
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="border p-2 text-right">年齢</th>
            <th className="border p-2 text-right">上位10%</th>
            <th className="border p-2 text-right">上位25%</th>
            <th className="border p-2 text-right">資産額中央値</th>
            <th className="border p-2 text-right">下位25%</th>
            <th className="border p-2 text-right">下位10%</th>
          </tr>
        </thead>
        <tbody>
          {summaryData.map(d => (
            <tr key={d.year}>
              <td className="border p-2 text-right">{d.age}歳</td>
              <td className="border p-2 text-right">{Math.floor(d.p90 / 10000).toLocaleString()}万円</td>
              <td className="border p-2 text-right">{Math.floor(d.p75 / 10000).toLocaleString()}万円</td>
              <td className="border p-2 text-right">{Math.floor(d.median / 10000).toLocaleString()}万円</td>
              <td className="border p-2 text-right">{Math.floor(d.p25 / 10000).toLocaleString()}万円</td>
              <td className="border p-2 text-right">{Math.floor(d.p10 / 10000).toLocaleString()}万円</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};