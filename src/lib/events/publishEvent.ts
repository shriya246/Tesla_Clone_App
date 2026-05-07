import "server-only";

import * as Sentry from "@sentry/nextjs";
import { Prisma } from "@prisma/client";

import { createAutomationEventLog } from "@/lib/db/automation-event-logs";
import { eventHandlerRegistry } from "@/lib/events/handlers";
import type {
  AppEvent,
  AppEventType,
  PublishEventInput,
  PublishEventResult,
} from "@/lib/events/types";

function toJsonValue(value: unknown) {
  return value as Prisma.InputJsonValue;
}

async function persistAutomationLog(input: {
  event: AppEvent;
  handler: string;
  status: "SUCCESS" | "PARTIAL_FAILURE" | "FAILED";
  message: string;
  metadata?: Record<string, unknown>;
}) {
  try {
    await createAutomationEventLog({
      eventType: input.event.type,
      entityType: input.event.entity.type,
      entityId: input.event.entity.id,
      handler: input.handler,
      status: input.status,
      message: input.message,
      payload: toJsonValue(input.event.payload),
      metadata: input.metadata ? toJsonValue(input.metadata) : undefined,
      userId: input.event.actor?.userId,
    });
  } catch (error) {
    Sentry.captureException(error);
    console.error("Failed to persist automation event log.", error);
  }
}

function buildEvent<TType extends AppEventType>(
  input: PublishEventInput<TType>,
): AppEvent<TType> {
  return {
    id: crypto.randomUUID(),
    type: input.type,
    occurredAt: new Date(),
    actor: input.actor,
    entity: input.entity,
    payload: input.payload,
  };
}

export async function publishEvent<TType extends AppEventType>(
  input: PublishEventInput<TType>,
): Promise<PublishEventResult> {
  const event = buildEvent(input);
  const handlers = eventHandlerRegistry[event.type];
  const logs: PublishEventResult["logs"] = [];
  let failureCount = 0;

  for (const handler of handlers) {
    try {
      const outcome = await handler.handle(event as never);
      const status = outcome?.status ?? "SUCCESS";
      const message =
        outcome?.message ?? `The ${handler.id} handler completed successfully.`;

      await persistAutomationLog({
        event,
        handler: handler.id,
        status,
        message,
        metadata: outcome?.metadata,
      });

      if (status === "FAILED") {
        failureCount += 1;
      }

      logs.push({
        handler: handler.id,
        status,
        message,
      });
    } catch (error) {
      failureCount += 1;
      Sentry.captureException(error);
      console.error(`Automation handler ${handler.id} failed.`, error);

      const message =
        error instanceof Error
          ? error.message
          : "The automation handler failed unexpectedly.";

      await persistAutomationLog({
        event,
        handler: handler.id,
        status: "FAILED",
        message,
      });

      logs.push({
        handler: handler.id,
        status: "FAILED",
        message,
      });
    }
  }

  return {
    eventId: event.id,
    type: event.type,
    handledCount: handlers.length,
    failureCount,
    logs,
  };
}
