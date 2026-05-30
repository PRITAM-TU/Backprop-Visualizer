from fastapi import APIRouter, HTTPException
from app.models.schemas import (
    ForwardRequest, ForwardResponse,
    BackwardRequest, BackwardResponse,
    TrainRequest, TrainResponse,
)
from app.services.mlp import forward, backward
from app.services.losses import get_loss

router = APIRouter()


@router.post("/forward", response_model=ForwardResponse)
def forward_pass(req: ForwardRequest):
    try:
        result = forward(
            req.inputs, req.W1, req.b1, req.W2, req.b2,
            req.hidden_activation,
        )
        loss_fn, _ = get_loss(req.loss_fn)
        loss = loss_fn(result["y_hat"], req.target)
        return {**result, "loss": float(loss)}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/backward", response_model=BackwardResponse)
def backward_pass(req: BackwardRequest):
    try:
        result = backward(
            req.inputs, req.W1, req.b1, req.W2, req.b2,
            req.target, req.forward_result,
            req.learning_rate, req.hidden_activation, req.loss_fn,
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/train", response_model=TrainResponse)
def train(req: TrainRequest):
    try:
        W1, b1, W2, b2 = req.W1, req.b1, req.W2, req.b2
        loss_fn, _ = get_loss(req.loss_fn)
        loss_history = []

        for _ in range(req.epochs):
            fwd = forward(req.inputs, W1, b1, W2, b2, req.hidden_activation)
            loss = loss_fn(fwd["y_hat"], req.target)
            loss_history.append(round(float(loss), 6))

            bwd = backward(
                req.inputs, W1, b1, W2, b2,
                req.target, fwd,
                req.learning_rate, req.hidden_activation, req.loss_fn,
            )
            uw = bwd["updated_weights"]
            W1, b1, W2, b2 = uw["W1"], uw["b1"], uw["W2"], uw["b2"]

        # Final forward after all epochs
        final_fwd = forward(req.inputs, W1, b1, W2, b2, req.hidden_activation)
        final_loss = loss_fn(final_fwd["y_hat"], req.target)

        return {
            "loss_history": loss_history,
            "final_weights": {"W1": W1, "b1": b1, "W2": W2, "b2": b2},
            "final_forward": {**final_fwd, "loss": float(final_loss)},
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
