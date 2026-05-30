import numpy as np


def sigmoid(z):
    z = np.clip(z, -500, 500)
    return 1.0 / (1.0 + np.exp(-z))


def sigmoid_prime(z):
    s = sigmoid(z)
    return s * (1.0 - s)


def relu(z):
    return np.maximum(0.0, z)


def relu_prime(z):
    return (z > 0).astype(float)


def tanh_fn(z):
    return np.tanh(z)


def tanh_prime(z):
    return 1.0 - np.tanh(z) ** 2


def leaky_relu(z, alpha=0.01):
    return np.where(z > 0, z, alpha * z)


def leaky_relu_prime(z, alpha=0.01):
    return np.where(z > 0, 1.0, alpha)


def linear(z):
    return z.copy()


def linear_prime(z):
    return np.ones_like(z)


ACTIVATIONS = {
    "sigmoid":    (sigmoid,     sigmoid_prime),
    "relu":       (relu,        relu_prime),
    "tanh":       (tanh_fn,     tanh_prime),
    "leaky_relu": (leaky_relu,  leaky_relu_prime),
    "linear":     (linear,      linear_prime),
}


def get_activation(name: str):
    return ACTIVATIONS.get(name, ACTIVATIONS["sigmoid"])
