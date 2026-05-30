/**
 * Calculate dynamic SVG positions for a 2-N-1 MLP.
 * @param {number} hiddenSize - number of hidden nodes (1-8)
 * @param {number} W          - SVG canvas width
 * @param {number} H          - SVG canvas height
 * @returns {{ input: [], hidden: [], output: [] }}  — each node has { x, y, id, label, layer }
 */
export function calcLayout(hiddenSize, W = 860, H = 460) {
  const pad = 80
  const layers = [
    { name: 'input',  count: 2 },
    { name: 'hidden', count: hiddenSize },
    { name: 'output', count: 1 },
  ]
  const layerXPositions = [pad, W / 2, W - pad]

  const result = {}
  layers.forEach((layer, li) => {
    const x = layerXPositions[li]
    const n = layer.count
    const availH = H - 2 * pad
    const spacing = n === 1 ? 0 : availH / (n - 1)
    const startY = n === 1 ? H / 2 : pad + (availH - spacing * (n - 1)) / 2

    result[layer.name] = Array.from({ length: n }, (_, ni) => ({
      id:    `${layer.name}_${ni}`,
      label: layer.name === 'input'  ? `x${ni + 1}`
           : layer.name === 'hidden' ? `h${ni + 1}`
           : 'ŷ',
      x,
      y:     n === 1 ? H / 2 : startY + ni * spacing,
      layer: layer.name,
      index: ni,
    }))
  })
  return result
}

/**
 * Generate all edges between layers.
 * Returns [{ from, to, key, fromNode, toNode }]
 */
export function calcEdges(layout) {
  const edges = []
  const layerPairs = [
    ['input', 'hidden'],
    ['hidden', 'output'],
  ]
  for (const [fromLayer, toLayer] of layerPairs) {
    for (const fromNode of layout[fromLayer]) {
      for (const toNode of layout[toLayer]) {
        edges.push({
          from:     fromNode.id,
          to:       toNode.id,
          key:      `${fromNode.id}->${toNode.id}`,
          fromNode,
          toNode,
          fromLayer,
          toLayer,
        })
      }
    }
  }
  return edges
}

/** Midpoint of an edge (for weight label placement). */
export function edgeMidpoint(edge) {
  return {
    x: (edge.fromNode.x + edge.toNode.x) / 2,
    y: (edge.fromNode.y + edge.toNode.y) / 2,
  }
}
