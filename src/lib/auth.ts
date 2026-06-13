import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import { connectDB } from "./mongodb";
import { User } from "../models/User";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
      authorization: {
        params: {
          prompt: "consent",
        },
      },
      profile(profile) {
        console.log("[DEBUG] GitHub OAuth Profile retrieved:", {
          id: profile.id,
          login: profile.login,
          name: profile.name,
          email: profile.email,
          avatar_url: profile.avatar_url,
        });
        return {
          id: profile.id.toString(),
          name: profile.name || profile.login,
          email: profile.email,
          image: profile.avatar_url,
          username: profile.login,
          bio: profile.bio || "",
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  secret: process.env.AUTH_SECRET,
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "github" && profile) {
        await connectDB();
        const githubId = profile.id?.toString() || user.id;
        const username = (profile as any).login || (user as any).username || "";
        const name = profile.name || user.name || "";
        const email = profile.email || user.email || "";
        const avatar = (profile as any).avatar_url || user.image || "";
        const bio = (profile as any).bio || "";

        // Check if user exists, otherwise create
        let dbUser = await User.findOne({ githubId });
        if (!dbUser) {
          dbUser = await User.create({
            githubId,
            username,
            name,
            email,
            avatar,
            bio,
          });
        } else {
          // Keep information synced if modified
          dbUser.name = name;
          dbUser.email = email;
          dbUser.avatar = avatar;
          dbUser.bio = bio;
          await dbUser.save();
        }

        // Attach DB details to user object so it gets put in the JWT token
        user.id = dbUser._id.toString();
        (user as any).username = dbUser.username;
        (user as any).bio = dbUser.bio;
      }
      return true;
    },
    async jwt({ token, user, account, profile }) {
      if (user) {
        // This runs only on sign in
        token.id = user.id;
        token.username = (user as any).username || "";
        token.bio = (user as any).bio || "";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        (session.user as any).id = token.id as string;
        (session.user as any).username = token.username as string;
        (session.user as any).bio = token.bio as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});
