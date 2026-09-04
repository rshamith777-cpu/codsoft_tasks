import { SecurityRule, Severity } from '../../src/types.ts';

export interface RuleDefinition extends SecurityRule {
  fileExtensions: string[];
  pattern?: RegExp;
  customChecker?: (content: string, lines: string[]) => Array<{
    line: number;
    column?: number;
    evidence: string;
    codeSnippet: string;
    customDescription?: string;
  }>;
}

export const SECURITY_RULES: RuleDefinition[] = [
  // 1. SQL Injection (Python)
  {
    id: 'SEC-PY-SQLI-01',
    name: 'Unparameterized SQL Query Construction',
    cwe: 'CWE-89',
    cweTitle: 'Improper Neutralization of Special Elements used in an SQL Command',
    owasp: 'A03:2021-Injection',
    severity: 'CRITICAL',
    language: 'python',
    fileExtensions: ['.py'],
    pattern: /(?:cursor|db|conn|connection|session|engine)\.(?:execute|executemany|raw|query)\s*\(\s*(?:f['"][^'"]*\{|['"][^'"]*%s*['"]\s*%|['"][^'"]*\+|(?:f?['"][^'"]*SELECT|INSERT|UPDATE|DELETE)[^'"]*format\()/i,
    description: 'User-controlled input or string interpolation is incorporated into an SQL query without parameterized placeholders, allowing attackers to manipulate queries, extract unauthorized database records, or execute arbitrary SQL commands.',
    detectionMethod: 'AST & Pattern Matching on SQL execution calls using f-strings, % formatting, or string concatenation.',
    impact: 'Full database compromise, unauthorized data exfiltration, authentication bypass, data destruction.',
    remediation: 'Use parameterized queries with bind variables (e.g., cursor.execute("SELECT * FROM users WHERE id = %s", (user_id,))) or ORM abstractions with safe query builders.',
    exampleVulnerable: 'cursor.execute(f"SELECT * FROM users WHERE username = \'{username}\'")',
    exampleSecure: 'cursor.execute("SELECT * FROM users WHERE username = %s", (username,))'
  },
  // 2. SQL Injection (Node.js / JS / TS)
  {
    id: 'SEC-JS-SQLI-01',
    name: 'SQL String Concatenation in Database Call',
    cwe: 'CWE-89',
    cweTitle: 'SQL Injection via Template Literals / String Concatenation',
    owasp: 'A03:2021-Injection',
    severity: 'CRITICAL',
    language: 'javascript',
    fileExtensions: ['.js', '.ts', '.jsx', '.tsx', '.mjs'],
    pattern: /(?:db|pool|client|sequelize|knex|connection|prisma)\.(?:query|raw|execute)\s*\(\s*(?:`[^`]*\${|\s*["'][^"']*\s*\+)/i,
    description: 'Dynamic SQL query constructed using JavaScript template literals or string concatenation instead of parameterized prepared statements.',
    detectionMethod: 'Pattern match on SQL execution methods receiving template string interpolations.',
    impact: 'Remote database extraction, record alteration, unauthorized authentication bypass.',
    remediation: 'Utilize parameterized queries ($1, ?, or named parameters) passed as the second argument array to db.query().',
    exampleVulnerable: 'const res = await db.query(`SELECT * FROM accounts WHERE id = ${req.body.id}`);',
    exampleSecure: 'const res = await db.query("SELECT * FROM accounts WHERE id = $1", [req.body.id]);'
  },
  // 3. Hardcoded Secret / API Key
  {
    id: 'SEC-GEN-SECRET-01',
    name: 'Hardcoded Cryptographic Key / API Secret',
    cwe: 'CWE-798',
    cweTitle: 'Use of Hard-coded Credentials',
    owasp: 'A07:2021-Identification and Authentication Failures',
    severity: 'HIGH',
    language: 'generic',
    fileExtensions: ['.py', '.js', '.ts', '.go', '.java', '.php', '.json', '.env', '.yaml', '.yml'],
    pattern: /(?:api[_-]?key|jwt[_-]?secret|auth[_-]?token|client[_-]?secret|private[_-]?key|aws[_-]?secret|db[_-]?password|access[_-]?token)\s*(?:=|:)\s*["'][A-Za-z0-9_\-+/=]{16,}["']/i,
    description: 'Sensitive API keys, JWT signing tokens, private keys, or passwords are hardcoded in source code files instead of being loaded securely from environment variables.',
    detectionMethod: 'High-entropy credential regex analysis detecting secret key assignment statements.',
    impact: 'Credential leakage via source control, unauthorized infrastructure or API access, credential replay.',
    remediation: 'Load secrets dynamically from process.env or a secure key management system (e.g. AWS Secrets Manager, GCP Secret Manager, Vault).',
    exampleVulnerable: 'const JWT_SECRET = "example_dummy_jwt_secret_token_key_9940";',
    exampleSecure: 'const JWT_SECRET = process.env.JWT_SECRET;'
  },
  // 4. Command Injection (Python)
  {
    id: 'SEC-PY-CMDI-01',
    name: 'OS Command Injection via Shell Execution',
    cwe: 'CWE-78',
    cweTitle: 'Improper Neutralization of Special Elements used in an OS Command',
    owasp: 'A03:2021-Injection',
    severity: 'CRITICAL',
    language: 'python',
    fileExtensions: ['.py'],
    pattern: /(?:os\.system|os\.popen|subprocess\.call|subprocess\.Popen|subprocess\.run)\s*\(\s*(?:f['"][^'"]*\{|['"][^'"]*%s*['"]\s*%|['"][^'"]*\+|[a-zA-Z0-9_]+(?:\s*,\s*shell\s*=\s*True))/i,
    description: 'OS command executed through shell interpreter with unvalidated user input or shell=True enabled, permitting command chaining and arbitrary system command execution.',
    detectionMethod: 'Inspection of os.system and subprocess invocations with shell=True or string interpolation.',
    impact: 'Complete server takeover, arbitrary code execution, lateral network movement.',
    remediation: 'Use subprocess.run() with shell=False and pass arguments as a structured list of strings without shell interpolation.',
    exampleVulnerable: 'os.system(f"ping -c 1 {host}")',
    exampleSecure: 'subprocess.run(["ping", "-c", "1", host], check=True, shell=False)'
  },
  // 5. Command Injection (Node.js)
  {
    id: 'SEC-JS-CMDI-01',
    name: 'Command Injection via Child Process Exec',
    cwe: 'CWE-78',
    cweTitle: 'Improper Neutralization of Special Elements used in an OS Command',
    owasp: 'A03:2021-Injection',
    severity: 'CRITICAL',
    language: 'javascript',
    fileExtensions: ['.js', '.ts', '.jsx', '.tsx'],
    pattern: /(?:child_process|cp)?\.(?:exec|execSync)\s*\(\s*(?:`[^`]*\${|["'][^"']*\+)/i,
    description: 'Child process execution using exec/execSync with string concatenation or template literals allows attackers to append command separators (; , && , |) and run malicious shell binaries.',
    detectionMethod: 'Regex detection on child_process.exec invocations with dynamic arguments.',
    impact: 'Host compromise, container escape, reverse shell deployment, data destruction.',
    remediation: 'Use execFile or spawn with fixed argument arrays rather than exec with shell parsing.',
    exampleVulnerable: 'exec(`pdf_generator --id ${req.query.id}`, callback);',
    exampleSecure: 'execFile("pdf_generator", ["--id", req.query.id], callback);'
  },
  // 6. Path Traversal / Arbitrary File Read
  {
    id: 'SEC-GEN-TRAV-01',
    name: 'Arbitrary File Read / Path Traversal',
    cwe: 'CWE-22',
    cweTitle: 'Improper Limitation of a Pathname to a Restricted Directory',
    owasp: 'A01:2021-Broken Access Control',
    severity: 'HIGH',
    language: 'generic',
    fileExtensions: ['.py', '.js', '.ts', '.php', '.go'],
    pattern: /(?:open|fs\.readFileSync|fs\.readFile|fs\.createReadStream|file_get_contents|os\.Open)\s*\(\s*(?:f['"][^'"]*\{|`[^`]*\${|path\.join\([^)]*(?:req\.|params|query|body)|["'][^'"]*\+\s*(?:filename|file_path|user_path|req))/i,
    description: 'File system access using user-provided paths without canonical path validation, allowing directory traversal sequences (../) to read sensitive system files (e.g. /etc/passwd).',
    detectionMethod: 'File reading API detection receiving untrusted input without path normalization checks.',
    impact: 'Sensitive system file disclosure, configuration leakage, source code exfiltration.',
    remediation: 'Validate input against an allowlist, use path.resolve, and verify the resulting path starts with the intended base directory using path.normalize.',
    exampleVulnerable: 'const data = fs.readFileSync(path.join("/uploads", req.query.filename));',
    exampleSecure: 'const safePath = path.resolve(BASE_DIR, path.basename(req.query.filename)); if (!safePath.startsWith(BASE_DIR)) throw new Error("Access denied");'
  },
  // 7. Dangerous Eval / Code Injection
  {
    id: 'SEC-GEN-EVAL-01',
    name: 'Dynamic Code Evaluation (Dangerous Eval)',
    cwe: 'CWE-94',
    cweTitle: 'Improper Control of Generation of Code (\'Code Injection\')',
    owasp: 'A03:2021-Injection',
    severity: 'CRITICAL',
    language: 'generic',
    fileExtensions: ['.py', '.js', '.ts', '.php', '.rb'],
    pattern: /(?:\beval\s*\(|\bexec\s*\(|new\s+Function\s*\(|vm\.runInThisContext\s*\()/i,
    description: 'Direct execution of dynamic strings as executable programming code using eval(), exec(), or Function constructor.',
    detectionMethod: 'Detection of eval/Function/exec calls on dynamic expressions.',
    impact: 'Arbitrary Remote Code Execution (RCE) with the full privileges of the application process.',
    remediation: 'Refactor code to use structured data parsers (e.g., JSON.parse) or mathematical expression parsers rather than eval.',
    exampleVulnerable: 'const result = eval(userCalculationExpression);',
    exampleSecure: 'const result = mathjs.evaluate(userCalculationExpression);'
  },
  // 8. Weak Cryptographic Hashing
  {
    id: 'SEC-CRYPTO-WEAK-01',
    name: 'Use of Broken Cryptographic Hash Algorithm (MD5 / SHA1)',
    cwe: 'CWE-327',
    cweTitle: 'Use of a Broken or Risky Cryptographic Algorithm',
    owasp: 'A02:2021-Cryptographic Failures',
    severity: 'MEDIUM',
    language: 'generic',
    fileExtensions: ['.py', '.js', '.ts', '.go', '.java', '.php'],
    pattern: /(?:hashlib\.(?:md5|sha1)|crypto\.createHash\s*\(\s*["'](?:md5|sha1)["']|md5\s*\(|sha1\s*\(|md5\.New\(\)|sha1\.New\(\))/i,
    description: 'Use of deprecated cryptographic hashing algorithms (MD5 or SHA-1) susceptible to collision attacks and rainbow table precomputation.',
    detectionMethod: 'Analysis of cryptographic algorithm identifiers passed to standard hashing libraries.',
    impact: 'Hash collision attacks, password cracking, integrity verification tampering.',
    remediation: 'Upgrade to collision-resistant algorithms such as SHA-256 / SHA-512, or use Argon2id / bcrypt for password hashing.',
    exampleVulnerable: 'const hash = crypto.createHash("md5").update(password).digest("hex");',
    exampleSecure: 'const hash = await argon2.hash(password);'
  },
  // 9. Insecure Deserialization (Python Pickle)
  {
    id: 'SEC-PY-PICKLE-01',
    name: 'Insecure Object Deserialization via Pickle',
    cwe: 'CWE-502',
    cweTitle: 'Deserialization of Untrusted Data',
    owasp: 'A08:2021-Software and Data Integrity Failures',
    severity: 'CRITICAL',
    language: 'python',
    fileExtensions: ['.py'],
    pattern: /(?:pickle|_pickle|cPickle)\.(?:loads|load)\s*\(/i,
    description: 'Python pickle deserialization of untrusted payloads triggers immediate arbitrary code execution via object __reduce__ magic methods.',
    detectionMethod: 'Pattern match on pickle.loads or pickle.load calls on user-supplied input streams.',
    impact: 'Remote Code Execution (RCE) on host process.',
    remediation: 'Use safe data serialization formats like JSON (json.loads) or Protocol Buffers, avoiding object serialization engines.',
    exampleVulnerable: 'user_session = pickle.loads(base64.b64decode(cookie_data))',
    exampleSecure: 'user_session = json.loads(cookie_data)'
  },
  // 10. Insecure Deserialization (PHP unserialize)
  {
    id: 'SEC-PHP-UNSER-01',
    name: 'Unsafe PHP Object Deserialization',
    cwe: 'CWE-502',
    cweTitle: 'Deserialization of Untrusted Data',
    owasp: 'A08:2021-Software and Data Integrity Failures',
    severity: 'CRITICAL',
    language: 'php',
    fileExtensions: ['.php'],
    pattern: /\bunserialize\s*\(\s*(?:\$_|\$user|\$data|\$input|\$cookie)/i,
    description: 'PHP unserialize() on untrusted user data allows POP (Property Oriented Programming) gadget chain execution leading to RCE.',
    detectionMethod: 'Regex match on PHP unserialize invocations taking input variables.',
    impact: 'Remote code execution, file manipulation, privilege escalation.',
    remediation: 'Use json_decode() for structured data exchange instead of unserialize().',
    exampleVulnerable: '$obj = unserialize($_POST["payload"]);',
    exampleSecure: '$obj = json_decode($_POST["payload"], true);'
  },
  // 11. Cross-Site Scripting (XSS / React / DOM)
  {
    id: 'SEC-JS-XSS-01',
    name: 'Direct DOM HTML Injection (innerHTML / dangerouslySetInnerHTML)',
    cwe: 'CWE-79',
    cweTitle: 'Improper Neutralization of Input During Web Page Generation',
    owasp: 'A03:2021-Injection',
    severity: 'HIGH',
    language: 'javascript',
    fileExtensions: ['.js', '.ts', '.jsx', '.tsx', '.html'],
    pattern: /(?:dangerouslySetInnerHTML\s*=\s*\{\s*\{\s*__html\s*:|\.innerHTML\s*=\s*(?:[a-zA-Z0-9_]+|`[^`]*\${)|\.outerHTML\s*=)/i,
    description: 'Unescaped user input rendered directly into the DOM via innerHTML or React dangerouslySetInnerHTML without sanitization, permitting Cross-Site Scripting (XSS).',
    detectionMethod: 'Detection of dangerouslySetInnerHTML and direct innerHTML assignments.',
    impact: 'Session hijacking, stolen authentication tokens, defacement, malicious client-side execution.',
    remediation: 'Render user data as safe text nodes, or sanitize HTML using DOMPurify before rendering.',
    exampleVulnerable: '<div dangerouslySetInnerHTML={{ __html: userContent }} />',
    exampleSecure: '<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userContent) }} />'
  },
  // 12. Weak Password PBKDF2 Iterations
  {
    id: 'SEC-CRYPTO-ITER-01',
    name: 'Insufficient Key Derivation Iterations',
    cwe: 'CWE-916',
    cweTitle: 'Use of Password Hash With Insufficient Computational Effort',
    owasp: 'A02:2021-Cryptographic Failures',
    severity: 'MEDIUM',
    language: 'generic',
    fileExtensions: ['.py', '.js', '.ts', '.go', '.java'],
    pattern: /(?:pbkdf2[a-zA-Z0-9_]*|hash_password|derive_key|bcrypt)\s*\([^)]*(?:iterations\s*=\s*(?:[1-9][0-9]{0,3}|[1-5][0-9]{4})\b|,\s*(?:[1-9][0-9]{0,3}|[1-5][0-9]{4})\s*,)/i,
    description: 'Password derivation function configured with insufficient iteration count (under 100,000 iterations for PBKDF2), making hashed passwords vulnerable to GPU brute-force cracking.',
    detectionMethod: 'Parameter value threshold check on key derivation iteration counts.',
    impact: 'Rapid password cracking of stolen database hashes.',
    remediation: 'Configure PBKDF2 with at least 600,000 iterations (OWASP recommendation) or migrate to Argon2id.',
    exampleVulnerable: 'hash = hashlib.pbkdf2_hmac("sha256", password, salt, 1000)',
    exampleSecure: 'hash = hashlib.pbkdf2_hmac("sha256", password, salt, 600000)'
  },
  // 13. Insecure Randomness for Security Tokens
  {
    id: 'SEC-GEN-RAND-01',
    name: 'Use of Cryptographically Insecure Pseudo-Random Generator',
    cwe: 'CWE-330',
    cweTitle: 'Use of Insufficiently Random Values',
    owasp: 'A02:2021-Cryptographic Failures',
    severity: 'MEDIUM',
    language: 'generic',
    fileExtensions: ['.py', '.js', '.ts', '.go', '.java', '.php'],
    pattern: /(?:Math\.random\(\)|random\.randint|random\.choice|random\.random|rand\.Intn\()/i,
    description: 'Non-cryptographic pseudo-random number generator used in security-sensitive operations such as token generation, password resets, or cryptographic nonces.',
    detectionMethod: 'Detection of Math.random / Python random module in token generation contexts.',
    impact: 'Token prediction, session hijacking, password reset takeover.',
    remediation: 'Use cryptographically secure PRNGs such as crypto.randomBytes() (Node.js), secrets module (Python), or crypto/rand (Go).',
    exampleVulnerable: 'const resetToken = Math.random().toString(36).substring(2);',
    exampleSecure: 'const resetToken = crypto.randomBytes(32).toString("hex");'
  },
  // 14. Debug Mode Enabled in Production
  {
    id: 'SEC-CONF-DEBUG-01',
    name: 'Debug / Verbose Diagnostic Mode Enabled',
    cwe: 'CWE-489',
    cweTitle: 'Active Debug Code in Production',
    owasp: 'A05:2021-Security Misconfiguration',
    severity: 'LOW',
    language: 'generic',
    fileExtensions: ['.py', '.js', '.ts', '.json', '.env', '.yaml', '.yml'],
    pattern: /(?:DEBUG\s*=\s*True|app\.debug\s*=\s*True|debug:\s*true|"debug":\s*true)/i,
    description: 'Application framework debug mode is enabled, exposing detailed stack traces, environment secrets, and interactive debug consoles to potential adversaries.',
    detectionMethod: 'Configuration flag check for active debug attributes.',
    impact: 'Information disclosure, exposure of internal architecture, potential interactive shell access.',
    remediation: 'Set DEBUG = False in production configurations and rely on structured error logging.',
    exampleVulnerable: 'app.run(debug=True, host="0.0.0.0")',
    exampleSecure: 'app.run(debug=False, host="0.0.0.0")'
  },
  // 15. Server-Side Request Forgery (SSRF)
  {
    id: 'SEC-GEN-SSRF-01',
    name: 'Potential Server-Side Request Forgery (SSRF)',
    cwe: 'CWE-918',
    cweTitle: 'Server-Side Request Forgery (SSRF)',
    owasp: 'A10:2021-Server-Side Request Forgery',
    severity: 'HIGH',
    language: 'generic',
    fileExtensions: ['.py', '.js', '.ts', '.go', '.php'],
    pattern: /(?:requests\.(?:get|post|put)|axios\.(?:get|post)|fetch|http\.Get|curl_exec)\s*\(\s*(?:req\.|params|query|url|target_url|user_url)/i,
    description: 'HTTP request initiated to an unvalidated, user-supplied URL allows attackers to target internal cloud metadata endpoints (169.254.169.254) or local internal services.',
    detectionMethod: 'HTTP client invocation taking unvalidated user parameters as request target.',
    impact: 'Cloud IAM credential theft from metadata services, internal network port scanning, internal service compromise.',
    remediation: 'Validate destination URLs against an allowlist of permitted hostnames and block private/loopback IP address ranges (RFC 1918, link-local).',
    exampleVulnerable: 'const resp = await axios.get(req.query.webhookUrl);',
    exampleSecure: 'if (!isAllowedDomain(req.query.webhookUrl)) throw new Error("Forbidden host"); const resp = await axios.get(req.query.webhookUrl);'
  },
  // 16. Insecure Dockerfile Configuration (Root User)
  {
    id: 'SEC-DOCKER-ROOT-01',
    name: 'Container Configured to Run as Root User',
    cwe: 'CWE-250',
    cweTitle: 'Execution with Unnecessary Privileges',
    owasp: 'A05:2021-Security Misconfiguration',
    severity: 'LOW',
    language: 'dockerfile',
    fileExtensions: ['Dockerfile', '.dockerfile'],
    pattern: /USER\s+root/i,
    description: 'Docker container explicitly configures the runtime user as root, increasing blast radius in the event of a container breakout vulnerability.',
    detectionMethod: 'Dockerfile directive check for USER root.',
    impact: 'Container breakout leading to host operating system privilege compromise.',
    remediation: 'Create and switch to an unprivileged user (e.g. USER node or USER appuser) in the Dockerfile.',
    exampleVulnerable: 'USER root',
    exampleSecure: 'RUN adduser -D appuser && USER appuser'
  },
  // 17. XML External Entity Injection (XXE)
  {
    id: 'SEC-GEN-XXE-01',
    name: 'Unsafe XML Parsing with External Entity Resolution',
    cwe: 'CWE-611',
    cweTitle: 'Improper Restriction of XML External Entity Reference',
    owasp: 'A05:2021-Security Misconfiguration',
    severity: 'HIGH',
    language: 'generic',
    fileExtensions: ['.py', '.js', '.ts', '.java', '.php'],
    pattern: /(?:xml\.etree\.ElementTree|xml\.sax|lxml\.etree|DocumentBuilderFactory|xml_parser_create|DOMParser)\b(?![^;]*disallow-doctype-decl)/i,
    description: 'XML parser instantiated without explicitly disabling DTDs or external entity expansion, leaving the system vulnerable to XML External Entity (XXE) attacks.',
    detectionMethod: 'XML parsing library usage check without secure parser configuration flags.',
    impact: 'Local file disclosure, internal SSRF, Denial of Service via billion laughs attack.',
    remediation: 'Disable external entity resolution (resolve_entities=False or FEATURE_SECURE_PROCESSING) or use defusedxml in Python.',
    exampleVulnerable: 'import xml.etree.ElementTree as ET\ntree = ET.fromstring(xml_payload)',
    exampleSecure: 'import defusedxml.ElementTree as ET\ntree = ET.fromstring(xml_payload)'
  },
  // 18. Cleartext Storage of Sensitive Data
  {
    id: 'SEC-GEN-CLEARTEXT-01',
    name: 'Cleartext Storage / Transmission of Sensitive Data',
    cwe: 'CWE-312',
    cweTitle: 'Cleartext Storage of Sensitive Information',
    owasp: 'A02:2021-Cryptographic Failures',
    severity: 'MEDIUM',
    language: 'generic',
    fileExtensions: ['.py', '.js', '.ts', '.go', '.json', '.env'],
    pattern: /(?:localStorage\.setItem\s*\(\s*["'][a-zA-Z0-9_]*(?:token|password|auth|credit_card|ssn)[a-zA-Z0-9_]*["']|http:\/\/(?!localhost|127\.0\.0\.1))/i,
    description: 'Sensitive credentials or security tokens stored in unencrypted client storage (localStorage) or transmitted over unencrypted HTTP channels.',
    detectionMethod: 'Identification of insecure browser storage calls with sensitive keys or cleartext HTTP protocols.',
    impact: 'Credential theft via client-side XSS or network eavesdropping on insecure channels.',
    remediation: 'Use secure, HttpOnly, SameSite cookies with HTTPS for session credentials.',
    exampleVulnerable: 'localStorage.setItem("authToken", token);',
    exampleSecure: 'document.cookie = `authToken=${token}; Secure; HttpOnly; SameSite=Strict`;'
  }
];
