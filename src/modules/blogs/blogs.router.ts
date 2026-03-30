import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.middleware';
import * as controller from './blogs.controller';

const router: Router = Router();

/** @route GET /api/blogs — lista blogs publicados con filtros opcionales */
router.get('/', controller.getBlogs);

/** @route GET /api/blogs/:id — obtiene un blog por ID */
router.get('/:id', controller.getBlogById);

/** @route POST /api/blogs — crea un blog (PENDING) + envia correo OTP */
router.post('/', requireAuth, controller.postBlog);

/** @route POST /api/blogs/verify — verifica OTP y publica el blog */
router.post('/verify', controller.postVerifyBlog);

/** @route DELETE /api/blogs/:id — elimina un blog, requiere autor o ADMIN y un motivo */
router.delete('/:id', requireAuth, controller.deleteBlog);

/** @route PATCH /api/blogs/:id — actualiza un blog, requiere autor (<1hr) o ADMIN */
router.patch('/:id', requireAuth, controller.updateBlog);

export default router;
