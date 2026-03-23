import { z } from 'zod';

export const createBlogSchema = z.object({
  title: z.string().min(5, 'El título debe tener al menos 5 caracteres'),
  excerpt: z.string().min(20, 'El resumen debe tener al menos 20 caracteres').max(300),
  content: z.string().min(100, 'El contenido debe tener al menos 100 caracteres'),
  category: z.string().min(1, 'La categoría es requerida'),
  images: z.array(z.string().url()).min(1, 'Agrega al menos 1 imagen').max(10),
  provinceId: z.string().optional(),
  destinationId: z.string().optional(),
});

export const verifyBlogSchema = z.object({
  blogId: z.string().min(1),
  code: z.string().length(6, 'El código OTP debe tener 6 dígitos'),
});

export const blogQuerySchema = z.object({
  category: z.string().optional(),
  search: z.string().optional(),
  provinceId: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(12),
});

export type CreateBlogDto = z.infer<typeof createBlogSchema>;
export type VerifyBlogDto = z.infer<typeof verifyBlogSchema>;
export type BlogQuery = z.infer<typeof blogQuerySchema>;
