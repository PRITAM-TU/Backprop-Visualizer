import axios from 'axios'

const api = axios.create({ baseURL: '/api', timeout: 30000 })

/**
 * Run a single forward pass.
 * @param {object} payload - { inputs, W1, b1, W2, b2, hidden_activation, loss_fn, target }
 */
export const apiForward = (payload) => api.post('/forward', payload).then(r => r.data)

/**
 * Run a single backward pass.
 * @param {object} payload - { inputs, W1, b1, W2, b2, forward_result, target, learning_rate, ... }
 */
export const apiBackward = (payload) => api.post('/backward', payload).then(r => r.data)

/**
 * Run N epochs of training.
 * @param {object} payload - { inputs, W1, b1, W2, b2, target, learning_rate, epochs, ... }
 */
export const apiTrain = (payload) => api.post('/train', payload).then(r => r.data)
