
export type UserRole = 'user' | 'admin' | 'pendente';

export interface CustomUser {
  displayName: string;
  email: string;
  photoURL?: string; // Base64 data URL
  birthday?: string; // YYYY-MM-DD format
  cpf?: string;
  role?: UserRole;
  isActive?: boolean;
}

export interface TeamMember {
  id: number;
  name: string;
  role: string;
  avatarUrl: string;
}

export interface AnnouncementView {
  viewerId: string;
  name: string;
  photoURL?: string | null;
  viewedAt: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  author?: string;
  authorPhotoURL?: string | null;
  views?: AnnouncementView[];
  createdAt: number;
}

export interface QuickLink {
  id: number;
  label: string;
  url: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface SignUpData {
  name: string;
  email: string;
  password: string;
  birthday: string; // YYYY-MM-DD format
}

export interface SignInData {
  email: string;
  password: string;
}

export interface UpdateProfileData {
  email: string;
  displayName?: string;
  photoURL?: string;
  birthday?: string;
  cpf?: string;
}


export interface ConfirmResetData {
  email: string;
  code: string;
  newPassword: string;
}

export interface SearchResultSource {
  title: string;
  uri: string;
}

export interface GeminiSearchResult {
  summary: string;
  sources: SearchResultSource[];
}
