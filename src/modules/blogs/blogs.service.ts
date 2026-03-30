import { prisma } from '../../lib/prisma';
import { createVerificationCode } from '../../services/otp.service';
import { sendVerificationEmail } from '../../services/mail.service';
import { createError } from '../../middleware/error.middleware';
import { CreateBlogDto, BlogQuery } from './blogs.schema';
import { Prisma } from '@prisma/client';

const slugify = (s: string): string =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

export const getBlogById = async (id: string) => {
  const blog = await prisma.blog.findUnique({
    where: { id },
    include: {
      author: { select: { id: true, name: true, foto: true } },
      province: true,
      destination: { select: { id: true, name: true, slug: true } }
    },
  });
  if (!blog) throw createError('Blog no encontrado', 404);
  return blog;
};

export const listBlogs = async (query: BlogQuery) => {
  const { category, search, provinceId, slug, page, limit } = query;
  const skip = (page - 1) * limit;

  const where: Prisma.BlogWhereInput = {
    status: 'PUBLISHED',
    ...(slug && { slug }),
    ...(category && { category: { equals: category, mode: Prisma.QueryMode.insensitive } }),
    ...(provinceId && { provinceId }),
    ...(search && {
      OR: [
        { title: { contains: search, mode: Prisma.QueryMode.insensitive } },
        { excerpt: { contains: search, mode: Prisma.QueryMode.insensitive } },
      ],
    }),
  };

  const [blogs, total] = await Promise.all([
    prisma.blog.findMany({
      where,
      skip,
      take: limit,
      include: { author: { select: { id: true, name: true, foto: true } }, province: true, destination: { select: { id: true, name: true, slug: true } } },
      orderBy: { publishedAt: 'desc' },
    }),
    prisma.blog.count({ where }),
  ]);

  return {
    data: blogs,
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
};

export const createBlog = async (
  userId: string,
  userEmail: string,
  dto: CreateBlogDto
) => {
  const baseSlug = slugify(dto.title);
  let slug = baseSlug;
  let counter = 1;

  while (await prisma.blog.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${counter++}`;
  }

  const blog = await prisma.blog.create({
    data: { ...dto, slug, authorId: userId, status: 'PUBLISHED', publishedAt: new Date() },
  });

  return blog;
};

export const verifyBlog = async (blogId: string, code: string) => {
  const { validateOtpCode } = await import('../../services/otp.service');
  const isValid = await validateOtpCode(blogId, code, 'blog');

  if (!isValid) throw createError('Código OTP inválido o expirado', 400);

  return prisma.blog.update({
    where: { id: blogId },
    data: { status: 'PUBLISHED', publishedAt: new Date() },
  });
};

export const deleteBlog = async (
  blogId: string,
  userId: string,
  userRole: 'USER' | 'ADMIN',
  reason?: string
) => {
  const blog = await prisma.blog.findUnique({ where: { id: blogId } });

  if (!blog) throw createError('Blog no encontrado', 404);

  if (blog.authorId !== userId && userRole !== 'ADMIN') {
    throw createError('No tienes permiso para eliminar este blog', 403);
  }

  if (userRole !== 'ADMIN' && !reason) {
    throw createError('Debes proporcionar un motivo para borrar este blog', 400);
  }

  if (reason) {
    await prisma.feedback.create({
      data: {
        type: 'DELETION_REQUEST',
        title: `El usuario borró el blog: ${blog.title}`,
        content: reason,
        userId,
        resourceId: blogId,
        resourceType: 'BLOG',
        status: 'RESOLVED',
      }
    });
  }

  await prisma.blog.delete({ where: { id: blogId } });
};

export const updateBlog = async (
  blogId: string,
  userId: string,
  userRole: 'USER' | 'ADMIN',
  dto: import('./blogs.schema').UpdateBlogDto
) => {
  const blog = await prisma.blog.findUnique({ where: { id: blogId } });

  if (!blog) throw createError('Blog no encontrado', 404);

  if (blog.authorId !== userId && userRole !== 'ADMIN') {
    throw createError('No tienes permiso para editar este blog', 403);
  }

  if (userRole !== 'ADMIN') {
    const oneHour = 60 * 60 * 1000;
    const now = new Date().getTime();
    const createdTime = blog.createdAt.getTime();
    if (now - createdTime > oneHour) {
      throw createError('El tiempo para editar expiró (máximo 1 hora desde su creación)', 403);
    }
  }

  let slug = blog.slug;
  if (dto.title && dto.title !== blog.title) {
    const baseSlug = slugify(dto.title);
    slug = baseSlug;
    let counter = 1;
    while (await prisma.blog.findFirst({ where: { slug, id: { not: blogId } } })) {
      slug = `${baseSlug}-${counter++}`;
    }
  }

  return await prisma.blog.update({
    where: { id: blogId },
    data: {
      ...dto,
      slug
    }
  });
};
