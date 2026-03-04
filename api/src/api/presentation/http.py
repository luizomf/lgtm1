"""HTTP routes for the demo API."""

from __future__ import annotations

import asyncio
import logging
from typing import TYPE_CHECKING, Annotated, cast

from fastapi import APIRouter, Query, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

from api.domain.scenarios import ScenarioMode, ScenarioOutcome
from api.infrastructure.telemetry import (
  annotate_current_span,
  current_trace_ids,
  record_scenario,
)

if TYPE_CHECKING:
  from api.application.scenario_service import ScenarioService

logger = logging.getLogger(__name__)
router = APIRouter()

_MIN_DELAY_MS = 0
_MAX_DELAY_MS = 30_000
_SERVER_ERROR_STATUS = 500


class IndexResponse(BaseModel):
  """Payload for the root route."""

  name: str
  purpose: str
  available_modes: list[str]
  suggested_routes: list[str]


class HealthResponse(BaseModel):
  """Payload for a simple health check."""

  status: str
  service: str
  version: str


class ScenarioResponse(BaseModel):
  """Payload returned by scenario-driven endpoints."""

  mode: str
  status: str
  detail: str
  delay_ms: int = Field(ge=_MIN_DELAY_MS, le=_MAX_DELAY_MS)


@router.get("/", response_model=IndexResponse)
async def index(request: Request) -> IndexResponse:
  """Describe the API surface for quick discovery."""
  service = _get_scenario_service(request)
  return IndexResponse(
    name="LGTM Demo API",
    purpose="Generate realistic application behavior for observability demos.",
    available_modes=list(service.available_modes()),
    suggested_routes=[
      "/health",
      "/unstable",
      "/scenario?mode=error",
      "/scenario?mode=slow&delay_ms=1500",
    ],
  )


@router.get("/health", response_model=HealthResponse)
async def health() -> HealthResponse:
  """Expose a stable happy-path endpoint."""
  return HealthResponse(status="ok", service="api", version="0.1.0")


@router.get(
  "/unstable",
  response_model=ScenarioResponse,
  responses={503: {"model": ScenarioResponse}},
)
async def unstable(request: Request) -> ScenarioResponse | JSONResponse:
  """Emit a random scenario to mimic real-world unpredictability."""
  return await _execute_scenario(request, mode=ScenarioMode.RANDOM)


@router.get(
  "/scenario",
  response_model=ScenarioResponse,
  responses={503: {"model": ScenarioResponse}},
)
async def scenario(
  request: Request,
  mode: ScenarioMode = ScenarioMode.OK,
  delay_ms: Annotated[
    int | None,
    Query(ge=_MIN_DELAY_MS, le=_MAX_DELAY_MS),
  ] = None,
) -> ScenarioResponse | JSONResponse:
  """Emit a requested scenario for repeatable demos."""
  return await _execute_scenario(request, mode=mode, delay_ms=delay_ms)


async def _execute_scenario(
  request: Request,
  *,
  mode: ScenarioMode,
  delay_ms: int | None = None,
) -> ScenarioResponse | JSONResponse:
  """Execute a scenario and keep the HTTP layer thin."""
  service = _get_scenario_service(request)
  outcome = service.resolve(mode, delay_ms=delay_ms)

  if outcome.delay_ms > 0:
    await asyncio.sleep(outcome.delay_ms / 1000)

  payload = ScenarioResponse(
    mode=outcome.mode.value,
    status=outcome.status,
    detail=outcome.detail,
    delay_ms=outcome.delay_ms,
  )
  annotate_current_span(
    request.url.path,
    payload.mode,
    payload.status,
    payload.delay_ms,
  )
  record_scenario(
    request.url.path,
    payload.mode,
    payload.status,
    payload.delay_ms,
  )
  _log_outcome(request, outcome)

  if outcome.http_status >= _SERVER_ERROR_STATUS:
    return JSONResponse(
      content=payload.model_dump(),
      headers={"X-Scenario-Mode": outcome.mode.value},
      status_code=outcome.http_status,
    )

  return payload


def _get_scenario_service(request: Request) -> ScenarioService:
  """Read the service dependency from application state."""
  return cast("ScenarioService", request.app.state.scenario_service)


def _log_outcome(request: Request, outcome: ScenarioOutcome) -> None:
  """Produce readable structured-like logs for the observability stack."""
  trace_id, span_id = current_trace_ids()
  logger.log(
    _log_level(outcome.severity),
    (
      "scenario=%s endpoint=%s status=%s http_status=%s delay_ms=%s "
      "trace_id=%s span_id=%s detail=%s"
    ),
    outcome.mode.value,
    request.url.path,
    outcome.status,
    outcome.http_status,
    outcome.delay_ms,
    trace_id or "-",
    span_id or "-",
    outcome.detail,
  )


def _log_level(severity: str) -> int:
  """Translate scenario severity names to stdlib log levels."""
  if severity == "error":
    return logging.ERROR

  if severity == "warning":
    return logging.WARNING

  return logging.INFO
