export interface DemoFile {
  path: string;
  language: string;
  content: string;
}

export const DEMO_PROJECT_NAME = 'Apex Bank & API Microservice';

export const DEMO_FILES: DemoFile[] = [
  {
    path: 'backend/auth.py',
    language: 'python',
    content: `"""
Apex Banking Authentication Service
Handles user login, JWT tokens, and password hashing.
"""
import hashlib
import os
import sqlite3
import jwt

# WARNING: Security issues present in this module
JWT_SECRET_KEY = "apex_super_secret_jwt_signing_key_2026_x991"
DEBUG_MODE = True

def authenticate_user(username, password):
    conn = sqlite3.connect('database.db')
    cursor = conn.cursor()
    
    # CWE-89: SQL Injection via f-string query formatting
    query = f"SELECT id, username, role FROM users WHERE username = '{username}'"
    cursor.execute(query)
    user = cursor.fetchone()
    
    if not user:
        return None
        
    # CWE-916: Insufficient PBKDF2 iterations (1000 instead of 600,000)
    derived_hash = hashlib.pbkdf2_hmac('sha256', password.encode(), b'salt_static', 1000)
    
    # Issue: Hardcoded JWT secret key
    token = jwt.encode({"user_id": user[0], "role": user[1]}, JWT_SECRET_KEY, algorithm="HS256")
    return {"token": token, "user": user[1]}

def debug_diagnostic_dump():
    # CWE-489: Active Debug Code in Production
    if DEBUG_MODE:
        return {"jwt_secret": JWT_SECRET_KEY, "debug": True, "os_env": dict(os.environ)}
    return {"status": "ok"}
`
  },
  {
    path: 'backend/database.py',
    language: 'python',
    content: `"""
Database Connection and Query Execution Module
"""
import sqlite3
import os

DATABASE_URI = "sqlite:///database.db"

def get_connection():
    return sqlite3.connect('database.db')

def search_customer_records(search_term):
    conn = get_connection()
    cursor = conn.cursor()
    
    # CWE-89: SQL Injection in query construction
    cursor.execute(f"SELECT id, name, balance, account_number FROM accounts WHERE name LIKE '%{search_term}%'")
    records = cursor.fetchall()
    conn.close()
    return records

def backup_database(destination_path):
    # CWE-78: OS Command Injection via shell format
    os.system(f"sqlite3 database.db .dump > {destination_path}")
    return True
`
  },
  {
    path: 'backend/routes/payment.ts',
    language: 'typescript',
    content: `import { Request, Response } from 'express';
import { exec } from 'child_process';
import { db } from '../db';

export async function processTransfer(req: Request, res: Response) {
  const { accountId, targetAccount, amount } = req.body;
  
  // CWE-89: SQL Injection in Node.js via template literal
  const result = await db.query(\`SELECT balance FROM accounts WHERE id = \${accountId}\`);
  
  if (result.rows[0].balance < amount) {
    return res.status(400).json({ error: 'Insufficient funds' });
  }
  
  // CWE-78: Command Injection via child_process.exec
  exec(\`generate_receipt_pdf --from \${accountId} --to \${targetAccount} --amount \${amount}\`, (err, stdout) => {
    if (err) {
      console.error('PDF generation failed', err);
    }
  });

  return res.json({ success: true, transferId: Math.random().toString(36) });
}

export function evaluateExpression(req: Request, res: Response) {
  const { formula } = req.body;
  // CWE-94: Dangerous Eval Code Injection
  const calculation = eval(formula);
  return res.json({ result: calculation });
}
`
  },
  {
    path: 'backend/crypto_helper.go',
    language: 'go',
    content: `package crypto

import (
	"crypto/md5"
	"fmt"
	"math/rand"
	"time"
)

// CWE-327: Use of broken cryptographic hash algorithm MD5
func HashPasswordMD5(password string) string {
	hasher := md5.New()
	hasher.Write([]byte(password))
	return fmt.Sprintf("%x", hasher.Sum(nil))
}

// CWE-330: Insecure random number generator for session tokens
func GenerateSessionToken() string {
	rand.Seed(time.Now().UnixNano())
	tokenBytes := make([]byte, 16)
	for i := 0; i < 16; i++ {
		tokenBytes[i] = byte(rand.Intn(256))
	}
	return fmt.Sprintf("%x", tokenBytes)
}
`
  },
  {
    path: 'backend/file_handler.php',
    language: 'php',
    content: `<?php
// Apex Bank File Upload and Deserialization Utility

if (isset($_GET['download'])) {
    $file = $_GET['download'];
    // CWE-22: Arbitrary File Read / Path Traversal
    $content = file_get_contents("../storage/files/" . $file);
    echo $content;
}

if (isset($_POST['session_state'])) {
    $raw_state = $_POST['session_state'];
    // CWE-502: Unsafe PHP Object Deserialization
    $session = unserialize($raw_state);
    var_dump($session);
}
?>
`
  },
  {
    path: 'frontend/src/UserProfile.tsx',
    language: 'typescript',
    content: `import React, { useEffect, useState } from 'react';

interface UserBioProps {
  bioHtml: string;
}

export const UserProfileView: React.FC<UserBioProps> = ({ bioHtml }) => {
  useEffect(() => {
    // CWE-312: Cleartext Storage of Sensitive Token in localStorage
    localStorage.setItem("authToken", "apex_user_jwt_token_unencrypted");
  }, []);

  return (
    <div className="user-profile">
      <h2>Account Biography</h2>
      {/* CWE-79: Cross-Site Scripting via dangerouslySetInnerHTML */}
      <div 
        className="bio-content" 
        dangerouslySetInnerHTML={{ __html: bioHtml }} 
      />
    </div>
  );
};
`
  },
  {
    path: 'Dockerfile',
    language: 'dockerfile',
    content: `# Apex Bank Service Dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# CWE-250: Execution with Unnecessary Privileges (Running as root)
USER root

EXPOSE 3000
CMD ["npm", "start"]
`
  }
];
