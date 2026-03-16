# Digital Identity Wallet - Design Decisions

This document outlines the architectural and design decisions made for the Digital Identity Wallet assessment.

## Credential Schema Design
The system uses a flexible JSON-based schema for credentials, allowing for various types such as `EducationCredential`, `IdentityCredential`, etc. Every credential contains:
- `id`: Unique identifier.
- `type`: The category of the credential.
- `issuerDid`: The DID of the issuing authority.
- `subjectDid`: The DID of the wallet holder receiving the credential.
- `claims`: An encrypted map of specific data points (e.g., degree, name).
- `issuedAt` & `expiryAt`: Lifespan metadata.
- `signature`: RSA-signed hash of the claims for non-repudiation.

## Key Management Strategy
- **Asymmetric Keys (RSA)**: Used for digital signatures. The Issuer holds a private key to sign credentials, while the public key is used for verification.
- **Symmetric Keys (AES)**: Used for encryption at rest. Claims are encrypted using AES-256 before being stored in the database.
- **JWT**: Used for user session management and securing API endpoints.

## Encryption Implementation
- **Encryption at Rest**: Credential claims are encrypted using **AES-256** symmetric encryption. This ensures that even with database access, the sensitive claims of a user cannot be read without the application's secret key.
- **Encryption in Transit**: Communication between the frontend and backend is expected to be over HTTPS (in a production environment).

## Revocation Strategy
The system implements a **Revocation Status** flag on the credential entity. 
- When an issuer revokes a credential, the `isRevoked` flag is set to `true`.
- The `/verify` endpoint checks this flag in real-time. Any credential marked as revoked will fail verification immediately, even if the signature is valid.

## Architecture Decisions
- **Backend**: Spring Boot 3 with a layered architecture (Controller -> Service -> Repository).
- **Security**: Spring Security with JWT for stateless authentication. Role-based access control separates `ISSUER` and `USER` capabilities.
- **Database**: PostgreSQL (H2 for local development/testing convenience).
- **Frontend**: React with TypeScript for a robust, type-safe user interface. Tailwind CSS for modern, responsive styling.
- **API Flow**: The system uses specific root paths (`/issuer`, `/wallet`, `/verify`) as per the assessment requirements to provide a clean separation of concerns between different actors in the ecosystem.
