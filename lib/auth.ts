import { AuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import dbConnect from './db';
import User from '@/models/User';

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || 'mock-id',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'mock-secret',
    }),
    CredentialsProvider({
      id: 'credentials',
      name: 'Development Login',
      credentials: {
        email: { label: 'Email', type: 'email' },
        role: { label: 'Role', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.email) return null;

        // Auto-assign name from email or set a friendly default
        const name = credentials.email.split('@')[0];
        const role = credentials.role || 'member';

        try {
          await dbConnect();
          let user = await User.findOne({ email: credentials.email });

          if (!user) {
            user = await User.create({
              name: name.charAt(0).toUpperCase() + name.slice(1),
              email: credentials.email,
              image: `https://api.dicebear.com/7.x/adventurer/svg?seed=${name}`,
              role: role,
            });
          }

          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            image: user.image,
            role: user.role,
          };
        } catch (e) {
          // Development bypass fallback in case database connection is not active yet
          return {
            id: 'mock-dev-id',
            name: name.charAt(0).toUpperCase() + name.slice(1),
            email: credentials.email,
            image: `https://api.dicebear.com/7.x/adventurer/svg?seed=${name}`,
            role: role,
          };
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google' && user.email) {
        try {
          await dbConnect();
          let existingUser = await User.findOne({ email: user.email });
          if (!existingUser) {
            existingUser = await User.create({
              name: user.name || 'Google User',
              email: user.email,
              image: user.image || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.email}`,
              role: 'member', // Default role for new sign-ups
            });
          }
          user.role = existingUser.role;
          user.id = existingUser._id.toString();
        } catch (e) {
          user.role = 'member';
          user.id = 'fallback-id';
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role || 'member';
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/login',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
};
