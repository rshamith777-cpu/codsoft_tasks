# Sovereign Network Defense & Incident Intelligence Workstation

A network packet analysis and defensive security workstation for inspecting traffic, identifying suspicious behavior, correlating detections, investigating incidents, preserving evidence, and supporting analyst-led response.

---

## Overview

The Sovereign Network Defense & Incident Intelligence Workstation is a full-stack security operations application that integrates a real-time packet capture engine, a deterministic multi-rule threat detection system, a structured incident management lifecycle, a cryptographic evidence vault, a security agent orchestration layer, and an automation engine — all accessible through a React-based analyst workstation UI.

The backend is a Node.js/Express server (`server.ts`) that coordinates all security subsystems. The Python capture engine (`capture_engine.py`) handles live interface capture and PCAP file replay, communicating results back to the backend. The frontend is built with React and Vite.

---

## Capabilities

| Capability | Status |
|---|---|
| Live packet capture (via Python capture engine + Scapy) | Implemented |
| PCAP file import and replay | Implemented |
| Packet inspection and hex/ASCII payload view | Implemented |
| OSI protocol dissection (TCP, UDP, DNS, HTTP, HTTPS, ICMP, ARP) | Implemented |
| Deterministic threat detection (15 rules) | Implemented |
| IOC watchlist matching | Implemented |
| MITRE ATT&CK technique enrichment | Implemented |
| Network anomaly and baseline deviation analysis | Implemented |
| Incident correlation and lifecycle management | Implemented |
| Evidence vault with SHA-256 fingerprints | Implemented |
| Chain of custody tracking | Implemented |
| Audit trail (immutable) | Implemented |
| Role-based access control (ADMIN / ANALYST / VIEWER) | Implemented |
| Security agent orchestration (15 agents) | Implemented |
| Automation engine (17 rules) | Implemented |
| AI Security Copilot (Gemini-assisted analysis) | Implemented |
| Network entity relationship graph | Implemented |
| Command palette (keyboard-driven navigation) | Implemented |
| Forensic PDF report export | Implemented |
| Prompt injection protection | Implemented |

---

## Detection Engine

The `DefensiveDetectionEngine` evaluates every captured or imported packet against 15 deterministic, stateful detection rules. Rules are backed by configurable thresholds and sliding time windows.

| Rule ID | Name | MITRE Technique | Category |
|---|---|---|---|
| RULE-001 | SYN Port Sweep Detection | T1046 Network Service Discovery | Reconnaissance |
| RULE-002 | ICMP Echo Flood | T1498 Network Denial of Service | Denial of Service |
| RULE-003 | Potential C2 Outbound Beaconing | T1071 Application Layer Protocol | Command and Control |
| RULE-004 | DNS Query Rate & Label Anomaly | T1071.004 DNS | Exfiltration / C2 |
| RULE-005 | Unusual Destination Port | T1571 Non-Standard Port | Lateral Movement / C2 |
| RULE-006 | Broadcast Storm / Large Datagram | T1499 Endpoint Denial of Service | Denial of Service |
| RULE-007 | Abnormal TCP Flag Combination | T1046 Network Service Discovery | Reconnaissance |
| RULE-008 | ARP Spoofing / Duplicate IP Binding | T1557.002 ARP Poisoning | Credential Access / MITM |
| RULE-009 | Configured IOC Watchlist Match | T1071 Application Layer Protocol | Threat Intelligence |
| RULE-010 | TCP SYN Flood / Rate Exhaustion | T1498 Network Denial of Service | Denial of Service |
| RULE-011 | UDP Volumetric Flood | T1498.001 Direct Network Flood | Denial of Service |
| RULE-012 | Brute Force Authentication Probing | T1110 Brute Force | Credential Access |
| RULE-013 | Lateral Movement / Internal SMB Probing | T1021.002 SMB/Windows Admin Shares | Lateral Movement |
| RULE-014 | Clear-Text Credential Exposure | T1552 Unsecured Credentials | Credential Access |
| RULE-015 | Oversized / Jumbo Exfiltration Anomaly | T1041 Exfiltration Over C2 Channel | Exfiltration |

All rules are individually enable/disable controllable at runtime. Each generated alert includes a `recommendedAction` field with analyst-facing remediation guidance.

---

## Security Agents

The `SecurityAgentOrchestrator` (`server/agentOrchestrator.ts`) implements 15 specialist security agents. Each agent uses deterministic logic grounded in packet data and alert state. Where configured, agents optionally invoke the Gemini API for supplementary analyst narrative, but all primary decisions are deterministic.

| Agent | Purpose |
|---|---|
| **Packet Triage** | Classifies individual packets as NORMAL / REVIEW / SUSPICIOUS / HIGH PRIORITY based on protocol, port, and active alerts |
| **Threat Correlation** | Groups alerts by source host and creates consolidated incident workspaces with confidence scoring |
| **Protocol Analyst** | Explains observed protocol behavior in analyst-readable form: what happened, why it matters, security relevance |
| **Incident Investigator** | Builds investigation workspaces: entity extraction, forensic timeline, MITRE summary, and recommended next steps |
| **Detection Engineering** | Reviews false positive patterns and drafts detection rule threshold adjustment proposals |
| **Network Baseline** | Computes statistical traffic baselines (protocol distribution, throughput, top talkers) from captured sessions |
| **Evidence & Timeline** | Constructs a structured forensic timeline from correlated packets, alerts, and incident events |
| **Security Report** | Generates structured security reports (Executive, Operational, Forensic, Compliance) from session data |
| **IOC Hunter** | Scans all captured packets against the active IOC watchlist and produces a detailed match report |
| **ATT&CK Mapper** | Maps observed alert and incident data to MITRE ATT&CK tactics and techniques |
| **Anomaly Investigator** | Investigates baseline deviation events and explains statistical outlier findings |
| **False Positive Analyst** | Reviews alert history to identify over-triggering rules and recommends suppression adjustments |
| **Incident Summarizer** | Produces concise tactical summaries of open incidents for analyst briefings |
| **Evidence Validator** | Re-verifies all evidence vault artifacts and reports on integrity health |
| **Response Planner** | Drafts a structured containment and response plan based on the current incident state |

---

## Automation Engine

The `SecurityAutomationEngine` (`server/automationEngine.ts`) operates 17 automated workflow rules that respond to system events without requiring manual analyst intervention. Human approval is required for any disruptive or rule-change actions.

| ID | Name | Trigger | Requires Approval |
|---|---|---|---|
| AUTO-001 | High-Severity Alert to Incident | ALERT_TRIGGERED (High/Critical) | No |
| AUTO-002 | Incident Evidence Aggregation | INCIDENT_CREATED | No |
| AUTO-003 | Session Stop Summarizer | CAPTURE_STOPPED | No |
| AUTO-004 | PCAP Ingestion Pipeline | PCAP_IMPORTED | No |
| AUTO-005 | Source Alert Clustering | MULTIPLE_ALERTS_SAME_SRC | No |
| AUTO-006 | Incident Resolution Report | INCIDENT_RESOLVED | No |
| AUTO-007 | Session Baseline Delta Assessment | CAPTURE_STARTED | No |
| AUTO-008 | MITRE ATT&CK Enrichment | THREAT_RULE_MATCH | No |
| AUTO-009 | Forensic Export Audit Record | DATA_EXPORT | No |
| AUTO-010 | Automated Rule Testing on Proposal | RULE_PROPOSED | **Yes** |
| AUTO-011 | Repeated Alert Escalation | REPEATED_ALERT_THRESHOLD | No |
| AUTO-012 | Evidence Integrity Failure Alarm | TAMPER_ALERT_RAISED | No |
| AUTO-013 | Known Malicious IOC Detection | IOC_MATCH_FOUND | No |
| AUTO-014 | Statistical Baseline Deviation Trigger | BASELINE_DEVIATION | No |
| AUTO-015 | Evidence Retention Threshold Review | RETENTION_STATUS_CHECK | No |
| AUTO-016 | Repeated False Positive Rule Tuning | FALSE_POSITIVE_FLAGGED | **Yes** |
| AUTO-017 | Critical Incident Analyst Notification | CRITICAL_INCIDENT_OPENED | No |

---

## Incident Lifecycle

Incidents pass through a defined status progression managed by the Automation Engine and analysts:

```
NEW
 └─► TRIAGED
       └─► INVESTIGATING
             └─► CONTAINMENT_PENDING
                   └─► CONTAINED
                         └─► RESOLVED
```

`FALSE_POSITIVE` is a terminal state that an analyst can set on any incident at any stage. Each status transition is recorded in the immutable audit trail.

---

## Evidence & Chain of Custody

The `EvidenceVault` (`server/evidenceVault.ts`) provides cryptographic evidence preservation:

- **SHA-256 fingerprinting**: Every preserved artifact receives a deterministic `contentHash` computed from its raw content using `crypto.createHash('sha256')`.
- **Preservation**: Each artifact is stored with type, source, metadata, creation timestamp, and a locked retention state.
- **Chain of custody log**: Every access action (PRESERVED, VIEWED, EXPORTED, VERIFIED) appends a `CustodyRecord` to the artifact's custody log.
- **Integrity verification**: The `verifyIntegrity()` method re-computes the SHA-256 hash for every artifact and compares it against the stored `contentHash`. Any mismatch marks the artifact as `TAMPERED` and raises a `CRITICAL_INTEGRITY_ALERT` audit entry.
- **Tamper detection**: If evidence is modified after preservation, verification will detect and report the discrepancy. AUTO-012 then automatically creates a Critical incident.
- **Export auditing**: Any data export triggers AUTO-009 to record a forensic export audit entry.

---

## RBAC

Three roles with enforced authorization at the server layer:

| Role | Capabilities |
|---|---|
| **ADMIN** | Full access: manage users, configure rules, approve proposals, perform all analyst operations |
| **ANALYST** | Capture, analyze, investigate incidents, manage evidence, run agents and automations |
| **VIEWER** | Read-only access to packets, alerts, incidents, reports, and evidence vault |

Authorization is enforced server-side via the `requireRole` and `requireAuth` middleware in `server/securityMiddleware.ts`. Role checks occur before any privileged API handler executes.

Default seeded accounts (for development/demo):

```
admin   / admin123  -> ADMIN
analyst / analyst123 -> ANALYST
viewer  / viewer123 -> VIEWER
```

> Change credentials before any production deployment.

---

## AI Security Copilot

The AI Security Copilot (`server/agentOrchestrator.ts`, `src/components/SecurityCopilotModal.tsx`) is a supplementary analyst-assistance feature powered by the Gemini API.

Key constraints applied:

- **Untrusted data isolation**: Raw packet payloads, DNS query strings, HTTP headers, and any network-originated content are wrapped by `sanitizeAndWrapUntrustedPayload()` (`server/securityMiddleware.ts`) before inclusion in any prompt. This content is explicitly labeled as untrusted data context and is structurally separated from system instructions.
- **No autonomous action**: AI output is advisory. The Copilot produces analysis, summaries, and recommendations. No AI recommendation is executed automatically without a human analyst decision.
- **Graceful degradation**: If `GEMINI_API_KEY` is not configured, the agent orchestrator operates entirely in deterministic mode. All detection, correlation, and incident management continues normally.

---

## Query / Investigation Features

The Packet Analysis and Filters views support field-based filtering of captured traffic. Supported filter syntax:

```
ip:<address>          Match source or destination IP
src:<address>         Match source IP only
dst:<address>         Match destination IP only
port:<number>         Match source or destination port
protocol:<name>       Match by protocol name (TCP, UDP, DNS, HTTP, HTTPS, ICMP, ARP)
tcp.flags:<flags>     Match TCP flag states
flags:<flags>         Alias for tcp.flags
dns:<query>           Match DNS query string content
http:<value>          Match HTTP info field content
alert:<type>          Filter by alert type substring
```

---

## Architecture

```
+-------------------------------------------------------------+
|                  Analyst Workstation (Browser)               |
|         React + Vite + TailwindCSS + Recharts + jsPDF       |
+---------------------------+---------------------------------+
                            |  HTTP / REST (Express)
+---------------------------v---------------------------------+
|                  Backend Server (server.ts)                  |
|              Node.js + Express + TypeScript                  |
+--------------+------------+---------------+-----------------+
|  Detection   |  Agent     |  Automation   |  Evidence       |
|  Engine      | Orchestrat.|  Engine       |  Vault          |
|  (15 rules)  | (15 agents)|  (17 rules)   |  (SHA-256)      |
+--------------+------------+---------------+-----------------+
|  Auth Service  |  Security Middleware  |  PCAP Decoder      |
+----------------+-----------------------+--------------------+
|               Python Capture Engine (capture_engine.py)      |
|                   Scapy  /  PCAP file replay                 |
+-------------------------------------------------------------+
```

Data flow:

```
Live Interface / PCAP File
        |
  capture_engine.py (Scapy)
        |
  Parsing / Normalization (server.ts)
        |
  DefensiveDetectionEngine (15 rules)
        |
  SecurityAutomationEngine (17 automation rules)
        |
  SecurityAgentOrchestrator (15 agents)
        |
  Incident Management + Evidence Vault + Audit Trail
        |
  Analyst UI (React)
```

---

## Technology Stack

### Frontend

| Package | Purpose |
|---|---|
| React 19 | UI framework |
| Vite 6 | Build tool and dev server |
| TailwindCSS 4 | Utility CSS |
| Recharts 3 | Traffic and statistics charts |
| Lucide React | Icon system |
| Motion | Animation library |
| jsPDF | PDF forensic report export |

### Backend

| Package | Purpose |
|---|---|
| Node.js + TypeScript | Runtime |
| Express 4 | HTTP API server |
| tsx | TypeScript execution for development |
| esbuild | Production server bundle |
| @google/genai 2 | Gemini API client for AI Copilot |
| dotenv | Environment variable loading |

### Capture Engine

| Component | Purpose |
|---|---|
| Python 3 | Capture engine runtime |
| Scapy | Live interface packet capture and PCAP decode |

### Testing

| Command | Purpose |
|---|---|
| `npm test` | Run automated security test suite |
| `npm run lint` | TypeScript type checking |

---

## Project Structure

```
Task-2-Network-Packet-Analyzer/
|-- server.ts                    # Express backend: API routes and subsystem bootstrap
|-- capture_engine.py            # Python packet capture engine (Scapy, PCAP replay)
|-- index.html                   # Vite entry HTML
|-- package.json                 # Node.js project manifest and scripts
|-- tsconfig.json                # TypeScript configuration
|-- vite.config.ts               # Vite frontend build configuration
|-- bun.lock                     # Dependency lockfile
|-- package-lock.json            # npm lockfile
|-- metadata.json                # Application metadata
|-- .env.example                 # Environment variable template
|-- .gitignore                   # Git ignore rules
|
|-- server/                      # Backend security subsystems
|   |-- agentOrchestrator.ts     # 15 specialist security agents
|   |-- automationEngine.ts      # 17 automation rules + incident management
|   |-- authService.ts           # PBKDF2 authentication + session management
|   |-- detectionEngine.ts       # 15 deterministic detection rules + IOC watchlist
|   |-- evidenceVault.ts         # SHA-256 evidence vault + chain of custody
|   |-- pcapDecoder.ts           # PCAP file decoding (server-side)
|   `-- securityMiddleware.ts    # RBAC, prompt injection protection, input validation
|
|-- src/                         # React frontend
|   |-- App.tsx                  # Application root and routing
|   |-- main.tsx                 # Vite entry point
|   |-- index.css                # Global styles
|   |-- types.ts                 # Shared TypeScript type definitions
|   |-- components/              # UI views and modals
|   |   |-- DashboardView.tsx
|   |   |-- LiveCaptureView.tsx
|   |   |-- PacketAnalysisView.tsx
|   |   |-- ThreatAlertsView.tsx
|   |   |-- IncidentsAndAgentsView.tsx
|   |   |-- EvidenceVaultView.tsx
|   |   |-- NetworkEntityGraphView.tsx
|   |   |-- ReportsView.tsx
|   |   |-- StatisticsView.tsx
|   |   |-- FiltersView.tsx
|   |   |-- SettingsView.tsx
|   |   |-- SecurityCopilotModal.tsx
|   |   |-- CommandPaletteModal.tsx
|   |   |-- AuthPage.tsx
|   |   `-- ...
|   `-- data/
|       |-- demoPackets.ts
|       `-- mockTrafficGenerator.ts
|
|-- test/                        # Automated test suite
|   |-- run_security_tests.ts    # Security and functional test runner
|   `-- fixtures/
|       `-- pcapFixtures.ts      # Deterministic PCAP-equivalent packet fixtures
|
`-- assets/                      # Static assets
```

---

## Installation

**Prerequisites:** Node.js 20+, Python 3.9+ (for live capture), npm

```bash
# Clone the repository
git clone https://github.com/rshamith777-cpu/codsoft_tasks.git
cd codsoft_tasks/Task-2-Network-Packet-Analyzer

# Install Node.js dependencies
npm install

# (Optional) Install Python capture engine dependencies
pip install scapy
```

---

## Configuration

Copy the environment template:

```bash
cp .env.example .env.local
```

Set variables in `.env.local`:

```env
# Required for AI Security Copilot (optional -- system runs fully deterministic without it)
GEMINI_API_KEY=your_gemini_api_key_here

# Application base URL (used for self-referential links)
APP_URL=http://localhost:3000
```

> **Never commit `.env.local` or any file containing real API keys.** The `.gitignore` excludes `.env*` by default (`.env.example` is the only committed template).

---

## Running Locally

Start the development server (backend + frontend together via Vite middleware):

```bash
npm run dev
```

The Express backend serves both the REST API and the Vite frontend. Open `http://localhost:3000` in your browser.

### Live Packet Capture

Live capture requires elevated OS privileges for raw socket access:

- **Linux/macOS**: Run with `sudo` or grant the Python binary `CAP_NET_RAW` capability
- **Windows**: Run as Administrator

The backend spawns `capture_engine.py` as a subprocess when a capture session starts. The Python engine uses Scapy to bind to the selected network interface and stream parsed packets to the backend.

---

## Testing

Run the automated security test suite:

```bash
npm test
```

The test suite (`test/run_security_tests.ts`) covers:

- Packet attribute conformance (protocol, ports, TCP flags)
- Capture statistics accuracy (deterministic, no random numbers)
- Detection engine rule accuracy (port scan, ICMP flood, C2 beaconing, DNS anomaly, ARP spoofing, TCP flag scans, IOC matching)
- Incident correlation correctness
- Evidence vault integrity (SHA-256 hash verification, tamper detection)
- Security middleware (input sanitization, RBAC enforcement, prompt injection protection)
- Agent deterministic output validation

Type-check the project:

```bash
npm run lint
```

Build the production bundle:

```bash
npm run build
```

---

## Security Considerations

**Privileged packet capture**: Live capture requires raw socket access. This should only be granted to trusted operators in a controlled environment. The capture engine runs as a subprocess isolated from the frontend.

**RBAC enforcement**: Authorization checks are enforced server-side before any privileged API handler executes. Frontend role state is not trusted for access decisions.

**Input validation**: All request bodies are validated at the API layer. Oversized inputs and unexpected types are rejected with structured error responses.

**PCAP handling**: Imported PCAP files are decoded in a controlled parser. Malformed frames are logged and skipped; they do not crash the server or allow code injection.

**Prompt injection protection**: Any data originating from the network (packet payloads, DNS queries, HTTP info fields) is wrapped in a labeled untrusted context block by `sanitizeAndWrapUntrustedPayload()` before inclusion in any AI prompt. This prevents network-originated content from masquerading as system instructions.

**API key isolation**: The `GEMINI_API_KEY` is loaded server-side only and never transmitted to the frontend or included in any client-facing response.

**Evidence integrity**: Evidence artifacts are SHA-256 fingerprinted at preservation time. Continuous and on-demand verification detects tampering. Any integrity failure raises a Critical audit event.

**Human approval gates**: Automation rules that propose detection rule changes (AUTO-010) or adjust false positive thresholds (AUTO-016) require explicit analyst approval before execution.

---

## CODSOFT Internship Task

**Program:** CODSOFT Cyber Security Internship  
**Task:** Network Packet Analyzer

---

## Author

**Shamith R**  
GitHub: [https://github.com/rshamith777-cpu](https://github.com/rshamith777-cpu)
