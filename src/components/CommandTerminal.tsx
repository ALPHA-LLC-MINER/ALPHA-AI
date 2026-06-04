import React, { useState, useRef, useEffect } from "react";
import { 
  Terminal, Play, HelpCircle, Code, Cpu, Shield, 
  RefreshCw, CheckCircle, AlertTriangle, ChevronRight, Copy, Save
} from "lucide-react";
import { ActivityLog } from "../types";

// Premade diagnostic code buffers
const CODE_TEMPLATES = {
  python: `def compute_and_send_metrics(host, metrics_pool):
    # WARNING: Memory leakage risks / Unprotected connection bindings
    socket_pool = []
    for m in metrics_pool:
        import os
        # Critical security vulnerability: Raw os.system execution
        untrusted_var = m.get("query_string", "none")
        os.system("nslookup " + untrusted_var)
        
        # Connection not closed cleanly
        conn = open_tcp_connection(host, 443)
        socket_pool.append(conn)
        conn.write_bytes(m.get("payload"))
        
    return "All payloads executed inline"`,
  
  html: `<!DOCTYPE html>
<html>
<head>
    <title>Enterprise Security Dashboard</title>
</head>
<body>
    <h1>Administration Access Gateway</h1>
    <div id="content">Loading secure session variables...</div>
    
    <!-- HIGH CRITICAL RISK: Inline database password leaks -->
    <script>
        const dbPassword = "VaultPass142_SuperSafe!";
        function bypassGate() {
            // Simulated login flow vulnerability
            if (document.location.hash === "#admin_override") {
                showSensitiveServerLogs();
            }
        }
        window.addEventListener("load", bypassGate);
    </script>
</body>
</html>`,

  json: `{
  "network_config": {
    "gateway_interface": "192.168.1.1",
    "dns_servers": ["8.8.8.8", "192.168.1.1"],
    "isolate_subnets": false,
    "unencrypted_port_bindings": [21, 23, 80],
    "master_token": "bearer-secret-oauth-key-temp"
  }
}`
};

const EDITOR_SHORTCUTS = [
  {
    cmd: "/unsafe-os",
    label: "os.system Attack Vector",
    desc: "Vulnerable script snippet executing shell injection vectors manually",
    insertText: `import os\n# ALPHA AI AST CHECK: Shell command execution payload\nargument_query = "127.0.0.1; rm -rf /"\nos.system("nslookup " + argument_query)\n`
  },
  {
    cmd: "/leak-password",
    label: "Inline Password Leak",
    desc: "Hardcoded secret string template to test vulnerability report modules",
    insertText: `// SECURITY THREAT HAZARD: Unencrypted administrative token\nconst dbPassword = "VaultPass142_SuperSafe!";\nconst masterToken = "bearer-secret-oauth-key-temp";\n`
  },
  {
    cmd: "/verify-ports",
    label: "Port Binding Script",
    desc: "Evaluate list of loopback socket adapters bound for client port 3000 checks",
    insertText: `def monitor_port_bounds(host, cluster_size=3):\n    # Connection loopback bindings configuration\n    unsecure_ports = [21, 23, 8080]\n    for p in unsecure_ports:\n        s = open_tcp_connection(host, p)\n        s.write_bytes("ALPHA_STATION_PING")\n`
  },
  {
    cmd: "/sanitize-ast",
    label: "Input AST Sanitizer",
    desc: "Rigorous regex filter function template to disinfect raw string injections",
    insertText: `import re\ndef sanitize_input_vector(raw_payload):\n    # Reconstruct buffer by scrubbing common terminal symbols\n    return re.sub(r"[;&|\\s]", "", raw_payload)\n`
  },
  {
    cmd: "/gcr-deploy",
    label: "GCR Deployer Rules",
    desc: "Kubernetes manifests code block with strict securityContext policies",
    insertText: `apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: gcr-alpha-diagnostics\nspec:\n  replicas: 4\n  template:\n    spec:\n      securityContext:\n        runAsNonRoot: true\n      containers:\n      - name: worker\n        image: gcr.io/alpha-main/worker:v2\n`
  }
];

const TERMINAL_SHORTCUTS = [
  {
    cmd: "/sysinfo",
    label: "sysinfo",
    desc: "Query physical core diagnostics, RAM allocations and system uptime",
    insertText: "sysinfo"
  },
  {
    cmd: "/nmap",
    label: "nmap [ip]",
    desc: "Scan local interfaces and gateways for open unencrypted services",
    insertText: "nmap 192.168.1.1"
  },
  {
    cmd: "/ping",
    label: "ping [ip]",
    desc: "Report active latency speed roundtrip vectors to target network ip",
    insertText: "ping 10.0.3.14"
  },
  {
    cmd: "/traceroute",
    label: "traceroute [ip]",
    desc: "Audit routing path switches and standard infrastructure gateway hops",
    insertText: "traceroute 10.0.3.50"
  },
  {
    cmd: "/ifconfig",
    label: "ifconfig",
    desc: "Print current virtual net adapter interfaces, loopbacks, and MAC configs",
    insertText: "ifconfig"
  },
  {
    cmd: "/clear",
    label: "clear",
    desc: "Wipe all current log outputs from shell console",
    insertText: "clear"
  },
  {
    cmd: "/help",
    label: "help",
    desc: "Summary list of all authorized shell directives",
    insertText: "help"
  }
];

interface CommandTerminalProps {
  onAddLog: (message: string, category: "security" | "network" | "recovery" | "terminal", level: "info" | "warning" | "error" | "success") => void;
  isOnline: boolean;
  systemPrompt: string;
  editorBuffer: string;
  setEditorBuffer: React.Dispatch<React.SetStateAction<string>>;
}

export default function CommandTerminal({ 
  onAddLog, 
  isOnline, 
  systemPrompt,
  editorBuffer,
  setEditorBuffer
}: CommandTerminalProps) {
  const [activeLanguage, setActiveLanguage] = useState<"python" | "html" | "json">("python");
  
  // Slash popup triggers states
  const [editorSlashOpen, setEditorSlashOpen] = useState(false);
  const [editorSlashQuery, setEditorSlashQuery] = useState("");
  const [editorSlashIndex, setEditorSlashIndex] = useState(0);

  const [terminalSlashOpen, setTerminalSlashOpen] = useState(false);
  const [terminalSlashQuery, setTerminalSlashQuery] = useState("");
  const [terminalSlashIndex, setTerminalSlashIndex] = useState(0);

  // Terminal states
  const [terminalHistory, setTerminalHistory] = useState<Array<{ command: string; output: string }>>([
    { command: "sysinfo", output: "ALPHA AI Autonomous Core v6.42\nOS Architecture: Virtual Core Sandbox\nDiagnostics Engines: AST Heuristics & Neural Transformers\nStatus: Secure Bound on port 3000\nType 'help' to review authorized administrative tools." }
  ]);
  const [currentInput, setCurrentInput] = useState<string>("");
  const terminalBottomRef = useRef<HTMLDivElement>(null);

  // Diagnostic states
  const [isDiagnosing, setIsDiagnosing] = useState<boolean>(false);
  const [diagnosticResponse, setDiagnosticResponse] = useState<{
    analysis: string;
    status: "SECURE" | "WARNING" | "CRITICAL";
    fixedCode: string;
    recoverySteps: string[];
    mode: string;
  } | null>(null);

  // Scroll to terminal bottom on changes
  useEffect(() => {
    terminalBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [terminalHistory]);

  const insertAtCursor = (inputElement: HTMLTextAreaElement | HTMLInputElement | null, textToInsert: string) => {
    if (!inputElement) return;
    const start = inputElement.selectionStart || 0;
    const end = inputElement.selectionEnd || 0;
    const originalVal = inputElement.value;
    
    // Replace the trailing slash command with text
    const beforeCursor = originalVal.substring(0, start);
    const afterCursor = originalVal.substring(end);
    
    // Remove the trailing / or /word
    const cleanBeforeCursor = beforeCursor.replace(/\/([a-zA-Z-]*)$/, "");
    const newVal = cleanBeforeCursor + textToInsert + afterCursor;
    
    if (inputElement.tagName === "TEXTAREA") {
      setEditorBuffer(newVal);
    } else {
      setCurrentInput(newVal);
    }
    
    setTimeout(() => {
      inputElement.focus();
      const newPos = cleanBeforeCursor.length + textToInsert.length;
      inputElement.setSelectionRange(newPos, newPos);
    }, 15);
  };

  const handleEditorChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setEditorBuffer(val);
    
    const start = e.target.selectionStart;
    const textBefore = val.substring(0, start);
    const match = textBefore.match(/\/([a-zA-Z-]*)$/);
    if (match) {
      setEditorSlashOpen(true);
      setEditorSlashQuery(match[1]);
      setEditorSlashIndex(0);
    } else {
      setEditorSlashOpen(false);
    }
  };

  const handleTerminalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCurrentInput(val);
    
    const start = e.target.selectionStart;
    const textBefore = val.substring(0, start);
    const match = textBefore.match(/\/([a-zA-Z-]*)$/);
    if (match) {
      setTerminalSlashOpen(true);
      setTerminalSlashQuery(match[1]);
      setTerminalSlashIndex(0);
    } else {
      setTerminalSlashOpen(false);
    }
  };

  const applyEditorShortcut = (item: typeof EDITOR_SHORTCUTS[number]) => {
    const inputEl = document.getElementById("editor-text-buffer") as HTMLTextAreaElement | null;
    insertAtCursor(inputEl, item.insertText);
    setEditorSlashOpen(false);
    onAddLog(`SHORTCUT: Loaded Code Lab interactive snippet [${item.cmd}].`, "terminal", "success");
  };

  const applyTerminalShortcut = (item: typeof TERMINAL_SHORTCUTS[number]) => {
    const inputEl = document.getElementById("terminal-cmd-input") as HTMLInputElement | null;
    insertAtCursor(inputEl, item.insertText);
    setTerminalSlashOpen(false);
    onAddLog(`SHORTCUT: Inserted terminal shell command [${item.cmd}].`, "terminal", "info");
  };

  const handleEditorKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (editorSlashOpen) {
      const filtered = EDITOR_SHORTCUTS.filter(item => 
        item.cmd.toLowerCase().includes(editorSlashQuery.toLowerCase()) ||
        item.label.toLowerCase().includes(editorSlashQuery.toLowerCase())
      );
      if (filtered.length > 0) {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          setEditorSlashIndex(prev => (prev + 1) % filtered.length);
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          setEditorSlashIndex(prev => (prev - 1 + filtered.length) % filtered.length);
        } else if (e.key === "Enter") {
          e.preventDefault();
          applyEditorShortcut(filtered[editorSlashIndex]);
        } else if (e.key === "Escape") {
          e.preventDefault();
          setEditorSlashOpen(false);
        }
      }
    }
  };

  const handleTerminalKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (terminalSlashOpen) {
      const filtered = TERMINAL_SHORTCUTS.filter(item => 
        item.cmd.toLowerCase().includes(terminalSlashQuery.toLowerCase()) ||
        item.label.toLowerCase().includes(terminalSlashQuery.toLowerCase())
      );
      if (filtered.length > 0) {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          setTerminalSlashIndex(prev => (prev + 1) % filtered.length);
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          setTerminalSlashIndex(prev => (prev - 1 + filtered.length) % filtered.length);
        } else if (e.key === "Enter") {
          e.preventDefault();
          applyTerminalShortcut(filtered[terminalSlashIndex]);
        } else if (e.key === "Escape") {
          e.preventDefault();
          setTerminalSlashOpen(false);
        }
      }
    }
  };

  const loadTemplate = (lang: "python" | "html" | "json") => {
    setActiveLanguage(lang);
    setEditorBuffer(CODE_TEMPLATES[lang]);
    onAddLog(`Template buffer reloaded with enterprise draft [${lang.toUpperCase()}].`, "terminal", "info");
  };

  // Execution algorithm of mock CLI commands
  const runCommand = (cmdStr: string) => {
    const trimmed = cmdStr.trim();
    if (!trimmed) return;

    const parts = trimmed.split(" ");
    const command = parts[0].toLowerCase();
    const args = parts.slice(1);

    let output = "";

    switch (command) {
      case "help":
        output = `AUTHORIZED MULTI-LAB COMMAND CONSOLE - ALPHA AI
Available commands (10+):
  sysinfo           Show operational metrics of the virtual host and processors.
  ping [ip]         Evaluate outbound routing latency and ICMP socket delivery.
  traceroute [ip]   Trace network hopping nodes to standard host architectures.
  nmap [ip]         Scan the target configuration for unencrypted open ports.
  nslookup [host]   Query available nameservers for DNS domain pointer mappings.
  ifconfig          List all network socket adapters, subnets, and bridges.
  curl [url]        Deploy test HTTP GET requests to simulated ingress layers.
  encrypt [text]    Generate cyphertext metrics using standard cipher protocols.
  decrypt [hash]    Validate cipher integrity structure under localized decryption key.
  analyze           Submit editor buffer to ALPHA AI diagnostic intelligence.
  fix               Instruct ALPHA AI to refactor and resolve editor script vulnerabilities.
  clear             Purge terminal history list.`;
        break;

      case "sysinfo":
        output = `ALPHA PROCESSOR CORE DIAGNOSTICS:
----------------------------------------
PROCESSORS : Alpha Xenon Neural Cores x64
CLOCK SPEED: 5.42 GHz
RAM STORAGE: 128.00 GB Virtual Virtual Memory Pool
NETWORK INT: 10 GbE Static fiber pipeline
API LINK_  : ${isOnline ? "ONLINE (Neural Gateway connected)" : "OFFLINE (Heuristic Fallback active)"}
SECURITY   : GCM-AES Key Vault rotation active`;
        break;

      case "ping":
        const pingHost = args[0] || "127.0.0.1";
        output = `PING ${pingHost} (56 bytes of data). Powered by Alpha Engine.
64 bytes from ${pingHost}: icmp_seq=1 ttl=64 time=1.45 ms
64 bytes from ${pingHost}: icmp_seq=2 ttl=64 time=2.12 ms
64 bytes from ${pingHost}: icmp_seq=3 ttl=64 time=1.89 ms
--- ${pingHost} ping statistics ---
3 packets transmitted, 3 received, 0% packet loss, time 2004ms
rtt min/avg/max = 1.45/1.82/2.12 ms`;
        onAddLog(`ICMP ping check evaluated metrics to target: ${pingHost}.`, "network", "info");
        break;

      case "traceroute":
        const trHost = args[0] || "10.0.3.14";
        output = `traceroute to ${trHost} (10.0.3.14), 12 hops max, 48 byte packets
 1  gateway.alpha.internal (192.168.1.1)  0.245 ms  0.180 ms
 2  router.wan.internal (10.0.0.1)  0.582 ms  0.512 ms
 3  routing.switch.external (45.12.5.21)  4.120 ms  5.244 ms
 4  ${trHost} (${trHost})  1.214 ms  0.940 ms`;
        break;

      case "nmap":
        const nmapHost = args[0] || "192.168.1.1";
        output = `Nmap scan report for ${nmapHost}
Host is up (0.0042s latency).
Not shown: 994 closed ports
PORT     STATE    SERVICE
21/tcp   open     ftp (Unencrypted)
22/tcp   open     ssh
80/tcp   open     http (Apache)
443/tcp  open     https (Nginx SSL proxy)
5432/tcp open     postgresql
8080/tcp open     http-proxy`;
        onAddLog(`Security port scan completed on IP config ${nmapHost}.`, "security", "warning");
        break;

      case "nslookup":
        const domain = args[0] || "alpha-core.io";
        output = `Server:		127.0.0.53
Address:	127.0.0.53#53

Non-authoritative answer:
Name:	${domain}
Address: 104.24.12.86
Address: 172.58.1.134
Name:	nameserver.alpha-core.io
Address: 10.0.0.1`;
        break;

      case "ifconfig":
        output = `eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500
        inet 192.168.1.100  netmask 255.255.255.0  broadcast 192.168.1.255
        inet6 fe80::215:5dff:fe1e:ff1a  prefixlen 64  scopeid 0x20<link>
        ether 00:15:5d:1e:ff:1a  txqueuelen 1000  (Ethernet)
        RX packets 421295  bytes 512041285 (512.0 MB)
        TX packets 210214  bytes 24042125  (24.0 MB)

lo: flags=73<UP,LOOPBACK,RUNNING>  mtu 65536
        inet 127.0.0.1  netmask 255.0.0.0
        loop  txqueuelen 1000  (Local Loopback)`;
        break;

      case "curl":
        const targetUrl = args[0] || "http://127.0.0.1:3000/api/health";
        output = `HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8
Content-Length: 15
Date: ${new Date().toUTCString()}
Server: Alpha-Vite-Backend
access-control-allow-origin: *

{ "status": "ok" }`;
        break;

      case "encrypt":
        const plainText = args.join(" ");
        if (!plainText) {
          output = "ERROR: Supply raw string parameter to encrypt (e.g. encrypt ConfidentialDBPass)";
        } else {
          const encoded = btoa(plainText).split("").reverse().join("");
          output = `ALPHA CIPHER METRICS GENERATOR
-----------------------------------------
Input String : "${plainText}"
Method       : Base64 Reverse XOR-Transpose Matrice
Ciphertext   : AESGCM_v2_${encoded}`;
          onAddLog(`Reversible encryption simulated for text payload.`, "security", "success");
        }
        break;

      case "decrypt":
        const hash = args[0];
        if (!hash) {
          output = "ERROR: Provide safe Cypher hash to evaluate (e.g. decrypt AESGCM_v2_YXBiYQ==)";
        } else if (!hash.startsWith("AESGCM_v2_")) {
          output = `ERROR: Invalid key format. Host requires AESGCM_v2 prefix to match rotation matrices.`;
        } else {
          try {
            const rawCipher = hash.replace("AESGCM_v2_", "");
            const reversed = rawCipher.split("").reverse().join("");
            const decoded = atob(reversed);
            output = `SECURE KEY DEPLOYMENT MATCHED:
-----------------------------------------
Validated Payload : "${decoded}"
Decryption Matrix : System Key Vault #3 Authorized`;
            onAddLog(`Decryption trace validated secure host metadata.`, "security", "success");
          } catch {
            output = "ERROR: Matrice integrity compromise. Padding or key sequence invalid.";
          }
        }
        break;

      case "analyze":
        setTerminalHistory(prev => [...prev, { command: cmdStr, output: "Submitting script payload to AI diagnostic stream...\nReady console output." }]);
        triggerAIDiagnostic("analyze");
        return;

      case "fix":
        setTerminalHistory(prev => [...prev, { command: cmdStr, output: "Submitting script payload to AI recovery stream...\nReady console output." }]);
        triggerAIDiagnostic("fix");
        return;

      case "clear":
        setTerminalHistory([]);
        return;

      default:
        output = `Command not recognized: "${command}". Type "help" to inspect the 10+ available network diagnostics.`;
        break;
    }

    setTerminalHistory(prev => [...prev, { command: cmdStr, output }]);
  };

  const handleTerminalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentInput.trim()) return;
    runCommand(currentInput);
    setCurrentInput("");
  };

  // AI Diagnostic Core utilizing Express proxy `/api/alpha-ai/diagnose`
  const triggerAIDiagnostic = async (commandType: "analyze" | "fix") => {
    if (isDiagnosing) return;
    setIsDiagnosing(true);
    setDiagnosticResponse(null);

    const targetDescription = `Running Alpha AI ${commandType.toUpperCase()} module over standard host buffer block.`;
    onAddLog(targetDescription, "recovery", "warning");

    try {
      const resp = await fetch("/api/alpha-ai/diagnose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: editorBuffer,
          command: commandType,
          language: activeLanguage,
          systemPrompt
        })
      });

      if (!resp.ok) {
        throw new Error(`Server status returned ${resp.status}`);
      }

      const data = await resp.json();
      if (data.success) {
        setDiagnosticResponse({
          analysis: data.analysis,
          status: data.status,
          fixedCode: data.fixedCode,
          recoverySteps: data.recoverySteps,
          mode: data.mode
        });

        // Output to terminal
        const termOutput = `\n[--- DIAGNOSTIC SENSOR REPORT FROM NEURAL ENGINE ---]\nStatus Indicator  : ${data.status}\nDiagnose Engine   : ${data.mode === "online-gemini" ? "Gemini-3.5-flash AI Core" : "Local Ast Heuristics"}\n\n${data.analysis}\n\n[Recovery Runbook Command Scripts]\n${data.recoverySteps.map((step: string, i: number) => ` ${i+1}. ${step}`).join("\n")}`;
        
        setTerminalHistory(prev => [...prev, { 
          command: `${commandType} buffer_stream`, 
          output: termOutput 
        }]);

        onAddLog(`AI diagnostics successfully executed. Safe recommendations parsed.`, "recovery", "success");
      } else {
        throw new Error(data.error || "Failed stream.");
      }
    } catch (err: any) {
      console.error(err);
      const errOutput = `[CRITICAL COUPLING ERROR] AI engine lost connection endpoint.\nReason: ${err.message || "Endpoint error"}\nFallback: Please check system logs.`;
      setTerminalHistory(prev => [...prev, { command: `${commandType} buffer_stream`, output: errOutput }]);
      onAddLog("Neural engine communication gateway timed out.", "recovery", "error");
    } finally {
      setIsDiagnosing(false);
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6" id="autonomous-lab-workspace">
      
      {/* File Template & Buffer Sandbox Code Editor */}
      <div className="xl:col-span-5 bg-[#0a0f1d] border border-slate-800 rounded-lg p-5 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
            <div className="flex items-center space-x-2">
              <Code className="w-4 h-4 text-emerald-400" />
              <h4 className="font-sans font-medium text-slate-200 text-sm tracking-wide">
                CYBER SANDBOX CODE LAB
              </h4>
            </div>
            
            <span className="font-mono text-[10px] bg-slate-900 border border-slate-800 px-2 py-0.5 text-slate-400 rounded">
              v1.0 Buffer
            </span>
          </div>

          <p className="font-sans text-slate-400 text-xs mb-4">
            Reload draft environments to analyze code logic or mock structures. Correct bugs inline instantly via the Alpha AI Engine.
          </p>

          {/* Tab selectors for structures */}
          <div className="flex space-x-2 mb-3">
            {(["python", "html", "json"] as const).map(lang => (
              <button
                key={lang}
                id={`tab-select-${lang}`}
                onClick={() => loadTemplate(lang)}
                className={`px-3 py-1.5 rounded font-mono text-xs font-bold border transition ${
                  activeLanguage === lang
                  ? "bg-indigo-950/40 text-indigo-300 border-indigo-800/80"
                  : "bg-slate-950/50 text-slate-500 border-slate-900 hover:text-slate-350 hover:bg-slate-900"
                }`}
              >
                {lang.toUpperCase()} draft
              </button>
            ))}
          </div>

          <div className="relative">
            <textarea
              id="editor-text-buffer"
              value={editorBuffer}
              onChange={handleEditorChange}
              onKeyDown={handleEditorKeyDown}
              className="w-full h-80 bg-[#04060c] border border-slate-900 rounded p-3 font-mono text-[11px] text-emerald-400 focus:outline-none focus:border-indigo-800 focus:ring-1 focus:ring-indigo-800 leading-snug duration-150 resize-none"
              spellCheck={false}
              placeholder="Encrypt templates or write code. Press '/' to quickly insert system prompts/scripts."
            />
            {/* Editor Floating Slash Popup */}
            {editorSlashOpen && (() => {
              const filtered = EDITOR_SHORTCUTS.filter(item => 
                item.cmd.toLowerCase().includes(editorSlashQuery.toLowerCase()) ||
                item.label.toLowerCase().includes(editorSlashQuery.toLowerCase())
              );
              if (filtered.length === 0) return null;
              return (
                <div className="absolute left-2 bottom-12 z-30 w-80 bg-[#090f1e] border border-indigo-900/80 rounded-lg p-1.5 shadow-2xl max-h-56 overflow-y-auto font-mono text-xs">
                  <div className="px-2 py-1 text-[9px] text-indigo-400 font-bold border-b border-indigo-950/40 uppercase mb-1">
                    Alpha System Code Snippet Shortcuts
                  </div>
                  {filtered.map((item, idx) => (
                    <div
                      key={item.cmd}
                      onClick={() => applyEditorShortcut(item)}
                      className={`p-1.5 rounded cursor-pointer leading-tight transition ${
                        editorSlashIndex === idx ? "bg-indigo-950/60 text-[#818cf8]" : "text-slate-350 hover:bg-slate-900"
                      }`}
                    >
                      <div className="flex justify-between items-center font-bold text-[11px]">
                        <span>{item.cmd}</span>
                        <span className="text-[9px] text-slate-500 font-sans">{item.label}</span>
                      </div>
                      <div className="text-[9px] text-slate-400 font-sans leading-none pt-0.5">{item.desc}</div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        </div>

        {/* AI Control Buttons */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <button
            id="btn-ai-analyze-buffer"
            onClick={() => triggerAIDiagnostic("analyze")}
            disabled={isDiagnosing}
            className="flex items-center justify-center space-x-1.5 py-2 px-3 border border-indigo-900/40 text-indigo-400 bg-indigo-950/10 hover:bg-indigo-950/30 rounded text-xs font-mono font-extrabold transition disabled:opacity-50"
          >
            {isDiagnosing ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>DIAGNOSING...</span>
              </>
            ) : (
              <>
                <Cpu className="w-3.5 h-3.5" />
                <span>AI DEEP ANALYZE</span>
              </>
            )}
          </button>

          <button
            id="btn-ai-fix-buffer"
            onClick={() => triggerAIDiagnostic("fix")}
            disabled={isDiagnosing}
            className="flex items-center justify-center space-x-1.5 py-2 px-3 bg-indigo-650 hover:bg-indigo-550 text-white rounded text-xs font-mono font-extrabold transition disabled:opacity-50"
          >
            {isDiagnosing ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>RECONSTRUCTING...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                <span>AI AUTO-FIX</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* UNIX Interactive Shell Terminal Pane */}
      <div className="xl:col-span-7 bg-[#050812] border border-slate-800 rounded-lg p-5 flex flex-col h-[520px]">
        {/* Terminal Header */}
        <div className="flex items-center justify-between mb-3 border-b border-slate-900 pb-2">
          <div className="flex items-center space-x-2">
            <Terminal className="w-4 h-4 text-indigo-400" />
            <span className="font-mono text-xs font-bold text-slate-300">
              ALPHA_SHELL@SANDBOX:~
            </span>
          </div>

          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
          </div>
        </div>

        {/* Console Outputs history */}
        <div className="flex-1 overflow-y-auto mb-3 font-mono text-[11px] leading-relaxed text-slate-300 pr-1 space-y-3 selection:bg-indigo-950">
          {terminalHistory.map((item, index) => (
            <div key={index} className="space-y-1">
              <div className="flex items-start text-indigo-400">
                <ChevronRight className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                <span className="font-bold text-slate-400">{item.command}</span>
              </div>
              <pre className="whitespace-pre-wrap pl-3 text-slate-300">{item.output}</pre>
            </div>
          ))}
          <div ref={terminalBottomRef} />
        </div>

        {/* Input CMD Prompt Line */}
        <div className="relative">
          {terminalSlashOpen && (() => {
            const filtered = TERMINAL_SHORTCUTS.filter(item => 
              item.cmd.toLowerCase().includes(terminalSlashQuery.toLowerCase()) ||
              item.label.toLowerCase().includes(terminalSlashQuery.toLowerCase())
            );
            if (filtered.length === 0) return null;
            return (
              <div className="absolute left-6 bottom-11 z-30 w-72 bg-[#090f1e] border border-indigo-900/80 rounded-lg p-1.5 shadow-2xl max-h-48 overflow-y-auto font-mono text-xs text-left">
                <div className="px-2 py-1 text-[9px] text-indigo-400 font-bold border-b border-indigo-950/40 uppercase mb-1">
                  VM Interactive CMD Shortcuts
                </div>
                {filtered.map((item, idx) => (
                  <div
                    key={item.cmd}
                    onClick={() => applyTerminalShortcut(item)}
                    className={`p-1.5 rounded cursor-pointer leading-tight transition ${
                      terminalSlashIndex === idx ? "bg-indigo-950/60 text-[#818cf8]" : "text-slate-350 hover:bg-slate-900"
                    }`}
                  >
                    <div className="flex justify-between items-center font-bold text-[11px]">
                      <span>{item.cmd}</span>
                    </div>
                    <div className="text-[9px] text-slate-500 font-sans leading-none pt-0.5">{item.desc}</div>
                  </div>
                ))}
              </div>
            );
          })()}

          <form onSubmit={handleTerminalSubmit} className="flex items-center border-t border-slate-900 pt-2 h-10">
            <ChevronRight className="w-4 h-4 text-emerald-400 mr-1.5 flex-shrink-0" />
            <input
              id="terminal-cmd-input"
              type="text"
              value={currentInput}
              onChange={handleTerminalChange}
              onKeyDown={handleTerminalKeyDown}
              placeholder="Type 'help' or slash '/' to insert VM commands..."
              className="flex-1 bg-transparent font-mono text-xs text-slate-200 outline-none placeholder-slate-650"
              autoComplete="off"
              spellCheck={false}
            />
          </form>
        </div>
      </div>

      {/* AI Diagnostic Split View Resolution Panel */}
      {diagnosticResponse && (
        <div className="col-span-1 xl:col-span-12 bg-slate-950/70 border border-slate-800 rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-indigo-400" />
              <div>
                <h4 className="font-sans font-extrabold text-[#f1f5f9] text-sm tracking-wide">
                  ALPHA AI THREAT INTEL ANALYSIS
                </h4>
                <p className="font-mono text-slate-500 text-[10px]">
                  Mode: <span className="text-emerald-400 font-bold uppercase">{diagnosticResponse.mode}</span> | Health Priority: <span className={`${diagnosticResponse.status === "CRITICAL" ? "text-red-405 font-bold" : "text-amber-450"}`}>{diagnosticResponse.status}</span>
                </p>
              </div>
            </div>

            <button
              id="btn-close-threat-intel"
              onClick={() => setDiagnosticResponse(null)}
              className="text-xs font-mono text-slate-500 hover:text-slate-300 border border-slate-800 hover:border-slate-700 px-2 py-1 rounded transition"
            >
              CLOSE REPORT
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 bg-[#05070e] border border-slate-900 rounded p-4 font-sans text-xs text-slate-300 prose prose-invert overflow-y-auto max-h-80 leading-relaxed">
              <div className="flex items-center space-x-2 mb-3 bg-[#0a0f1d] p-2 rounded border border-slate-900">
                {diagnosticResponse.status === "CRITICAL" ? (
                  <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
                ) : (
                  <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                )}
                <span className="font-mono text-[10px] font-bold tracking-wider uppercase">
                  neural scanning diagnostic matrix report
                </span>
              </div>
              <div className="whitespace-pre-line text-slate-200">{diagnosticResponse.analysis}</div>
            </div>

            <div className="lg:col-span-5 space-y-4">
              {/* Recovery micro sequence display */}
              <div className="bg-[#0b0c14] border border-indigo-950 p-4 rounded">
                <span className="font-mono text-[9px] font-bold text-indigo-400 tracking-wider uppercase block mb-2">
                  reconstruction runbook protocols
                </span>
                
                <div className="space-y-2">
                  {diagnosticResponse.recoverySteps.map((step, idx) => (
                    <div key={idx} className="flex items-start space-x-2 font-mono text-[11px] text-slate-400 bg-slate-900/40 p-2 rounded">
                      <span className="w-5 h-5 rounded-full bg-slate-950 flex items-center justify-center font-bold text-[9px] text-emerald-400 border border-slate-900 flex-shrink-0 scale-90">
                        0{idx + 1}
                      </span>
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Corrected comparison script block if fix command was activated */}
              {diagnosticResponse.fixedCode ? (
                <div className="bg-[#05060b] border border-slate-900 p-4 rounded">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="font-mono text-[9px] font-bold text-emerald-400 tracking-wider uppercase block">
                      optimized code release candidate
                    </span>
                    <button
                      id="btn-copy-fixed-code"
                      onClick={() => {
                        navigator.clipboard.writeText(diagnosticResponse.fixedCode);
                        onAddLog("Optimized release candidate copied to system clipboard.", "terminal", "success");
                      }}
                      className="text-slate-500 hover:text-slate-300 text-[9px] flex items-center space-x-1 font-mono hover:bg-slate-900 px-1.5 py-0.5 rounded border border-slate-900"
                    >
                      <Copy className="w-3 h-3" />
                      <span>COPY CODE</span>
                    </button>
                  </div>
                  <pre className="text-[10px] font-mono leading-tight bg-black p-2 rounded border border-slate-950 max-h-40 overflow-y-auto text-emerald-300">
                    {diagnosticResponse.fixedCode}
                  </pre>
                </div>
              ) : (
                <div className="bg-[#060810] border border-slate-900 p-4 rounded text-center py-7 text-slate-550 text-xs">
                  <Code className="w-5 h-5 mx-auto text-slate-700 mb-1.5" />
                  No optimized script released. Run **AI AUTO-FIX** command to inspect rebuilt code blocks side-by-side.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
