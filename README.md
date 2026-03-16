Digital Wallet Backend
Overview

The Digital Wallet Backend is a Spring Boot application that enables users to manage digital identities and verifiable credentials.

The system allows:

User registration and authentication

Wallet creation for each user

Issuing digital credentials

Credential verification

Credential revocation

Secure sharing of credentials

Each user receives a wallet DID in the format:

did:wallet:<uuid>

Example:

did:wallet:12ab45cd78

The application uses JWT authentication, PostgreSQL for persistence, and Spring Security for API protection.

Architecture Overview

The system follows a layered architecture with clearly separated concerns for the three main roles (Issuer, Holder, Verifier).

Client (React Frontend)
        │
        ▼
Controller Layer
(IssuerController, WalletController, VerifierController)
        │
        ▼
Service Layer
(CredentialService, AuthService)
        │
        ▼
Repository Layer
(JPA Repositories)
        │
        ▼
Databases (H2 / PostgreSQL)

Key Components

Controllers
- IssuerController: Handles credential issuance and revocation.
- WalletController: Manages the holder's wallet, sharing, and selective disclosure.
- VerifierController: Handles verification logic and audit logs.

Services
- CredentialService: Implements RSA signatures, AES encryption at rest, and verification logic.

Repositories
- Use Spring Data JPA to interact with the database.

Security
- JWT authentication for all protected routes.
- AES-256 Encryption for credential claims at rest.

Setup Instructions
1 Clone Repository
cd digital-wallet

2 Database Setup
This project is configured to use H2 (In-Memory) for easy testing, but supports PostgreSQL.

To use PostgreSQL, update `backend/src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/digital_wallet
spring.datasource.username=postgres
spring.datasource.password=yourpassword
spring.jpa.hibernate.ddl-auto=update
```

3 Install Dependencies
Ensure you have:
- Java 17+
- Node.js 18+
- Maven (bundled via mvnw)

4 Run the Application
Backend:
```bash
cd backend
./mvnw spring-boot:run
```
Frontend:
```bash
cd frontend
npm install
npm run dev
```

API Documentation

Authentication
- POST /auth/register: Register a new user and create a wallet.
- POST /auth/login: Authenticate and receive a JWT.

Issuer APIs (Role: ISSUER)
- POST /issuer/credential: Issue a new signed credential to a wallet.
- POST /issuer/revoke/{id}: Revoke an existing credential.

Wallet APIs (Role: USER)
- GET /wallet/credentials: Fetch all credentials belonging to the authenticated user.
- GET /wallet/credentials/{id}: Fetch details for a specific credential.
- POST /wallet/share/{id}: Generate a temporary sharing token.
- POST /wallet/present: Generate a selective disclosure presentation.

Verifier APIs
- POST /verify: Verify a credential or presentation token.
- GET /verification/logs: View audit logs of all verification attempts.

Security
The application implements:
- RSA Digital Signatures for non-repudiation.
- AES-256 Encryption for claims at rest.
- JWT-based authentication.
- Cryptographic hash validation for integrity.
Future Improvements

DID resolution support

Selective disclosure

Zero-knowledge credential proofs

Key rotation for signing keys

Credential presentation via QR codes

Technologies Used

Java 17

Spring Boot

Spring Security

PostgreSQL

Hibernate / JPA

JWT
