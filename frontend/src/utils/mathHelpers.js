/** Format a number to N decimal places, adding + sign for positives. */
export const fmt = (n, decimals = 4) =>
  typeof n === 'number' ? n.toFixed(decimals) : '—'

export const fmtSigned = (n, decimals = 4) =>
  typeof n === 'number' ? (n >= 0 ? `+${n.toFixed(decimals)}` : n.toFixed(decimals)) : '—'

/** Sigmoid formula string. */
export const sigmoidStr = (z) =>
  typeof z === 'number' ? `σ(${fmt(z, 3)}) = ${fmt(1 / (1 + Math.exp(-z)), 4)}` : '—'

/** Get the W1 weight for input i → hidden j.
 *  W1 is stored as [hidden_i][input_j]. */
export const getW1 = (W1, hiddenIdx, inputIdx) =>
  W1?.[hiddenIdx]?.[inputIdx] ?? 0

export const getW2 = (W2, hiddenIdx) =>
  W2?.[0]?.[hiddenIdx] ?? 0

/** Initialise random weights for a 2-N-1 network. */
export function initWeights(hiddenSize) {
  // Xavier-like small random init
  const rand = () => (Math.random() * 2 - 1) * 0.5
  const W1 = Array.from({ length: hiddenSize }, () => [rand(), rand()])
  const b1 = Array.from({ length: hiddenSize }, rand)
  const W2 = [Array.from({ length: hiddenSize }, rand)]
  const b2 = [rand()]
  return { W1, b1, W2, b2 }
}

/** Loss colour: green at 0, red at 1 */
export function lossColor(loss) {
  if (typeof loss !== 'number') return '#6366f1'
  const t = Math.min(loss, 2) / 2   // normalise to 0-1
  const r = Math.round(16 + t * (239 - 16))
  const g = Math.round(185 - t * (185 - 68))
  const b = Math.round(129 - t * (129 - 68))
  return `rgb(${r},${g},${b})`
}

/** Gradient colour by magnitude */
export function gradColor(val) {
  const abs = Math.abs(val)
  if (abs < 0.01) return '#6366f1'
  if (abs < 0.1)  return '#f59e0b'
  return '#ef4444'
}

/** Build W1 chain-rule explanation strings for a given hidden node */
export function w1ChainRule(inputIdx, hiddenIdx) {
  return `∂L/∂W1[${hiddenIdx}][${inputIdx}] = δ₂ · W2[${hiddenIdx}] · σ'(z1[${hiddenIdx}]) · x${inputIdx + 1}`
}
export function w2ChainRule(hiddenIdx) {
  return `∂L/∂W2[0][${hiddenIdx}] = δ₂ · a1[${hiddenIdx}]`
}
