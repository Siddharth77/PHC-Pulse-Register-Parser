import pytest
from backend.app.federated import federated_service

def test_federated_round_increments():
    """Verify training rounds advance federated accuracy metrics correctly."""
    federated_service.reset_simulation()
    initial_metrics = federated_service.get_metrics()
    assert initial_metrics.current_round == 1

    next_metrics = federated_service.run_training_round()
    assert next_metrics.current_round == 2
    assert len(next_metrics.history) == 2

def test_federated_reset():
    """Verify simulation reset restores Round 1 baseline."""
    federated_service.run_training_round()
    reset_metrics = federated_service.reset_simulation()
    assert reset_metrics.current_round == 1
    assert len(reset_metrics.history) == 1
