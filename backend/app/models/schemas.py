from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional


class ForwardRequest(BaseModel):
    inputs: List[float] = Field(..., example=[0.5, 0.8])
    W1: List[List[float]]
    b1: List[float]
    W2: List[List[float]]
    b2: List[float]
    hidden_activation: str = "sigmoid"
    loss_fn: str = "bce"
    target: float = 1.0


class ForwardResponse(BaseModel):
    z1: List[float]
    a1: List[float]
    z2: float
    a2: float
    y_hat: float
    loss: float


class BackwardRequest(BaseModel):
    inputs: List[float]
    W1: List[List[float]]
    b1: List[float]
    W2: List[List[float]]
    b2: List[float]
    forward_result: Dict[str, Any]   # full dict from /forward
    target: float
    learning_rate: float = 0.1
    hidden_activation: str = "sigmoid"
    loss_fn: str = "bce"


class BackwardResponse(BaseModel):
    gradients: Dict[str, Any]
    updated_weights: Dict[str, Any]


class TrainRequest(BaseModel):
    inputs: List[float]
    W1: List[List[float]]
    b1: List[float]
    W2: List[List[float]]
    b2: List[float]
    target: float
    learning_rate: float = 0.1
    epochs: int = Field(default=100, ge=1, le=5000)
    hidden_activation: str = "sigmoid"
    loss_fn: str = "bce"


class TrainResponse(BaseModel):
    loss_history: List[float]
    final_weights: Dict[str, Any]
    final_forward: Dict[str, Any]
