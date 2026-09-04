import { GoogleGenAI, Type } from '@google/genai';
import { Finding, AIAnalysisResponse } from '../src/types.ts';

let aiClient: GoogleGenAI | null = null;

function getGenAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

export async function analyzeFindingWithAI(finding: Finding): Promise<AIAnalysisResponse> {
  const ai = getGenAI();

  if (!ai) {
    // Deterministic rule-based fallback when GEMINI_API_KEY is not configured
    return {
      findingId: finding.id,
      exploitMechanics: `Static analysis detected ${finding.title} (${finding.cwe}). An adversary can supply malicious input to exploit ${finding.evidence} in ${finding.file} at line ${finding.line}.`,
      attackVector: `Direct input injection or manipulated parameter payload targeting line ${finding.line}.`,
      potentialImpact: finding.impact || 'High risk of unauthorized data access, privilege escalation, or code execution.',
      remediationGuidance: finding.remediation || 'Refactor the line to use parameterized queries, strict input validation, or safe cryptographic libraries.',
      secureCodePatch: finding.fixSnippet || '// Replace vulnerable implementation with parameterized logic\n' + finding.evidence,
      cveReferences: [finding.cwe, 'OWASP-Top-10-2021'],
      mitigationPriority: finding.severity === 'CRITICAL' ? 'IMMEDIATE' : finding.severity === 'HIGH' ? 'HIGH' : 'SCHEDULED'
    };
  }

  try {
    const prompt = `You are a Principal Application Security Engineer assessing a static code analysis finding.
Analyze the following REAL security finding detected in source code:

Finding ID: ${finding.id}
Vulnerability: ${finding.title}
CWE: ${finding.cwe} (${finding.cweTitle || 'N/A'})
Severity: ${finding.severity}
File: ${finding.file}
Line: ${finding.line}
Vulnerable Evidence: ${finding.evidence}
Code Snippet:
${finding.codeSnippet}

Provide a deep, authoritative technical assessment of this exact finding:
1. Exploit mechanics (how an attacker would trigger it)
2. Attack vector
3. Potential business & technical impact
4. Remediation step-by-step guidance
5. Drop-in secure code replacement patch
6. Related real-world CVE patterns or CWE references
7. Mitigation priority (IMMEDIATE, HIGH, or SCHEDULED)`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        systemInstruction: 'You are CodeSentinel AI Security Copilot. You analyze real security findings provided by the static analysis engine. You output precise technical vulnerability analysis and patched code.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            exploitMechanics: { type: Type.STRING, description: 'Technical mechanics of how this flaw can be exploited' },
            attackVector: { type: Type.STRING, description: 'Specific entrypoint and delivery vector' },
            potentialImpact: { type: Type.STRING, description: 'Consequences of successful exploitation' },
            remediationGuidance: { type: Type.STRING, description: 'Step-by-step engineering fix instructions' },
            secureCodePatch: { type: Type.STRING, description: 'Clean, drop-in replacement secure source code' },
            cveReferences: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Related CVE or CWE identifiers'
            },
            mitigationPriority: {
              type: Type.STRING,
              description: 'IMMEDIATE, HIGH, or SCHEDULED'
            }
          },
          required: ['exploitMechanics', 'attackVector', 'potentialImpact', 'remediationGuidance', 'secureCodePatch', 'mitigationPriority']
        }
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    return {
      findingId: finding.id,
      exploitMechanics: parsed.exploitMechanics || finding.description,
      attackVector: parsed.attackVector || 'Untrusted user input vector',
      potentialImpact: parsed.potentialImpact || finding.impact,
      remediationGuidance: parsed.remediationGuidance || finding.remediation,
      secureCodePatch: parsed.secureCodePatch || finding.fixSnippet || finding.evidence,
      cveReferences: parsed.cveReferences || [finding.cwe],
      mitigationPriority: (parsed.mitigationPriority as any) || (finding.severity === 'CRITICAL' ? 'IMMEDIATE' : 'HIGH')
    };
  } catch (error) {
    console.error('Gemini Copilot analysis error:', error);
    return {
      findingId: finding.id,
      exploitMechanics: `Vulnerability: ${finding.title} in ${finding.file}:${finding.line}. ${finding.description}`,
      attackVector: 'Untrusted input parameter exploitation.',
      potentialImpact: finding.impact,
      remediationGuidance: finding.remediation,
      secureCodePatch: finding.fixSnippet || finding.evidence,
      cveReferences: [finding.cwe],
      mitigationPriority: finding.severity === 'CRITICAL' ? 'IMMEDIATE' : 'HIGH'
    };
  }
}

export async function askSecurityCopilot(question: string, contextFinding?: Finding): Promise<string> {
  const ai = getGenAI();
  if (!ai) {
    return `CodeSentinel Security Copilot Assistant: 
When evaluating ${contextFinding ? contextFinding.title + ' (' + contextFinding.cwe + ')' : 'secure code vulnerabilities'}, always enforce defense-in-depth, input sanitization, parameterized execution, and zero-trust authentication boundaries. (Connect Gemini API Key in Settings > Secrets for customized interactive responses).`;
  }

  try {
    const contextPrompt = contextFinding 
      ? `Context Finding: ${contextFinding.title} (${contextFinding.cwe}) in ${contextFinding.file}:${contextFinding.line}\nEvidence: ${contextFinding.evidence}\nDescription: ${contextFinding.description}\n\n`
      : '';

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: `${contextPrompt}User Question: ${question}`,
      config: {
        systemInstruction: 'You are CodeSentinel AI Security Copilot, a senior Application Security expert. Give concise, highly technical, actionable security answers with code examples where relevant.'
      }
    });

    return response.text || 'Unable to generate security advice at this time.';
  } catch (err: any) {
    console.error('Copilot Chat error:', err);
    return `Security Copilot encountered an error: ${err?.message || 'Please verify network and API parameters.'}`;
  }
}
