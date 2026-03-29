import { Request, Response, NextFunction } from 'express';
import { toggleReaction, addComment, getInteractionDetails, toggleReactionSchema, addCommentSchema } from './interactions.service';

export const postToggleReaction = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user!;
    const dto = toggleReactionSchema.parse(req.body);
    const result = await toggleReaction(user.id, dto);
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

export const postAddComment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user!;
    const dto = addCommentSchema.parse(req.body);
    const result = await addComment(user.id, dto);
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

export const getInteractions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { targetType, targetId } = req.params;
    const user = req.user as any;
    
    if (targetType !== 'DESTINATION' && targetType !== 'BLOG') {
      return res.status(400).json({ success: false, message: 'Invalid targetType' });
    }

    const result = await getInteractionDetails(targetType as 'DESTINATION'|'BLOG', targetId as string, user?.id);
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};
