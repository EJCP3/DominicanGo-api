import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.middleware';
import * as controller from './destinations.controller';

const router: Router = Router();

/**
 * @route   GET /api/destinations
 * @desc    lista destinos publicados con filtros opcionales
 * @access  Public
 */
router.get('/', controller.getDestinations);

/**
 * @route   GET /api/destinations/:id
 * @desc    obtiene un destino por ID
 * @access  Public
 */
router.get('/:id', controller.getDestinationById);

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

/**
 * @route   DELETE /api/destinations/:id
 * @desc    elimina un destino, requiere que el usuario sea dueño o ADMIN y provea un motivo
 * @access  Private
 */
router.delete('/:id', requireAuth, controller.deleteDestination);

/**
 * @route   PATCH /api/destinations/:id
 * @desc    actualiza un destino, requiere que el usuario sea dueño (y < 1hr) o ADMIN
 * @access  Private
 */
router.patch('/:id', requireAuth, controller.updateDestination);

export default router;
