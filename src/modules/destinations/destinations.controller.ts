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
