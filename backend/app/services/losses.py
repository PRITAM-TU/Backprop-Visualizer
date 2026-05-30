import numpy as np

EPS = 1e-15


def bce(y_hat, y):
    y_hat_c = np.clip(y_hat, EPS, 1.0 - EPS)
    y_arr = np.array(y)
    return float(-np.mean(y_arr * np.log(y_hat_c) + (1.0 - y_arr) * np.log(1.0 - y_hat_c)))


def bce_prime(y_hat, y):
    y_hat_c = np.clip(y_hat, EPS, 1.0 - EPS)
    y_arr = np.array(y)
    return -(y_arr / y_hat_c - (1.0 - y_arr) / (1.0 - y_hat_c))


def mse(y_hat, y):
    return float(np.mean((np.array(y_hat) - np.array(y)) ** 2))


def mse_prime(y_hat, y):
    n = np.array(y).size
    return 2.0 * (np.array(y_hat) - np.array(y)) / n


def mae(y_hat, y):
    return float(np.mean(np.abs(np.array(y_hat) - np.array(y))))


def mae_prime(y_hat, y):
    n = np.array(y).size
    return np.sign(np.array(y_hat) - np.array(y)) / n


LOSSES = {
    "bce": (bce, bce_prime),
    "mse": (mse, mse_prime),
    "mae": (mae, mae_prime),
}


def get_loss(name: str):
    return LOSSES.get(name, LOSSES["bce"])
