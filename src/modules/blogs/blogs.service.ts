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

export const listBlogs = async (query: BlogQuery) => {
  const { category, search, provinceId, page, limit } = query;
  const skip = (page - 1) * limit;

  const where: Prisma.BlogWhereInput = {
    status: 'PUBLISHED',
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
    data: { ...dto, slug, authorId: userId, status: 'PENDING' },
  });

  const code = await createVerificationCode(userId, blog.id, 'blog');
  await sendVerificationEmail(userEmail, code, blog.title);

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
