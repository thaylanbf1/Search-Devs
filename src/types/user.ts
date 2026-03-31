// Defines and validates the structure of user data returned by the GitHub API
// and allows automatic inference of the TypeScript type

import { z } from 'zod'
 
export const UserSchema = z.object({
  avatar_url: z.string().url(),
  login: z.string(),
  name: z.string().nullable(),
  location: z.string().nullable(),
  bio: z.string().nullable(),
  followers: z.number(),
  following: z.number(),
  public_repos: z.number(),
  email: z.string().nullable(),
  blog: z.string().nullable(),

// Optional additional fields for the user's social media.
  twitter_username: z.string().nullable().optional(),
  linkedin_username: z.string().nullable().optional(),
})
 
export type UserProps = z.infer<typeof UserSchema>