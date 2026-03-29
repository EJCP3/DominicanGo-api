import { prisma } from '../../lib/prisma';
import { createError } from '../../middleware/error.middleware';
import { z } from 'zod';

export const toggleReactionSchema = z.object({
  targetType: z.enum(['DESTINATION', 'BLOG', 'COMMENT']),
  destinationId: z.string().optional(),
  blogId: z.string().optional(),
  commentId: z.string().optional(),
  type: z.enum(['LIKE', 'DISLIKE']),
});

export type ToggleReactionDto = z.infer<typeof toggleReactionSchema>;

export const addCommentSchema = z.object({
  targetType: z.enum(['DESTINATION', 'BLOG']),
  destinationId: z.string().optional(),
  blogId: z.string().optional(),
  content: z.string().min(1, 'El comentario no puede estar vacío'),
});

export type AddCommentDto = z.infer<typeof addCommentSchema>;

export const toggleReaction = async (userId: string, dto: ToggleReactionDto) => {
  const { targetType, destinationId, blogId, commentId, type } = dto;

  if (targetType === 'DESTINATION' && !destinationId) {
    throw createError('Se requiere destinationId para DESTINATION', 400);
  }
  if (targetType === 'BLOG' && !blogId) {
    throw createError('Se requiere blogId para BLOG', 400);
  }
  if (targetType === 'COMMENT' && !commentId) {
    throw createError('Se requiere commentId para COMMENT', 400);
  }

  const whereCondition =
    targetType === 'DESTINATION'
      ? { userId_destinationId: { userId, destinationId: destinationId! } }
      : targetType === 'BLOG'
        ? { userId_blogId: { userId, blogId: blogId! } }
        : { userId_commentId: { userId, commentId: commentId! } };

  const existing = await prisma.reaction.findUnique({ where: whereCondition as any });

  if (existing) {
    if (existing.type === type) {
      // If clicking the same button twice, remove it
      await prisma.reaction.delete({ where: { id: existing.id } });
      return { action: 'removed', message: 'Reacción eliminada' };
    } else {
      // Flip reaction (Like -> Dislike or Dislike -> Like)
      const updated = await prisma.reaction.update({
        where: { id: existing.id },
        data: { type },
      });
      return { action: 'updated', message: 'Reacción actualizada', data: updated };
    }
  }

  // Create new
  const created = await prisma.reaction.create({
    data: {
      userId,
      type,
      targetType,
      ...(destinationId && { destinationId }),
      ...(blogId && { blogId }),
      ...(commentId && { commentId }),
    },
  });

  return { action: 'added', message: 'Reacción añadida', data: created };
};

export const addComment = async (userId: string, dto: AddCommentDto) => {
  const { targetType, destinationId, blogId, content } = dto;
  const created = await prisma.comment.create({
    data: {
      userId,
      content,
      targetType,
      ...(destinationId && { destinationId }),
      ...(blogId && { blogId }),
    },
    include: {
      user: { select: { name: true, foto: true } }
    }
  });
  return { data: created, message: 'Comentario publicado' };
};

export const getInteractionDetails = async (targetType: 'DESTINATION'|'BLOG', targetId: string, userId?: string) => {
  const isDest = targetType === 'DESTINATION';
  const filter = isDest ? { destinationId: targetId } : { blogId: targetId };

  // Get Reactions
  const reactions = await prisma.reaction.groupBy({
    by: ['type'],
    where: { targetType, ...filter },
    _count: { type: true }
  });

  const counts: Record<string, number> = { LIKE: 0, DISLIKE: 0 };
  reactions.forEach(r => { counts[r.type] = r._count.type; });

  // Get user's current reaction if logged in
  let userReaction = null;
  let currUser = null;
  if (userId) {
    currUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, foto: true }
    });

    const userR = await prisma.reaction.findFirst({
      where: { userId, targetType, ...filter }
    });
    userReaction = userR?.type || null;
  }

  // Get Comments with their reactions
  const comments = await prisma.comment.findMany({
    where: { targetType, ...filter },
    include: {
      user: { select: { id: true, name: true, foto: true } },
      reactions: {
         select: { type: true, userId: true }
      }
    },
    orderBy: { createdAt: 'desc' },
  });

  // Calculate reaction counts dynamically for each comment
  const formattedComments = comments.map(c => {
    let likes = 0;
    let dislikes = 0;
    let userReactionForComment = null;

    c.reactions.forEach(r => {
      if (r.type === 'LIKE') likes++;
      if (r.type === 'DISLIKE') dislikes++;
      if (userId && r.userId === userId) {
        userReactionForComment = r.type;
      }
    });

    return {
      id: c.id,
      content: c.content,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
      user: c.user,
      likes,
      dislikes,
      userReaction: userReactionForComment
    };
  });

  return { data: { counts, userReaction, comments: formattedComments, currUser } };
};
