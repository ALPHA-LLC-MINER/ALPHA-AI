import React, { useState, useEffect } from "react";
import { 
  NetworkNode, ActivityLog, SystemStatus, UserAccount, UserSessionData 
} from "./types";
import NetworkTopology from "./components/NetworkTopology";
import CommandTerminal from "./components/CommandTerminal";
import SecurityMFA from "./components/SecurityMFA";
import CloudArchitect from "./components/CloudArchitect";
import ConnectorHub from "./components/ConnectorHub";
import VoiceCompanionHub from "./components/VoiceCompanionHub";
import FloatingAssistant from "./components/FloatingAssistant";
import SupportCenter from "./components/SupportCenter";
import { 
  Radio, Shield, Terminal, Settings2, ShieldCheck, Cpu, 
  HelpCircle, Globe, RefreshCcw, Activity, Key, Sliders, CheckCircle, Flame, Bot,
  User, Lock, UserPlus, Monitor, Smartphone, Power, LogOut, Check, Mail, LifeBuoy, ExternalLink
} from "lucide-react";

// Inherent model of initial virtual server connections
const INITIAL_NODES: NetworkNode[] = [
  {
    id: "balancer",
    name: "Web Balancer",
    type: "balancer",
    status: "active",
    ip: "192.168.1.1",
    load: 18,
    latency: 1.5,
    traffic: 12.8,
    ports: [80, 443],
    connections: ["gateway"]
  },
  {
    id: "gateway",
    name: "API Ingress Ingress",
    type: "gateway",
    status: "active",
    ip: "192.168.1.20",
    load: 12,
    latency: 2.1,
    traffic: 12.8,
    ports: [8080],
    connections: ["router"]
  },
  {
    id: "router",
    name: "WAN WAN Link Switch",
    type: "router",
    status: "active",
    ip: "10.0.0.1",
    load: 4,
    latency: 0.8,
    traffic: 124.5,
    ports: [22, 53],
    connections: ["database", "vm", "node"]
  },
  {
    id: "database",
    name: "Main SQL Database",
    type: "database",
    status: "active",
    ip: "10.0.3.14",
    load: 35,
    latency: 12.4,
    traffic: 5.2,
    ports: [5432],
    connections: []
  },
  {
    id: "vm",
    name: "Lab Worker Sandbox",
    type: "vm",
    status: "active",
    ip: "10.0.3.50",
    load: 2,
    latency: 4.5,
    traffic: 1.1,
    ports: [3000, 22],
    connections: []
  },
  {
    id: "node",
    name: "Auth Crypto Vault",
    type: "node",
    status: "active",
    ip: "10.0.3.18",
    load: 8,
    latency: 1.1,
    traffic: 18.2,
    ports: [8443],
    connections: []
  }
];

const INITIAL_LOGS: ActivityLog[] = [
  {
    id: "log_1",
    timestamp: new Date().toLocaleTimeString(),
    category: "system",
    source: "ALPHA CORE SYSTEM",
    message: "ALPHA AI Kernel loaded securely. Local process bound.",
    level: "success"
  },
  {
    id: "log_2",
    timestamp: new Date().toLocaleTimeString(),
    category: "network",
    source: "INTERFACE GATEWAY",
    message: "Outbound bridge active on port 3000.",
    level: "info"
  }
];

const INITIAL_CODE_TEMPLATE = `def compute_and_send_metrics(host, metrics_pool):
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
        
    return "All payloads executed inline"`;

export default function App() {
  // Core user accounts stored in localStorage
  const [registeredUsers, setRegisteredUsers] = useState<UserAccount[]>([]);
  
  // Current logged in user session
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  
  // View mode switcher: desktop and mobile simulation
  const [viewMode, setViewMode] = useState<"desktop" | "mobile">("desktop");

  const [activeTab, setActiveTab] = useState<"topology" | "lab" | "crypto" | "cloud" | "connectors" | "companion">("companion");
  const [nodes, setNodes] = useState<NetworkNode[]>(INITIAL_NODES);
  const [selectedNode, setSelectedNode] = useState<NetworkNode | null>(null);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(INITIAL_LOGS);
  
  // Custom user parameters in tuning diagnostic behavior
  const [systemPrompt, setSystemPrompt] = useState<string>(
    "Perform deep diagnostics and analyze for errors, memory leaks, and unencrypted port binds."
  );
  
  // Real-time sandboxed code buffer synced across terminal and connector hubs
  const [editorBuffer, setEditorBuffer] = useState<string>(INITIAL_CODE_TEMPLATE);
  
  // High fidelity credentials MFA active check state
  const [mfaActive, setMfaActive] = useState<boolean>(false);

  // Authentication states
  const [typedUsername, setTypedUsername] = useState("");
  const [typedPassword, setTypedPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [authSuggestion, setAuthSuggestion] = useState<string | null>(null);
  const [loginTab, setLoginTab] = useState<"signin" | "signup">("signin");

  // Signup fields
  const [signupUsername, setSignupUsername] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupFullName, setSignupFullName] = useState("");
  const [signupRole, setSignupRole] = useState("Architect Consultant");
  const [signupLiteracy, setSignupLiteracy] = useState("expert");
  const [signupPronoun, setSignupPronoun] = useState("they/them");
  const [signupTitle, setSignupTitle] = useState("Lead Systems Director");

  // Load and seed registered user accounts from localStorage on mount
  useEffect(() => {
    const savedUsers = localStorage.getItem("alpha_ai_registered_users");
    let usersList: UserAccount[] = [];
    if (!savedUsers) {
      usersList = [
        {
          username: "iconfarvie@gmail.com",
          fullName: "Farvie Icon",
          role: "DevOps Engineer",
          computerLiteracy: "expert",
          pronoun: "they/them",
          title: "Lead Architect",
          createdAt: new Date().toLocaleDateString(),
          password: "secure123"
        },
        {
          username: "admin",
          fullName: "Alpha Root Administrator",
          role: "System Admin",
          computerLiteracy: "expert",
          pronoun: "he/him",
          title: "Root Controller",
          createdAt: new Date().toLocaleDateString(),
          password: "admin123"
        }
      ];
      localStorage.setItem("alpha_ai_registered_users", JSON.stringify(usersList));
    } else {
      try {
        usersList = JSON.parse(savedUsers);
      } catch (e) {
        console.error("Failed to parse", e);
      }
    }
    setRegisteredUsers(usersList);

    // Auto-login active session if present in sessionStorage
    const savedSession = sessionStorage.getItem("alpha_ai_active_user");
    if (savedSession) {
      try {
        const parsedUser = JSON.parse(savedSession);
        setCurrentUser(parsedUser);
      } catch (e) {
        console.error("Failed session read", e);
      }
    }
  }, []);

  // Restore user-specific project state, logs, and parameters upon authentication
  useEffect(() => {
    if (currentUser) {
      const savedData = localStorage.getItem(`alpha_project_${currentUser.username}`);
      if (savedData) {
        try {
          const parsed: UserSessionData = JSON.parse(savedData);
          if (parsed.nodes) setNodes(parsed.nodes);
          if (parsed.activityLogs) setActivityLogs(parsed.activityLogs);
          if (parsed.systemPrompt) setSystemPrompt(parsed.systemPrompt);
          if (parsed.editorBuffer) setEditorBuffer(parsed.editorBuffer);
          setMfaActive(parsed.mfaActive || false);
          if (parsed.activeTab) setActiveTab(parsed.activeTab);
        } catch (err) {
          console.error("Error loading saved user data", err);
        }
      } else {
        // Initial defaults for newly registered users
        setNodes(INITIAL_NODES);
        setActivityLogs(INITIAL_LOGS);
        setSystemPrompt("Perform deep diagnostics and analyze for errors, memory leaks, and unencrypted port binds.");
        setEditorBuffer(INITIAL_CODE_TEMPLATE);
        setMfaActive(false);
        setActiveTab("companion");
      }
    }
  }, [currentUser]);

  // Handle auto-save storage anytime project configurations change
  useEffect(() => {
    if (currentUser) {
      const sessionData: UserSessionData = {
        nodes,
        activityLogs,
        systemPrompt,
        editorBuffer,
        mfaActive,
        activeTab
      };
      localStorage.setItem(`alpha_project_${currentUser.username}`, JSON.stringify(sessionData));
    }
  }, [nodes, activityLogs, systemPrompt, editorBuffer, mfaActive, activeTab, currentUser]);

  // Auto calculate average infrastructure load and status priority
  const avgLoad = Math.round(nodes.reduce((acc, n) => acc + n.load, 0) / nodes.length);
  const avgLatency = Math.round(nodes.reduce((acc, n) => acc + n.latency, 0) / nodes.length);

  const getSystemStatus = (): SystemStatus => {
    if (nodes.some(n => n.status === "error")) return "CRITICAL";
    if (nodes.some(n => n.status === "warning") || avgLoad > 75) return "WARNING";
    return "SECURE";
  };

  const getStatusColorClass = (status: SystemStatus) => {
    if (status === "CRITICAL") return "text-red-500 border-red-500 bg-red-950/20";
    if (status === "WARNING") return "text-amber-500 border-amber-500 bg-amber-950/20";
    return "text-emerald-400 border-emerald-900/60 bg-emerald-950/20";
  };

  const addLog = (
    message: string, 
    category: "security" | "network" | "recovery" | "terminal" | "system", 
    level: "info" | "warning" | "error" | "success"
  ) => {
    const newLog: ActivityLog = {
      id: "log_" + Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toLocaleTimeString(),
      source: "ALPHA RECOVERY DAEMON",
      category,
      message,
      level
    };
    setActivityLogs(l => [newLog, ...l]);
  };

  const updateNodeStatus = (nodeId: string, status: "active" | "warning" | "error", extra?: Partial<NetworkNode>) => {
    setNodes(prev => prev.map(n => {
      if (n.id === nodeId) {
        return {
          ...n,
          status,
          ...(extra || {})
        };
      }
      return n;
    }));
  };

  // Login handler
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthSuggestion(null);

    const userIn = typedUsername.trim();
    if (!userIn || !typedPassword) {
      setAuthError("Credential inputs cannot be blank.");
      return;
    }

    const matchedUser = registeredUsers.find(
      u => u.username.toLowerCase() === userIn.toLowerCase()
    );

    if (!matchedUser) {
      setAuthError(`No verified diagnostic credential found matching identifier: ${userIn}`);
      setAuthSuggestion(userIn);
      return;
    }

    if (matchedUser.password !== typedPassword) {
      setAuthError("Crypt decryption failed: The provided security authentication key is invalid.");
      return;
    }

    // Success! Set the session
    setCurrentUser(matchedUser);
    sessionStorage.setItem("alpha_ai_active_user", JSON.stringify(matchedUser));
    
    // Log the action 
    addLog(`User '${matchedUser.fullName}' login verified. Loaded project state securely.`, "security", "success");
  };

  // Sign up handler
  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");

    const newUsername = signupUsername.trim();
    if (!newUsername || !signupPassword || !signupFullName) {
      setAuthError("Please fill out all registered identity credentials.");
      return;
    }

    const holdsPrior = registeredUsers.some(
      u => u.username.toLowerCase() === newUsername.toLowerCase()
    );

    if (holdsPrior) {
      setAuthError("This credential identifier is already registered. Try login or specify a different address.");
      return;
    }

    // Provision new user object
    const createdUser: UserAccount = {
      username: newUsername,
      password: signupPassword,
      fullName: signupFullName.trim(),
      role: signupRole,
      computerLiteracy: signupLiteracy,
      pronoun: signupPronoun,
      title: signupTitle || "System Architect",
      createdAt: new Date().toLocaleDateString()
    };

    const nextUsers = [...registeredUsers, createdUser];
    setRegisteredUsers(nextUsers);
    localStorage.setItem("alpha_ai_registered_users", JSON.stringify(nextUsers));

    // Sign the user in automatically
    setCurrentUser(createdUser);
    sessionStorage.setItem("alpha_ai_active_user", JSON.stringify(createdUser));

    addLog(`Newly initialized profile established for: ${createdUser.fullName}.`, "system", "success");
  };

  // Suggestion action to switch tab and pre-fill username
  const handleApplySuggestion = (usr: string) => {
    setSignupUsername(usr);
    setLoginTab("signup");
    setAuthError("");
    setAuthSuggestion(null);
  };

  // Logout handler
  const handleLogout = () => {
    setCurrentUser(null);
    sessionStorage.removeItem("alpha_ai_active_user");
    setTypedUsername("");
    setTypedPassword("");
    setAuthError("");
    setAuthSuggestion(null);
  };

  // Sync selectedNode state if updated inside topology component simulation
  useEffect(() => {
    if (selectedNode) {
      const match = nodes.find(n => n.id === selectedNode.id);
      if (match) setSelectedNode(match);
    }
  }, [nodes, selectedNode]);

  // Sticky top control bar for viewport rendering modes and operator profile metrics
  const workspaceModeSelectorBar = (
    <div className="bg-[#020409] border-b border-slate-850 px-4 md:px-6 py-2.5 flex flex-col md:flex-row md:items-center md:justify-between text-[11px] font-mono shrink-0 select-none text-slate-400 gap-2 font-serif">
      <div className="flex items-center space-x-2">
        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
        <span className="font-bold tracking-wider text-slate-300">ALPHA CORE INTERFACE REPLICATION SYSTEMS</span>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        {currentUser && (
          <span className="text-[11px] text-slate-400 border-r border-[#1e293b] pr-3 leading-none font-serif">
            OPERATOR: <strong className="text-[#818cf8] font-bold font-serif">{currentUser.title} / {currentUser.fullName} ({currentUser.role})</strong>
          </span>
        )}
        <div className="flex items-center space-x-1 bg-[#0b1021] border border-slate-800 rounded p-0.5 shrink-0">
          <button 
            type="button"
            onClick={() => setViewMode("desktop")}
            className={`px-3 py-1 rounded text-[10px] font-serif font-bold flex items-center space-x-1.5 transition cursor-pointer ${viewMode === "desktop" ? "bg-indigo-950/70 text-indigo-300 border border-indigo-900/40" : "text-slate-550 hover:text-slate-300"}`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Desktop Mode</span>
          </button>
          <button 
            type="button"
            onClick={() => setViewMode("mobile")}
            className={`px-3 py-1 rounded text-[10px] font-serif font-bold flex items-center space-x-1.5 transition cursor-pointer ${viewMode === "mobile" ? "bg-indigo-950/70 text-indigo-300 border border-indigo-900/40" : "text-slate-550 hover:text-slate-300"}`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Mobile Mode</span>
          </button>
        </div>
      </div>
    </div>
  );

  // Authenticated core UI home matrix layout 
  const mainAppHTML = (
    <div className={`flex flex-col flex-1 justify-between bg-[#04060c] ${viewMode === "mobile" ? "text-slate-100 font-sans" : "min-h-screen text-slate-100 font-sans"}`} id="alpha-ai-mainframe">
      {/* Upper Main Headings Banner */}
      <header className="border-b border-slate-800 bg-[#060a16] px-4 md:px-6 py-4 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          
          {/* Logo Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-950/40 border border-indigo-800 flex items-center justify-center text-indigo-400 shrink-0">
              <Shield className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h1 className="font-sans font-extrabold text-[#f1f5f9] text-base tracking-wider flex items-center gap-1.5 leading-none">
                ALPHA <span className="text-[#818cf8] font-mono select-all">AI</span>
              </h1>
              <p className="font-mono text-slate-500 text-[9px] leading-none pt-1 uppercase">
                SYSTEM DIAGNOSTICS & DECRYPTION CORES
              </p>
            </div>
          </div>

          {/* Core Hardware Metrics Dashboard Gauges */}
          <div className="flex flex-wrap items-center gap-2 text-left">
            {/* Status priority indicator bubble */}
            <div className={`flex items-center space-x-2 text-[10px] font-mono font-bold border px-2 py-1 rounded uppercase leading-none ${getStatusColorClass(getSystemStatus())}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${getSystemStatus() === "CRITICAL" ? "bg-red-500 animate-ping" : getSystemStatus() === "WARNING" ? "bg-amber-500 text-amber-500" : "bg-emerald-400"}`} />
              <span>BOUNDS: {getSystemStatus()}</span>
            </div>

            {/* Average CPU Cluster Load state */}
            <div className="bg-[#0b1021] border border-slate-800 rounded px-2 py-0.5 text-center shrink-0">
              <span className="block font-mono text-slate-500 text-[8px] uppercase leading-none font-sans">Avg Load</span>
              <span className="font-mono text-[10px] text-slate-200 font-bold block pt-0.5">{avgLoad}%</span>
            </div>

            {/* Ingress latency ms indicator */}
            <div className="bg-[#0b1021] border border-slate-800 rounded px-2 py-0.5 text-center shrink-0">
              <span className="block font-mono text-slate-500 text-[8px] uppercase leading-none font-sans">Net Latency</span>
              <span className="font-mono text-[10px] text-slate-200 font-bold block pt-0.5">{avgLatency}ms</span>
            </div>

            {/* Logged in User tag with Signout button */}
            <button 
              onClick={handleLogout}
              className="p-1.5 bg-red-950/20 border border-red-900/60 text-red-400 hover:bg-red-900/30 rounded transition flex items-center space-x-1 uppercase text-[9px] cursor-pointer font-sans"
              title="Sign Out Operations Client"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>SIGN OUT</span>
            </button>
          </div>

        </div>
      </header>

      {/* Main Administrative HUD tabs */}
      <main className="max-w-7xl mx-auto w-full flex-1 px-4 lg:px-6 py-6 space-y-6">
        
        {/* Navigation Tabs bar */}
        <div className="flex flex-wrap gap-1.5 border-b border-slate-850 pb-1.5 justify-start">
          <button
            id="tab-view-companion"
            onClick={() => setActiveTab("companion")}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded font-mono text-[11px] font-bold border transition ${
              activeTab === "companion"
              ? "bg-[#090f1d] border-emerald-850 text-emerald-400 shadow-md"
              : "bg-transparent border-transparent text-indigo-400 hover:text-emerald-400"
            }`}
          >
            <Bot className="w-3.5 h-3.5 animate-pulse text-emerald-400 shrink-0" />
            <span>Voice Companion Hub</span>
          </button>

          <button
            id="tab-view-topology"
            onClick={() => setActiveTab("topology")}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded font-mono text-[11px] font-bold border transition ${
              activeTab === "topology"
              ? "bg-[#090f1d] border-indigo-850 text-indigo-400 shadow"
              : "bg-transparent border-transparent text-slate-400 hover:text-slate-300"
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Interactive Map</span>
          </button>

          <button
            id="tab-view-lab"
            onClick={() => setActiveTab("lab")}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded font-mono text-[11px] font-bold border transition ${
              activeTab === "lab"
              ? "bg-[#090f1d] border-indigo-850 text-indigo-400 shadow"
              : "bg-transparent border-transparent text-slate-400 hover:text-slate-300"
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>AI Shell Sandbox</span>
          </button>

          <button
            id="tab-view-crypto"
            onClick={() => setActiveTab("crypto")}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded font-mono text-[11px] font-bold border transition ${
              activeTab === "crypto"
              ? "bg-[#090f1d] border-indigo-850 text-indigo-400 shadow"
              : "bg-transparent border-transparent text-slate-400 hover:text-slate-300"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>MFA & Crypt</span>
          </button>

          <button
            id="tab-view-cloud"
            onClick={() => setActiveTab("cloud")}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded font-mono text-[11px] font-bold border transition ${
              activeTab === "cloud"
              ? "bg-[#090f1d] border-indigo-850 text-indigo-400 shadow"
              : "bg-transparent border-transparent text-slate-400 hover:text-slate-300"
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Cloud Ingress</span>
          </button>

          <button
            id="tab-view-connectors"
            onClick={() => setActiveTab("connectors")}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded font-mono text-[11px] font-bold border transition ${
              activeTab === "connectors"
              ? "bg-[#090f1d] border-indigo-850 text-[#818cf8] shadow"
              : "bg-transparent border-transparent text-slate-400 hover:text-slate-300"
            }`}
          >
            <Settings2 className="w-3.5 h-3.5" />
            <span>Connectors</span>
          </button>

          <button
            id="tab-view-support"
            onClick={() => setActiveTab("support")}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded font-mono text-[11px] font-bold border transition ${
              activeTab === "support"
              ? "bg-[#090f1d] border-indigo-850 text-[#818cf8] shadow"
              : "bg-transparent border-transparent text-[#818cf8]/75 hover:text-[#818cf8]"
            }`}
          >
            <LifeBuoy className="w-3.5 h-3.5 text-[#818cf8]" />
            <span>Support & Care</span>
          </button>
        </div>

        {/* Global AI Tuning parameter prompt input */}
        <div className="bg-[#0a0f1d] border border-slate-850 rounded-lg p-3 flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-left">
          <div className="flex items-start space-x-3 flex-1">
            <div className="w-8 h-8 rounded bg-indigo-950/50 border border-indigo-900 flex items-center justify-center text-indigo-400 font-bold text-xs flex-shrink-0 mt-0.5">
              AI
            </div>
            <div className="flex-1">
              <span className="font-mono text-[8.5px] font-bold text-indigo-400 tracking-wider uppercase block">
                TUNING ENGINE PARAMETERS (REAL-TIME MODEL PARAMETERS)
              </span>
              <input
                id="ai-tuning-system-prompt-input"
                type="text"
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                placeholder="Ex: Scan for SQL memory leaks, analyze code buffers for AST hazards"
                className="w-full bg-transparent border-none text-slate-200 text-xs font-medium focus:outline-none p-0 pt-0.5 placeholder-slate-650"
              />
            </div>
          </div>
          <div className="text-right flex items-center space-x-3 shrink-0">
            <span className="font-mono text-[9px] text-slate-500 uppercase">
              Model Hook: <span className="text-emerald-400 font-bold">gemini-3.5-flash</span>
            </span>
          </div>
        </div>

        {/* Render Tab views conditionally */}
        <div>
          {activeTab === "companion" && (
            <VoiceCompanionHub 
              onAddLog={addLog}
            />
          )}

          {activeTab === "topology" && (
            <NetworkTopology 
              nodes={nodes}
              selectedNode={selectedNode}
              onSelectNode={setSelectedNode}
              activityLogs={activityLogs}
              setActivityLogs={setActivityLogs}
              updateNodeStatus={updateNodeStatus}
            />
          )}

          {activeTab === "lab" && (
            <CommandTerminal 
              onAddLog={addLog}
              isOnline={true}
              systemPrompt={systemPrompt}
              editorBuffer={editorBuffer}
              setEditorBuffer={setEditorBuffer}
            />
          )}

          {activeTab === "crypto" && (
            <SecurityMFA 
              onAddLog={addLog}
              mfaActive={mfaActive}
              setMfaActive={setMfaActive}
            />
          )}

          {activeTab === "cloud" && (
            <CloudArchitect 
              onAddLog={addLog}
            />
          )}

          {activeTab === "connectors" && (
            <ConnectorHub 
              onAddLog={addLog}
              editorCode={editorBuffer}
            />
          )}

          {activeTab === "support" && (
            <SupportCenter 
              currentUser={currentUser}
              avgLoad={avgLoad}
              avgLatency={avgLatency}
              onAddLog={addLog}
            />
          )}
        </div>

        {/* Real-time Activity Logs Ticker Console */}
        <div className="bg-[#050812] border border-slate-850 rounded-lg p-4" id="realtime-activity-logs-ticker">
          <div className="flex items-center justify-between mb-2.5 border-b border-slate-900 pb-2">
            <h4 className="font-mono text-xs font-bold text-[#f1f5f9] uppercase tracking-wider flex items-center space-x-1.5 text-left">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>ALPHA RECOVERY DAEMON AUDIT STREAM</span>
            </h4>
            
            <button
              id="btn-purge-audit-logs"
              onClick={() => setActivityLogs([])}
              className="font-mono text-[9px] text-slate-500 hover:text-slate-350 border border-slate-900 px-2 py-0.5 rounded transition"
            >
              PURGE AUDIT STREAM
            </button>
          </div>

          <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
            {activityLogs.length > 0 ? (
              activityLogs.map(log => (
                <div key={log.id} className="font-mono text-[10px] flex items-start space-x-2 bg-slate-950/30 p-1.5 rounded border border-slate-950/50 leading-relaxed text-left">
                  <span className="text-slate-500 flex-shrink-0">[{log.timestamp}]</span>
                  <span className={`font-bold uppercase text-[9px] border px-1 rounded flex-shrink-0 leading-none py-0.5 mt-0.5 ${
                    log.level === "error" ? "bg-red-950/20 text-red-400 border-red-950/45" :
                    log.level === "warning" ? "bg-amber-950/20 text-amber-500 border-amber-950/45" :
                    log.level === "success" ? "bg-emerald-950/20 text-emerald-400 border-emerald-950/45" :
                    "bg-slate-900/60 text-indigo-400 border-slate-850"
                  }`}>
                    {log.category}
                  </span>
                  <span className={`font-semibold ${
                    log.level === "error" ? "text-red-400" :
                    log.level === "warning" ? "text-amber-500" :
                    log.level === "success" ? "text-slate-100" :
                    "text-slate-350"
                  }`}>
                    {log.message}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-slate-650 font-mono text-[10px]">
                No operational activity recorded under this session epoch. Initiate tests to populate audit events.
              </div>
            )}
          </div>
        </div>

      </main>

      {/* Corporate Footnotes and legal */}
      <footer className="border-t border-slate-900 bg-[#03060c] py-4 px-6 text-center select-none font-mono text-[9px] text-slate-600">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2">
          <span>ALPHA AI CORE • ENTERPRISE DEFIANCE SYSTEMS • HOST PORT 3000 COMPLIANT</span>
          <span>© 2026 INTERNAL SECURITY INTELLECTUAL MATRIX • OFFLINE BACKUPS SYNCHRONIZED</span>
        </div>
      </footer>

      <FloatingAssistant
        activeTab={activeTab}
        selectedNode={selectedNode}
        editorBuffer={editorBuffer}
        mfaActive={mfaActive}
        activityLogs={activityLogs}
        onAddLog={addLog}
      />
    </div>
  );

  // Elegant serif-oriented Login/Signup Form overlay
  const loginSignupPortal = (
    <div className="min-h-screen bg-[#020306] bg-opacity-95 text-slate-100 flex flex-col justify-center items-center py-12 px-4 select-none font-serif w-full">
      <div className="max-w-md w-full bg-[#050813] border border-slate-800 rounded-2xl p-8 shadow-2xl relative space-y-6">
        
        {/* Decorative corner highlights */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[#818cf8]/45 rounded-tl-2xl pointer-events-none" />
        <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-[#818cf8]/45 rounded-tr-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-[#818cf8]/45 rounded-bl-2xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[#818cf8]/45 rounded-br-2xl pointer-events-none" />

        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 rounded-xl bg-indigo-950/50 border border-indigo-700/60 flex items-center justify-center text-indigo-400">
            <Shield className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-black tracking-widest text-[#f1f5f9] uppercase">
            ALPHA <span className="text-indigo-400 font-mono">AI</span> MAINFRAME
          </h2>
          <p className="text-[10px] text-indigo-400 uppercase tracking-widest leading-none font-mono">
            PERSISTENT VERIFICATION ACCESS PORTAL
          </p>
        </div>

        {/* Switch View Tabs */}
        <div className="grid grid-cols-2 bg-[#04060c] border border-slate-850 p-1 rounded-lg">
          <button
            type="button"
            onClick={() => { setLoginTab("signin"); setAuthError(""); setAuthSuggestion(null); }}
            className={`py-2 rounded-md text-xs font-bold transition flex items-center justify-center space-x-2 cursor-pointer ${
              loginTab === "signin" 
                ? "bg-indigo-955/65 border border-indigo-900/40 text-indigo-300 shadow-sm" 
                : "text-slate-500 hover:text-slate-300"
            }`}
          >
            <Lock className="w-3.5 h-3.5 text-indigo-455" />
            <span>SIGN IN PROCESS</span>
          </button>
          <button
            type="button"
            onClick={() => { setLoginTab("signup"); setAuthError(""); setAuthSuggestion(null); }}
            className={`py-2 rounded-md text-xs font-bold transition flex items-center justify-center space-x-2 cursor-pointer ${
              loginTab === "signup" 
                ? "bg-indigo-955/65 border border-indigo-900/40 text-indigo-300 shadow-sm" 
                : "text-slate-500 hover:text-slate-300"
            }`}
          >
            <UserPlus className="w-3.5 h-3.5 text-indigo-455" />
            <span>NEW VECTOR SIGNUP</span>
          </button>
        </div>

        {/* Warnings / Error feedback */}
        {authError && (
          <div className="bg-red-955/20 border border-red-900/40 rounded-lg p-3.5 text-xs text-red-400 leading-normal text-left font-serif space-y-1 animate-fadeIn">
            <span className="font-bold text-[9px] font-mono text-red-500 block uppercase">ACCESS REJECTION</span>
            <p>{authError}</p>
          </div>
        )}

        {/* Dynamic Verification Suggestion block */}
        {authSuggestion && (
          <div className="bg-amber-955/20 border border-amber-800/40 rounded-lg p-4 text-xs text-amber-400 leading-normal text-left font-serif space-y-2.5 animate-fadeIn">
            <span className="font-bold text-[8.5px] bg-amber-950 border border-amber-900 px-2 py-0.5 rounded font-mono text-amber-500 uppercase tracking-widest block w-fit">VERIFICATION SUGGESTION</span>
            <p className="text-slate-300">
              The credentials for <strong className="text-amber-405">"{authSuggestion}"</strong> are not registered or formally verified in database directory coordinates. 
            </p>
            <button
              type="button"
              onClick={() => handleApplySuggestion(authSuggestion)}
              className="mt-1 w-full bg-amber-950/60 border border-amber-800 text-amber-400 hover:bg-amber-955 text-xs py-1.5 font-bold rounded cursor-pointer transition flex items-center justify-center space-x-2"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Create New Account for '{authSuggestion}'</span>
            </button>
          </div>
        )}

        {/* SIGN IN VIEW */}
        {loginTab === "signin" && (
          <form onSubmit={handleLoginSubmit} className="space-y-4 text-left">
            <div>
              <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1.5">
                Operator Username Coordinating Identifier
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-650">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={typedUsername}
                  onChange={(e) => setTypedUsername(e.target.value)}
                  placeholder="e.g. iconfarvie@gmail.com"
                  className="w-full bg-[#04060c] border border-slate-850 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-205 outline-none focus:border-indigo-750 transition placeholder:text-slate-700"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1.5">
                Client Cryptography Access Passkey
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-650">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={typedPassword}
                  onChange={(e) => setTypedPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#04060c] border border-slate-850 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-205 outline-none focus:border-indigo-750 transition placeholder:text-slate-700"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-950 hover:bg-indigo-900 border border-indigo-750 text-indigo-400 hover:text-indigo-300 font-bold py-2.5 rounded-lg text-sm transition cursor-pointer select-none font-serif uppercase tracking-widest"
            >
              Verify Credentials & Terminate Locks
            </button>
          </form>
        )}

        {/* SIGN UP VIEW */}
        {loginTab === "signup" && (
          <form onSubmit={handleSignupSubmit} className="space-y-3.5 text-left">
            <div>
              <label className="block text-[9.5px] font-mono text-slate-500 uppercase tracking-widest mb-1">
                Establish Operator Username Coordinate
              </label>
              <input
                type="text"
                value={signupUsername}
                onChange={(e) => setSignupUsername(e.target.value)}
                placeholder="e.g. iconfarvie@gmail.com"
                className="w-full bg-[#04060c] border border-slate-850 rounded-lg px-3 py-1.5 text-xs text-slate-200 outline-none focus:border-indigo-755 transition placeholder:text-slate-700"
              />
            </div>

            <div>
              <label className="block text-[9.5px] font-mono text-slate-500 uppercase tracking-widest mb-1">
                Assign Secure Passphrase
              </label>
              <input
                type="password"
                value={signupPassword}
                onChange={(e) => setSignupPassword(e.target.value)}
                placeholder="Crypt Key"
                className="w-full bg-[#04060c] border border-slate-850 rounded-lg px-3 py-1.5 text-xs text-slate-200 outline-none focus:border-indigo-755 transition placeholder:text-slate-700"
              />
            </div>

            <div>
              <label className="block text-[9.5px] font-mono text-slate-500 uppercase tracking-widest mb-1">
                Architect Full Name
              </label>
              <input
                type="text"
                value={signupFullName}
                onChange={(e) => setSignupFullName(e.target.value)}
                placeholder="e.g. Farvie Icon"
                className="w-full bg-[#04060c] border border-slate-850 rounded-lg px-3 py-1.5 text-xs text-slate-200 outline-none focus:border-indigo-755 transition placeholder:text-slate-700"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[9.5px] font-mono text-slate-500 uppercase tracking-widest mb-1">
                  Operator Role
                </label>
                <select
                  value={signupRole}
                  onChange={(e) => setSignupRole(e.target.value)}
                  className="w-full bg-[#04060c] border border-slate-850 rounded-lg px-2 py-1.5 text-xs text-slate-210 outline-none focus:border-indigo-755 cursor-pointer font-serif"
                >
                  <option value="Lead Developer">Lead Developer</option>
                  <option value="DevOps Engineer">DevOps Engineer</option>
                  <option value="Security Auditor">Security Auditor</option>
                  <option value="System Architect">System Architect</option>
                </select>
              </div>

              <div>
                <label className="block text-[9.5px] font-mono text-slate-500 uppercase tracking-widest mb-1">
                  Pronouns
                </label>
                <select
                  value={signupPronoun}
                  onChange={(e) => setSignupPronoun(e.target.value)}
                  className="w-full bg-[#04060c] border border-slate-850 rounded-lg px-2 py-1.5 text-xs text-slate-210 outline-none focus:border-indigo-755 cursor-pointer font-serif"
                >
                  <option value="they/them">they/them</option>
                  <option value="he/him">he/him</option>
                  <option value="she/her">she/her</option>
                  <option value="other">other/identity</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[9.5px] font-mono text-slate-500 uppercase tracking-widest mb-1">
                  Literacy Level
                </label>
                <select
                  value={signupLiteracy}
                  onChange={(e) => setSignupLiteracy(e.target.value)}
                  className="w-full bg-[#04060c] border border-slate-850 rounded-lg px-2 py-1.5 text-xs text-slate-210 outline-none focus:border-indigo-755 cursor-pointer font-serif"
                >
                  <option value="expert">Expert (Admin)</option>
                  <option value="advanced">Advanced Specialist</option>
                  <option value="intermediate">Intermediate Tech</option>
                </select>
              </div>

              <div>
                <label className="block text-[9.5px] font-mono text-slate-500 uppercase tracking-widest mb-1">
                  Security Title
                </label>
                <input
                  type="text"
                  value={signupTitle}
                  onChange={(e) => setSignupTitle(e.target.value)}
                  placeholder="Root Operator"
                  className="w-full bg-[#04060c] border border-slate-850 rounded-lg px-3 py-1.5 text-xs text-slate-210 outline-none focus:border-indigo-755 transition placeholder:text-slate-700"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-950 hover:bg-emerald-900 border border-emerald-700 text-emerald-400 hover:text-emerald-300 font-bold py-2 py-2.5 rounded-lg text-sm transition cursor-pointer select-none font-serif uppercase tracking-widest mt-2"
            >
              Verify & Provision Node profile
            </button>
          </form>
        )}

        {/* Ledger list of verified credentials */}
        <div className="bg-[#03060c] border border-slate-900 p-2.5 rounded-lg text-left text-[11px] text-slate-505 font-serif space-y-1">
          <span className="font-bold text-[9px] font-mono text-[#818cf8] uppercase tracking-wider block">Verified Mainframe Keys (Pre-registered Accounts)</span>
          <p className="text-slate-500">For instant workspace logins, use standard verified coordinates:</p>
          <ul className="list-disc pl-4 space-y-0.5 text-slate-450 font-mono text-[9.5px]">
            <li>Username: <span className="text-[#818cf8] font-bold select-all">iconfarvie@gmail.com</span> / Key: <span className="text-[#818cf8] font-bold">secure123</span></li>
            <li>Username: <span className="text-[#818cf8] font-bold select-all">admin</span> / Key: <span className="text-[#818cf8] font-bold">admin123</span></li>
          </ul>
        </div>

        {/* System Support & Customer Care coordinates */}
        <div className="bg-[#040815] border border-indigo-950/60 p-3 rounded-lg text-left text-[11px] space-y-1.5 font-serif">
          <div className="flex items-center space-x-1.5 text-indigo-405">
            <Mail className="w-3.5 h-3.5 text-indigo-400" />
            <span className="font-bold font-mono text-[9px] uppercase tracking-wider text-indigo-400">Customer Care & Support</span>
          </div>
          <p className="text-slate-400 leading-normal font-sans text-[10px]">
            Locked out or need administrative assistance? Reach our desk directly:
          </p>
          <div className="flex items-center justify-between p-2 bg-slate-950 border border-slate-905 rounded">
            <span className="font-mono text-[10.5px] text-[#818cf8] font-bold select-all">Management.alpha@icloud.com</span>
            <a 
              href="mailto:Management.alpha@icloud.com?subject=%5BAlpha%20AI%5D%20Access%20Assistance"
              className="text-[9.5px] font-mono text-slate-400 hover:text-[#818cf8] transition flex items-center gap-0.5 bg-indigo-950/30 border border-indigo-900/60 px-1.5 py-0.5 rounded"
            >
              <span>Mail</span>
              <ExternalLink className="w-2.5 h-2.5 shrink-0" />
            </a>
          </div>
        </div>

      </div>
    </div>
  );

  // Decoupled Router App target view
  const appContent = currentUser ? mainAppHTML : loginSignupPortal;

  // Render Mobile Device View Shell
  if (viewMode === "mobile") {
    return (
      <div className="min-h-screen bg-[#010204] flex flex-col overflow-x-hidden font-serif">
        {workspaceModeSelectorBar}
        <div className="flex-1 w-full flex items-center justify-center py-6 px-4 overflow-y-auto">
          {/* Real simulated modern smartphone frame casing mockup */}
          <div className="relative w-full max-w-[395px] bg-[#04060c] border-[12px] border-slate-800 rounded-[44px] shadow-2xl overflow-hidden flex flex-col transition-all duration-300 shrink-0" style={{ height: "812px" }}>
            
            {/* Front facing sensor notch (Dynamic Island) */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-full z-50 flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-zinc-900 rounded-full ml-auto mr-3 shrink-0" />
            </div>

            {/* Smart simulated LTE connectivity status clock indicators */}
            <div className="bg-[#060a16] text-slate-400 text-[10px] font-mono px-5 pt-8 pb-1.5 flex justify-between items-center select-none z-30 shrink-0 border-b border-indigo-950/20 leading-none">
              <span className="font-bold">22:58</span>
              <div className="flex items-center space-x-1 px-1 py-0.5 rounded">
                <span className="text-[7.5px] text-[#818cf8] font-bold leading-none tracking-widest font-mono uppercase">5G</span>
                <div className="w-3.5 h-2 bg-slate-500 rounded-xs relative ml-1">
                  <div className="absolute top-0.5 right-[-1.5px] w-[1.5px] h-[3px] bg-slate-500 rounded-full" />
                </div>
              </div>
            </div>

            {/* Content holder scroll frame */}
            <div className="flex-1 overflow-y-auto flex flex-col bg-[#04060c]">
              {appContent}
            </div>

            {/* Bottom device task pill */}
            <div className="absolute bottom-1 right-0 left-0 w-full h-1 flex items-center justify-center pointer-events-none z-40">
              <div className="w-24 h-1 bg-slate-750/90 rounded-full" />
            </div>

          </div>
        </div>
      </div>
    );
  }

  // Desktop Wide View Layout renders full screen natively
  return (
    <div className="min-h-screen bg-[#04060c] flex flex-col overflow-x-hidden font-serif">
      {workspaceModeSelectorBar}
      <div className="flex-1 flex flex-col">
        {appContent}
      </div>
    </div>
  );
}
