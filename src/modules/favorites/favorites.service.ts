import { prisma } from '../../lib/prisma';
import { createError } from '../../middleware/error.middleware';
import { z } from 'zod';

export const toggleFavoriteSchema = z.object({
  type: z.enum(['DESTINATION', 'BLOG']),
  destinationId: z.string().optional(),
  blogId: z.string().optional(),
});

export type ToggleFavoriteDto = z.infer<typeof toggleFavoriteSchema>;

/**
 * Añade o elimina un favorito.
 * @returns { added: boolean } para indicar la acción realizada
 */
export const toggleFavorite = async (userId: string, dto: ToggleFavoriteDto) => {
  const { type, destinationId, blogId } = dto;

  if (type === 'DESTINATION' && !destinationId) {
    throw createError('Se requiere destinationId para favoritos de tipo DESTINATION', 400);
  }
  if (type === 'BLOG' && !blogId) {
    throw createError('Se requiere blogId para favoritos de tipo BLOG', 400);
  }

  const where =
    type === 'DESTINATION'
      ? { userId_destinationId: { userId, destinationId: destinationId! } }
      : { userId_blogId: { userId, blogId: blogId! } };

  const existing = await prisma.favorite.findUnique({ where } as never);

  if (existing) {
    await prisma.favorite.delete({ where: { id: existing.id } });
    return { added: false, message: 'Eliminado de favoritos' };
  }

  const created = await prisma.favorite.create({
    data: {
      type,
      userId,
      ...(destinationId && { destinationId }),
      ...(blogId && { blogId }),
    },
  });

  return { added: true, message: 'Añadido a favoritos', data: created };
};

/**
 * Devuelve todos los favoritos (destinos + blogs) de un usuario.
 */
export const getUserFavorites = async (userId: string) => {
  const favorites = await prisma.favorite.findMany({
    where: { userId },
    include: {
      destination: { include: { province: true } },
      blog: { include: { author: { select: { id: true, name: true, foto: true } } } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return { data: favorites };
};
