export interface User {
  id: string;
  email: string;
  name?: string;
  role?: string;
}

export interface AuthResponse {
  token: string;
  name?: string;
  email?: string;
  didWalletId?: string;
  role?: string;
  user?: User;
}

export interface Credential {
  id: string;
  type: string;
  issuer: string;
  subject: string;
  issuedAt: string;
  claims: Record<string, any>;
  signature?: string;
}

export interface Wallet {
  id: string; // did:wallet:<uuid>
  owner: string;
}

export interface ShareResponse {
  presentationToken: string;
  expiresIn: number;
}

export interface VerificationResponse {
  status: 'VERIFIED' | 'INVALID_SIGNATURE' | 'REVOKED' | 'EXPIRED';
  issuer?: string;
  issuedDate?: string;
}
