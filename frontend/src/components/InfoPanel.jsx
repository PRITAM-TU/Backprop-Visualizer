import React from 'react'
import { motion } from 'framer-motion'
import { PHASE } from '../hooks/useNetworkState'
import { fmt, fmtSigned, lossColor, gradColor, w1ChainRule, w2ChainRule } from '../utils/mathHelpers'

const Section = ({ title, children }) => (
  <div className="mb-4">
    <div className="section-title">{title}</div>
    {children}
  </div>
)

const MathRow = ({ label, value, color, mono = true }) => (
  <div className="flex justify-between items-center py-1 border-b border-bg-border/40 gap-2">
    <span className={`text-xs text-slate-400 ${mono ? 'font-mono' : ''}`}>{label}</span>
    <span className={`text-xs font-mono font-semibold`} style={{ color }}>{value}</span>
  </div>
)

export default function InfoPanel({ state }) {
  const { phase, forwardResult, backwardResult, hiddenSize, target, lossFn, hiddenActivation, currentLoss } = state
  const idle = phase === PHASE.IDLE

  return (
    <div className="flex flex-col gap-3 h-full overflow-y-auto pr-1">
      {/* Status */}
      <div className="card-sm">
        <div className="section-title">Status</div>
        <div className={`text-sm font-semibold ${
          phase === PHASE.IDLE      ? 'text-slate-500' :
          phase === PHASE.FORWARD   ? 'text-accent-cyan' :
          phase === PHASE.LOSS      ? 'text-accent-yellow' :
          phase === PHASE.BACKWARD  ? 'text-accent-orange' :
          phase === PHASE.TRAINING  ? 'text-accent-blue' :
          'text-accent-green'
        }`}>
          {phase === PHASE.IDLE     && '⏸  Idle — configure & step forward'}
          {phase === PHASE.FORWARD  && '▶  Forward pass running...'}
          {phase === PHASE.LOSS     && '⚡  Loss computed — ready to backprop'}
          {phase === PHASE.BACKWARD && '◀  Backward pass running...'}
          {phase === PHASE.TRAINING && '🔄  Training in progress...'}
          {phase === PHASE.COMPLETE && '✓  Step complete — weights updated'}
        </div>
      </div>

      {/* Forward results */}
      {forwardResult && (
        <motion.div className="card-sm"
          initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
          <Section title="Forward Pass">
            <div className="math-box mb-2 text-[10px] leading-relaxed">
              <div className="text-accent-cyan mb-1">Hidden Layer ({hiddenActivation})</div>
              {Array.from({ length: hiddenSize }, (_, i) => (
                <div key={i}>
                  z{i+1} = Σw·x + b → <span className="text-accent-blue">{fmt(forwardResult.z1?.[i])}</span>
                  {'  '}a{i+1} = act(z{i+1}) = <span className="text-accent-purple">{fmt(forwardResult.a1?.[i])}</span>
                </div>
              ))}
              <div className="mt-1 text-accent-green">
                Output Layer (sigmoid)
              </div>
              <div>
                z_out = Σw·h + b → <span className="text-accent-blue">{fmt(forwardResult.z2)}</span>
                {'  '}ŷ = σ(z_out) = <span className="text-accent-green">{fmt(forwardResult.y_hat)}</span>
              </div>
            </div>
            <MathRow label="ŷ (prediction)" value={fmt(forwardResult.y_hat)} color="#10b981" />
            <MathRow label="y  (target)"    value={fmt(target)}              color="#f59e0b" />
          </Section>
        </motion.div>
      )}

      {/* Loss */}
      {currentLoss !== null && (
        <motion.div className="card-sm"
          initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
          <Section title={`Loss (${lossFn.toUpperCase()})`}>
            <div className="math-box mb-2 text-[10px] leading-relaxed">
              {lossFn === 'bce' && (
                <div>L = -[y·log(ŷ) + (1-y)·log(1-ŷ)]</div>
              )}
              {lossFn === 'mse' && (
                <div>L = (ŷ - y)²</div>
              )}
              {lossFn === 'mae' && (
                <div>L = |ŷ - y|</div>
              )}
            </div>
            <div className="text-3xl font-black text-center py-2 font-mono"
              style={{ color: lossColor(currentLoss) }}>
              {fmt(currentLoss, 6)}
            </div>
          </Section>
        </motion.div>
      )}

      {/* Backward / Gradients */}
      {backwardResult?.gradients && (
        <motion.div className="card-sm"
          initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
          <Section title="Gradients (Chain Rule)">
            <div className="math-box mb-2 text-[10px] leading-relaxed">
              <div className="text-accent-orange mb-1">Output → Hidden</div>
              {backwardResult.gradients.dL_dW2?.[0]?.map((g, hi) => (
                <div key={hi} style={{ color: gradColor(g) }}>
                  {w2ChainRule(hi)} = {fmtSigned(g)}
                </div>
              ))}
              <div className="text-accent-red mt-1 mb-1">Hidden → Input</div>
              {backwardResult.gradients.dL_dW1?.map((row, hi) =>
                row.map((g, ii) => (
                  <div key={`${hi}-${ii}`} style={{ color: gradColor(g) }}>
                    {w1ChainRule(ii, hi)} = {fmtSigned(g)}
                  </div>
                ))
              )}
            </div>
          </Section>

          <Section title="Weight Update Rule">
            <div className="math-box text-[10px]">
              w_new = w_old − α · ∂L/∂w
            </div>
          </Section>
        </motion.div>
      )}

      {idle && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-slate-600 text-sm">
            <div className="text-4xl mb-2">🧠</div>
            <div>Press <span className="text-accent-blue font-semibold">Step Forward</span> to begin</div>
          </div>
        </div>
      )}
    </div>
  )
}
