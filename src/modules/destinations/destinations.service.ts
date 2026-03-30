import { prisma } from '../../lib/prisma';
import { createVerificationCode } from '../../services/otp.service';
import { sendVerificationEmail } from '../../services/mail.service';
import { createError } from '../../middleware/error.middleware';
import { CreateDestinationDto, DestinationQuery } from './destinations.schema';
import { Prisma } from '@prisma/client';

/**
 * Genera un slug amigable para URL a partir de una cadena.
 */
const slugify = (s: string): string =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

/**
 * Lista destinos publicados con filtros opcionales y paginación.
 */
export const listDestinations = async (query: DestinationQuery) => {
  const { type, provinceId, region, price, search, page, limit } = query;
  const skip = (page - 1) * limit;

  const where: Prisma.DestinationWhereInput = {
    status: 'PUBLISHED',
    ...(type && { type }),
    ...(provinceId && { provinceId }),
    ...(price && { price }),
    ...(region && { province: { region } }),
    ...(search && {
      OR: [
        { name: { contains: search, mode: Prisma.QueryMode.insensitive } },
        { description: { contains: search, mode: Prisma.QueryMode.insensitive } },
        { tags: { has: search } },
      ],
    }),
  };

  const [destinations, total] = await Promise.all([
    prisma.destination.findMany({
      where,
      skip,
      take: limit,
      include: { province: true },
      orderBy: { publishedAt: 'desc' },
    }),
    prisma.destination.count({ where }),
  ]);

  return {
    data: destinations,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Obtiene un destino por ID.
 */
export const getDestinationById = async (id: string) => {
  const destination = await prisma.destination.findUnique({
    where: { id },
    include: { province: true },
  });
  if (!destination) throw createError('Destino no encontrado', 404);
  return destination;
};

/**
 * Crea un destino en estado PENDING, genera OTP y envía correo.
 */
export const createDestination = async (
  userId: string,
  userEmail: string,
  dto: CreateDestinationDto
) => {
  const baseSlug = slugify(dto.name);
  let slug = baseSlug;
  let counter = 1;

  // Asegura la unicidad del slug
  while (await prisma.destination.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${counter++}`;
  }

  const destination = await prisma.destination.create({
    data: {
      ...dto,
      slug,
      authorId: userId,
      status: 'PENDING',
    },
  });

  // Genera OTP y envía correo
  const code = await createVerificationCode(userId, destination.id, 'destination');
  await sendVerificationEmail(userEmail, code, destination.name);

  return destination;
};

/**
 * Verifica OTP y publica un destino.
 */
export const verifyDestination = async (destinationId: string, code: string) => {
  const { validateOtpCode } = await import('../../services/otp.service');
  const isValid = await validateOtpCode(destinationId, code, 'destination');

  if (!isValid) {
    throw createError('Código OTP inválido o expirado', 400);
  }

  const destination = await prisma.destination.update({
    where: { id: destinationId },
    data: {
      status: 'PUBLISHED',
      publishedAt: new Date(),
    },
  });

  return destination;
};

/**
 * Elimina un destino y opcionalmente registra la razón (si el autor lo borra).
 */
export const deleteDestination = async (
  destinationId: string,
  userId: string,
  userRole: 'USER' | 'ADMIN',
  reason?: string
) => {
  const destination = await prisma.destination.findUnique({ where: { id: destinationId } });
  
  if (!destination) {
    throw createError('Destino no encontrado', 404);
  }

  if (destination.authorId !== userId && userRole !== 'ADMIN') {
    throw createError('No tienes permiso para eliminar este destino', 403);
  }

  if (userRole !== 'ADMIN' && !reason) {
    throw createError('Debes proporcionar un motivo para borrar este destino', 400);
  }

  if (reason) {
    await prisma.feedback.create({
      data: {
        type: 'DELETION_REQUEST',
        title: `El usuario borró el destino: ${destination.name}`,
        content: reason,
        userId,
        resourceId: destinationId,
        resourceType: 'DESTINATION',
        status: 'RESOLVED',
      }
    });
  }

  await prisma.destination.delete({ where: { id: destinationId } });
};

/**
 * Actualiza un destino si el usuario es creador (y hace menos de 1 hora) o ADMIN.
 */
export const updateDestination = async (
  destinationId: string,
  userId: string,
  userRole: 'USER' | 'ADMIN',
  dto: import('./destinations.schema').UpdateDestinationDto
) => {
  const destination = await prisma.destination.findUnique({ where: { id: destinationId } });
  
  if (!destination) {
    throw createError('Destino no encontrado', 404);
  }

  if (destination.authorId !== userId && userRole !== 'ADMIN') {
    throw createError('No tienes permiso para editar este destino', 403);
  }

  if (userRole !== 'ADMIN') {
    const oneHour = 60 * 60 * 1000;
    const now = new Date().getTime();
    const createdTime = destination.createdAt.getTime();
    if (now - createdTime > oneHour) {
      throw createError('El tiempo para editar expiró (máximo 1 hora desde su creación)', 403);
    }
  }

  let slug = destination.slug;
  if (dto.name && dto.name !== destination.name) {
    const baseSlug = slugify(dto.name);
    slug = baseSlug;
    let counter = 1;
    while (await prisma.destination.findFirst({ where: { slug, id: { not: destinationId } } })) {
      slug = `${baseSlug}-${counter++}`;
    }
  }

  return await prisma.destination.update({
    where: { id: destinationId },
    data: {
      ...dto,
      slug
    }
  });
};
