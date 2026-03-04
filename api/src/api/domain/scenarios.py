"""Scenario domain models."""

from __future__ import annotations

from dataclasses import dataclass
from enum import StrEnum


class ScenarioMode(StrEnum):
  """Supported scenario modes exposed by the API."""

  OK = "ok"
  WARN = "warn"
  ERROR = "error"
  SLOW = "slow"
  RANDOM = "random"


@dataclass(frozen=True, slots=True)
class ScenarioOutcome:
  """Immutable result returned by the scenario service."""

  mode: ScenarioMode
  http_status: int
  status: str
  detail: str
  delay_ms: int
  severity: str
