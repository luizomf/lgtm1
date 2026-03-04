"""Scenario orchestration for the demo API."""

from __future__ import annotations

from random import Random, SystemRandom

from api.domain.scenarios import ScenarioMode, ScenarioOutcome


class ScenarioService:
  """Resolve demo scenarios into predictable API outcomes."""

  _DEFAULT_DELAY_MS = 1200
  _UNSTABLE_POOL = (
    ScenarioMode.OK,
    ScenarioMode.OK,
    ScenarioMode.OK,
    ScenarioMode.WARN,
    ScenarioMode.WARN,
    ScenarioMode.ERROR,
    ScenarioMode.SLOW,
  )

  def __init__(
    self,
    *,
    rng: Random | None = None,
    default_delay_ms: int = _DEFAULT_DELAY_MS,
  ) -> None:
    self._rng = rng if rng is not None else SystemRandom()
    self._default_delay_ms = default_delay_ms

  def available_modes(self) -> tuple[str, ...]:
    """Return the public scenario names for documentation and discovery."""
    return tuple(mode.value for mode in ScenarioMode)

  def resolve(
    self,
    mode: ScenarioMode,
    *,
    delay_ms: int | None = None,
  ) -> ScenarioOutcome:
    """Map the requested mode into a stable response contract."""
    effective_mode = self._pick_mode() if mode is ScenarioMode.RANDOM else mode

    if effective_mode is ScenarioMode.OK:
      return ScenarioOutcome(
        mode=effective_mode,
        http_status=200,
        status="ok",
        detail="Request completed normally.",
        delay_ms=0,
        severity="info",
      )

    if effective_mode is ScenarioMode.WARN:
      return ScenarioOutcome(
        mode=effective_mode,
        http_status=200,
        status="degraded",
        detail="Request completed with a recoverable warning.",
        delay_ms=0,
        severity="warning",
      )

    if effective_mode is ScenarioMode.ERROR:
      return ScenarioOutcome(
        mode=effective_mode,
        http_status=503,
        status="error",
        detail="Simulated upstream dependency failure.",
        delay_ms=0,
        severity="error",
      )

    applied_delay_ms = self._resolve_delay(delay_ms)
    return ScenarioOutcome(
      mode=effective_mode,
      http_status=200,
      status="slow",
      detail="Request completed, but slower than expected.",
      delay_ms=applied_delay_ms,
      severity="warning",
    )

  def _pick_mode(self) -> ScenarioMode:
    """Choose a semi-realistic unstable response profile."""
    return self._rng.choice(self._UNSTABLE_POOL)

  def _resolve_delay(self, delay_ms: int | None) -> int:
    """Clamp delay values to something safe for local demos."""
    if delay_ms is None:
      return self._default_delay_ms

    return max(delay_ms, 0)
