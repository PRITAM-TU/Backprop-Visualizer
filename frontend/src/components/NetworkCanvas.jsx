import React, { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { calcLayout, calcEdges } from '../utils/networkLayout'
import { fmt, getW1, getW2, gradColor } from '../utils/mathHelpers'
import { PHASE } from '../hooks/useNetworkState'

const W = 860
const H = 460
const R = 26   // node radius

const LAYER_COLORS = {
  input:  { fill: '#0e2a40', stroke: '#22d3ee', text: '#22d3ee' },
  hidden: { fill: '#1a1040', stroke: '#8b5cf6', text: '#8b5cf6' },
  output: { fill: '#0a2a1e', stroke: '#10b981', text: '#10b981' },
}

// Animated packet flowing along an edge
function FlowPacket({ edge, color, delay, duration, reverse }) {
  const x1 = reverse ? edge.toNode.x : edge.fromNode.x
  const y1 = reverse ? edge.toNode.y : edge.fromNode.y
  const x2 = reverse ? edge.fromNode.x : edge.toNode.x
  const y2 = reverse ? edge.fromNode.y : edge.toNode.y
  return (
    <motion.circle
      cx={x1} cy={y1} r={5} fill={color} opacity={0.9}
      animate={{ cx: [x1, x2], cy: [y1, y2], opacity: [0.9, 0] }}
      transition={{ duration, delay, ease: 'easeInOut' }}
    />
  )
}

// Tooltip shown on node hover
function NodeTooltip({ node, forwardResult, backwardResult, phase }) {
  const isInput  = node.layer === 'input'
  const isOutput = node.layer === 'output'
  const isHidden = node.layer === 'hidden'
  const i = node.index

  let lines = []
  if (isInput && forwardResult) {
    lines = [`Value: x${i+1} = (user input)`]
  }
  if (isHidden && forwardResult) {
    const z = forwardResult.z1?.[i]
    const a = forwardResult.a1?.[i]
    lines = [
      `z${i+1} = Σ(w·x) + b = ${fmt(z)}`,
      `a${i+1} = σ(z${i+1}) = ${fmt(a)}`,
    ]
  }
  if (isOutput && forwardResult) {
    const z = forwardResult.z2
    const yhat = forwardResult.y_hat
    lines = [
      `z_out = Σ(w·h) + b = ${fmt(z)}`,
      `ŷ = σ(z_out) = ${fmt(yhat)}`,
      `loss = ${fmt(forwardResult.loss)}`,
    ]
  }
  if (!lines.length) lines = [node.label]

  return (
    <foreignObject
      x={node.x + R + 6} y={node.y - 44}
      width={210} height={110}
      style={{ pointerEvents: 'none' }}
    >
      <div className="bg-bg-card border border-bg-border rounded-xl p-2.5 shadow-glow-lg text-xs font-mono">
        <div className="font-bold text-accent-blue mb-1">{node.label}</div>
        {lines.map((l, i) => (
          <div key={i} className="text-slate-300 leading-relaxed">{l}</div>
        ))}
      </div>
    </foreignObject>
  )
}

export default function NetworkCanvas({ state, setHighlight }) {
  const { hiddenSize, W1, b1, W2, b2, phase, forwardResult, backwardResult } = state
  const [hoveredNode, setHoveredNode] = useState(null)
  const [hoveredEdge, setHoveredEdge] = useState(null)

  const layout = useMemo(() => calcLayout(hiddenSize, W, H), [hiddenSize])
  const edges  = useMemo(() => calcEdges(layout), [layout])
  const allNodes = useMemo(() =>
    [...layout.input, ...layout.hidden, ...layout.output], [layout])

  const isForwarding  = phase === PHASE.FORWARD
  const isLoss        = phase === PHASE.LOSS
  const isBackwarding = phase === PHASE.BACKWARD
  const isComplete    = phase === PHASE.COMPLETE

  // Determine node activation brightness
  const nodeActivity = (node) => {
    if (node.layer === 'hidden' && forwardResult?.a1) {
      return forwardResult.a1[node.index]
    }
    if (node.layer === 'output' && forwardResult?.y_hat) {
      return forwardResult.y_hat
    }
    return null
  }

  // Edge gradient value (for backward colouring)
  const edgeGrad = (edge) => {
    if (!backwardResult?.gradients) return null
    if (edge.fromLayer === 'input') {
      return backwardResult.gradients.dL_dW1?.[edge.toNode.index]?.[edge.fromNode.index]
    }
    if (edge.fromLayer === 'hidden') {
      return backwardResult.gradients.dL_dW2?.[0]?.[edge.fromNode.index]
    }
    return null
  }

  // Edge weight label
  const edgeWeight = (edge) => {
    if (edge.fromLayer === 'input')
      return getW1(W1, edge.toNode.index, edge.fromNode.index)
    if (edge.fromLayer === 'hidden')
      return getW2(W2, edge.fromNode.index)
    return 0
  }

  return (
    <div className="relative w-full h-full">
      {/* Phase banner */}
      <AnimatePresence>
        {phase !== PHASE.IDLE && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute top-3 left-1/2 -translate-x-1/2 z-10 px-4 py-1.5 rounded-full text-xs font-bold tracking-wider
              backdrop-blur border"
            style={{
              background:
                phase === PHASE.FORWARD   ? 'rgba(34,211,238,0.12)' :
                phase === PHASE.LOSS      ? 'rgba(245,158,11,0.12)' :
                phase === PHASE.BACKWARD  ? 'rgba(249,115,22,0.12)' :
                phase === PHASE.TRAINING  ? 'rgba(99,102,241,0.12)' :
                                            'rgba(16,185,129,0.12)',
              borderColor:
                phase === PHASE.FORWARD   ? '#22d3ee' :
                phase === PHASE.LOSS      ? '#f59e0b' :
                phase === PHASE.BACKWARD  ? '#f97316' :
                phase === PHASE.TRAINING  ? '#6366f1' :
                                            '#10b981',
              color:
                phase === PHASE.FORWARD   ? '#22d3ee' :
                phase === PHASE.LOSS      ? '#f59e0b' :
                phase === PHASE.BACKWARD  ? '#f97316' :
                phase === PHASE.TRAINING  ? '#6366f1' :
                                            '#10b981',
            }}
          >
            {phase === PHASE.FORWARD  && '▶  Forward Pass'}
            {phase === PHASE.LOSS     && '⚡  Loss Computed'}
            {phase === PHASE.BACKWARD && '◀  Backward Pass'}
            {phase === PHASE.TRAINING && '🔄  Training...'}
            {phase === PHASE.COMPLETE && '✓  Weights Updated'}
          </motion.div>
        )}
      </AnimatePresence>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%" height="100%"
        style={{ overflow: 'visible' }}
      >
        {/* ── Defs ─────────────────────────────────────────────────────── */}
        <defs>
          {['input', 'hidden', 'output'].map(layer => (
            <radialGradient key={layer} id={`grad-${layer}`} cx="40%" cy="35%">
              <stop offset="0%" stopColor={LAYER_COLORS[layer].stroke} stopOpacity={0.25} />
              <stop offset="100%" stopColor={LAYER_COLORS[layer].fill} stopOpacity={1} />
            </radialGradient>
          ))}
          <filter id="glow-blue">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="glow-purple">
            <feGaussianBlur stdDeviation="5" result="coloredBlur" />
            <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="glow-orange">
            <feGaussianBlur stdDeviation="6" result="coloredBlur" />
            <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* ── Layer labels ─────────────────────────────────────────────── */}
        {[
          { x: 80,       label: 'Input Layer',  color: '#22d3ee' },
          { x: W / 2,    label: 'Hidden Layer', color: '#8b5cf6' },
          { x: W - 80,   label: 'Output Layer', color: '#10b981' },
        ].map(({ x, label, color }) => (
          <text key={label} x={x} y={24} textAnchor="middle" fontSize={11}
            fontFamily="Inter, sans-serif" fontWeight="600" fill={color} opacity={0.7}
            letterSpacing="0.08em"
          >
            {label.toUpperCase()}
          </text>
        ))}

        {/* ── Edges ────────────────────────────────────────────────────── */}
        {edges.map(edge => {
          const grad = edgeGrad(edge)
          const isHovered = hoveredEdge === edge.key
          const weight = edgeWeight(edge)
          const strokeColor =
            (isBackwarding || isComplete) && grad != null ? gradColor(grad)
            : isHovered ? '#6366f1'
            : '#252a4a'
          const strokeW = isHovered ? 2.5 : 1.5
          const mid = {
            x: (edge.fromNode.x + edge.toNode.x) / 2,
            y: (edge.fromNode.y + edge.toNode.y) / 2,
          }
          return (
            <g key={edge.key}>
              {/* Invisible hit area */}
              <line
                x1={edge.fromNode.x} y1={edge.fromNode.y}
                x2={edge.toNode.x}   y2={edge.toNode.y}
                stroke="transparent" strokeWidth={16}
                style={{ cursor: 'pointer' }}
                onMouseEnter={() => setHoveredEdge(edge.key)}
                onMouseLeave={() => setHoveredEdge(null)}
              />
              {/* Visible edge */}
              <motion.line
                x1={edge.fromNode.x} y1={edge.fromNode.y}
                x2={edge.toNode.x}   y2={edge.toNode.y}
                stroke={strokeColor}
                strokeWidth={strokeW}
                opacity={isHovered ? 1 : 0.55}
                animate={{ stroke: strokeColor, strokeWidth: strokeW }}
                transition={{ duration: 0.4 }}
                style={{ pointerEvents: 'none' }}
              />
              {/* Weight label on hover or after backward */}
              <AnimatePresence>
                {(isHovered || isComplete || isBackwarding) && (
                  <motion.g
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  >
                    <rect
                      x={mid.x - 28} y={mid.y - 10} width={56} height={20} rx={4}
                      fill="#161a30" stroke={strokeColor} strokeWidth={1} opacity={0.95}
                    />
                    <text
                      x={mid.x} y={mid.y + 4}
                      textAnchor="middle" fontSize={9} fontFamily="JetBrains Mono, monospace"
                      fill={strokeColor}
                    >
                      w={fmt(weight, 3)}
                    </text>
                    {(isComplete || isBackwarding) && grad != null && (
                      <text
                        x={mid.x} y={mid.y + 18}
                        textAnchor="middle" fontSize={8} fontFamily="JetBrains Mono, monospace"
                        fill={gradColor(grad)} opacity={0.8}
                      >
                        ∇={fmt(grad, 3)}
                      </text>
                    )}
                  </motion.g>
                )}
              </AnimatePresence>
            </g>
          )
        })}

        {/* ── Flow Packets ─────────────────────────────────────────────── */}
        <AnimatePresence>
          {isForwarding && edges.map((edge, i) => (
            <FlowPacket key={`fwd-${edge.key}`} edge={edge} color="#22d3ee"
              delay={edge.fromLayer === 'input' ? i * 0.08 : 0.5 + i * 0.08}
              duration={0.6} reverse={false}
            />
          ))}
          {isBackwarding && edges.map((edge, i) => (
            <FlowPacket key={`bwd-${edge.key}`} edge={edge} color="#f97316"
              delay={edge.fromLayer === 'hidden' ? i * 0.08 : 0.5 + i * 0.08}
              duration={0.6} reverse={true}
            />
          ))}
        </AnimatePresence>

        {/* ── Nodes ────────────────────────────────────────────────────── */}
        {allNodes.map(node => {
          const colors = LAYER_COLORS[node.layer]
          const activity = nodeActivity(node)
          const isHov = hoveredNode === node.id
          const isActivePhase =
            (isForwarding && node.layer === 'hidden') ||
            (isLoss && node.layer === 'output') ||
            (isBackwarding && node.layer === 'hidden')

          return (
            <g key={node.id}
              style={{ cursor: 'pointer' }}
              onMouseEnter={() => setHoveredNode(node.id)}
              onMouseLeave={() => setHoveredNode(null)}
            >
              {/* Glow ring when active */}
              {(isActivePhase || isHov) && (
                <motion.circle
                  cx={node.x} cy={node.y}
                  r={R + 2} fill="none"
                  stroke={colors.stroke}
                  strokeWidth={1.5}
                  initial={{ r: R + 4, opacity: 0.8 }}
                  animate={{ r: [R + 4, R + 18], opacity: [0.8, 0] }}
                  transition={{ repeat: Infinity, duration: 1.4, ease: 'easeOut' }}
                />
              )}

              {/* Main node circle */}
              <motion.circle
                cx={node.x} cy={node.y}
                r={R}
                fill={`url(#grad-${node.layer})`}
                stroke={colors.stroke}
                strokeWidth={isHov || isActivePhase ? 2.5 : 1.5}
                filter={isActivePhase ? 'url(#glow-purple)' : isHov ? 'url(#glow-blue)' : undefined}
                animate={{
                  r: isActivePhase ? R + 2 : R,
                  strokeWidth: isHov || isActivePhase ? 2.5 : 1.5,
                }}
                transition={{ duration: 0.3 }}
              />

              {/* Activity fill overlay */}
              {activity !== null && (
                <motion.circle
                  cx={node.x} cy={node.y}
                  r={R - 4}
                  fill={colors.stroke}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: activity * 0.35 }}
                  transition={{ duration: 0.5 }}
                />
              )}

              {/* Node label */}
              <text
                x={node.x} y={node.y + 1}
                textAnchor="middle" dominantBaseline="middle"
                fontSize={12} fontFamily="JetBrains Mono, monospace" fontWeight="600"
                fill={colors.text}
                style={{ pointerEvents: 'none', userSelect: 'none' }}
              >
                {node.label}
              </text>

              {/* Activation value below node */}
              {activity !== null && (
                <motion.text
                  x={node.x} y={node.y + R + 14}
                  textAnchor="middle"
                  fontSize={9} fontFamily="JetBrains Mono, monospace"
                  fill={colors.stroke} opacity={0.85}
                  initial={{ opacity: 0, y: node.y + R + 8 }}
                  animate={{ opacity: 0.85, y: node.y + R + 14 }}
                  transition={{ duration: 0.4 }}
                >
                  {fmt(activity, 3)}
                </motion.text>
              )}

              {/* Tooltip on hover */}
              {isHov && (
                <NodeTooltip
                  node={node}
                  forwardResult={forwardResult}
                  backwardResult={backwardResult}
                  phase={phase}
                />
              )}
            </g>
          )
        })}
      </svg>
    </div>
  )
}
