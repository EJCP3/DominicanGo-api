import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.middleware';
import * as controller from './destinations.controller';

const router = Router();

/**
 * @route   GET /api/destinations
 * @desc    lista destinos publicados con filtros opcionales
 * @access  Public
 */
router.get('/', controller.getDestinations);

/**
 * @route   POST /api/destinations
 * @desc    crea un destino (status: PENDING) + envia correo OTP
 * @access  Private
 */
router.post('/', requireAuth, controller.postDestination);

/**
 * @route   POST /api/destinations/verify
 * @desc    verifica el codigo OTP y publica el destino
 * @access  Public
 */
router.post('/verify', controller.postVerifyDestination);

export default router;
