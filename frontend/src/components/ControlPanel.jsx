import React from 'react'
import { motion } from 'framer-motion'
import { PHASE } from '../hooks/useNetworkState'
import { fmt, getW1, getW2 } from '../utils/mathHelpers'

const ACTIVATIONS = [
  { value: 'sigmoid',    label: 'Sigmoid σ(z)',    desc: '1/(1+e⁻ᶻ)' },
  { value: 'relu',       label: 'ReLU',             desc: 'max(0,z)' },
  { value: 'tanh',       label: 'Tanh',             desc: 'tanh(z)' },
  { value: 'leaky_relu', label: 'Leaky ReLU',       desc: 'max(0.01z,z)' },
  { value: 'linear',     label: 'Linear',           desc: 'z' },
]

const LOSSES = [
  { value: 'bce', label: 'Binary Cross-Entropy', desc: '-[y·log(ŷ)+(1-y)·log(1-ŷ)]' },
  { value: 'mse', label: 'Mean Squared Error',   desc: '(ŷ-y)²' },
  { value: 'mae', label: 'Mean Absolute Error',  desc: '|ŷ-y|' },
]

function Slider({ label, value, min, max, step, onChange, displayValue }) {
  const pct = ((value - min) / (max - min)) * 100
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="label">{label}</span>
        <span className="text-xs font-mono text-accent-blue font-semibold">{displayValue || value}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={{ '--value': `${pct}%` }}
        className="w-full"
      />
    </div>
  )
}

function WeightRow({ label, value, onChange, disabled }) {
  return (
    <div className="flex items-center gap-2 mb-1">
      <span className="text-[10px] font-mono text-slate-400 w-20 flex-shrink-0">{label}</span>
      <input
        type="number" step="0.01" value={Number(value).toFixed(4)}
        onChange={e => onChange(parseFloat(e.target.value) || 0)}
        disabled={disabled}
        className="input-field py-0.5 text-[11px] h-6"
      />
    </div>
  )
}

export default function ControlPanel({
  state,
  addHiddenNode, removeHiddenNode,
  setW1, setB1, setW2, setB2,
  setInput, setTarget,
  setLR, setEpochs, setHiddenActivation, setLossFn,
  stepForward, stepBackward, trainEpochs,
  reset, resetFull,
}) {
  const {
    hiddenSize, W1, b1, W2, b2,
    inputs, target,
    learningRate, epochs,
    hiddenActivation, lossFn,
    phase, loading, error,
  } = state

  const busy       = loading || phase === PHASE.TRAINING
  const canForward = !busy
  const canBackward= !busy && phase === PHASE.LOSS
  const canTrain   = !busy

  return (
    <div className="flex flex-col gap-3 h-full overflow-y-auto pr-1">

      {/* ── Network Architecture ───────────────────────────────────── */}
      <div className="card-sm">
        <div className="section-title">Architecture</div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-slate-400">Hidden Nodes</span>
          <div className="flex items-center gap-2">
            <button className="btn-icon" onClick={removeHiddenNode} disabled={hiddenSize <= 1} title="Remove node">−</button>
            <span className="text-base font-black text-accent-purple font-mono w-6 text-center">{hiddenSize}</span>
            <button className="btn-icon" onClick={addHiddenNode} disabled={hiddenSize >= 8} title="Add node">+</button>
          </div>
        </div>
        <div className="flex gap-2 text-[10px] text-slate-500 font-mono">
          <span className="badge-cyan">Input: 2</span>
          <span className="badge-purple">Hidden: {hiddenSize}</span>
          <span className="badge-green">Output: 1</span>
        </div>
      </div>

      {/* ── Inputs & Target ───────────────────────────────────────── */}
      <div className="card-sm">
        <div className="section-title">Inputs & Target</div>
        {[0, 1].map(i => (
          <div key={i} className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono text-accent-cyan w-6">x{i+1}</span>
            <input type="number" step="0.1" min={0} max={1}
              value={inputs[i]}
              onChange={e => setInput(i, parseFloat(e.target.value) || 0)}
              className="input-field py-0.5 text-[11px] h-6"
            />
          </div>
        ))}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-accent-yellow w-6">y</span>
          <select value={target} onChange={e => setTarget(Number(e.target.value))}
            className="select-field py-0.5 text-[11px] h-6">
            <option value={1}>1  (positive)</option>
            <option value={0}>0  (negative)</option>
          </select>
        </div>
      </div>

      {/* ── Activation & Loss ─────────────────────────────────────── */}
      <div className="card-sm">
        <div className="section-title">Functions</div>
        <div className="mb-2">
          <label className="label">Hidden Activation</label>
          <select value={hiddenActivation} onChange={e => setHiddenActivation(e.target.value)}
            className="select-field text-xs">
            {ACTIVATIONS.map(a => (
              <option key={a.value} value={a.value}>{a.label}  [{a.desc}]</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Loss Function</label>
          <select value={lossFn} onChange={e => setLossFn(e.target.value)}
            className="select-field text-xs">
            {LOSSES.map(l => (
              <option key={l.value} value={l.value}>{l.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Hyperparameters ───────────────────────────────────────── */}
      <div className="card-sm">
        <div className="section-title">Hyperparameters</div>
        <Slider
          label="Learning Rate (α)"
          value={learningRate} min={0.001} max={1} step={0.001}
          displayValue={learningRate.toFixed(3)}
          onChange={setLR}
        />
        <div className="mt-3">
          <div className="flex justify-between items-center mb-1">
            <span className="label">Epochs</span>
            <span className="text-xs font-mono text-accent-blue font-semibold">{epochs}</span>
          </div>
          <input type="number" min={1} max={5000} value={epochs}
            onChange={e => setEpochs(Math.min(5000, Math.max(1, parseInt(e.target.value) || 1)))}
            className="input-field text-[11px] h-7"
          />
          <input type="range" min={1} max={5000} step={1} value={epochs}
            onChange={e => setEpochs(Number(e.target.value))}
            style={{ '--value': `${(epochs / 5000) * 100}%` }}
            className="w-full mt-1"
          />
        </div>
      </div>

      {/* ── Weights Editor ────────────────────────────────────────── */}
      <div className="card-sm">
        <div className="section-title">Weights W₁ (hidden←input)</div>
        <div className="max-h-36 overflow-y-auto">
          {Array.from({ length: hiddenSize }, (_, hi) =>
            [0, 1].map(ii => (
              <WeightRow key={`w1-${hi}-${ii}`}
                label={`W1[${hi}][${ii}]`}
                value={getW1(W1, hi, ii)}
                onChange={v => setW1(hi, ii, v)}
                disabled={busy}
              />
            ))
          )}
        </div>
        <div className="section-title mt-2">Biases b₁</div>
        {Array.from({ length: hiddenSize }, (_, hi) => (
          <WeightRow key={`b1-${hi}`}
            label={`b1[${hi}]`} value={b1[hi]}
            onChange={v => setB1(hi, v)} disabled={busy}
          />
        ))}
        <div className="section-title mt-2">Weights W₂ (output←hidden)</div>
        {Array.from({ length: hiddenSize }, (_, hi) => (
          <WeightRow key={`w2-${hi}`}
            label={`W2[0][${hi}]`} value={W2[0]?.[hi] ?? 0}
            onChange={v => setW2(hi, v)} disabled={busy}
          />
        ))}
        <WeightRow label="b2[0]" value={b2[0]} onChange={setB2} disabled={busy} />
      </div>

      {/* ── Actions ───────────────────────────────────────────────── */}
      <div className="card-sm space-y-2">
        <div className="section-title">Step-by-Step</div>
        <div className="grid grid-cols-2 gap-2">
          <button className="btn-primary" onClick={stepForward} disabled={!canForward} id="btn-step-forward">
            ▶ Step Forward
          </button>
          <button className="btn-secondary" onClick={stepBackward} disabled={!canBackward} id="btn-step-backward">
            ◀ Step Backward
          </button>
        </div>
        <div className="section-title mt-2">Auto Train</div>
        <button className="btn-primary w-full" onClick={trainEpochs} disabled={!canTrain} id="btn-train">
          {loading && phase === PHASE.TRAINING ? '⏳ Training...' : `🚀 Train ${epochs} Epochs`}
        </button>
        <div className="grid grid-cols-2 gap-2">
          <button className="btn-secondary" onClick={reset} id="btn-reset-weights">
            ↺ Re-init Weights
          </button>
          <button className="btn-danger" onClick={resetFull} id="btn-reset-full">
            ✕ Full Reset
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="card-sm border-red-600/50 bg-red-900/10 text-accent-red text-xs"
        >
          ⚠ {error}
        </motion.div>
      )}
    </div>
  )
}
