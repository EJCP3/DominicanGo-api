import { Router, Request, Response } from 'express';
import { requireAuth } from '../../middleware/auth.middleware';

const router = Router();

/**
 * @route   GET /api/users/me
 * @desc    devuelve el perfil del usuario autenticado actual
 * @access  Private (requiere JWT)
 */
router.get('/me', requireAuth, (req: Request, res: Response) => {
  res.json({
    success: true,
    data: req.user,
  });
});

export default router;
