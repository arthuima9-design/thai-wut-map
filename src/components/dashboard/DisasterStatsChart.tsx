import React from 'react';
import type { DisasterEvent } from '../../types/disaster';
import { DISASTER_TYPES_CONFIG } from '../../utils/formatters';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { BarChart3 } from 'lucide-react';

interface DisasterStatsChartProps {
  events: DisasterEvent[];
}

export const DisasterStatsChart: React.FC<DisasterStatsChartProps> = ({ events }) => {
  // Aggregate events by disaster type
  const typeCounts: Record<string, { label: string; count: number; color: string }> = {};

  (events || []).forEach((evt) => {
    if (!evt || !evt.type) return;
    const cfg = DISASTER_TYPES_CONFIG[evt.type] || DISASTER_TYPES_CONFIG.alert;
    if (!typeCounts[evt.type]) {
      typeCounts[evt.type] = {
        label: cfg.labelTh ? cfg.labelTh.split('/')[0] : 'อื่นๆ',
        count: 0,
        color: cfg.color || '#38bdf8',
      };
    }
    typeCounts[evt.type].count += 1;
  });

  const data = Object.values(typeCounts).sort((a, b) => b.count - a.count);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
        <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wider">
          <BarChart3 className="w-4 h-4 text-sky-600" />
          <span>สัดส่วนภัยพิบัติที่กำลังดำเนินการ</span>
        </h3>
        <span className="text-[11px] text-slate-500">ตามประเภทเหตุการณ์</span>
      </div>

      <div className="h-44 w-full flex items-center justify-center">
        {data.length === 0 ? (
          <div className="text-xs text-slate-500 text-center py-6">
            ยังไม่มีข้อมูลสัดส่วนภัยพิบัติในขณะนี้
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ top: 5, right: 16, left: 0, bottom: 5 }}>
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="label"
                stroke="#475569"
                fontSize={10.5}
                tickLine={false}
                axisLine={false}
                width={112}
              />
              <Tooltip
                cursor={false}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0].payload;
                    return (
                      <div className="bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-xl text-xs z-50">
                        <div className="font-bold text-slate-900">{item.label}</div>
                        <div className="text-sky-600 font-semibold">{item.count} จุด / เหตุการณ์</div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
