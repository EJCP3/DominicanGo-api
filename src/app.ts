import express from 'express';
import cors from 'cors';
import session from 'express-session';
import { env } from './config/env';
import './config/passport'; // Side-effect: registers passport strategy
import passport from 'passport';
import { errorHandler } from './middleware/error.middleware';

// ── Routers ────────────────────────────────────────────────────────────────
import authRouter from './modules/auth/auth.router';
import usersRouter from './modules/users/users.router';
import destinationsRouter from './modules/destinations/destinations.router';
import blogsRouter from './modules/blogs/blogs.router';
import favoritesRouter from './modules/favorites/favorites.router';
import interactionsRouter from './modules/interactions/interactions.router';
import feedbackRouter from './modules/feedback/feedback.router';

// ── App ────────────────────────────────────────────────────────────────────
const app = express();

// ── Security & Parsing ────────────────────────────────────────────────────
app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Session (requerido para los internos de Passport durante el flujo de OAuth) ──────────
app.use(
  session({
    secret: env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 10, // 10 minutes — only needed during OAuth flow
    },
  })
);

// ── Passport ──────────────────────────────────────────────────────────────
app.use(passport.initialize());
app.use(passport.session());

// ── Health Check ──────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Routes ────────────────────────────────────────────────────────────────
app.use('/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/destinations', destinationsRouter);
app.use('/api/blogs', blogsRouter);
app.use('/api/favorites', favoritesRouter);
app.use('/api/interactions', interactionsRouter);
app.use('/api/feedback', feedbackRouter);

// ── 404 Handler ───────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Ruta no encontrada' });
});

app.use(errorHandler);

export default app;
