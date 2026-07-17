export interface Social {
  vk?: string
  telegram?: string
  instagram?: string
  youtube?: string
}

export interface Member {
  id: string
  name: string
  role: string
  bio: string
  avatar: string
  socials: Social
}

export interface ReleasePlatforms {
  spotify?: string
  youtube?: string
  yandex?: string
  apple?: string
}

export interface Release {
  id: string
  title: string
  originalArtist: string
  cover: string
  releaseDate: string
  status: 'upcoming' | 'released'
  platforms: ReleasePlatforms
  description: string
  currentStage?: number
}

export interface Service {
  id: string
  title: string
  description: string
  includes: string[]
  price: string
  turnaround: string
}

export interface Vacancy {
  id: string
  role: string
  requirements: string[]
  conditions: string
  isOpen: boolean
}

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  registeredAt: string
}

export interface Submission {
  id: string
  userId: string
  type: 'service' | 'join'
  payload: Record<string, string>
  createdAt: string
}
