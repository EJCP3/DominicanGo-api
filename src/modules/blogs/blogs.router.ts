import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.middleware';
import * as controller from './blogs.controller';

const router = Router();

/** @route GET /api/blogs — lista blogs publicados con filtros opcionales */
router.get('/', controller.getBlogs);

/** @route POST /api/blogs — crea un blog (PENDING) + envia correo OTP */
router.post('/', requireAuth, controller.postBlog);

/** @route POST /api/blogs/verify — verifica OTP y publica el blog */
router.post('/verify', controller.postVerifyBlog);

export default router;
