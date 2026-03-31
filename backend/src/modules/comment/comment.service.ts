import { prisma } from "../../lib/prisma.js";
import { CreateCommentInput } from "./comment.types.js";
import { AppError } from "../../utils/app-error.js";

const serializeComment = (comment: any) => ({
  id: comment.id,
  trackId: comment.trackId,
  userId: comment.userId,
  text: comment.text,
  timestamp: comment.timestamp,
  createdAt: comment.createdAt,
  user: comment.user,
});

export const createComment = async (
  trackId: string,
  userId: string,
  data: CreateCommentInput,
) => {
  const track = await prisma.track.findFirst({
    where: {
      id: trackId,
      project: {
        userId,
      },
    },
  });

  if (!track) {
    throw new AppError("Track not found", 404);
  }

  const comment = await prisma.comment.create({
    data: {
      trackId,
      userId,
      text: data.text,
      timestamp: data.timestamp,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
  });

  return serializeComment(comment);
};

export const getCommentsByTrack = async (trackId: string, userId: string) => {
  const track = await prisma.track.findFirst({
    where: {
      id: trackId,
      project: {
        userId,
      },
    },
  });

  if (!track) {
    throw new AppError("Track not found", 404);
  }

  const comments = await prisma.comment.findMany({
    where: { trackId },
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
  });

  return comments.map(serializeComment);
};