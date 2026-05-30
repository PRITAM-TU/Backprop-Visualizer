"""
General MLP with architecture: 2 inputs → N hidden nodes → 1 output.
Supports dynamic hidden layer size, configurable activation & loss functions.
"""
import numpy as np
from app.services.activations import get_activation, sigmoid, sigmoid_prime
from app.services.losses import get_loss


def forward(inputs, W1, b1, W2, b2, hidden_activation="sigmoid"):
    """
    Forward pass for a 2-N-1 MLP.
    Output neuron always uses Sigmoid (binary classification).
    Returns all intermediate values needed for backprop.
    """
    act_fn, _ = get_activation(hidden_activation)

    x  = np.array(inputs, dtype=float).reshape(-1, 1)
    W1 = np.array(W1, dtype=float)
    b1 = np.array(b1, dtype=float).reshape(-1, 1)
    W2 = np.array(W2, dtype=float)
    b2 = np.array(b2, dtype=float).reshape(-1, 1)

    z1 = W1 @ x + b1          # (hidden_size, 1)
    a1 = act_fn(z1)            # (hidden_size, 1)

    z2 = W2 @ a1 + b2          # (1, 1)
    a2 = sigmoid(z2)           # (1, 1) — output activation always sigmoid

    return {
        "z1": z1.flatten().tolist(),
        "a1": a1.flatten().tolist(),
        "z2": float(z2.flatten()[0]),
        "a2": float(a2.flatten()[0]),
        "y_hat": float(a2.flatten()[0]),
    }


def backward(inputs, W1, b1, W2, b2, target, fwd_result,
             learning_rate, hidden_activation="sigmoid", loss_fn_name="bce"):
    """
    Backward pass. Accepts the full forward result dict.
    Returns gradients and updated weights.
    """
    _, act_prime = get_activation(hidden_activation)
    _, loss_prime = get_loss(loss_fn_name)

    x  = np.array(inputs, dtype=float).reshape(-1, 1)
    W1 = np.array(W1, dtype=float)
    b1 = np.array(b1, dtype=float).reshape(-1, 1)
    W2 = np.array(W2, dtype=float)
    b2 = np.array(b2, dtype=float).reshape(-1, 1)

    y_hat = np.array([[fwd_result["y_hat"]]], dtype=float)
    a1    = np.array(fwd_result["a1"], dtype=float).reshape(-1, 1)
    z1    = np.array(fwd_result["z1"], dtype=float).reshape(-1, 1)
    z2    = np.array([[fwd_result["z2"]]], dtype=float)
    y     = np.array([[target]], dtype=float)

    # ── Output layer ──────────────────────────────────────────────────────────
    dL_dyhat  = loss_prime(y_hat, y)          # (1,1)
    dyhat_dz2 = sigmoid_prime(z2)             # (1,1)
    delta2    = dL_dyhat * dyhat_dz2          # (1,1)

    dL_dW2 = delta2 @ a1.T                    # (1, hidden_size)
    dL_db2 = delta2                            # (1,1)

    # ── Hidden layer ──────────────────────────────────────────────────────────
    dL_da1 = W2.T @ delta2                    # (hidden_size, 1)
    da1_dz1 = act_prime(z1)                   # (hidden_size, 1)
    delta1  = dL_da1 * da1_dz1               # (hidden_size, 1)

    dL_dW1 = delta1 @ x.T                    # (hidden_size, input_size)
    dL_db1 = delta1                           # (hidden_size, 1)

    # ── Weight update ─────────────────────────────────────────────────────────
    W1_new = W1 - learning_rate * dL_dW1
    b1_new = b1 - learning_rate * dL_db1
    W2_new = W2 - learning_rate * dL_dW2
    b2_new = b2 - learning_rate * dL_db2

    return {
        "gradients": {
            "dL_dW1": dL_dW1.tolist(),
            "dL_db1": dL_db1.flatten().tolist(),
            "dL_dW2": dL_dW2.tolist(),
            "dL_db2": dL_db2.flatten().tolist(),
            "delta2":  float(delta2.flatten()[0]),
            "delta1":  delta1.flatten().tolist(),
        },
        "updated_weights": {
            "W1": W1_new.tolist(),
            "b1": b1_new.flatten().tolist(),
            "W2": W2_new.tolist(),
            "b2": b2_new.flatten().tolist(),
        },
    }
