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

export const getBlogById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const blog = await blogsService.getBlogById(req.params.id as string);
    res.json({ success: true, data: blog });
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

export const deleteBlog = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const { reason } = req.body;
    const userRole = req.user!.role; // Because requireAuth
    
    await blogsService.deleteBlog(id, req.user!.id, userRole, reason);
    res.json({ success: true, message: 'Blog eliminado correctamente' });
  } catch (error) {
    next(error);
  }
};

export const updateBlog = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const dto = require('./blogs.schema').updateBlogSchema.parse(req.body);
    const blog = await blogsService.updateBlog(id, req.user!.id, req.user!.role, dto);
    res.json({ success: true, message: 'Blog actualizado correctamente', data: blog });
  } catch (error) {
    next(error);
  }
};
