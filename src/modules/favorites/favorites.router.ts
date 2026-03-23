import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.middleware';
import * as controller from './favorites.controller';

const router = Router();

/** @route POST /api/favorites — Toggle favorite (add or remove) */
router.post('/', requireAuth, controller.postToggleFavorite);

/** @route GET /api/favorites — Get all user's saved favorites */
router.get('/', requireAuth, controller.getFavorites);

export default router;
