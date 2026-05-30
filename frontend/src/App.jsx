import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNetworkState, PHASE } from './hooks/useNetworkState'
import NetworkCanvas from './components/NetworkCanvas'
import ControlPanel from './components/ControlPanel'
import InfoPanel from './components/InfoPanel'
import LossChart from './components/LossChart'

// ── Tab component ────────────────────────────────────────────────────────────
function Tab({ label, active, onClick, badge }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-150 ${
        active
          ? 'bg-accent-blue/20 text-accent-blue border border-accent-blue/40'
          : 'text-slate-500 hover:text-slate-300'
      }`}
    >
      {label}
      {badge && (
        <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-accent-green/20 text-accent-green text-[9px] font-bold">
          {badge}
        </span>
      )}
    </button>
  )
}

// ── Header ───────────────────────────────────────────────────────────────────
function Header({ phase }) {
  const phaseLabel = {
    [PHASE.IDLE]:     { text: 'Ready', color: '#475569' },
    [PHASE.FORWARD]:  { text: 'Forward Pass', color: '#22d3ee' },
    [PHASE.LOSS]:     { text: 'Loss Computed', color: '#f59e0b' },
    [PHASE.BACKWARD]: { text: 'Backward Pass', color: '#f97316' },
    [PHASE.TRAINING]: { text: 'Training…', color: '#6366f1' },
    [PHASE.COMPLETE]: { text: 'Step Complete', color: '#10b981' },
  }[phase] || { text: 'Ready', color: '#475569' }

  return (
    <header className="flex items-center justify-between px-5 py-3 border-b border-bg-border bg-bg-secondary/80 backdrop-blur z-20">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-blue to-accent-purple flex items-center justify-center text-sm font-black">
          ∂
        </div>
        <div>
          <div className="text-sm font-bold text-white leading-none">Backprop Visualizer</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Interactive Deep Learning</div>
        </div>
      </div>

      {/* Phase indicator */}
      <div className="flex items-center gap-2">
        <motion.div
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: phaseLabel.color }}
          animate={{ scale: phase !== PHASE.IDLE ? [1, 1.3, 1] : 1 }}
          transition={{ repeat: Infinity, duration: 1.2 }}
        />
        <span className="text-xs font-semibold" style={{ color: phaseLabel.color }}>
          {phaseLabel.text}
        </span>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-[10px]">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#22d3ee' }} />
          <span className="text-slate-500">Forward</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#f97316' }} />
          <span className="text-slate-500">Backward</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#6366f1' }} />
          <span className="text-slate-500">Weights</span>
        </div>
      </div>
    </header>
  )
}

// ── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const ns = useNetworkState()
  const { state } = ns
  const [rightTab, setRightTab] = useState('info')  // 'info' | 'chart'
  const hasHistory = state.lossHistory?.length > 0

  return (
    <div className="flex flex-col h-screen bg-bg-primary overflow-hidden">
      <Header phase={state.phase} />

      {/* ── Main body ─────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── Left: Control Panel ─────────────────────────────────────── */}
        <aside className="w-64 flex-shrink-0 border-r border-bg-border bg-bg-secondary/40 overflow-y-auto p-3">
          <ControlPanel
            state={state}
            addHiddenNode={ns.addHiddenNode}
            removeHiddenNode={ns.removeHiddenNode}
            setW1={ns.setW1} setB1={ns.setB1}
            setW2={ns.setW2} setB2={ns.setB2}
            setInput={ns.setInput} setTarget={ns.setTarget}
            setLR={ns.setLR} setEpochs={ns.setEpochs}
            setHiddenActivation={ns.setHiddenActivation}
            setLossFn={ns.setLossFn}
            stepForward={ns.stepForward}
            stepBackward={ns.stepBackward}
            trainEpochs={ns.trainEpochs}
            reset={ns.reset} resetFull={ns.resetFull}
          />
        </aside>

        {/* ── Centre: Network Canvas ──────────────────────────────────── */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Canvas */}
          <div className="flex-1 min-h-0 relative p-4">
            {/* Background grid */}
            <div className="absolute inset-0 opacity-[0.04]"
              style={{
                backgroundImage: 'linear-gradient(#6366f1 1px, transparent 1px), linear-gradient(90deg, #6366f1 1px, transparent 1px)',
                backgroundSize: '32px 32px',
              }}
            />
            <div className="relative h-full w-full">
              <NetworkCanvas
                state={state}
                setHighlight={ns.setHighlight}
              />
            </div>
          </div>

          {/* ── Bottom: Loss Chart ─────────────────────────────────── */}
          <div className="h-44 border-t border-bg-border bg-bg-secondary/30 px-4 py-3 flex-shrink-0">
            <div className="flex items-center justify-between mb-2">
              <span className="section-title mb-0">Training Loss Curve</span>
              {hasHistory && (
                <span className="badge-green text-[9px]">{state.lossHistory.length} pts</span>
              )}
            </div>
            <div className="h-[calc(100%-24px)]">
              <LossChart lossHistory={state.lossHistory} />
            </div>
          </div>
        </main>

        {/* ── Right: Info / Details ───────────────────────────────────── */}
        <aside className="w-64 flex-shrink-0 border-l border-bg-border bg-bg-secondary/40 flex flex-col">
          {/* Tab bar */}
          <div className="flex items-center gap-1 px-3 py-2 border-b border-bg-border">
            <Tab label="Math Details" active={rightTab === 'info'} onClick={() => setRightTab('info')} />
            <Tab
              label="Loss History" active={rightTab === 'chart'}
              onClick={() => setRightTab('chart')}
              badge={hasHistory ? state.lossHistory.length : null}
            />
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-y-auto p-3">
            <AnimatePresence mode="wait">
              {rightTab === 'info' ? (
                <motion.div key="info"
                  initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }} transition={{ duration: 0.15 }}
                  className="h-full"
                >
                  <InfoPanel state={state} />
                </motion.div>
              ) : (
                <motion.div key="chart"
                  initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }} transition={{ duration: 0.15 }}
                  className="h-80"
                >
                  <LossChart lossHistory={state.lossHistory} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </aside>
      </div>
    </div>
  )
}
