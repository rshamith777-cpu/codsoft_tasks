# SecureVault

> Military-grade encrypted file vault - Zero-knowledge architecture with real-time security monitoring, role-based access control, and AI-powered threat detection.

---

## Overview

SecureVault is a full-stack cybersecurity application that provides end-to-end encrypted file storage with enterprise-grade security controls. Every file is encrypted client-side using AES-256-GCM before leaving the browser, ensuring the server never has access to plaintext data. The application combines a React frontend with an Express/TypeScript backend and a comprehensive security monitoring layer.

This project was developed as **Task 1** of the CODSOFT Cybersecurity Internship program.

---

## Features

### Core Security

| Feature | Implementation |
|---|---|
| File Encryption | AES-256-GCM with per-file unique IVs via Web Crypto API |
| Key Derivation | PBKDF2 - 100,000 iterations, SHA-256, random salt |
| Authentication | HMAC-SHA256 JWT with configurable expiry |
| Password Hashing | Argon2id (server-side) |
| Transport Security | HTTPS enforced, HSTS headers, strict CSP |

### Access Control

- **Role-Based Access Control (RBAC)** - Admin / Editor / Viewer permission tiers
- **Granular File Sharing** - Time-limited, permission-scoped share links
- **Multi-Factor Authentication** - TOTP-based 2FA with QR enrollment
- **Session Management** - Sliding expiry, device fingerprinting, forced logout

### Monitoring and Audit

- **Real-time Security Dashboard** - Live threat score, event stream, active session overview
- **Immutable Audit Log** - Every read, write, share, and login attempt is recorded
- **Security Events Feed** - Categorized events: authentication, vault, sharing, system
- **AI Security Copilot** - Natural-language interface for querying security posture and vault status

### Automation

- **Automated Key Rotation** - Scheduled re-encryption with zero downtime
- **Anomaly Detection** - Baseline behavioral modeling; alerts on deviation
- **Vault Integrity Scanner** - Periodic hash verification of all stored files
- **Threat Intelligence** - Integration hooks for external IOC feeds

---

## Technology Stack

**Frontend**
- React 18 + TypeScript
- Vite (build tooling)
- Web Crypto API (native browser encryption)
- CSS custom properties (design system)

**Backend**
- Node.js + Express
- TypeScript (strict mode)
- Argon2 (password hashing)
- JSON Web Tokens (session management)
- Node.js crypto module (server-side operations)

---

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0

### Installation

Clone the repository and install dependencies:

    git clone https://github.com/rshamith777-cpu/codsoft_tasks.git
    cd codsoft_tasks/Task-1-SecureVault
    npm install
    cp .env.example .env.local

Edit .env.local and configure:
- JWT_SECRET: a random 64-character hex string
- GEMINI_API_KEY: your Gemini API key (required only for the AI Security Copilot feature)

### Running Locally

    npm run dev

Frontend: http://localhost:5173 - API server: http://localhost:3001

### Running Tests

    npm test

Runs the regression suite (tests/regression.test.ts) - 16 test cases covering encryption, authentication, RBAC, audit logging, and file sharing.

### Building for Production

    npm run build

Output is placed in dist/. Deploy with any static file host behind HTTPS.

---

## Project Structure

    Task-1-SecureVault/
    +-- src/
    |   +-- components/
    |   |   +-- ui/                    Reusable design system components
    |   |   +-- LandingView.tsx        Unauthenticated landing page
    |   |   +-- AuthModal.tsx          Login and register flow
    |   |   +-- VaultView.tsx          Encrypted file vault
    |   |   +-- OverviewView.tsx       Security dashboard overview
    |   |   +-- AuditActivityView.tsx
    |   |   +-- SecurityEventsView.tsx
    |   |   +-- SecureSharesView.tsx
    |   |   +-- SecurityCopilot.tsx    AI assistant interface
    |   |   +-- SecurityAgentsView.tsx
    |   |   +-- AutomationsView.tsx
    |   |   +-- CryptoInspectorView.tsx
    |   |   +-- SecurityArchitectureView.tsx
    |   +-- services/api.ts            Typed API client
    |   +-- types.ts                   Shared TypeScript interfaces
    |   +-- App.tsx                    Root component and routing
    |   +-- main.tsx
    |   +-- index.css                  Design system tokens and global styles
    +-- tests/regression.test.ts       Full regression suite - 16 tests
    +-- server.ts                      Express API server
    +-- package.json
    +-- vite.config.ts
    +-- tsconfig.json
    +-- .env.example

---

## Security Design Decisions

**Zero-Knowledge Encryption**: Encryption and decryption happen entirely in the browser using the Web Crypto API. The server stores only ciphertext, IV, and salt. It cannot decrypt files even with full database access.

**Key Isolation**: Each file has a unique 256-bit key derived from the user's master password and a per-file random salt. Compromise of one file key does not expose others.

**Audit Immutability**: Audit records are append-only. The API provides no endpoint to delete audit entries. All security-relevant actions generate a signed audit record.

**Defense in Depth**: Security controls are layered across the transport layer (HTTPS, HSTS, CSP), the API layer (JWT authentication, RBAC, rate limiting), and the storage layer (encryption at rest).

---

## Internship Context

**Program**: CODSOFT Cybersecurity Internship
**Task**: Task 1 - Secure File Vault
**Objective**: Build a secure file storage application demonstrating applied cryptography, authentication systems, and security monitoring.

---

## License

This project is developed for educational purposes as part of the CODSOFT internship program.