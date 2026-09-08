import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { prisma } from "../src/lib/prisma";
import { registerClient, pushToClient } from "../src/module/notifications/registry";
import { getNotificationsSince, publishNotification, publishNotificationOncePerActor } from "../src/module/notifications/service";

describe("notifications registry", () => {
  test("delivers a pushed event to every registered client for that user", () => {
    const received: string[] = [];
    const unregisterA = registerClient("user-1", { write: (chunk) => received.push(`A:${chunk}`) });
    const unregisterB = registerClient("user-1", { write: (chunk) => received.push(`B:${chunk}`) });

    pushToClient("user-1", "FAVORITE_ADDED", "notif-1", { hello: "world" });

    expect(received).toHaveLength(2);
    expect(received[0]).toContain("id: notif-1");
    expect(received[0]).toContain("event: FAVORITE_ADDED");
    expect(received[0]).toContain(JSON.stringify({ hello: "world" }));

    unregisterA();
    unregisterB();
  });

  test("does nothing when the recipient has no open connection", () => {
    expect(() => pushToClient("nobody-connected", "PROFILE_VIEWED", "notif-2", {})).not.toThrow();
  });

  test("unregister stops further delivery to that client only", () => {
    const receivedA: string[] = [];
    const receivedB: string[] = [];
    const unregisterA = registerClient("user-2", { write: (chunk) => receivedA.push(chunk) });
    registerClient("user-2", { write: (chunk) => receivedB.push(chunk) });

    unregisterA();
    pushToClient("user-2", "PROFILE_VIEWED", "notif-3", {});

    expect(receivedA).toHaveLength(0);
    expect(receivedB).toHaveLength(1);
  });
});

describe("notifications service", () => {
  const recipientId = crypto.randomUUID();
  const actorId = crypto.randomUUID();

  beforeAll(async () => {
    const now = new Date();
    await prisma.users.createMany({
      data: [
        {
          id: recipientId,
          firstname: "Recipient",
          lastname: "Test",
          name: "Recipient Test",
          email: `recipient-${recipientId}@example.test`,
          role: "jobseeker",
          createdAt: now,
          updatedAt: now,
          birthdate: new Date("1990-01-01"),
        },
        {
          id: actorId,
          firstname: "Actor",
          lastname: "Test",
          name: "Actor Test",
          email: `actor-${actorId}@example.test`,
          role: "recruiter",
          createdAt: now,
          updatedAt: now,
          birthdate: new Date("1990-01-01"),
        },
      ],
    });
  });

  afterAll(async () => {
    await prisma.users.deleteMany({ where: { id: { in: [recipientId, actorId] } } });
  });

  test("publishNotification persists a row readable back through getNotificationsSince", async () => {
    await publishNotification({
      recipientId,
      actorId,
      type: "FAVORITE_ADDED",
      payload: { videoId: "video-123" },
    });

    const notifications = await getNotificationsSince(recipientId);

    expect(notifications).toHaveLength(1);
    expect(notifications[0]!.type).toBe("FAVORITE_ADDED");
    expect(notifications[0]!.payload).toEqual({ videoId: "video-123" });
    expect(notifications[0]!.actor?.id).toBe(actorId);
  });

  test("getNotificationsSince only returns notifications strictly after the given cursor", async () => {
    const cursor = new Date();

    await publishNotification({
      recipientId,
      actorId: null,
      type: "PROFILE_VIEWED",
      payload: {},
    });

    const sinceNow = await getNotificationsSince(recipientId, cursor);
    const sinceBeginning = await getNotificationsSince(recipientId);

    expect(sinceNow).toHaveLength(1);
    expect(sinceNow[0]!.type).toBe("PROFILE_VIEWED");
    expect(sinceNow[0]!.actor).toBeNull();
    expect(sinceBeginning.length).toBeGreaterThanOrEqual(2);
  });

  test("publishNotification never throws, even for a recipient that does not exist", async () => {
    await expect(
      publishNotification({
        recipientId: crypto.randomUUID(),
        actorId: null,
        type: "PROFILE_VIEWED",
        payload: {},
      }),
    ).resolves.toBeUndefined();
  });

  test("publishNotificationOncePerActor creates PROFILE_VIEWED only once per recruiter", async () => {
    const before = await getNotificationsSince(recipientId);

    await publishNotificationOncePerActor({
      recipientId,
      actorId,
      type: "PROFILE_VIEWED",
      payload: {},
    });
    await publishNotificationOncePerActor({
      recipientId,
      actorId,
      type: "PROFILE_VIEWED",
      payload: {},
    });

    const after = await getNotificationsSince(recipientId);
    const viewsFromActor = after.filter(
      (notification) =>
        notification.type === "PROFILE_VIEWED" && notification.actor?.id === actorId,
    );

    expect(after.length).toBe(before.length + 1);
    expect(viewsFromActor).toHaveLength(1);
  });
});
