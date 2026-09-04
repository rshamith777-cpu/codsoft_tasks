# CodeSentinel — Secure Code Assessment & Vulnerability Intelligence Platform

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)](#testing)
[![Test Coverage](https://img.shields.io/badge/tests-45%20passed-brightgreen.svg)](#testing)
[![Security Audited](https://img.shields.io/badge/security-hardened-blue.svg)](#security-controls)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](#)

CodeSentinel is an enterprise-grade Static Application Security Testing (SAST) and vulnerability intelligence platform designed for AppSec engineers, DevSecOps practitioners, and security analysts. It provides deterministic, zero-hallucination source code vulnerability detection across multi-file codebases, structural AST analysis, cryptographic strength auditing, OWASP Top 10 / MITRE CWE taxonomy mapping, differential scan comparison, immutable security audit logging, and an isolated, server-side Security Copilot advisory assistant.

---

## CODSOFT Task 3 — Secure Code Assessment

This project represents the complete, hardened implementation for **CODSOFT Cybersecurity Internship Task 3: Secure Code Assessment**.

### Task Objective
Build an automated static code analysis engine that inspects source code for security vulnerabilities, enforces secure coding standards, identifies high-risk programming patterns, maps findings against industry standards (OWASP / CWE), calculates quantitative security risk scores, generates compliance reports, and provides verifiable remediation guidance.

### Implementation Highlights
- **100% Deterministic SAST Core**: Vulnerability detection is governed entirely by AST and deterministic pattern rules—never delegated to generative AI for detection.
- **18 Enterprise Detection Signatures**: Broad coverage across injection, authentication, broken cryptography, SSRF, XXE, insecure deserialization, path traversal, and security misconfigurations.
- **Full Operational Console**: Overview dashboard, multi-file scanner, finding intelligence with line-accurate evidence, interactive source code explorer, rule intelligence catalog, historical scan delta comparisons, audit trail logging, and OWASP/CWE compliance mapping.
- **Hardened Security Architecture**: Zip Slip extraction defense, strict input payload limits, strict MIME validation, XSS mitigation, zero client-side secret exposure, and prompt injection isolation for the Copilot AI assistant.

---

## Key Capabilities

1. **Deterministic Static Code Analysis**:
   - High-throughput scanning of single files, multi-file projects, and compressed ZIP archives.
   - Comprehensive multi-language support (JavaScript, TypeScript, Python, Java, Go, C/C++, PHP, Shell, and Dockerfiles).
   - Zero external scanner dependencies; runs locally and self-contained.

2. **Finding Intelligence & Evidence Triangulation**:
   - Structural vulnerability metadata including CWE ID, OWASP Top 10 category, severity (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`, `INFO`), and confidence scoring (`CONFIRMED`, `HIGH`, `MEDIUM`, `LOW`).
   - Line-indexed source snippets displaying vulnerable lines and contextual boundary tokens.
   - Prescriptive remediation steps and contextual security impact analysis for developers.

3. **In-Browser Source Code Explorer**:
   - Interactive tree-view project explorer with direct navigation from vulnerability findings to exact line coordinates.
   - Visual risk indicators on file trees and syntax-highlighted code views.

4. **Historical Diff & Regression Analysis**:
   - Side-by-side comparative analysis between any two scans.
   - Categorizes findings into `NEW` (introduced vulnerabilities), `RESOLVED` (fixed issues), `UNCHANGED` (persistent tech debt), and `REGRESSED` (worsened severity).
   - Score delta tracking to measure security posture progression over time.

5. **Security Audit Logging**:
   - Structured audit trails recording scans, exports, configuration updates, and AI interactions.
   - Exportable in JSON format for enterprise SIEM ingestion.

6. **Executive & Technical Reporting**:
   - Export scan results to structured JSON, CSV spreadsheets, and clean printable audit reports.

7. **Security Copilot (AI Advisory Layer)**:
   - Server-side isolated assistant powered by Google Gemini models (`gemini-2.5-flash`, `gemini-2.0-flash`, `gemini-1.5-flash`).
   - Purely advisory: explains detected findings, reasons about attack chains, and drafts safe code patches. Never responsible for scanner truth.

---

## Security Analysis Engine

CodeSentinel operates a two-tier evaluation pipeline:

```
+------------------+     +-------------------+     +--------------------+
|  Raw Source Code | --> | Structural Lexing | --> | Rule Evaluation    |
|  or ZIP Archive  |     | & Line Indexing   |     | (18 Deterministic) |
+------------------+     +-------------------+     +--------------------+
                                                             |
                                                             v
+------------------+     +-------------------+     +--------------------+
| Executive Report | <-- | Quantitative Risk | <-- | Structural Finding |
| & SIEM Export    |     | Scoring (0 - 100) |     | Model Generation   |
+------------------+     +-------------------+     +--------------------+
```

### Quantitative Security Scoring Model
The platform computes a standardized security score between `0` and `100` based on finding severity density:

$$\text{Security Score} = \max\left(0, 100 - (25 \times N_{\text{Critical}} + 12 \times N_{\text{High}} + 5 \times N_{\text{Medium}} + 2 \times N_{\text{Low}})\right)$$

- **90 – 100**: Low Risk (A-Grade)
- **70 – 89**: Moderate Risk (B-Grade)
- **50 – 69**: Elevated Risk (C-Grade)
- **0 – 49**: Critical Risk (Urgent Remediation Required)

---

## Detection Rules

CodeSentinel incorporates 18 production-hardened SAST rules covering critical threat vectors:

| Rule ID | Name | Severity | CWE | OWASP Top 10 | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `SEC-INJ-SQL-01` | SQL Injection Pattern | **CRITICAL** | CWE-89 | A03:2021-Injection | String concatenation or formatted values inside raw SQL execution calls |
| `SEC-AUTH-CRED-01` | Hardcoded Credentials & Secrets | **CRITICAL** | CWE-798 | A07:2021-Auth Failures | Hardcoded API keys, bearer tokens, private keys, or passwords |
| `SEC-INJ-CMD-01` | Command Injection Vulnerability | **CRITICAL** | CWE-78 | A03:2021-Injection | Execution of system commands using unvalidated variable inputs |
| `SEC-DESER-UNSAFE-01`| Insecure Object Deserialization | **CRITICAL** | CWE-502 | A08:2021-Integrity Failures | Deserialization of untrusted bytecode or serialized payloads |
| `SEC-PATH-TRAV-01` | Path Traversal / LFI Pattern | **HIGH** | CWE-22 | A01:2021-Broken Access | Unsanitized filesystem read/write operations using relative dot paths |
| `SEC-CODE-EVAL-01` | Dynamic Code Evaluation (`eval`) | **HIGH** | CWE-95 | A03:2021-Injection | Use of `eval()`, `exec()`, or dynamic runtime compiler functions |
| `SEC-SSRF-REQ-01` | Server-Side Request Forgery | **HIGH** | CWE-918 | A10:2021-SSRF | HTTP client calls targeting arbitrary URLs composed of user input |
| `SEC-XML-XXE-01` | XML External Entity Injection (XXE) | **HIGH** | CWE-611 | A05:2021-Security Misconfig | XML parsers configured with external DTD entities enabled |
| `SEC-XSS-DOM-01` | DOM-based Cross-Site Scripting | **HIGH** | CWE-79 | A03:2021-Injection | Direct assignments to `innerHTML`, `outerHTML`, or `document.write` |
| `SEC-CRYPTO-WEAK-01` | Broken Cryptographic Hash (MD5/SHA1)| **MEDIUM** | CWE-328 | A02:2021-Cryptographic | Obsolete hash algorithms applied in security-sensitive contexts |
| `SEC-CRYPTO-RAND-01` | Insecure Pseudorandom Generation | **MEDIUM** | CWE-338 | A02:2021-Cryptographic | `Math.random()` or `rand()` used where cryptographic entropy is required |
| `SEC-CRYPTO-ITER-01` | Weak PBKDF2 Iteration Count | **MEDIUM** | CWE-916 | A02:2021-Cryptographic | Key derivation configured with under 100,000 hashing rounds |
| `SEC-CONF-DEBUG-01` | Production Debug Mode Enabled | **MEDIUM** | CWE-489 | A05:2021-Security Misconfig | Development or debug flags left active in deployable configuration |
| `SEC-CONF-DOCKER-ROOT`| Container Running as Privileged Root| **MEDIUM** | CWE-250 | A05:2021-Security Misconfig | Container configuration lacking unprivileged user directive (`USER`) |
| `SEC-GEN-CLEARTEXT-01`| Cleartext Sensitive Local Storage | **MEDIUM** | CWE-312 | A02:2021-Cryptographic | Sensitive authentication tokens stored in unencrypted browser storage |
| `SEC-CONF-CORS-01` | Overly Permissive CORS Policy | **LOW** | CWE-942 | A05:2021-Security Misconfig | Access-Control-Allow-Origin header set to unrestricted wildcard (`*`) |
| `SEC-CONF-COOKIE-01`| Insecure Session Cookie Flags | **LOW** | CWE-614 | A05:2021-Security Misconfig | Session cookies missing `HttpOnly`, `Secure`, or `SameSite` flags |
| `SEC-LOG-INFO-01` | Potential Information Leak via Log | **INFO** | CWE-532 | A09:2021-Logging Failures | Sensitive variable dumps inside stdout or diagnostic logs |

---

## Finding Intelligence

Every vulnerability identified by CodeSentinel generates a strongly typed `Finding` record:

```typescript
interface Finding {
  id: string;              // Deterministic UUID based on scan, file, line, and rule
  scanId: string;          // Parent scan reference
  ruleId: string;          // Matched detection rule identifier
  title: string;           // Canonical vulnerability title
  severity: Severity;      // CRITICAL | HIGH | MEDIUM | LOW | INFO
  confidence: Confidence;  // CONFIRMED | HIGH | MEDIUM | LOW
  cwe: string;             // MITRE Common Weakness Enumeration ID (e.g., CWE-89)
  owasp: string;           // OWASP Top 10 (2021) Category mapping
  file: string;            // Relative normalized file path
  line: number;            // 1-indexed vulnerable line number
  column?: number;         // Column offset when available
  evidence: string;        // Exact code snippet extracted from source
  description: string;     // Technical explanation of the detected flaw
  securityImpact: string;  // Concrete exploit impact on CIA triad
  remediation: string;     // Prescriptive developer remediation guidance
  scanner: string;         // Detection engine signature
  detectedAt: string;      // ISO-8601 detection timestamp
}
```

---

## Source Explorer

The interactive Source Explorer connects security findings directly with code:
- **Hierarchical File Tree**: Visual representation of project directories with severity-badged vulnerability counts per file.
- **Synchronized Line Jumping**: Selecting any finding jumps the code viewport directly to the targeted source line.
- **Vulnerability Highlights**: High-contrast markers differentiate affected source segments from clean code.
- **Read-Only Inspection**: Zero risk of inadvertent modification during security assessment.

---

## Scan History

CodeSentinel maintains a persistent, JSON-backed scan repository (`data/scans.json`):
- **Immutability & Integrity**: All completed assessments are saved with timestamp, file counts, analyzed line counts, findings array, and calculated score.
- **Fail-Safe Recovery**: Corrupted or empty storage files are automatically backed up and reconstituted gracefully without server downtime.
- **Scan Retention & Deletion**: Individual historical assessments can be inspected, compared, or expunged through the UI with explicit confirmation.

---

## Scan Comparison

To support continuous verification and regression tracking, CodeSentinel provides a dedicated differential analysis module:
- **Baseline vs. Target Selection**: Select any baseline scan and compare it against a subsequent scan.
- **Delta Categorization**:
  - `NEW`: Vulnerabilities introduced in the target scan.
  - `RESOLVED`: Vulnerabilities fixed between baseline and target.
  - `UNCHANGED`: Unresolved vulnerabilities remaining across both scans.
  - `REGRESSED`: Vulnerabilities whose severity increased due to code refactoring.
- **Posture Progression**: Visual indicators displaying net score improvement or degradation.

---

## Reports

Export scan results in multiple standardized formats:
- **JSON**: Full-fidelity scan export containing metadata, findings, rule configurations, and metrics for pipeline automation.
- **CSV**: Flattened tabular export formatted for spreadsheet review, bug tracker import (Jira, GitHub Issues), or risk reporting.
- **Printable Audit Report**: Clean, high-contrast document view formatted for browser printing and PDF generation.

---

## Compliance Mapping

CodeSentinel maps all findings to industry-recognized cybersecurity frameworks:
- **OWASP Top 10 (2021)**: Full distribution mapping across A01 (Broken Access Control) through A10 (SSRF).
- **MITRE CWE Top 25**: Classification against most dangerous software weaknesses.
- **Honest Mapped Coverage**: Explicitly presented as *Mapped Coverage* rather than claiming formal certification.

---

## Security Architecture

```
+-------------------------------------------------------------------------+
|                               Browser (React)                           |
|  - Strictly typed UI      - DOM XSS Defenses   - Hash-based Routing     |
|  - Zero Secret Exposure   - Strict Sanitization- No Direct Provider API |
+-------------------------------------------------------------------------+
                                    |
                           HTTP / REST API (CORS)
                                    |
+-------------------------------------------------------------------------+
|                             Node.js Server                              |
|  - Security Middleware    - Rate Limiting      - Strict JSON Validation |
|  - Zip Slip Protection    - Size Bounds Checks - Safe Error Formatting  |
|  - Deterministic Scanner  - Local File Storage - Audit Trail Engine     |
+-------------------------------------------------------------------------+
                                    |
                          Server-Side Only HTTPS
                                    |
+-------------------------------------------------------------------------+
|                     Google Gemini API (Optional)                        |
|  - Upstream AI Provider   - Isolated Prompts   - Delimited Context      |
+-------------------------------------------------------------------------+
```

---

## Copilot Architecture

The Security Copilot acts as an isolated advisory layer with strict architectural boundaries:

1. **Server-Side API Key Storage**: The Gemini API key is never exposed to the frontend, never placed in build artifacts, never sent over client responses, and never logged.
2. **Deterministic Source of Truth**: The Copilot does not perform vulnerability scanning. It only analyzes findings already confirmed by the deterministic SAST engine.
3. **Prompt Injection Defense**:
   - Source code and evidence are treated as **untrusted data**.
   - Input is strictly isolated using `<untrusted_code>` XML boundary tags.
   - Explicit system instructions forbid the model from executing instructions contained within user-supplied source files.
4. **Resilient Multi-Model Fallback**:
   - Primary: `gemini-2.5-flash`
   - Secondary: `gemini-2.0-flash`
   - Fallback: `gemini-1.5-flash`
5. **Safe Error Masking**: Provider errors, network timeouts, or quota limits return sanitized user messages without stack traces, local paths, or credentials.

---

## Security Controls

| Category | Mitigation Implemented |
| :--- | :--- |
| **Path Traversal / Zip Slip** | Strict path normalization; verification that extracted archive targets remain strictly inside sandboxed temporary directories; rejection of `..` segments. |
| **Denial of Service (DoS)** | Request body limits (25MB max project upload), per-file limits (2MB max), archive entry counts (500 files max), and timeout safeguards. |
| **Secret Management** | Zero client-side API keys; `.env` excluded from version control; server-only configuration loading. |
| **Error Leakage** | Centralized `formatSafeError` utility prevents internal stack traces, database details, or absolute filesystem paths from reaching HTTP responses. |
| **HTTP Hardening** | Security headers enforced via middleware: `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, and `X-XSS-Protection: 1; mode=block`. |
| **Audit Logging** | Immutable append-only log capturing all major security actions with timestamps and client metadata. |

---

## Testing

CodeSentinel maintains a comprehensive automated test suite consisting of **45 passing unit and integration tests**:

```bash
# Execute full automated test suite
npm test
```

### Test Suite Breakdown
- **`tests/rules.test.ts` (18 tests)**: Positive and negative detection cases for every SAST rule, ensuring zero false positives on compliant code.
- **`tests/scanner.test.ts` (6 tests)**: Scanner lifecycle validation, empty input handling, multi-file execution, large file benchmarks, and invalid syntax resilience.
- **`tests/scoring.test.ts` (4 tests)**: Verification of risk score mathematical boundaries (clamping between 0 and 100) and severity weight calculations.
- **`tests/upload-security.test.ts` (5 tests)**: Archive security tests verifying Zip Slip traversal rejection, oversized file blocking, and empty archive rejection.
- **`tests/persistence.test.ts` (3 tests)**: Scan persistence verification, atomic writes, and corrupt JSON auto-recovery.
- **`tests/copilot.test.ts` (5 tests)**: Prompt injection defense verification, delimiter enforcement, provider error masking, and graceful missing-key handling.
- **`tests/security.test.ts` (4 tests)**: Security header verification, path sanitization utilities, and production bundle secret checks.

---

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Lucide React Icons
- **Build Tooling**: Vite 6, Rollup, PostCSS, Autoprefixer
- **Backend**: Node.js, Express, ESBuild
- **Archive Processing**: Adm-Zip with custom path validation
- **AI Advisory**: Google Gemini REST API (`@google/genai` compliant direct HTTPS integration)
- **Testing**: Node.js native test runner (`node --test`), TSX runtime

---

## Project Structure

```
codesentinel/
├── data/                       # Persistent data stores (auto-created)
│   ├── scans.json              # Historical scan database
│   └── audit_log.json          # Security audit trail log
├── server/                     # Backend server architecture
│   ├── scanner/                # Deterministic SAST analysis engine
│   │   ├── rules.ts            # 18 SAST detection signatures
│   │   └── engine.ts           # Multi-file analysis & scoring engine
│   ├── gemini.ts               # Isolated Gemini Copilot integration
│   ├── securityMiddleware.ts   # Zip Slip, validation & error formatting
│   └── storage.ts              # Resilient JSON persistence & scan diffing
├── src/                        # Frontend React application
│   ├── components/             # Modular product views
│   │   ├── Overview.tsx        # Command center & metric aggregation
│   │   ├── ScannerView.tsx     # Assessment engine & upload workflows
│   │   ├── FindingsView.tsx    # Finding intelligence & filtering
│   │   ├── SourceExplorer.tsx  # Code viewer & line-accurate jumping
│   │   ├── RuleIntelligence.tsx# SAST signature catalog & inspector
│   │   ├── HistoryView.tsx     # Historical assessment database
│   │   ├── ScanComparisonView.tsx # Differential scan delta analysis
│   │   ├── AuditTrailView.tsx  # Security event log & SIEM export
│   │   ├── ComplianceView.tsx  # OWASP & CWE taxonomy coverage
│   │   ├── ReportsView.tsx     # JSON, CSV & printable report generator
│   │   ├── SettingsDocsView.tsx# Configuration & technical docs
│   │   ├── SecurityCopilotModal.tsx # Advisory AI panel
│   │   ├── CommandPalette.tsx  # Keyboard-driven navigation (Ctrl+K)
│   │   └── BackgroundCanvas.tsx# Unified visual design atmosphere
│   ├── App.tsx                 # Main application shell & router
│   ├── types.ts                # Domain types & schema definitions
│   └── main.tsx                # React entry point
├── tests/                      # Automated test suite (45 tests)
│   ├── scanner.test.ts
│   ├── rules.test.ts
│   ├── scoring.test.ts
│   ├── upload-security.test.ts
│   ├── persistence.test.ts
│   ├── copilot.test.ts
│   └── security.test.ts
├── .env.example                # Sample environment configuration
├── package.json                # Dependencies & scripts
├── server.ts                   # Express server entry point
├── tsconfig.json               # TypeScript configuration
├── vite.config.ts              # Vite configuration
└── README.md                   # Platform documentation
```

---

## Installation

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### Steps
```bash
# Clone the repository
git clone https://github.com/your-username/codsoft_tasks.git
cd codsoft_tasks/Task-3-CodeSentinel

# Install dependencies
npm install
```

---

## Environment Configuration

Copy the example environment template to `.env`:

```bash
cp .env.example .env
```

Configure the following variables in `.env` as needed:

```env
# Server Port
PORT=3000

# Environment Mode
NODE_ENV=development

# Optional: Google Gemini API Key
# (Required only for the optional AI Copilot advisory assistant)
GEMINI_API_KEY="your-gemini-api-key-here"
```

> **Note**: CodeSentinel's SAST scanner, reporting, compliance mapping, diff engine, and audit logging are **100% functional without an API key**. The Gemini API key is only utilized for the interactive Copilot chat assistant.

---

## Running Locally

### Development Mode
Runs both the Express API server and the Vite development server with Hot Module Replacement (HMR):

```bash
npm run dev
```

The application will be accessible at: `http://localhost:3000`

### Production Build
Builds the optimized client bundle and compiles the standalone backend server:

```bash
# Compile client assets and server bundle
npm run build

# Start production server
npm start
```

### Running Tests
Execute the comprehensive automated test suite:

```bash
npm test
```

---

## Security Notes

1. **Scanner Integrity**: All vulnerability detections are deterministic. No AI hallucinated findings are introduced into assessment reports.
2. **Sandbox Safety**: Uploaded source files are processed in-memory or in isolated temporary buffers and are never executed or evaluated at runtime.
3. **API Key Confidentiality**: The Gemini API key is strictly maintained server-side. It is never transmitted to the browser or embedded into client bundles.

---

## CODSOFT Internship

This repository was developed as part of the **CODSOFT Cybersecurity Internship Program**.
- **Track**: Cybersecurity / Application Security
- **Project**: Task 3 — Secure Code Assessment
- **Objective**: Design and build an automated Static Application Security Testing (SAST) platform for enterprise vulnerability identification.

---

## Author

- **Developer**: Sumith R
- **Program**: CODSOFT Cybersecurity Internship
- **Role**: Security Engineering & Full-Stack Development
