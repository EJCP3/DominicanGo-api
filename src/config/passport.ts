import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { prisma } from '../lib/prisma';
import { env } from './env';


passport.use(
  new GoogleStrategy(
    {
      clientID: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      callbackURL: env.GOOGLE_CALLBACK_URL,
      scope: ['profile', 'email'],
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        if (!email) {
          return done(new Error('No se pudo obtener el email del perfil de Google'), undefined);
        }

        // Upsert: create if not exists, update photo if exists
        const user = await prisma.user.upsert({
          where: { googleId: profile.id },
          update: {
            foto: profile.photos?.[0]?.value,
            name: profile.displayName,
          },
          create: {
            googleId: profile.id,
            email,
            name: profile.displayName,
            foto: profile.photos?.[0]?.value,
          },
        });

        return done(null, user);
      } catch (error) {
        return done(error as Error, undefined);
      }
    }
  )
);

// Not using session serialization since we're using JWT
passport.serializeUser((user: Express.User, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    done(null, user ?? undefined);
  } catch (error) {
    done(error, undefined);
  }
});

export default passport;
