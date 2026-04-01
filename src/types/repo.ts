// Defines and validates the structure of repository data returned by the GitHub API
// and allows inferring the TypeScript type from the schema

import { z } from "zod"

export const RepoSchema = z.object({
  id: z.number(),
  login: z.string().optional(),
  name: z.string(),
  description: z.string().nullable(),
  language: z.string().nullable(),
  html_url: z.string().url(),
  fork: z.boolean(), 
  forks_count: z.number(),
  stargazers_count: z.number(),
  updated_at: z.string().nullable(),
  created_at: z.string().nullable().optional(),
  pushed_at: z.string().nullable().optional(),
})

export type RepoProps = z.infer<typeof RepoSchema>