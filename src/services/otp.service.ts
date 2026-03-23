import crypto from 'crypto';
import { prisma } from '../lib/prisma';

const OTP_EXPIRY_MINUTES = 15;

/**
 * Genera un código OTP seguro de 6 dígitos.
 */
export const generateOtpCode = (): string => {
  // Random number between 100000 and 999999
  return crypto.randomInt(100000, 1000000).toString();
};

/**
 * Crea y almacena un nuevo código OTP vinculado a un usuario y un recurso.
 * Invalida cualquier código anterior no utilizado para el mismo recurso.
 *
 * @param userId - ID del usuario autenticado
 * @param resourceId - ID del destino o blog
 * @param resourceType - 'destination' o 'blog'
 */
export const createVerificationCode = async (
  userId: string,
  resourceId: string,
  resourceType: 'destination' | 'blog'
): Promise<string> => {
  const code = generateOtpCode();
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  const data =
    resourceType === 'destination'
      ? { userId, destinationId: resourceId, code, expiresAt }
      : { userId, blogId: resourceId, code, expiresAt };

  await prisma.verificationCode.create({ data });

  return code;
};

/**
 * Valida un código OTP para un recurso dado.
 * Marca el código como usado si es válido.
 *
 * @returns true si es válido, false en caso contrario
 */
export const validateOtpCode = async (
  resourceId: string,
  code: string,
  resourceType: 'destination' | 'blog'
): Promise<boolean> => {
  const where =
    resourceType === 'destination'
      ? { destinationId: resourceId }
      : { blogId: resourceId };

  const record = await prisma.verificationCode.findFirst({
    where: {
      ...where,
      code,
      used: false,
      expiresAt: { gte: new Date() },
    },
    orderBy: { createdAt: 'desc' },
  });

  if (!record) return false;

  // Mark as used (one-time use only)
  await prisma.verificationCode.update({
    where: { id: record.id },
    data: { used: true },
  });

  return true;
};
