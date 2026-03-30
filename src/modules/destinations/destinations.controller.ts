import { Request, Response, NextFunction } from 'express';
import * as destinationsService from './destinations.service';
import {
  createDestinationSchema,
  verifyDestinationSchema,
  destinationQuerySchema,
} from './destinations.schema';

export const getDestinations = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = destinationQuerySchema.parse(req.query);
    const result = await destinationsService.listDestinations(query);
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

export const getDestinationById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const destination = await destinationsService.getDestinationById(req.params.id as string);
    res.json({ success: true, data: destination });
  } catch (error) {
    next(error);
  }
};

export const postDestination = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user!;
    const dto = createDestinationSchema.parse(req.body);
    const destination = await destinationsService.createDestination(user.id, user.email, dto);
    res.status(201).json({
      success: true,
      message: 'Destino creado. Revisa tu email para el código de verificación.',
      data: destination,
    });
  } catch (error) {
    next(error);
  }
};

export const postVerifyDestination = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { destinationId, code } = verifyDestinationSchema.parse(req.body);
    const destination = await destinationsService.verifyDestination(destinationId, code);
    res.json({
      success: true,
      message: '¡Destino publicado exitosamente!',
      data: destination,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteDestination = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const { reason } = req.body;
    const userRole = req.user!.role; // Because requireAuth
    
    await destinationsService.deleteDestination(id, req.user!.id, userRole, reason);
    res.json({ success: true, message: 'Destino eliminado correctamente' });
  } catch (error) {
    next(error);
  }
};

export const updateDestination = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const dto = require('./destinations.schema').updateDestinationSchema.parse(req.body);
    const destination = await destinationsService.updateDestination(id, req.user!.id, req.user!.role, dto);
    res.json({ success: true, message: 'Destino actualizado correctamente', data: destination });
  } catch (error) {
    next(error);
  }
};
