import { Router } from 'express';
import { requireAuth, optionalAuth } from '../../middleware/auth.middleware';
import * as controller from './interactions.controller';

const router = Router();

// Toggle reaction (requires Auth)
router.post('/react', requireAuth, controller.postToggleReaction);

// Add comment (requires Auth)
router.post('/comment', requireAuth, controller.postAddComment);

// Get Interactions (User state populated via optionalAuth)
router.get('/:targetType/:targetId', optionalAuth, controller.getInteractions);

export default router;
