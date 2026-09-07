import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { videoConfig } from "../../config/video";
import { getSessionUser } from "../../middleware/session";
import {
  UnsupportedVideoTypeError,
  VideoNotFoundError,
  VideoProviderUnavailableError,
  VideoTooLargeError,
} from "./errors";
import { parseByteRange } from "./range";
import {
  describePlayback,
  getUserVideo,
  openPlayback,
  purgeUserVideo,
  replaceUserVideo,
} from "./service";
import {
  providerIdParamSchema,
  userIdParamSchema,
  videoDeletionSchema,
  videoDescriptorSchema,
  videoErrorSchema,
} from "./schemas";

const ACCEPTED_UPLOAD_TYPES = [
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/x-m4v",
  "video/ogg",
];

const NO_VIDEO = { status: "ERROR", providerName: "none", playbackUrl: null } as const;

function uploadFilename(request: FastifyRequest): string {
  const header = request.headers["x-video-filename"];
  return typeof header === "string" && header.trim() ? header.trim() : "video";
}

function uploadFailure(error: unknown, reply: FastifyReply): FastifyReply {
  if (error instanceof UnsupportedVideoTypeError) {
    return reply.status(415).send({ error: error.message });
  }
  if (error instanceof VideoTooLargeError) {
    return reply.status(413).send({ error: error.message });
  }
  if (error instanceof VideoProviderUnavailableError) {
    return reply.status(503).send({ error: error.message });
  }
  throw error;
}

export async function videoRoutes(fastify: FastifyInstance) {
  const typed = fastify.withTypeProvider<ZodTypeProvider>();

  fastify.addContentTypeParser(
    ACCEPTED_UPLOAD_TYPES,
    { parseAs: "buffer", bodyLimit: videoConfig.maxUploadBytes },
    (_request, body, done) => done(null, body),
  );

  typed.get(
    "/api/videos/me",
    {
      schema: {
        tags: ["video"],
        summary: "Current user video",
        response: { 200: videoDescriptorSchema, 401: videoErrorSchema },
      },
    },
    async (request, reply) => {
      const user = await getSessionUser(request);

      if (!user) {
        return reply.status(401).send({ error: "Non authentifié" });
      }

      return reply.send((await getUserVideo(user.id)) ?? NO_VIDEO);
    },
  );

  typed.get(
    "/api/profiles/:userId/video",
    {
      schema: {
        tags: ["video"],
        summary: "Public video descriptor of a profile",
        params: userIdParamSchema,
        response: { 200: videoDescriptorSchema },
      },
    },
    async (request, reply) => {
      return reply.send((await getUserVideo(request.params.userId)) ?? NO_VIDEO);
    },
  );

  typed.post(
    "/api/videos",
    {
      bodyLimit: videoConfig.maxUploadBytes,
      schema: {
        tags: ["video"],
        summary: "Upload the current user video",
        response: {
          201: videoDescriptorSchema,
          401: videoErrorSchema,
          413: videoErrorSchema,
          415: videoErrorSchema,
          503: videoErrorSchema,
        },
      },
    },
    async (request, reply) => {
      const user = await getSessionUser(request);

      if (!user) {
        return reply.status(401).send({ error: "Non authentifié" });
      }

      const data = request.body;

      if (!Buffer.isBuffer(data) || data.byteLength === 0) {
        return reply.status(415).send({ error: "Corps de requête vidéo invalide" });
      }

      try {
        const descriptor = await replaceUserVideo(user.id, {
          filename: uploadFilename(request),
          mimeType: String(request.headers["content-type"]).split(";")[0]!.trim(),
          data,
        });
        return reply.status(201).send(descriptor);
      } catch (error) {
        return uploadFailure(error, reply);
      }
    },
  );

  typed.delete(
    "/api/videos/me",
    {
      schema: {
        tags: ["video"],
        summary: "Delete the current user video and its bytes",
        response: { 200: videoDeletionSchema, 401: videoErrorSchema },
      },
    },
    async (request, reply) => {
      const user = await getSessionUser(request);

      if (!user) {
        return reply.status(401).send({ error: "Non authentifié" });
      }

      return reply.send({ deleted: await purgeUserVideo(user.id) });
    },
  );

  typed.delete(
    "/api/me/consent",
    {
      schema: {
        tags: ["video"],
        summary: "Revoke consent and erase the deposited video",
        response: { 200: videoDeletionSchema, 401: videoErrorSchema },
      },
    },
    async (request, reply) => {
      const user = await getSessionUser(request);

      if (!user) {
        return reply.status(401).send({ error: "Non authentifié" });
      }

      return reply.send({ deleted: await purgeUserVideo(user.id) });
    },
  );

  typed.get(
    "/api/videos/:providerId/stream",
    {
      schema: {
        tags: ["video"],
        summary: "Stream a stored video through the application",
        params: providerIdParamSchema,
      },
    },
    async (request, reply) => {
      try {
        const head = await describePlayback(request.params.providerId);
        const range = parseByteRange(request.headers.range, head.size);
        const playback = await openPlayback(request.params.providerId, range ?? undefined);

        reply.header("Content-Type", head.mimeType);
        reply.header("Accept-Ranges", "bytes");
        reply.header("Cache-Control", "private, no-store");

        if (!range) {
          reply.header("Content-Length", head.size);
          return reply.send(playback.stream);
        }

        reply.status(206);
        reply.header("Content-Length", range.end - range.start + 1);
        reply.header("Content-Range", `bytes ${range.start}-${range.end}/${head.size}`);
        return reply.send(playback.stream);
      } catch (error) {
        if (error instanceof VideoNotFoundError) {
          return reply.status(404).send({ error: "Vidéo introuvable" });
        }
        throw error;
      }
    },
  );
}
