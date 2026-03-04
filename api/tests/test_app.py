"""HTTP tests for the demo API."""

from __future__ import annotations

from http import HTTPStatus

from fastapi.testclient import TestClient

from api.application.scenario_service import ScenarioService
from api.domain.scenarios import ScenarioMode
from api.main import create_app


class FixedScenarioService(ScenarioService):
  """Scenario service with deterministic unstable responses for tests."""

  def __init__(self, unstable_mode: ScenarioMode) -> None:
    super().__init__(default_delay_ms=1)
    self._unstable_mode = unstable_mode

  def _pick_mode(self) -> ScenarioMode:
    return self._unstable_mode


def test_index_exposes_useful_routes() -> None:
  client = TestClient(
    create_app(ScenarioService(default_delay_ms=1), enable_telemetry=False),
  )

  response = client.get("/")

  assert response.status_code == HTTPStatus.OK
  assert response.json()["available_modes"] == ["ok", "warn", "error", "slow", "random"]


def test_health_reports_service_status() -> None:
  client = TestClient(
    create_app(ScenarioService(default_delay_ms=1), enable_telemetry=False),
  )

  response = client.get("/health")

  assert response.status_code == HTTPStatus.OK
  assert response.json() == {"status": "ok", "service": "api", "version": "0.1.0"}


def test_scenario_ok_returns_happy_path_payload() -> None:
  client = TestClient(
    create_app(ScenarioService(default_delay_ms=1), enable_telemetry=False),
  )

  response = client.get("/scenario", params={"mode": "ok"})

  assert response.status_code == HTTPStatus.OK
  assert response.json() == {
    "mode": "ok",
    "status": "ok",
    "detail": "Request completed normally.",
    "delay_ms": 0,
  }


def test_scenario_error_returns_service_unavailable() -> None:
  client = TestClient(
    create_app(ScenarioService(default_delay_ms=1), enable_telemetry=False),
  )

  response = client.get("/scenario", params={"mode": "error"})

  assert response.status_code == HTTPStatus.SERVICE_UNAVAILABLE
  assert response.headers["x-scenario-mode"] == "error"
  assert response.json() == {
    "mode": "error",
    "status": "error",
    "detail": "Simulated upstream dependency failure.",
    "delay_ms": 0,
  }


def test_scenario_slow_accepts_custom_delay() -> None:
  client = TestClient(
    create_app(ScenarioService(default_delay_ms=1), enable_telemetry=False),
  )

  response = client.get("/scenario", params={"mode": "slow", "delay_ms": 5})

  assert response.status_code == HTTPStatus.OK
  assert response.json() == {
    "mode": "slow",
    "status": "slow",
    "detail": "Request completed, but slower than expected.",
    "delay_ms": 5,
  }


def test_unstable_uses_injected_scenario_selection() -> None:
  client = TestClient(
    create_app(FixedScenarioService(ScenarioMode.WARN), enable_telemetry=False),
  )

  response = client.get("/unstable")

  assert response.status_code == HTTPStatus.OK
  assert response.json() == {
    "mode": "warn",
    "status": "degraded",
    "detail": "Request completed with a recoverable warning.",
    "delay_ms": 0,
  }
