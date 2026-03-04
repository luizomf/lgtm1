"""Application entrypoint."""

from __future__ import annotations

import logging

import uvicorn
from fastapi import FastAPI

from api.application.scenario_service import ScenarioService
from api.infrastructure.telemetry import setup_telemetry
from api.presentation.http import router


def create_app(
  service: ScenarioService | None = None,
  *,
  enable_telemetry: bool = True,
) -> FastAPI:
  """Create the FastAPI application with injectable collaborators."""
  _configure_logging()

  app = FastAPI(
    title="LGTM Demo API",
    summary="A small API that intentionally emits useful demo signals.",
    version="0.1.0",
  )
  app.state.scenario_service = service if service is not None else ScenarioService()
  if enable_telemetry:
    setup_telemetry(app)
  app.include_router(router)
  return app


def run() -> None:
  """Run the local development server."""
  uvicorn.run("api.main:create_app", factory=True, host="127.0.0.1", port=8000)


def _configure_logging() -> None:
  """Install a simple log format that is readable in terminals and collectors."""
  root_logger = logging.getLogger()
  if root_logger.handlers:
    return

  logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s %(message)s",
  )
