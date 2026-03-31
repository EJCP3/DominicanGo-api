import { z } from 'zod';
import { maxBase64Size } from '../../utils/base64Validator';

export const createDestinationSchema = z.object({
  provinceId: z.string().min(1, 'La provincia es requerida'),
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  type: z.enum(['playa', 'naturaleza', 'aventura', 'cultura', 'museo', 'comida', 'parque', 'tienda', 'montana']),
  price: z.enum(['gratis', 'pagado']),
  description: z.string().min(20, 'La descripción debe tener al menos 20 caracteres'),
  image: z.string().min(1, 'La imagen principal es requerida').refine(maxBase64Size(10), 'La imagen no puede exceder los 10MB'),
  images: z.array(z.string().refine(maxBase64Size(10), 'Cada imagen de galería no puede exceder los 10MB')).max(6, 'Máximo 6 imágenes en la galería').optional().default([]),
  tags: z.array(z.string()).min(1, 'Agrega al menos 1 etiqueta').max(8),
  hoursWeekdays: z.string().optional(),
  hoursWeekend: z.string().optional(),
  website: z.string().url().optional().nullable(),
});

export const verifyDestinationSchema = z.object({
  destinationId: z.string().min(1),
  code: z.string().length(6, 'El código OTP debe tener 6 dígitos'),
});

export const destinationQuerySchema = z.object({
  type: z.enum(['playa', 'naturaleza', 'aventura', 'cultura', 'museo', 'comida', 'parque', 'tienda', 'montana']).optional(),
  provinceId: z.string().optional(),
  region: z.string().optional(),
  price: z.enum(['gratis', 'pagado']).optional(),
  search: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(12),
});

export type CreateDestinationDto = z.infer<typeof createDestinationSchema>;
export type VerifyDestinationDto = z.infer<typeof verifyDestinationSchema>;
export type DestinationQuery = z.infer<typeof destinationQuerySchema>;

export const updateDestinationSchema = createDestinationSchema.partial();
export type UpdateDestinationDto = z.infer<typeof updateDestinationSchema>;
