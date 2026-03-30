import { Request, Response } from 'express';
import * as feedbackService from './feedback.service';

export const submitFeedback = async (req: Request, res: Response): Promise<void> => {
  try {
    const { type, content, title, resourceId, resourceType } = req.body;
    
    // Si hay usuario en la request (opcional), se asocia
    const userId = req.user?.id;

    if (!type || !content) {
      res.status(400).json({ success: false, message: 'El tipo y el contenido son obligatorios.' });
      return;
    }

    if (type === 'DELETION_REQUEST' && !userId) {
      res.status(401).json({ success: false, message: 'Debes iniciar sesión para solicitar eliminación de contenido.' });
      return;
    }

    const feedback = await feedbackService.createFeedback({
      type,
      content,
      title,
      userId,
      resourceId,
      resourceType,
    });

    res.status(201).json({ success: true, data: feedback });
  } catch (error) {
    console.error('Error in submitFeedback:', error);
    res.status(500).json({ success: false, message: 'Failed to submit feedback.' });
  }
};

export const getFeedbacks = async (req: Request, res: Response): Promise<void> => {
  try {
    const feedbacks = await feedbackService.getAllFeedbacks();
    res.status(200).json({ success: true, data: feedbacks });
  } catch (error) {
    console.error('Error in getFeedbacks:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch feedbacks.' });
  }
};

export const updateStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { status } = req.body;

    if (!status) {
      res.status(400).json({ success: false, message: 'El estado es obligatorio.' });
      return;
    }

    const updated = await feedbackService.updateFeedbackStatus(id, status);
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    console.error('Error in updateStatus:', error);
    res.status(500).json({ success: false, message: 'Failed to update feedback status.' });
  }
};
