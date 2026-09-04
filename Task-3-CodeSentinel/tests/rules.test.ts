import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { executeScan } from '../server/scanner/engine.ts';
import { SECURITY_RULES } from '../server/scanner/rules.ts';

describe('CodeSentinel Rule Verification Suite — All 18 Signatures', () => {
  test('verifies all 18 security rules are registered in the engine', () => {
    assert.equal(SECURITY_RULES.length, 18);
  });

  // 1. Python SQL Injection
  test('Rule 1 (SEC-PY-SQLI-01): detects f-string unparameterized query & passes safe query', () => {
    const vuln = executeScan([{ path: 'query.py', content: 'cursor.execute(f"SELECT * FROM users WHERE id = {user_id}")' }]);
    assert.ok(vuln.findings.some(f => f.ruleId === 'SEC-PY-SQLI-01'), 'Must detect Python SQLi');

    const safe = executeScan([{ path: 'query.py', content: 'cursor.execute("SELECT * FROM users WHERE id = %s", (user_id,))' }]);
    assert.ok(!safe.findings.some(f => f.ruleId === 'SEC-PY-SQLI-01'), 'Must pass parameterized query');
  });

  // 2. JS / TS SQL Injection
  test('Rule 2 (SEC-JS-SQLI-01): detects template literal SQL interpolation & passes parameterized call', () => {
    const vuln = executeScan([{ path: 'db.ts', content: 'await db.query(`SELECT * FROM accounts WHERE id = ${req.body.id}`);' }]);
    assert.ok(vuln.findings.some(f => f.ruleId === 'SEC-JS-SQLI-01'), 'Must detect JS template SQLi');

    const safe = executeScan([{ path: 'db.ts', content: 'await db.query("SELECT * FROM accounts WHERE id = $1", [req.body.id]);' }]);
    assert.ok(!safe.findings.some(f => f.ruleId === 'SEC-JS-SQLI-01'), 'Must pass parameterized query');
  });

  // 3. Hardcoded Secret
  test('Rule 3 (SEC-GEN-SECRET-01): detects hardcoded secret assignment & passes process.env', () => {
    const vuln = executeScan([{ path: 'auth.js', content: 'const jwt_secret = "a1b2c3d4e5f6g7h8i9j0k1l2m3";' }]);
    assert.ok(vuln.findings.some(f => f.ruleId === 'SEC-GEN-SECRET-01'), 'Must detect hardcoded secret');

    const safe = executeScan([{ path: 'auth.js', content: 'const jwt_secret = process.env.JWT_SECRET;' }]);
    assert.ok(!safe.findings.some(f => f.ruleId === 'SEC-GEN-SECRET-01'), 'Must pass env var reference');
  });

  // 4. Python Command Injection
  test('Rule 4 (SEC-PY-CMDI-01): detects os.system string formatting & passes structured subprocess', () => {
    const vuln = executeScan([{ path: 'backup.py', content: 'os.system(f"tar -czf backup.tar.gz {user_dir}")' }]);
    assert.ok(vuln.findings.some(f => f.ruleId === 'SEC-PY-CMDI-01'), 'Must detect Python cmd injection');

    const safe = executeScan([{ path: 'backup.py', content: 'subprocess.run(["tar", "-czf", "backup.tar.gz", user_dir], check=True)' }]);
    assert.ok(!safe.findings.some(f => f.ruleId === 'SEC-PY-CMDI-01'), 'Must pass subprocess array');
  });

  // 5. Node.js Command Injection
  test('Rule 5 (SEC-JS-CMDI-01): detects child_process.exec template string & passes execFile', () => {
    const vuln = executeScan([{ path: 'printer.js', content: 'child_process.exec(`pdf_gen --file ${req.query.filename}`);' }]);
    assert.ok(vuln.findings.some(f => f.ruleId === 'SEC-JS-CMDI-01'), 'Must detect Node exec cmd injection');

    const safe = executeScan([{ path: 'printer.js', content: 'execFile("pdf_gen", ["--file", req.query.filename]);' }]);
    assert.ok(!safe.findings.some(f => f.ruleId === 'SEC-JS-CMDI-01'), 'Must pass execFile');
  });

  // 6. Path Traversal
  test('Rule 6 (SEC-GEN-TRAV-01): detects unvalidated path read & passes normalized path', () => {
    const vuln = executeScan([{ path: 'server.js', content: 'const data = fs.readFileSync(path.join("/uploads", req.query.filename));' }]);
    assert.ok(vuln.findings.some(f => f.ruleId === 'SEC-GEN-TRAV-01'), 'Must detect path traversal');

    const safe = executeScan([{ path: 'server.js', content: 'const safeFile = path.resolve(BASE_DIR, "default.txt");' }]);
    assert.ok(!safe.findings.some(f => f.ruleId === 'SEC-GEN-TRAV-01'), 'Must pass static file read');
  });

  // 7. Dangerous Eval
  test('Rule 7 (SEC-GEN-EVAL-01): detects eval() execution & passes JSON.parse', () => {
    const vuln = executeScan([{ path: 'calc.js', content: 'const res = eval(userExpr);' }]);
    assert.ok(vuln.findings.some(f => f.ruleId === 'SEC-GEN-EVAL-01'), 'Must detect dangerous eval');

    const safe = executeScan([{ path: 'calc.js', content: 'const res = JSON.parse(userExpr);' }]);
    assert.ok(!safe.findings.some(f => f.ruleId === 'SEC-GEN-EVAL-01'), 'Must pass JSON parser');
  });

  // 8. Weak Cryptographic Hash
  test('Rule 8 (SEC-CRYPTO-WEAK-01): detects MD5 hash creation & passes SHA-256', () => {
    const vuln = executeScan([{ path: 'hash.js', content: 'const h = crypto.createHash("md5").update(pw).digest("hex");' }]);
    assert.ok(vuln.findings.some(f => f.ruleId === 'SEC-CRYPTO-WEAK-01'), 'Must detect MD5');

    const safe = executeScan([{ path: 'hash.js', content: 'const h = crypto.createHash("sha256").update(pw).digest("hex");' }]);
    assert.ok(!safe.findings.some(f => f.ruleId === 'SEC-CRYPTO-WEAK-01'), 'Must pass SHA-256');
  });

  // 9. Python Insecure Deserialization (Pickle)
  test('Rule 9 (SEC-PY-PICKLE-01): detects pickle.loads & passes json.loads', () => {
    const vuln = executeScan([{ path: 'session.py', content: 'data = pickle.loads(raw_cookie)' }]);
    assert.ok(vuln.findings.some(f => f.ruleId === 'SEC-PY-PICKLE-01'), 'Must detect pickle.loads');

    const safe = executeScan([{ path: 'session.py', content: 'data = json.loads(raw_cookie)' }]);
    assert.ok(!safe.findings.some(f => f.ruleId === 'SEC-PY-PICKLE-01'), 'Must pass json.loads');
  });

  // 10. PHP Insecure Deserialization
  test('Rule 10 (SEC-PHP-UNSER-01): detects unserialize on POST & passes json_decode', () => {
    const vuln = executeScan([{ path: 'api.php', content: '$data = unserialize($_POST["state"]);' }]);
    assert.ok(vuln.findings.some(f => f.ruleId === 'SEC-PHP-UNSER-01'), 'Must detect PHP unserialize');

    const safe = executeScan([{ path: 'api.php', content: '$data = json_decode($_POST["state"], true);' }]);
    assert.ok(!safe.findings.some(f => f.ruleId === 'SEC-PHP-UNSER-01'), 'Must pass json_decode');
  });

  // 11. DOM XSS
  test('Rule 11 (SEC-JS-XSS-01): detects dangerouslySetInnerHTML & passes safe text node', () => {
    const vuln = executeScan([{ path: 'View.tsx', content: '<div dangerouslySetInnerHTML={{ __html: userText }} />' }]);
    assert.ok(vuln.findings.some(f => f.ruleId === 'SEC-JS-XSS-01'), 'Must detect dangerouslySetInnerHTML');

    const safe = executeScan([{ path: 'View.tsx', content: '<div>{userText}</div>' }]);
    assert.ok(!safe.findings.some(f => f.ruleId === 'SEC-JS-XSS-01'), 'Must pass safe text rendering');
  });

  // 12. Weak PBKDF2 Iterations
  test('Rule 12 (SEC-CRYPTO-ITER-01): detects low PBKDF2 iterations & passes strong count', () => {
    const vuln = executeScan([{ path: 'crypto.py', content: 'hash = hashlib.pbkdf2_hmac("sha256", pw, salt, iterations=1000)' }]);
    assert.ok(vuln.findings.some(f => f.ruleId === 'SEC-CRYPTO-ITER-01'), 'Must detect weak PBKDF2 iterations');

    const safe = executeScan([{ path: 'crypto.py', content: 'hash = hashlib.pbkdf2_hmac("sha256", pw, salt, iterations=600000)' }]);
    assert.ok(!safe.findings.some(f => f.ruleId === 'SEC-CRYPTO-ITER-01'), 'Must pass 600,000 iterations');
  });

  // 13. Insecure Randomness
  test('Rule 13 (SEC-GEN-RAND-01): detects Math.random() in token generation & passes crypto.randomBytes', () => {
    const vuln = executeScan([{ path: 'token.js', content: 'const sessionToken = Math.random().toString(36);' }]);
    assert.ok(vuln.findings.some(f => f.ruleId === 'SEC-GEN-RAND-01'), 'Must detect Math.random');

    const safe = executeScan([{ path: 'token.js', content: 'const sessionToken = crypto.randomBytes(32).toString("hex");' }]);
    assert.ok(!safe.findings.some(f => f.ruleId === 'SEC-GEN-RAND-01'), 'Must pass crypto.randomBytes');
  });

  // 14. Debug Mode Enabled
  test('Rule 14 (SEC-CONF-DEBUG-01): detects DEBUG = True & passes DEBUG = False', () => {
    const vuln = executeScan([{ path: 'settings.py', content: 'DEBUG = True' }]);
    assert.ok(vuln.findings.some(f => f.ruleId === 'SEC-CONF-DEBUG-01'), 'Must detect DEBUG=True');

    const safe = executeScan([{ path: 'settings.py', content: 'DEBUG = False' }]);
    assert.ok(!safe.findings.some(f => f.ruleId === 'SEC-CONF-DEBUG-01'), 'Must pass DEBUG=False');
  });

  // 15. Server-Side Request Forgery (SSRF)
  test('Rule 15 (SEC-GEN-SSRF-01): detects axios unvalidated request & passes static destination', () => {
    const vuln = executeScan([{ path: 'webhook.js', content: 'const res = await axios.get(req.query.url);' }]);
    assert.ok(vuln.findings.some(f => f.ruleId === 'SEC-GEN-SSRF-01'), 'Must detect SSRF vector');

    const safe = executeScan([{ path: 'webhook.js', content: 'const res = await axios.get("https://api.internal.org/status");' }]);
    assert.ok(!safe.findings.some(f => f.ruleId === 'SEC-GEN-SSRF-01'), 'Must pass static trusted URL');
  });

  // 16. Insecure Dockerfile (Root User)
  test('Rule 16 (SEC-DOCKER-ROOT-01): detects USER root in Dockerfile & passes non-root user', () => {
    const vuln = executeScan([{ path: 'Dockerfile', content: 'FROM node:18\nUSER root\nCMD ["npm", "start"]' }]);
    assert.ok(vuln.findings.some(f => f.ruleId === 'SEC-DOCKER-ROOT-01'), 'Must detect USER root');

    const safe = executeScan([{ path: 'Dockerfile', content: 'FROM node:18\nUSER node\nCMD ["npm", "start"]' }]);
    assert.ok(!safe.findings.some(f => f.ruleId === 'SEC-DOCKER-ROOT-01'), 'Must pass unprivileged user');
  });

  // 17. XML External Entity (XXE)
  test('Rule 17 (SEC-GEN-XXE-01): detects unsafe xml.etree & passes defusedxml', () => {
    const vuln = executeScan([{ path: 'parse.py', content: 'import xml.etree.ElementTree as ET\ntree = ET.fromstring(payload)' }]);
    assert.ok(vuln.findings.some(f => f.ruleId === 'SEC-GEN-XXE-01'), 'Must detect unsafe XML parser');

    const safe = executeScan([{ path: 'parse.py', content: 'import defusedxml.ElementTree as ET\ntree = ET.fromstring(payload)' }]);
    assert.ok(!safe.findings.some(f => f.ruleId === 'SEC-GEN-XXE-01'), 'Must pass defusedxml');
  });

  // 18. Cleartext Storage of Sensitive Data
  test('Rule 18 (SEC-GEN-CLEARTEXT-01): detects localStorage sensitive token & passes httpOnly cookie', () => {
    const vuln = executeScan([{ path: 'login.js', content: 'localStorage.setItem("authToken", token);' }]);
    assert.ok(vuln.findings.some(f => f.ruleId === 'SEC-GEN-CLEARTEXT-01'), 'Must detect cleartext localStorage');

    const safe = executeScan([{ path: 'login.js', content: 'sessionStorage.setItem("theme", "dark");' }]);
    assert.ok(!safe.findings.some(f => f.ruleId === 'SEC-GEN-CLEARTEXT-01'), 'Must pass non-sensitive storage');
  });
});
