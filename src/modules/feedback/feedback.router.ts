import { Router } from 'express';
import { submitFeedback, getFeedbacks, updateStatus } from './feedback.controller';
import { optionalAuth, requireAuth, requireAdmin } from '../../middleware/auth.middleware';

const router = Router();

// Endpoint público/opcional para enviar feedback
router.post('/', optionalAuth, submitFeedback);

// Endpoint protegido para administradores para ver todos los feedbacks
router.get('/', requireAuth, requireAdmin, getFeedbacks);

// Endpoint protegido para administradores para actualizar el estado del feedback
router.patch('/:id/status', requireAuth, requireAdmin, updateStatus);

export default router;
