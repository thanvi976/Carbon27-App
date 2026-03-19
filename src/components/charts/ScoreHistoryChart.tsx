import { View } from 'react-native';
import { VictoryAxis, VictoryChart, VictoryLine, VictoryTheme } from 'victory-native';
import { COLORS } from '../../constants/colors';

export function ScoreHistoryChart({ data }: { data: { date: string; score: number }[] }) {
  const chartData = (data ?? []).map((d) => ({ x: d.date.slice(5), y: d.score }));
  if (chartData.length === 0) return <View style={{ height: 120 }} />;

  return (
    <View style={{ height: 160 }}>
      <VictoryChart
        theme={VictoryTheme.material}
        padding={{ top: 20, left: 42, right: 18, bottom: 30 }}
        domain={{ y: [0, 100] }}
      >
        <VictoryAxis
          style={{
            axis: { stroke: COLORS.border },
            tickLabels: { fill: COLORS.textMuted, fontSize: 10 },
            grid: { stroke: 'transparent' },
          }}
        />
        <VictoryAxis
          dependentAxis
          style={{
            axis: { stroke: COLORS.border },
            tickLabels: { fill: COLORS.textMuted, fontSize: 10 },
            grid: { stroke: COLORS.surface },
          }}
        />
        <VictoryLine
          data={chartData}
          style={{ data: { stroke: COLORS.gold, strokeWidth: 2 } }}
          interpolation="monotoneX"
        />
      </VictoryChart>
    </View>
  );
}

