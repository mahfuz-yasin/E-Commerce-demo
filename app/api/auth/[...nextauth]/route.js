import NextAuth from "next-auth"
import Facebook from "next-auth/providers/facebook"
import { connectDB } from "@/lib/databaseConnection"
import UserModel from "@/models/User.model"

async function getFacebookConfig() {
  const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/auth/facebook-config`)
  const data = await response.json()
  return data
}

async function getUserFromFacebook(profile) {
  await connectDB()
  
  let user = await UserModel.findOne({ facebookId: profile.id })
  
  if (!user) {
    user = await UserModel.findOne({ email: profile.email })
    
    if (user) {
      // Link Facebook account to existing user
      user.facebookId = profile.id
      user.facebookPicture = profile.picture
      await user.save()
    } else {
      // Create new user
      user = await UserModel.create({
        name: profile.name,
        email: profile.email,
        facebookId: profile.id,
        facebookPicture: profile.picture,
        role: 'user',
        password: Math.random().toString(36).slice(-8), // Random password for Facebook users
        isEmailVerified: true
      })
    }
  } else {
    // Update existing Facebook user
    user.facebookPicture = profile.picture
    if (profile.email && !user.email) {
      user.email = profile.email
    }
    await user.save()
  }
  
  return user
}

const handler = NextAuth({
  providers: [
    Facebook({
      clientId: async () => {
        const config = await getFacebookConfig()
        return config.clientId
      },
      clientSecret: async () => {
        const config = await getFacebookConfig()
        return config.clientSecret
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'facebook') {
        const dbUser = await getUserFromFacebook(profile)
        user.id = dbUser._id.toString()
        user.role = dbUser.role
        user.name = dbUser.name
        user.email = dbUser.email
        user.facebookId = dbUser.facebookId
        user.picture = dbUser.facebookPicture || profile.picture
      }
      return true
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.facebookId = user.facebookId
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id
        session.user.role = token.role
        session.user.facebookId = token.facebookId
      }
      return session
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
})

export { handler as GET, handler as POST }
