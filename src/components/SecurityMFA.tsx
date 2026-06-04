import React, { useState, useEffect } from "react";
import { 
  ShieldCheck, ShieldClose, Lock, Unlock, Key, 
  RotateCw, RefreshCw, KeyRound, QrCode, Clipboard 
} from "lucide-react";
import { VaultKey } from "../types";

interface SecurityMFAProps {
  onAddLog: (message: string, category: "security" | "network" | "recovery" | "terminal", level: "info" | "warning" | "error" | "success") => void;
  mfaActive: boolean;
  setMfaActive: (active: boolean) => void;
}

const INITIAL_VAULT: VaultKey[] = [
  {
    id: "key-1",
    service: "WAN Core Router SSL Certificate",
    type: "RSA-2048",
    key: "MIIEogIBAAKCAQEA0y6vTf...vJvVbN",
    lastRotated: "2026-05-12 (23 days ago)",
    strength: "High"
  },
  {
    id: "key-2",
    service: "Main Relational Database Encryption Key",
    type: "AES-256-GCM",
    key: "AESGCM_SALT_42f0b71...155e9c",
    lastRotated: "2026-06-01 (3 days ago)",
    strength: "Robust"
  },
  {
    id: "key-3",
    service: "Gemini AI Remote Proxy Hook",
    type: "API-Credential",
    key: "GEMINI_API_SECRET_ROT_X8",
    lastRotated: "2026-06-04 (Today)",
    strength: "High"
  }
];

export default function SecurityMFA({ onAddLog, mfaActive, setMfaActive }: SecurityMFAProps) {
  // Vault keys
  const [vaultKeys, setVaultKeys] = useState<VaultKey[]>(INITIAL_VAULT);
  
  // MFA states
  const [mfaDraftInput, setMfaDraftInput] = useState<string>("");
  const [mfaError, setMfaError] = useState<string>("");
  const [totpSimulated, setTotpSimulated] = useState<string>("524901");
  const [totpTimer, setTotpTimer] = useState<number>(30);

  // Symmetric Matrix state
  const [textToEncrypt, setTextToEncrypt] = useState<string>("Enter classified server credentials...");
  const [secretCipherKey, setSecretCipherKey] = useState<string>("ALPHA_SALT_841");
  const [encryptedOutput, setEncryptedOutput] = useState<string>("");
  const [decryptionInput, setDecryptionInput] = useState<string>("");
  const [decryptedOutput, setDecryptedOutput] = useState<string>("");

  // Rotating TOTP Simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setTotpTimer(prev => {
        if (prev <= 1) {
          // Generate new fake TOTP
          const nextCode = Math.floor(100000 + Math.random() * 900000).toString();
          setTotpSimulated(nextCode);
          return 30;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Symmetric XOR/Transpose Encrypt algorithm
  const handleEncryptText = () => {
    if (!textToEncrypt) return;
    try {
      // Reversible symmetric pseudo AESGCM encryption matrix
      // Reverse string, XOR-like byte shifts and Base64 padding
      const saltSum = secretCipherKey.split("").reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0) % 15;
      const step1 = textToEncrypt.split("").reverse().join("");
      const step2 = Array.from(step1).map((char: any) => {
        const code = (char as string).charCodeAt(0);
        return String.fromCharCode(code + saltSum);
      }).join("");
      const step3 = btoa(unescape(encodeURIComponent(step2)));
      setEncryptedOutput(`ALPHA_MATRIX_CYPHER_${step3}`);
      onAddLog("Local AES/Matrix symmetric encryption pipeline executed successfully.", "security", "success");
    } catch {
      onAddLog("Encryption failure. Invalid system boundaries.", "security", "error");
    }
  };

  const handleDecryptText = () => {
    if (!decryptionInput) return;
    try {
      const raw = decryptionInput.replace("ALPHA_MATRIX_CYPHER_", "").trim();
      const saltSum = secretCipherKey.split("").reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0) % 15;
      const step1 = decodeURIComponent(escape(atob(raw)));
      const step2 = Array.from(step1).map((char: any) => {
        const code = (char as string).charCodeAt(0);
        return String.fromCharCode(code - saltSum);
      }).join("");
      const step3 = step2.split("").reverse().join("");
      setDecryptedOutput(step3);
      onAddLog("Symmetric cryptographic deciphering completed.", "security", "success");
    } catch {
      setDecryptedOutput("ERROR: Cryptographic signature mismatch. Check salt or cipher content.");
      onAddLog("Decryption matrix failure. Secret boundary key incorrect.", "security", "error");
    }
  };

  const handleMfaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mfaDraftInput.trim() === totpSimulated) {
      setMfaActive(true);
      setMfaError("");
      setMfaDraftInput("");
      onAddLog("SUCCESS: Administrative Session MFA token verified. Global credential vault decrypted.", "security", "success");
    } else {
      setMfaError("Verification token mismatch. Check rotating secure authenticator matrix.");
      onAddLog("FAILED: Admin Session MFA token verification mismatch.", "security", "error");
    }
  };

  const handleDeactivateMfa = () => {
    setMfaActive(false);
    onAddLog("MFA Administrative Access disabled. Offline session locked.", "security", "warning");
  };

  const handleRotateKey = (keyId: string) => {
    setVaultKeys(prev => prev.map(k => {
      if (k.id === keyId) {
        const randomHex = Math.random().toString(16).substring(2, 10).toUpperCase();
        return {
          ...k,
          key: `${k.type === "RSA-2048" ? "MIIEogIBAAKCAQEA" : "AESGCM_SALT_"}${randomHex}...rotated`,
          lastRotated: "2026-06-04 (Just now)",
          strength: "Robust"
        };
      }
      return k;
    }));
    const keyName = vaultKeys.find(k => k.id === keyId)?.service || "Service";
    onAddLog(`SUCCESS: Instigated automatic key-pair rotation for "${keyName}".`, "security", "success");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="security-mfa-root">
      
      {/* MFA Simulation Module */}
      <div className="lg:col-span-4 bg-[#0a0f1d] border border-slate-800 rounded-lg p-5 flex flex-col justify-between">
        <div>
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-2.5 mb-3">
            <Lock className="w-4 h-4 text-purple-400" />
            <h4 className="font-sans font-medium text-slate-200 text-sm tracking-wide">
              MFA GATEWAY AUTHENTICATOR
            </h4>
          </div>

          <p className="font-sans text-slate-400 text-xs mb-4 leading-relaxed">
            Scan the Alpha QR-Code token to initiate administrator privileges across secure host nodes.
          </p>

          <div className="flex flex-col items-center justify-center p-4 bg-[#04060b] border border-slate-900 rounded mb-4">
            <div className="relative p-2 bg-white rounded border border-slate-300">
              <QrCode className="w-28 h-28 text-slate-950" />
              <div className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-[1px] opacity-0 hover:opacity-100 transition-opacity duration-200">
                <span className="font-mono text-[9px] text-slate-950 font-bold tracking-wider text-center px-2">
                  ALPHA INTEGRITY SECTOR
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-2 mt-4 text-xs font-mono">
              <span className="text-slate-400 font-bold">Simulator Device:</span>
              <span className="text-[#a5b4fc] tracking-widest font-extrabold">{totpSimulated}</span>
              <span className="text-slate-500 font-medium font-sans">({totpTimer}s)</span>
            </div>
          </div>

          {/* Verification input */}
          {!mfaActive ? (
            <form onSubmit={handleMfaSubmit} className="space-y-3">
              <div>
                <label className="block font-mono text-slate-500 text-[9px] uppercase mb-1">
                  TOTP Core Verification Key
                </label>
                <input
                  id="mfa-verification-token-input"
                  type="text"
                  maxLength={6}
                  value={mfaDraftInput}
                  onChange={(e) => setMfaDraftInput(e.target.value)}
                  placeholder="Enter 6-digit simulated code"
                  className="w-full bg-[#050814] border border-slate-900 font-mono text-sm tracking-wider text-center text-slate-200 rounded py-2 outline-none focus:border-purple-800"
                />
              </div>

              {mfaError && (
                <p className="font-sans text-red-400 text-[10px] bg-red-950/20 py-1 px-2 border border-red-950 rounded text-center">
                  {mfaError}
                </p>
              )}

              <button
                id="btn-verify-mfa"
                type="submit"
                className="w-full bg-purple-750 hover:bg-purple-650 text-white font-mono font-bold text-xs py-2 rounded transition"
              >
                VERIFY COUPLING TOKEN
              </button>
            </form>
          ) : (
            <div className="text-center p-3 bg-emerald-950/10 border border-emerald-900/40 rounded space-y-3">
              <div className="flex items-center justify-center space-x-1.5 text-emerald-400">
                <ShieldCheck className="w-5 h-5" />
                <span className="font-mono text-xs font-bold uppercase tracking-wider">ADMINISTRATIVE BOUNDS ACTIVE</span>
              </div>
              <p className="font-sans text-slate-400 text-[11px] leading-relaxed">
                Secure root shells, AI diagnostics and credential vectors have been negotiated successfully.
              </p>
              <button
                id="btn-deactivate-mfa"
                onClick={handleDeactivateMfa}
                className="w-full bg-red-950/30 border border-red-900/40 text-red-450 hover:bg-red-950/50 text-xs font-mono font-bold py-1.5 rounded transition"
              >
                REVOKE SESSION SHELL
              </button>
            </div>
          )}
        </div>

        <div className="mt-4 border-t border-slate-950 pt-3">
          <div className="flex justify-between font-sans text-[10px]">
            <span className="text-slate-500">MFA Status_</span>
            <span className={mfaActive ? "text-emerald-400 font-bold" : "text-amber-500 font-medium"}>
              {mfaActive ? "AUTHENTICATED SECURE" : "MFA PENDING"}
            </span>
          </div>
        </div>
      </div>

      {/* Symmetric Matrix Encryption Tool */}
      <div className="lg:col-span-8 space-y-6">
        <div className="bg-[#0a0f1d] border border-slate-800 rounded-lg p-5">
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-2.5 mb-4">
            <Key className="w-4 h-4 text-indigo-400" />
            <h4 className="font-sans font-medium text-slate-200 text-sm tracking-wide">
              SYMMETRIC SHIFT CIPHER ENCODER / DECODER
            </h4>
          </div>

          <p className="font-sans text-slate-400 text-xs mb-4">
            Symmetrically encode secure payloads using dynamic salt configurations before transmitting over simulated local channels.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Encrypt Block */}
            <div className="space-y-3">
              <span className="font-mono text-[9px] font-bold text-slate-500 uppercase tracking-wider block">
                encipher pipeline buffer
              </span>

              <input
                id="encryption-secret-salt-key"
                type="text"
                value={secretCipherKey}
                onChange={(e) => setSecretCipherKey(e.target.value)}
                placeholder="Secret cipher transposition key"
                className="w-full bg-[#04060c] border border-slate-900 font-mono text-xs text-indigo-350 p-2 rounded focus:outline-none focus:border-indigo-800"
              />

              <textarea
                id="encryption-text-to-encrypt"
                value={textToEncrypt}
                onChange={(e) => setTextToEncrypt(e.target.value)}
                className="w-full h-24 bg-[#04060c] border border-slate-900 font-mono text-xs text-slate-350 p-2.5 rounded focus:outline-none focus:border-indigo-800 resize-none"
              />

              <button
                id="btn-run-encryption-matrix"
                onClick={handleEncryptText}
                className="w-full bg-indigo-950/40 hover:bg-indigo-900/40 text-indigo-400 border border-indigo-850 py-1.5 rounded transition font-mono font-bold text-[11px]"
              >
                RUN SYMMETRIC TRANSPOSE
              </button>

              {encryptedOutput && (
                <div className="bg-slate-950 p-2 border border-slate-900 rounded relative">
                  <span className="block font-mono text-[9px] text-slate-550 mb-1 leading-none uppercase">RESULT HASH</span>
                  <p className="font-mono text-[9px] text-[#818cf8] break-all leading-tight pr-8">{encryptedOutput}</p>
                  <button
                    id="btn-copy-cipher-code"
                    onClick={() => {
                      navigator.clipboard.writeText(encryptedOutput);
                      onAddLog("Cypher bounds hash copied successfully.", "terminal", "success");
                    }}
                    className="absolute right-2 bottom-2 text-slate-500 hover:text-slate-300"
                  >
                    <Clipboard className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Decrypt Block */}
            <div className="space-y-3">
              <span className="font-mono text-[9px] font-bold text-slate-500 uppercase tracking-wider block">
                decipher pipeline buffer
              </span>

              <input
                id="decryption-cipher-hash-input"
                type="text"
                value={decryptionInput}
                onChange={(e) => setDecryptionInput(e.target.value)}
                placeholder="ALPHA_MATRIX_CYPHER_hash_bytes"
                className="w-full bg-[#04060c] border border-slate-900 font-mono text-xs text-indigo-350 p-2 rounded focus:outline-none focus:border-indigo-800"
              />

              <button
                id="btn-run-decryption-matrix"
                onClick={handleDecryptText}
                className="w-full bg-indigo-650 hover:bg-indigo-550 text-white py-1.5 rounded transition font-mono font-bold text-[11px] h-[34px]"
              >
                DECRYPT CIPHER SIG
              </button>

              {decryptedOutput && (
                <div className="bg-[#05060b] p-3 border border-slate-900 rounded min-h-[96px] flex flex-col justify-center">
                  <span className="block font-mono text-[9px] text-slate-550 mb-1 leading-none uppercase">DECRYPTED DECODE</span>
                  <p className="font-mono text-[11px] text-emerald-400 break-all leading-relaxed">{decryptedOutput}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Secure Key Rotations Vault */}
        <div className="bg-[#0a0f1d] border border-slate-800 rounded-lg p-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-3">
            <div className="flex items-center space-x-2">
              <KeyRound className="w-4 h-4 text-emerald-400" />
              <h4 className="font-sans font-medium text-slate-200 text-sm tracking-wide">
                SYSTEM REDUNDANT KEY VAULT
              </h4>
            </div>

            <span className="font-mono text-[10px] text-slate-500">
              Vault Status: SECURED GCM
            </span>
          </div>

          <p className="font-sans text-slate-400 text-xs mb-4 leading-relaxed">
            Corporate credential store with dynamic key rotation and visual entropy health values.
          </p>

          <div className="space-y-3">
            {vaultKeys.map(key => (
              <div key={key.id} className="bg-[#04060c] border border-slate-900 rounded p-3 flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-1 max-w-full md:max-w-md">
                  <div className="flex items-center space-x-2">
                    <span className="font-sans font-extrabold text-[#f1f5f9] text-xs leading-none">
                      {key.service}
                    </span>
                    <span className="font-mono text-[9px] bg-indigo-950/50 border border-indigo-900/40 px-1 rounded text-indigo-300 uppercase leading-none">
                      {key.type}
                    </span>
                  </div>
                  <pre className="font-mono text-[9px] text-slate-500 block break-all leading-none">{key.key}</pre>
                  <span className="font-mono text-[9px] text-slate-600 block leading-none pt-0.5">
                    Last automated rotation: {key.lastRotated}
                  </span>
                </div>

                <div className="flex items-center space-x-3 ml-auto">
                  <span className="font-mono text-[9px] text-slate-500">
                    Strength: <span className="text-emerald-400 font-bold">{key.strength}</span>
                  </span>

                  <button
                    id={`btn-rotate-${key.id}`}
                    onClick={() => handleRotateKey(key.id)}
                    className="p-1 px-2 hover:bg-slate-900 border border-slate-850 hover:border-slate-800 rounded text-slate-400 hover:text-slate-200 transition font-mono text-[10px] flex items-center space-x-1"
                  >
                    <RotateCw className="w-3 h-3" />
                    <span>ROTATE</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
