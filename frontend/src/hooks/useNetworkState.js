import { useState, useCallback } from 'react'
import { initWeights } from '../utils/mathHelpers'
import { apiForward, apiBackward, apiTrain } from '../api/backpropApi'

// ── Phase constants ──────────────────────────────────────────────────────────
export const PHASE = {
  IDLE:      'IDLE',
  FORWARD:   'FORWARD',
  LOSS:      'LOSS',
  BACKWARD:  'BACKWARD',
  COMPLETE:  'COMPLETE',
  TRAINING:  'TRAINING',
}

const DEFAULT_HIDDEN = 2

function makeInitState(hiddenSize = DEFAULT_HIDDEN) {
  return {
    // Architecture
    hiddenSize,
    // Weights (randomly initialised)
    ...initWeights(hiddenSize),
    // Inputs & target
    inputs: [0.5, 0.8],
    target: 1.0,
    // Hyperparams
    learningRate: 0.1,
    epochs: 100,
    hiddenActivation: 'sigmoid',
    lossFn: 'bce',
    // Computation results
    forwardResult: null,
    backwardResult: null,
    // Animation phase
    phase: PHASE.IDLE,
    // Training history
    lossHistory: [],
    // Per-step loss tracking
    currentLoss: null,
    // Error state
    error: null,
    // Loading
    loading: false,
    // Which node/edge is highlighted
    highlightedNode: null,
    highlightedEdge: null,
  }
}

export function useNetworkState() {
  const [state, setState] = useState(() => makeInitState())

  const set = useCallback((patch) =>
    setState(prev => ({ ...prev, ...(typeof patch === 'function' ? patch(prev) : patch) }))
  , [])

  // ── Architecture controls ─────────────────────────────────────────────────
  const addHiddenNode = useCallback(() => {
    setState(prev => {
      if (prev.hiddenSize >= 8) return prev
      const newSize = prev.hiddenSize + 1
      // Add row to W1 (new hidden node ← all inputs)
      const rand = () => (Math.random() * 2 - 1) * 0.5
      const newW1 = [...prev.W1, [rand(), rand()]]
      const newB1 = [...prev.b1, rand()]
      // Add column to W2 (output ← new hidden node)
      const newW2 = [[ ...prev.W2[0], rand() ]]
      return {
        ...prev,
        hiddenSize: newSize,
        W1: newW1, b1: newB1, W2: newW2,
        forwardResult: null, backwardResult: null,
        phase: PHASE.IDLE, lossHistory: [],
      }
    })
  }, [])

  const removeHiddenNode = useCallback(() => {
    setState(prev => {
      if (prev.hiddenSize <= 1) return prev
      const newSize = prev.hiddenSize - 1
      const newW1 = prev.W1.slice(0, newSize)
      const newB1 = prev.b1.slice(0, newSize)
      const newW2 = [prev.W2[0].slice(0, newSize)]
      return {
        ...prev,
        hiddenSize: newSize,
        W1: newW1, b1: newB1, W2: newW2,
        forwardResult: null, backwardResult: null,
        phase: PHASE.IDLE, lossHistory: [],
      }
    })
  }, [])

  // ── Weight / bias editors ─────────────────────────────────────────────────
  const setW1 = useCallback((hi, ii, val) =>
    setState(prev => {
      const W1 = prev.W1.map((row, r) => row.map((v, c) => r === hi && c === ii ? val : v))
      return { ...prev, W1 }
    })
  , [])

  const setB1 = useCallback((hi, val) =>
    setState(prev => {
      const b1 = prev.b1.map((v, i) => i === hi ? val : v)
      return { ...prev, b1 }
    })
  , [])

  const setW2 = useCallback((hi, val) =>
    setState(prev => {
      const W2 = [prev.W2[0].map((v, i) => i === hi ? val : v)]
      return { ...prev, W2 }
    })
  , [])

  const setB2 = useCallback((val) =>
    setState(prev => ({ ...prev, b2: [val] }))
  , [])

  // ── Inputs & target ───────────────────────────────────────────────────────
  const setInput = useCallback((idx, val) =>
    setState(prev => {
      const inputs = [...prev.inputs]
      inputs[idx] = val
      return { ...prev, inputs }
    })
  , [])

  const setTarget = useCallback((val) => set({ target: val }), [set])

  // ── Hyperparams ───────────────────────────────────────────────────────────
  const setLR    = useCallback((v) => set({ learningRate: v }), [set])
  const setEpochs= useCallback((v) => set({ epochs: v }), [set])
  const setHiddenActivation = useCallback((v) => set({ hiddenActivation: v }), [set])
  const setLossFn= useCallback((v) => set({ lossFn: v }), [set])

  // ── Step Forward ──────────────────────────────────────────────────────────
  const stepForward = useCallback(async () => {
    set({ loading: true, error: null, phase: PHASE.FORWARD, backwardResult: null })
    try {
      const { W1, b1, W2, b2, inputs, target, hiddenActivation, lossFn } = state
      const result = await apiForward({ inputs, W1, b1, W2, b2, hidden_activation: hiddenActivation, loss_fn: lossFn, target })
      set({ forwardResult: result, currentLoss: result.loss, phase: PHASE.LOSS, loading: false })
    } catch (e) {
      set({ error: e?.response?.data?.detail || e.message, loading: false, phase: PHASE.IDLE })
    }
  }, [state, set])

  // ── Step Backward ─────────────────────────────────────────────────────────
  const stepBackward = useCallback(async () => {
    if (!state.forwardResult) return
    set({ loading: true, error: null, phase: PHASE.BACKWARD })
    try {
      const { W1, b1, W2, b2, inputs, target, learningRate, hiddenActivation, lossFn, forwardResult } = state
      const result = await apiBackward({
        inputs, W1, b1, W2, b2,
        forward_result: forwardResult,
        target,
        learning_rate: learningRate,
        hidden_activation: hiddenActivation,
        loss_fn: lossFn,
      })
      const uw = result.updated_weights
      setState(prev => ({
        ...prev,
        backwardResult: result,
        W1: uw.W1, b1: uw.b1, W2: uw.W2, b2: uw.b2,
        lossHistory: [...(prev.lossHistory || []), prev.currentLoss],
        phase: PHASE.COMPLETE,
        loading: false,
      }))
    } catch (e) {
      set({ error: e?.response?.data?.detail || e.message, loading: false, phase: PHASE.LOSS })
    }
  }, [state, set])

  // ── Train N epochs ────────────────────────────────────────────────────────
  const trainEpochs = useCallback(async () => {
    set({ loading: true, error: null, phase: PHASE.TRAINING, lossHistory: [] })
    try {
      const { W1, b1, W2, b2, inputs, target, learningRate, epochs, hiddenActivation, lossFn } = state
      const result = await apiTrain({
        inputs, W1, b1, W2, b2, target,
        learning_rate: learningRate,
        epochs,
        hidden_activation: hiddenActivation,
        loss_fn: lossFn,
      })
      const fw = result.final_weights
      set({
        W1: fw.W1, b1: fw.b1, W2: fw.W2, b2: fw.b2,
        lossHistory: result.loss_history,
        forwardResult: result.final_forward,
        currentLoss: result.final_forward.loss,
        phase: PHASE.COMPLETE,
        loading: false,
      })
    } catch (e) {
      set({ error: e?.response?.data?.detail || e.message, loading: false, phase: PHASE.IDLE })
    }
  }, [state, set])

  // ── Reset ─────────────────────────────────────────────────────────────────
  const reset = useCallback(() =>
    setState(prev => ({
      ...makeInitState(prev.hiddenSize),
      hiddenActivation: prev.hiddenActivation,
      lossFn: prev.lossFn,
      learningRate: prev.learningRate,
      epochs: prev.epochs,
    }))
  , [])

  const resetFull = useCallback(() => setState(makeInitState()), [])

  return {
    state,
    // architecture
    addHiddenNode, removeHiddenNode,
    // weights
    setW1, setB1, setW2, setB2,
    // inputs
    setInput, setTarget,
    // hyperparams
    setLR, setEpochs, setHiddenActivation, setLossFn,
    // actions
    stepForward, stepBackward, trainEpochs,
    reset, resetFull,
    // highlight
    setHighlight: (node, edge) => set({ highlightedNode: node, highlightedEdge: edge }),
  }
}
