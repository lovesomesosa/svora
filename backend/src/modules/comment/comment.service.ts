import { prisma } from "../../lib/prisma.js";
import { CreateCommentInput } from "./comment.types.js";
import { AppError } from "../../utils/app-error.js";
import { getPagination } from "../../utils/pagination.js";

type SerializableComment = {
  id: string;
  trackId: string;
  userId: string;
  text: string;
  timestamp: string | null;
  createdAt: Date;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
};

const serializeComment = (comment: SerializableComment) => ({
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

export const getCommentsByTrack = async (
  trackId: string,
  userId: string,
  page?: string,
  limit?: string,
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

  const { skip, limit: take, page: currentPage } = getPagination(page, limit);

  const [comments, total] = await Promise.all([
    prisma.comment.findMany({
      where: { trackId },
      skip,
      take,
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
    }),
    prisma.comment.count({
      where: { trackId },
    }),
  ]);

  return {
    items: comments.map(serializeComment),
    pagination: {
      page: currentPage,
      limit: take,
      total,
      pages: total === 0 ? 1 : Math.ceil(total / take),
    },
  };
};
