import React, { useMemo } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts'
import { lossColor } from '../utils/mathHelpers'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  const val = payload[0].value
  return (
    <div className="bg-bg-card border border-bg-border rounded-lg px-3 py-2 text-xs font-mono shadow-glow">
      <div className="text-slate-400 mb-0.5">Epoch {label}</div>
      <div className="font-bold" style={{ color: lossColor(val) }}>Loss: {val?.toFixed(6)}</div>
    </div>
  )
}

export default function LossChart({ lossHistory }) {
  const data = useMemo(() =>
    (lossHistory || []).map((loss, i) => ({ epoch: i + 1, loss })),
    [lossHistory]
  )

  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-full text-slate-600 text-sm gap-2">
        <span>📉</span>
        <span>Loss curve will appear after training epochs</span>
      </div>
    )
  }

  const minLoss = Math.min(...data.map(d => d.loss))
  const maxLoss = Math.max(...data.map(d => d.loss))
  const finalLoss = data[data.length - 1]?.loss
  const improvement = data[0]?.loss - finalLoss

  return (
    <div className="flex flex-col h-full gap-2">
      {/* Stats row */}
      <div className="flex gap-4 text-xs font-mono flex-wrap">
        <span>
          <span className="text-slate-500">Epochs: </span>
          <span className="text-accent-blue font-semibold">{data.length}</span>
        </span>
        <span>
          <span className="text-slate-500">Start: </span>
          <span className="font-semibold" style={{ color: lossColor(data[0]?.loss) }}>{data[0]?.loss?.toFixed(5)}</span>
        </span>
        <span>
          <span className="text-slate-500">Final: </span>
          <span className="font-semibold" style={{ color: lossColor(finalLoss) }}>{finalLoss?.toFixed(5)}</span>
        </span>
        <span>
          <span className="text-slate-500">↓ Drop: </span>
          <span className={`font-semibold ${improvement >= 0 ? 'text-accent-green' : 'text-accent-red'}`}>
            {improvement >= 0 ? '-' : '+'}{Math.abs(improvement).toFixed(5)}
          </span>
        </span>
      </div>

      {/* Chart */}
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#252a4a" vertical={false} />
            <XAxis
              dataKey="epoch"
              tick={{ fill: '#475569', fontSize: 9, fontFamily: 'JetBrains Mono' }}
              tickLine={false} axisLine={false}
              label={{ value: 'Epoch', position: 'insideBottomRight', offset: -8, fill: '#475569', fontSize: 10 }}
            />
            <YAxis
              tick={{ fill: '#475569', fontSize: 9, fontFamily: 'JetBrains Mono' }}
              tickLine={false} axisLine={false}
              width={52}
              tickFormatter={v => v.toFixed(3)}
              domain={[Math.max(0, minLoss - 0.05), maxLoss + 0.05]}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={minLoss} stroke="#10b981" strokeDasharray="4 4" strokeWidth={1} opacity={0.5} />
            <Line
              type="monotone" dataKey="loss"
              stroke="url(#lossGradient)" strokeWidth={2}
              dot={data.length <= 20 ? { fill: '#6366f1', r: 3, strokeWidth: 0 } : false}
              activeDot={{ r: 5, fill: '#8b5cf6', strokeWidth: 0 }}
              isAnimationActive={true}
              animationDuration={800}
            />
            <defs>
              <linearGradient id="lossGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%"   stopColor="#ef4444" />
                <stop offset="50%"  stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#10b981" />
              </linearGradient>
            </defs>
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
