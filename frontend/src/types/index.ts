export interface User {
  id: string;
  email: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  color: number;
  createdAt: string;
  ownerId: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface Alert {
  id: string;
  type: 'error' | 'warning' | 'info' | 'success';
  message: string;
  timestamp: string;
  resolved: boolean;
}
