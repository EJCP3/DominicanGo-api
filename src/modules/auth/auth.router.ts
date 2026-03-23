import { Router, Request, Response } from 'express';
import passport from 'passport';
import { signToken } from '../../lib/jwt';
import { env } from '../../config/env';

const router = Router();

/**
 * @route   GET /auth/google
 * @desc    Initiates Google OAuth2 flow
 */
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })
);

/**
 * @route   GET /auth/google/callback
 * @desc    Google OAuth2 callback — firma JWT & redicion a frontend
 */
router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: `${env.FRONTEND_URL}/login?error=google_auth_failed` }),
  (req: Request, res: Response) => {
    const user = req.user as Express.User;

    const token = signToken({ userId: user.id, email: user.email });

    res.redirect(`${env.FRONTEND_URL}/auth/callback?token=${token}`);
  }
);

export default router;
