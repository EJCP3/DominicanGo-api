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
