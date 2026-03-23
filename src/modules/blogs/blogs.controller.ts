import { Request, Response, NextFunction } from 'express';
import * as blogsService from './blogs.service';
import {
  createBlogSchema,
  verifyBlogSchema,
  blogQuerySchema,
} from './blogs.schema';

export const getBlogs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = blogQuerySchema.parse(req.query);
    const result = await blogsService.listBlogs(query);
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

export const postBlog = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user!;
    const dto = createBlogSchema.parse(req.body);
    const blog = await blogsService.createBlog(user.id, user.email, dto);
    res.status(201).json({
      success: true,
      message: 'Blog creado. Revisa tu email para el código de verificación.',
      data: blog,
    });
  } catch (error) {
    next(error);
  }
};

export const postVerifyBlog = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { blogId, code } = verifyBlogSchema.parse(req.body);
    const blog = await blogsService.verifyBlog(blogId, code);
    res.json({
      success: true,
      message: '¡Blog publicado exitosamente!',
      data: blog,
    });
  } catch (error) {
    next(error);
  }
};
