"""OpenTelemetry configuration for the demo API."""

from __future__ import annotations

import os
from dataclasses import dataclass
from typing import TYPE_CHECKING, Final

from opentelemetry import metrics, trace
from opentelemetry.exporter.otlp.proto.grpc.metric_exporter import (
  OTLPMetricExporter,
)
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
from opentelemetry.sdk.metrics import MeterProvider
from opentelemetry.sdk.metrics.export import PeriodicExportingMetricReader
from opentelemetry.sdk.resources import Resource
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor

if TYPE_CHECKING:
  from fastapi import FastAPI

_DEFAULT_EXPORT_INTERVAL_MS: Final = 5_000
_DEFAULT_OTLP_ENDPOINT: Final = "http://127.0.0.1:4317"
_DEFAULT_SERVICE_NAME: Final = "lgtm-demo-api"
_STATE = {
  "metrics_initialized": False,
  "providers_configured": False,
  "scenario_counter": None,
  "scenario_delay_histogram": None,
}


@dataclass(frozen=True, slots=True)
class TelemetrySettings:
  """Settings used to configure the OpenTelemetry exporters."""

  service_name: str = _DEFAULT_SERVICE_NAME
  otlp_endpoint: str = _DEFAULT_OTLP_ENDPOINT
  export_interval_ms: int = _DEFAULT_EXPORT_INTERVAL_MS

  @classmethod
  def from_env(cls) -> TelemetrySettings:
    """Read telemetry settings from environment variables."""
    return cls(
      service_name=os.getenv("OTEL_SERVICE_NAME", _DEFAULT_SERVICE_NAME),
      otlp_endpoint=os.getenv("OTEL_EXPORTER_OTLP_ENDPOINT", _DEFAULT_OTLP_ENDPOINT),
      export_interval_ms=int(
        os.getenv("OTEL_METRIC_EXPORT_INTERVAL", str(_DEFAULT_EXPORT_INTERVAL_MS)),
      ),
    )


def setup_telemetry(app: FastAPI, settings: TelemetrySettings | None = None) -> None:
  """Attach telemetry providers and FastAPI instrumentation."""
  effective_settings = (
    settings if settings is not None else TelemetrySettings.from_env()
  )
  _configure_providers(effective_settings)
  _ensure_metrics(effective_settings.service_name)

  FastAPIInstrumentor.instrument_app(
    app,
    meter_provider=metrics.get_meter_provider(),
    tracer_provider=trace.get_tracer_provider(),
  )


def annotate_current_span(endpoint: str, mode: str, status: str, delay_ms: int) -> None:
  """Enrich the active span with demo-specific attributes."""
  span = trace.get_current_span()
  if not span.is_recording():
    return

  span.set_attribute("demo.endpoint", endpoint)
  span.set_attribute("demo.scenario.mode", mode)
  span.set_attribute("demo.scenario.status", status)
  span.set_attribute("demo.scenario.delay_ms", delay_ms)


def record_scenario(endpoint: str, mode: str, status: str, delay_ms: int) -> None:
  """Record application-level metrics for the demo flow."""
  attributes = {
    "demo.endpoint": endpoint,
    "demo.scenario.mode": mode,
    "demo.scenario.status": status,
  }

  counter = _STATE["scenario_counter"]
  if counter is not None:
    counter.add(1, attributes=attributes)

  histogram = _STATE["scenario_delay_histogram"]
  if histogram is not None:
    histogram.record(delay_ms, attributes=attributes)


def current_trace_ids() -> tuple[str | None, str | None]:
  """Return the active trace identifiers for log correlation."""
  context = trace.get_current_span().get_span_context()
  if not context.is_valid:
    return None, None

  trace_id = format(context.trace_id, "032x")
  span_id = format(context.span_id, "016x")
  return trace_id, span_id


def _configure_providers(settings: TelemetrySettings) -> None:
  """Install global providers once per process."""
  if _STATE["providers_configured"]:
    return

  resource = Resource.create(
    {
      "service.name": settings.service_name,
      "service.version": "0.1.0",
      "deployment.environment": os.getenv("APP_ENV", "development"),
    },
  )

  tracer_provider = TracerProvider(resource=resource)
  tracer_provider.add_span_processor(
    BatchSpanProcessor(
      OTLPSpanExporter(endpoint=settings.otlp_endpoint, insecure=True),
    ),
  )
  trace.set_tracer_provider(tracer_provider)

  metric_reader = PeriodicExportingMetricReader(
    OTLPMetricExporter(endpoint=settings.otlp_endpoint, insecure=True),
    export_interval_millis=settings.export_interval_ms,
  )
  metrics.set_meter_provider(
    MeterProvider(resource=resource, metric_readers=[metric_reader]),
  )

  _STATE["providers_configured"] = True


def _ensure_metrics(service_name: str) -> None:
  """Create reusable metrics instruments once per process."""
  if _STATE["metrics_initialized"]:
    return

  meter = metrics.get_meter(service_name)
  _STATE["scenario_counter"] = meter.create_counter(
    name="demo_api_requests_total",
    description="Count of demo API requests by scenario.",
    unit="{request}",
  )
  _STATE["scenario_delay_histogram"] = meter.create_histogram(
    name="demo_api_response_delay_ms",
    description="Requested delay emitted by scenario endpoints.",
    unit="ms",
  )
  _STATE["metrics_initialized"] = True
