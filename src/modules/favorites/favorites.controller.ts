import { Request, Response, NextFunction } from 'express';
import { toggleFavorite, getUserFavorites, toggleFavoriteSchema } from './favorites.service';

export const postToggleFavorite = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user!;
    const dto = toggleFavoriteSchema.parse(req.body);
    const result = await toggleFavorite(user.id, dto);
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

export const getFavorites = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user!;
    const result = await getUserFavorites(user.id);
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};
