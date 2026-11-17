'use client';

import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

interface IndicatorRadarProps {
  internal: number;
  external: number;
  expert: number;
  correction: number;
  tierColor: string;
}

export default function IndicatorRadar({
  internal,
  external,
  expert,
  correction,
  tierColor,
}: IndicatorRadarProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    if (!chartInstance.current) {
      chartInstance.current = echarts.init(chartRef.current);
    }

    const option: echarts.EChartsOption = {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        borderColor: '#334155',
        textStyle: { color: '#F8FAFC', fontSize: 11 },
      },
      radar: {
        indicator: [
          { name: 'Internal', max: 100 },
          { name: 'Eksternal', max: 100 },
          { name: 'Eksper/Ahli', max: 100 },
          { name: 'Koreksi Data', max: 10 },
        ],
        shape: 'polygon',
        splitNumber: 3,
        axisName: {
          color: '#64748B',
          fontSize: 10,
          fontWeight: 600,
        },
        splitLine: {
          lineStyle: { color: '#E2E8F0' },
        },
        splitArea: {
          show: true,
          areaStyle: {
            color: ['rgba(248, 250, 252, 0.5)', 'rgba(241, 245, 249, 0.5)'],
          },
        },
        axisLine: {
          lineStyle: { color: '#CBD5E1' },
        },
      },
      series: [
        {
          type: 'radar',
          data: [
            {
              value: [
                Number(internal) || 0,
                Number(external) || 0,
                Number(expert) || 0,
                Math.abs(Number(correction)) || 0,
              ],
              name: 'Skor Dimensi',
              symbol: 'circle',
              symbolSize: 4,
              lineStyle: {
                width: 2,
                color: tierColor,
              },
              areaStyle: {
                color: `${tierColor}33`,
              },
              itemStyle: {
                color: tierColor,
              },
            },
          ],
        },
      ],
    };

    chartInstance.current.setOption(option);

    const handleResize = () => chartInstance.current?.resize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [internal, external, expert, correction, tierColor]);

  return <div ref={chartRef} className="w-full h-44" />;
}
