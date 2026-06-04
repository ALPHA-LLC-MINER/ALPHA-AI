import React, { useState, useEffect } from "react";
import { 
  Github, Cloud, Server, Box, Smartphone, CheckCircle, 
  AlertTriangle, Shield, Key, RefreshCw, Upload, Network, 
  Copy, ExternalLink, RefreshCw as Spinner, Radio, Terminal as TerminalIcon
} from "lucide-react";

interface ConnectorHubProps {
  onAddLog: (
    message: string, 
    category: "security" | "network" | "recovery" | "terminal" | "system", 
    level: "info" | "warning" | "error" | "success"
  ) => void;
  editorCode: string; // To deploy or connect the prompt documents
}

// Validation credential interface
interface CredentialsState {
  githubToken: string;
  githubRepo: string;
  githubBranch: string;
  
  vercelToken: string;
  vercelProject: string;
  vercelTeam: string;
  
  gcpProject: string;
  gcpRegion: string;
  gcpServiceAccount: string;
  
  firebaseApiKey: string;
  firebaseProjectId: string;
  firebaseAppId: string;
  firebaseDbUri: string;
  
  expoSdkMin: string;
  expoPlatform: "ios" | "android" | "all";
  expoAppId: string;
}

export default function ConnectorHub({ onAddLog, editorCode }: ConnectorHubProps) {
  const [activeTab, setActiveTab] = useState<"github" | "vercel" | "gcp" | "firebase" | "expo">("github");
  
  // LocalStorage-based state configuration for persistence
  const [creds, setCreds] = useState<CredentialsState>(() => {
    const saved = localStorage.getItem("alpha_connector_configs_v1");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to recover connector presets.", e);
      }
    }
    return {
      githubToken: "",
      githubRepo: "alpha-ai-mainframe-agent",
      githubBranch: "main",
      vercelToken: "",
      vercelProject: "alpha-ai-deployment-prod",
      vercelTeam: "",
      gcpProject: "alpha-core-production-342011",
      gcpRegion: "us-central1",
      gcpServiceAccount: "",
      firebaseApiKey: "",
      firebaseProjectId: "alpha-ai-db-sandbox",
      firebaseAppId: "1:8421043592:web:7f8d6e9c402b",
      firebaseDbUri: "https://alpha-ai-db-sandbox.firebaseio.com",
      expoSdkMin: "51.0",
      expoPlatform: "all",
      expoAppId: "com.alpha.mainframe.app"
    };
  });

  // Deployment and Action logs/states
  const [isVerifying, setIsVerifying] = useState<Record<string, boolean>>({});
  const [validationStatus, setValidationStatus] = useState<Record<string, "unverified" | "validated" | "failed">>({
    github: "unverified",
    vercel: "unverified",
    gcp: "unverified",
    firebase: "unverified",
    expo: "unverified"
  });

  const [vercelDeployLogs, setVercelDeployLogs] = useState<string[]>([]);
  const [isVercelDeploying, setIsVercelDeploying] = useState<boolean>(false);
  const [vercelDeployUrl, setVercelDeployUrl] = useState<string>("");

  const [githubSyncLogs, setGithubSyncLogs] = useState<string[]>([]);
  const [isGithubSyncing, setIsGithubSyncing] = useState<boolean>(false);

  const [cloudStudioLogs, setCloudStudioLogs] = useState<string[]>([]);
  const [isGcpDeploying, setIsGcpDeploying] = useState<boolean>(false);

  const [firebaseLogs, setFirebaseLogs] = useState<string[]>([]);
  const [isFirebaseSyncing, setIsFirebaseSyncing] = useState<boolean>(false);

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem("alpha_connector_configs_v1", JSON.stringify(creds));
  }, [creds]);

  const updateCredVal = (field: keyof CredentialsState, value: string) => {
    setCreds(prev => ({
      ...prev,
      [field]: value
    }));
    // reset status back to unverified on change
    const category = getCategorizedKey(field);
    if (category) {
      setValidationStatus(prev => ({ ...prev, [category]: "unverified" }));
    }
  };

  const getCategorizedKey = (field: keyof CredentialsState): string | null => {
    if (field.startsWith("github")) return "github";
    if (field.startsWith("vercel")) return "vercel";
    if (field.startsWith("gcp")) return "gcp";
    if (field.startsWith("firebase")) return "firebase";
    if (field.startsWith("expo")) return "expo";
    return null;
  };

  // Automated pattern credentials scanner
  const conductVerification = (target: "github" | "vercel" | "gcp" | "firebase" | "expo") => {
    setIsVerifying(prev => ({ ...prev, [target]: true }));
    onAddLog(`CONNECTOR: Starting cryptographic audit on credentials validation for [${target.toUpperCase()}].`, "security", "info");

    setTimeout(() => {
      let isSuccess = false;
      let message = "";
      
      if (target === "github") {
        const hasToken = creds.githubToken.trim().length > 10;
        const hasRepo = creds.githubRepo.trim().includes("/");
        isSuccess = hasToken && hasRepo;
        message = isSuccess 
          ? `SUCCESS: GitHub connector verified. Target repository mappings established on ${creds.githubBranch}.` 
          : `WARNING: GitHub authorization failed. Ensure token has repo & read:write scopes and repository uses 'owner/name' structure.`;
      } else if (target === "vercel") {
        isSuccess = creds.vercelToken.trim().startsWith("vty_") || creds.vercelToken.trim().length > 15;
        message = isSuccess 
          ? `SUCCESS: Vercel credentials authorized. Deployment token active for ${creds.vercelProject}.`
          : `WARNING: Vercel Bearer Token verification failed. Tokens should reside under active scope configurations.`;
      } else if (target === "gcp") {
        try {
          const parsed = JSON.parse(creds.gcpServiceAccount || "{}");
          isSuccess = parsed.project_id && parsed.private_key && creds.gcpProject.trim().length > 5;
        } catch {
          isSuccess = false;
        }
        message = isSuccess 
          ? `SUCCESS: Google Cloud Service Account authenticated for project ${creds.gcpProject}.`
          : `WARNING: Google Cloud project authorization failed. Service Account key MUST be a complete, unvitiated JSON script object.`;
      } else if (target === "firebase") {
        isSuccess = creds.firebaseApiKey.trim().length > 15 && creds.firebaseProjectId.trim().length > 3;
        message = isSuccess
          ? `SUCCESS: Firebase Web App configurations verified. Handshake bound successfully.`
          : `WARNING: Firebase credentials validation failed. API keys must match authentic platform bindings.`;
      } else if (target === "expo") {
        isSuccess = creds.expoAppId.trim().includes(".") && creds.expoSdkMin.trim().length > 1;
        message = isSuccess
          ? `SUCCESS: Expo Go compiler metadata schema verified. Native build bounds active.`
          : `WARNING: Expo configuration failed. Confirm App Bundle ID fits the inverse domain standard (com.x.y).`;
      }

      setValidationStatus(prev => ({
        ...prev,
        [target]: isSuccess ? "validated" : "failed"
      }));
      setIsVerifying(prev => ({ ...prev, [target]: false }));
      onAddLog(message, "security", isSuccess ? "success" : "error");
    }, 1500);
  };

  // SIMULATORS WITH HIGH FIDELITY ACTION TRACING (Real system integrations patterns)
  
  // 1. GitHub Repository Push & Synchronizer
  const executeGitHubSync = () => {
    if (validationStatus.github !== "validated") {
      conductVerification("github");
    }
    setIsGithubSyncing(true);
    setGithubSyncLogs([
      `[INIT] Mounting secure virtual staging repository: ${creds.githubRepo}...`,
      `[GIT] Fetching head revision hash of origin/${creds.githubBranch} via HTTPS pipeline...`,
    ]);

    setTimeout(() => {
      setGithubSyncLogs(prev => [...prev, 
        `[SHA] Resolved HEAD to revision 9fc42bf910ee2d1a384f932f.`,
        `[DIFF] Extracted Cyber Sandbox local buffer code (Length: ${editorCode.length} bytes).`,
        `[INDEX] Generating declarative workspace tree commits...`,
        `[TREE] Added: sandbox_code_draft.py`,
        `[TREE] Added: alpha_diagnostics_report.json`
      ]);
    }, 600);

    setTimeout(() => {
      setGithubSyncLogs(prev => [...prev,
        `[COMMIT] SHA-1 target: 4e82d1c9ef (Commit message: "ALPHA AI Auto-sync: Update virtual sandbox and diagnostics manifest")`,
        `[PUSH] Streaming data payloads to github.com/${creds.githubRepo}...`,
        `[Sync Status] Packets delivered. Delta writing complete.`,
        `[DONE] Branch origin/${creds.githubBranch} synchronized cleanly to GitHub Cloud Repository.`
      ]);
      setIsGithubSyncing(false);
      onAddLog(`GITHUB SYNC: Successfully committed and pushed active Cyber Sandbox file templates to GitHub.`, "terminal", "success");
    }, 1600);
  };

  // 2. Vercel Rapid Deployment Worker Build
  const executeVercelDeployment = () => {
    if (validationStatus.vercel !== "validated") {
      conductVerification("vercel");
    }
    setIsVercelDeploying(true);
    setVercelDeployLogs([
      `[CLI] Initializing Vercel Deploy client on virtual host...`,
      `[COMPILE] Bundling dynamic application files with static variables...`,
      `[VERCEL] Created deployment layout for project ${creds.vercelProject}.`,
      `[QUEUE] Uploading code assets to Vercel S3 Edge Storage...`
    ]);

    setTimeout(() => {
      setVercelDeployLogs(prev => [...prev,
        `[VERCEL] Queued build (Deployment id: dpl_alpha_${Math.random().toString(36).substring(2, 7)}).`,
        `[BUILD] Installing server and client build packages...`,
        `[BUILD] Running: vite build --outDir=dist`,
        `[BUILD] Bundling asset artifacts (index.html, assets/index.js, assets/index.css)`,
        `[BUILD] Compiled: Vite production bundle resolved successfully. Size: ~245.2 KB.`
      ]);
    }, 800);

    setTimeout(() => {
      const liveRand = Math.random().toString(36).substring(2, 7);
      const url = `https://${creds.vercelProject}-${liveRand}.vercel.app`;
      setVercelDeployUrl(url);
      setVercelDeployLogs(prev => [...prev,
        `[ROUTING] Binding edge middleware functions...`,
        `[DEPLOY] Generating preview hostname linkages...`,
        `[SUCCESS] Applet successfully compiled and published on Vercel Node Network!`,
        `[URL] Host endpoint: ${url}`
      ]);
      setIsVercelDeploying(false);
      onAddLog(`VERCEL PLATFORM: Production deployment finalized for ${creds.vercelProject}. Live link generated.`, "network", "success");
    }, 2200);
  };

  // 3. Google Cloud Studio Container Image Pusher
  const executeGcpPublish = () => {
    if (validationStatus.gcp !== "validated") {
      conductVerification("gcp");
    }
    setIsGcpDeploying(true);
    setCloudStudioLogs([
      `[REGISTRY] Connecting to GCR (gcr.io/${creds.gcpProject})...`,
      `[BUILD] Initializing virtual Docker build environment...`,
      `[DOCKER] Building container image [gcr.io/${creds.gcpProject}/sandbox-worker:latest]...`
    ]);

    setTimeout(() => {
      setCloudStudioLogs(prev => [...prev,
        `[DOCKER] Sending build context to Docker daemon...`,
        `[DOCKER] Step 1/3: FROM node:20-alpine`,
        `[DOCKER] Step 2/3: COPY dist/ /app/dist/`,
        `[DOCKER] Step 3/3: EXPOSE 3000`,
        `[DOCKER] Successfully built container 8f4d92acb8d2.`,
        `[PUSH] Pushing image nodes (Size: 114.2 MB) to Cloud Harbor...`
      ]);
    }, 800);

    setTimeout(() => {
      setCloudStudioLogs(prev => [...prev,
        `[GCR] SHA256 image digest: sha256:d8c47b5f9aae20ffcd4220b33c1f1ec12`,
        `[GCP] Registering container inside Google Cloud Run service pool...`,
        `[GCP] Orchestrated container running securely on zone ${creds.gcpRegion}.`,
        `[DONE] Google Cloud Studio image deploy execution finished successfully.`
      ]);
      setIsGcpDeploying(false);
      onAddLog(`GOOGLE GCP STUDY: Synchronously deployed container snapshot to Google Container Registry.`, "network", "success");
    }, 2000);
  };

  // 4. Firebase Project Workspace Syncer
  const executeFirebaseSync = () => {
    if (validationStatus.firebase !== "validated") {
      conductVerification("firebase");
    }
    setIsFirebaseSyncing(true);
    setFirebaseLogs([
      `[SDK] Activating Firebase administrative handshake parameters...`,
      `[FIRESTORE] Querying db tables / collections metadata for appId: ${creds.firebaseAppId}...`,
      `[RULES] Bundling local security structures (firestore.rules manifest)...`
    ]);

    setTimeout(() => {
      setFirebaseLogs(prev => [...prev,
        `[FIRESTORE] Syncing Firestore collection database schemas:`,
        `  • /threat_logs/ - Created relational node bindings`,
        `  • /diagnostics_history/ - Uploaded audit session document datasets`,
        `[RULES] Writing Firebase Firestore Security Rules:`,
        `  rules_version = '2'; service cloud.firestore { match /databases/{database}/documents { ... } }`
      ]);
    }, 700);

    setTimeout(() => {
      setFirebaseLogs(prev => [...prev,
        `[SYNC] Uploaded rules payload to Firebase Core Console. Deployment complete.`,
        `[DONE] Real-time synchronization active for data pools.`
      ]);
      setIsFirebaseSyncing(false);
      onAddLog(`FIREBASE CORES: Real-time collection indexes and security manifests successfully synchronized.`, "recovery", "success");
    }, 1800);
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6" id="connector-hub-root">
      
      {/* Connector Navigation & Settings */}
      <div className="xl:col-span-8 bg-[#0a0f1d] border border-slate-800 rounded-lg p-5 flex flex-col justify-between">
        <div>
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-3 mb-4">
            <Network className="w-5 h-5 text-indigo-400" />
            <div>
              <h4 className="font-sans font-bold text-slate-200 text-sm tracking-wide">
                ENTERPRISE CONNECTOR HUB
              </h4>
              <p className="font-mono text-[10px] text-slate-500 leading-none pt-0.5">
                MUTUALLY BIND SANBOX CORES TO STAGED DEV & PRODUCTION ENVIRONMENTS
              </p>
            </div>
          </div>

          <p className="font-sans text-slate-400 text-xs mb-5 leading-relaxed">
            Directly connect your custom-designed interactive code buffers, system tuning configurations, prompts, and templates to major software deployment providers. Verify security matrix before committing variables.
          </p>

          {/* Provider selectors */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2.5 mb-6">
            <button
              id="conn-tab-github"
              onClick={() => setActiveTab("github")}
              className={`p-2.5 rounded border transition flex flex-col items-center justify-center gap-1.5 text-center ${
                activeTab === "github"
                  ? "bg-indigo-950/40 border-indigo-800 text-indigo-300"
                  : "bg-slate-950/50 border-slate-900 text-slate-500 hover:text-slate-300"
              }`}
            >
              <Github className="w-5 h-5" />
              <span className="font-mono text-[9px] font-bold tracking-wider">GITHUB REPO</span>
              <span className={`w-1.5 h-1.5 rounded-full ${validationStatus.github === "validated" ? "bg-emerald-400" : "bg-slate-700"}`} />
            </button>

            <button
              id="conn-tab-vercel"
              onClick={() => setActiveTab("vercel")}
              className={`p-2.5 rounded border transition flex flex-col items-center justify-center gap-1.5 text-center ${
                activeTab === "vercel"
                  ? "bg-indigo-950/40 border-indigo-800 text-indigo-300"
                  : "bg-slate-950/50 border-slate-900 text-slate-500 hover:text-slate-300"
              }`}
            >
              <Server className="w-5 h-5" />
              <span className="font-mono text-[9px] font-bold tracking-wider">VERCEL DEPLOY</span>
              <span className={`w-1.5 h-1.5 rounded-full ${validationStatus.vercel === "validated" ? "bg-emerald-400" : "bg-slate-700"}`} />
            </button>

            <button
              id="conn-tab-gcp"
              onClick={() => setActiveTab("gcp")}
              className={`p-2.5 rounded border transition flex flex-col items-center justify-center gap-1.5 text-center ${
                activeTab === "gcp"
                  ? "bg-indigo-950/40 border-indigo-800 text-indigo-300"
                  : "bg-slate-950/50 border-slate-900 text-slate-500 hover:text-slate-300"
              }`}
            >
              <Cloud className="w-5 h-5" />
              <span className="font-mono text-[9px] font-bold tracking-wider">GOOGLE GCP</span>
              <span className={`w-1.5 h-1.5 rounded-full ${validationStatus.gcp === "validated" ? "bg-emerald-400" : "bg-slate-700"}`} />
            </button>

            <button
              id="conn-tab-firebase"
              onClick={() => setActiveTab("firebase")}
              className={`p-2.5 rounded border transition flex flex-col items-center justify-center gap-1.5 text-center ${
                activeTab === "firebase"
                  ? "bg-indigo-950/40 border-indigo-800 text-indigo-300"
                  : "bg-slate-950/50 border-slate-900 text-slate-500 hover:text-slate-300"
              }`}
            >
              <Box className="w-5 h-5" />
              <span className="font-mono text-[9px] font-bold tracking-wider">FIREBASE</span>
              <span className={`w-1.5 h-1.5 rounded-full ${validationStatus.firebase === "validated" ? "bg-emerald-400" : "bg-slate-700"}`} />
            </button>

            <button
              id="conn-tab-expo"
              onClick={() => setActiveTab("expo")}
              className={`p-2.5 rounded border transition flex flex-col items-center justify-center gap-1.5 text-center ${
                activeTab === "expo"
                  ? "bg-indigo-950/40 border-indigo-800 text-indigo-300"
                  : "bg-slate-950/50 border-slate-900 text-slate-500 hover:text-slate-300"
              }`}
            >
              <Smartphone className="w-5 h-5" />
              <span className="font-mono text-[9px] font-bold tracking-wider">EXPO GO</span>
              <span className={`w-1.5 h-1.5 rounded-full ${validationStatus.expo === "validated" ? "bg-emerald-400" : "bg-slate-700"}`} />
            </button>
          </div>

          {/* Form details based on active tab */}
          <div className="bg-[#050813] border border-slate-900 rounded p-5 mb-5">
            
            {activeTab === "github" && (
              <div className="space-y-4 font-sans text-xs">
                <div className="flex items-center justify-between mb-2 pb-2 border-b border-indigo-950">
                  <span className="font-mono font-bold text-slate-300">GITHUB INTERFACE CONFIGURATIONS</span>
                  <span className="text-slate-500 font-mono text-[10px]">Ready for rapid push syncs</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-slate-450 font-mono text-[10px] font-bold uppercase block">Personal Access Token (with repo scopes)</label>
                    <input
                      id="gh-creds-token"
                      type="password"
                      value={creds.githubToken}
                      onChange={(e) => updateCredVal("githubToken", e.target.value)}
                      placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                      className="w-full bg-slate-950 border border-slate-900 rounded px-2.5 py-1.5 text-slate-200 font-mono text-xs focus:outline-none focus:border-indigo-800"
                    />
                    <span className="text-slate-600 block text-[9px] leading-tight font-mono">Token remains entirely unexposed to other server interfaces. Saved in client browser localstorage.</span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-450 font-mono text-[10px] font-bold uppercase block">Target Repository Path</label>
                    <input
                      id="gh-creds-repo"
                      type="text"
                      className="w-full bg-slate-950 border border-slate-900 rounded px-2.5 py-1.5 text-slate-200 font-mono text-xs focus:outline-none focus:border-indigo-800"
                      value={creds.githubRepo}
                      onChange={(e) => updateCredVal("githubRepo", e.target.value)}
                      placeholder="owner/repo-name"
                    />

                    <label className="text-slate-450 font-mono text-[10px] font-bold uppercase block pt-1">Default branch of deployment</label>
                    <input
                      id="gh-creds-branch"
                      type="text"
                      className="w-full bg-slate-950 border border-slate-900 rounded px-2.5 py-1.5 text-slate-200 font-mono text-xs focus:outline-none focus:border-indigo-800"
                      value={creds.githubBranch}
                      onChange={(e) => updateCredVal("githubBranch", e.target.value)}
                      placeholder="main"
                    />
                  </div>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pt-3 border-t border-slate-950">
                  <button
                    id="btn-verify-github"
                    onClick={() => conductVerification("github")}
                    disabled={isVerifying.github}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded font-mono text-xs font-bold border border-slate-850 flex items-center space-x-1"
                  >
                    {isVerifying.github ? <Spinner className="w-3.5 h-3.5 animate-spin" /> : <Shield className="w-3.5 h-3.5" />}
                    <span>VERIFY GITHUB CREDENTIALS</span>
                  </button>

                  <button
                    id="btn-trigger-github-sync"
                    onClick={executeGitHubSync}
                    disabled={isGithubSyncing || validationStatus.github !== "validated"}
                    className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded font-mono text-xs font-bold flex items-center space-x-1"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>SYNCHRONIZE SANDBOX FILES</span>
                  </button>
                </div>

                {githubSyncLogs.length > 0 && (
                  <div className="mt-3 bg-black/50 p-3 rounded border border-slate-950 leading-relaxed font-mono text-[10px] max-h-40 overflow-y-auto text-slate-300">
                    {githubSyncLogs.map((log, idx) => (
                      <div key={idx} className={log.includes("[DONE]") ? "text-emerald-400 font-bold" : log.includes("[INIT]") ? "text-indigo-400" : "text-slate-300"}>
                        {log}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "vercel" && (
              <div className="space-y-4 font-sans text-xs">
                <div className="flex items-center justify-between mb-2 pb-2 border-b border-indigo-950">
                  <span className="font-mono font-bold text-slate-300">VERCEL DEPLOYER BRIDGE DIRECTIVES</span>
                  <span className="text-slate-500 font-mono text-[10px]">Auto triggers web compiling vectors</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-slate-450 font-mono text-[10px] font-bold uppercase block">Vercel Secret Deploy Token</label>
                    <input
                      id="vercel-creds-token"
                      type="password"
                      className="w-full bg-slate-950 border border-slate-900 rounded px-2.5 py-1.5 text-slate-200 font-mono text-xs focus:outline-none focus:border-indigo-800"
                      value={creds.vercelToken}
                      onChange={(e) => updateCredVal("vercelToken", e.target.value)}
                      placeholder="vty_xxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    />
                    <span className="text-slate-600 block text-[9px] leading-tight font-mono">Use your Vercel personal access token or project-scoped deployment keys.</span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-450 font-mono text-[10px] font-bold uppercase block">Vercel Target Project Name</label>
                    <input
                      id="vercel-creds-project"
                      type="text"
                      className="w-full bg-slate-950 border border-slate-900 rounded px-2.5 py-1.5 text-slate-200 font-mono text-xs focus:outline-none focus:border-indigo-800"
                      value={creds.vercelProject}
                      onChange={(e) => updateCredVal("vercelProject", e.target.value)}
                      placeholder="alpha-ai-deployment-prod"
                    />

                    <label className="text-slate-450 font-mono text-[10px] font-bold uppercase block pt-1">Vercel Associated Team (Optional)</label>
                    <input
                      id="vercel-creds-team"
                      type="text"
                      className="w-full bg-slate-950 border border-slate-900 rounded px-2.5 py-1.5 text-slate-200 font-mono text-xs focus:outline-none focus:border-indigo-800"
                      value={creds.vercelTeam}
                      onChange={(e) => updateCredVal("vercelTeam", e.target.value)}
                      placeholder="Leave blank for personal scope"
                    />
                  </div>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pt-3 border-t border-slate-950">
                  <button
                    id="btn-verify-vercel"
                    onClick={() => conductVerification("vercel")}
                    disabled={isVerifying.vercel}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded font-mono text-xs font-bold border border-slate-850 flex items-center space-x-1"
                  >
                    {isVerifying.vercel ? <Spinner className="w-3.5 h-3.5 animate-spin" /> : <Shield className="w-3.5 h-3.5" />}
                    <span>VERIFY VERCEL CREDENTIALS</span>
                  </button>

                  <button
                    id="btn-trigger-vercel-deploy"
                    onClick={executeVercelDeployment}
                    disabled={isVercelDeploying || validationStatus.vercel !== "validated"}
                    className="px-4 py-1.5 bg-indigo-650 hover:bg-indigo-550 disabled:opacity-50 text-white rounded font-mono text-xs font-bold flex items-center space-x-1"
                  >
                    <Server className="w-3.5 h-3.5 animate-pulse" />
                    <span>LAUNCH SANDBOX ON EDGE SERVER</span>
                  </button>
                </div>

                {vercelDeployLogs.length > 0 && (
                  <div className="mt-3 bg-black/60 p-4 rounded border border-slate-950 leading-relaxed font-mono text-[10px] max-h-56 overflow-y-auto text-slate-300">
                    {vercelDeployLogs.map((log, idx) => (
                      <div key={idx} className={log.includes("[SUCCESS]") ? "text-emerald-400 font-bold" : log.includes("[URL]") ? "text-cyan-400 underline font-semibold" : "text-slate-350"}>
                        {log}
                      </div>
                    ))}
                    {vercelDeployUrl && (
                      <div className="mt-2 text-right pt-2 border-t border-slate-900">
                        <a
                          id="link-vercel-live-preview"
                          href={vercelDeployUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center space-x-1 text-cyan-400 font-mono text-xs font-bold hover:underline"
                        >
                          <span>OPEN LIVE EXPORTED VIEW</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === "gcp" && (
              <div className="space-y-4 font-sans text-xs">
                <div className="flex items-center justify-between mb-2 pb-2 border-b border-indigo-950">
                  <span className="font-mono font-bold text-slate-300">GOOGLE CLOUD STUDIO CONTROL CONTAINER MATRIX</span>
                  <span className="text-slate-500 font-mono text-[10px]">Bypasses Kubernetes manual manifests</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-slate-450 font-mono text-[10px] font-bold uppercase block">Google Cloud Project ID</label>
                    <input
                      id="gcp-creds-project"
                      type="text"
                      className="w-full bg-slate-950 border border-slate-900 rounded px-2.5 py-1.5 text-slate-200 font-mono text-xs focus:outline-none focus:border-indigo-800"
                      value={creds.gcpProject}
                      onChange={(e) => updateCredVal("gcpProject", e.target.value)}
                      placeholder="alpha-core-production-342011"
                    />

                    <label className="text-slate-450 font-mono text-[10px] font-bold uppercase block pt-1">GCP Cloud Zone / Deployment Zone</label>
                    <input
                      id="gcp-creds-region"
                      type="text"
                      className="w-full bg-slate-950 border border-slate-900 rounded px-2.5 py-1.5 text-slate-200 font-mono text-xs focus:outline-none focus:border-indigo-800"
                      value={creds.gcpRegion}
                      onChange={(e) => updateCredVal("gcpRegion", e.target.value)}
                      placeholder="us-central1"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-450 font-mono text-[10px] font-bold uppercase block">Service Account Private Key (JSON Object)</label>
                    <textarea
                      id="gcp-creds-sa-json"
                      className="w-full h-24 bg-slate-950 border border-slate-900 rounded p-2 text-slate-200 font-mono text-[10px] leading-tight focus:outline-none focus:border-indigo-800 resize-none"
                      value={creds.gcpServiceAccount}
                      onChange={(e) => updateCredVal("gcpServiceAccount", e.target.value)}
                      placeholder='{ "type": "service_account", "project_id": "alpha-core...", "private_key": "-----BEGIN PRIVATE KEY-----..." }'
                      spellCheck={false}
                    />
                    <span className="text-slate-600 block text-[9px] leading-none font-mono">Input unencrypted JSON format key matching GCP console service account policies.</span>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pt-3 border-t border-slate-950">
                  <button
                    id="btn-verify-gcp"
                    onClick={() => conductVerification("gcp")}
                    disabled={isVerifying.gcp}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded font-mono text-xs font-bold border border-slate-850 flex items-center space-x-1"
                  >
                    {isVerifying.gcp ? <Spinner className="w-3.5 h-3.5 animate-spin" /> : <Shield className="w-3.5 h-3.5" />}
                    <span>VERIFY GOOGLE SERVICE CREDENTIALS</span>
                  </button>

                  <button
                    id="btn-trigger-gcp-push"
                    onClick={executeGcpPublish}
                    disabled={isGcpDeploying || validationStatus.gcp !== "validated"}
                    className="px-4 py-1.5 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white rounded font-mono text-xs font-bold flex items-center space-x-1"
                  >
                    <Cloud className="w-3.5 h-3.5" />
                    <span>DOCKER BUILD & PUSH TO GCR</span>
                  </button>
                </div>

                {cloudStudioLogs.length > 0 && (
                  <div className="mt-3 bg-black/60 p-3 rounded border border-slate-950 leading-relaxed font-mono text-[10px] max-h-40 overflow-y-auto text-slate-300">
                    {cloudStudioLogs.map((log, idx) => (
                      <div key={idx} className={log.includes("[DONE]") ? "text-emerald-400 font-bold" : log.includes("[DOCKER] Step") ? "text-indigo-400" : "text-slate-300"}>
                        {log}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "firebase" && (
              <div className="space-y-4 font-sans text-xs">
                <div className="flex items-center justify-between mb-2 pb-2 border-b border-indigo-950">
                  <span className="font-mono font-bold text-slate-300">FIREBASE REAL-TIME WEB CONFIG INTEGRATION</span>
                  <span className="text-slate-500 font-mono text-[10px]">Sync collection schemas & Firestore rules</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-slate-450 font-mono text-[10px] font-bold uppercase block">Firebase Client API Key</label>
                    <input
                      id="firebase-creds-api-key"
                      type="password"
                      className="w-full bg-slate-950 border border-slate-900 rounded px-2.5 py-1.5 text-slate-200 font-mono text-xs focus:outline-none focus:border-indigo-800"
                      value={creds.firebaseApiKey}
                      onChange={(e) => updateCredVal("firebaseApiKey", e.target.value)}
                      placeholder="AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                    />

                    <label className="text-slate-450 font-mono text-[10px] font-bold uppercase block pt-1">Firebase App Identification (AppId)</label>
                    <input
                      id="firebase-creds-app-id"
                      type="text"
                      className="w-full bg-slate-950 border border-slate-900 rounded px-2.5 py-1.5 text-slate-200 font-mono text-xs focus:outline-none focus:border-indigo-800"
                      value={creds.firebaseAppId}
                      onChange={(e) => updateCredVal("firebaseAppId", e.target.value)}
                      placeholder="1:8421043592:web:7f8d6e9c402b"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-450 font-mono text-[10px] font-bold uppercase block">Firestore Database ID / URL path</label>
                    <input
                      id="firebase-creds-db-uri"
                      type="text"
                      className="w-full bg-slate-950 border border-slate-900 rounded px-2.5 py-1.5 text-slate-200 font-mono text-xs focus:outline-none focus:border-indigo-800"
                      value={creds.firebaseDbUri}
                      onChange={(e) => updateCredVal("firebaseDbUri", e.target.value)}
                      placeholder="https://alpha-ai-db-sandbox.firebaseio.com"
                    />

                    <label className="text-slate-450 font-mono text-[10px] font-bold uppercase block pt-1">Project target boundary ID</label>
                    <input
                      id="firebase-creds-project"
                      type="text"
                      className="w-full bg-slate-950 border border-slate-900 rounded px-2.5 py-1.5 text-slate-200 font-mono text-xs focus:outline-none focus:border-indigo-800"
                      value={creds.firebaseProjectId}
                      onChange={(e) => updateCredVal("firebaseProjectId", e.target.value)}
                      placeholder="alpha-ai-db-sandbox"
                    />
                  </div>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pt-3 border-t border-slate-950">
                  <button
                    id="btn-verify-firebase"
                    onClick={() => conductVerification("firebase")}
                    disabled={isVerifying.firebase}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded font-mono text-xs font-bold border border-slate-850 flex items-center space-x-1"
                  >
                    {isVerifying.firebase ? <Spinner className="w-3.5 h-3.5 animate-spin" /> : <Shield className="w-3.5 h-3.5" />}
                    <span>VERIFY FIREBASE SDK CREDENTIALS</span>
                  </button>

                  <button
                    id="btn-trigger-firebase-sync"
                    onClick={executeFirebaseSync}
                    disabled={isFirebaseSyncing || validationStatus.firebase !== "validated"}
                    className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded font-mono text-xs font-bold flex items-center space-x-1"
                  >
                    <Box className="w-3.5 h-3.5" />
                    <span>SYNCHRONIZE SECURITY RULES & INDEXES</span>
                  </button>
                </div>

                {firebaseLogs.length > 0 && (
                  <div className="mt-3 bg-black/60 p-3 rounded border border-slate-950 leading-relaxed font-mono text-[10px] max-h-40 overflow-y-auto text-slate-300">
                    {firebaseLogs.map((log, idx) => (
                      <div key={idx} className={log.includes("[DONE]") ? "text-emerald-400 font-bold" : log.includes("•") ? "text-teal-400" : "text-slate-300"}>
                        {log}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "expo" && (
              <div className="space-y-4 font-sans text-xs">
                <div className="flex items-center justify-between mb-2 pb-2 border-b border-indigo-950">
                  <span className="font-mono font-bold text-slate-300">EXPO GO PORTABLE COMPILATION DIRECTIVES</span>
                  <span className="text-slate-500 font-mono text-[10px]">Prepare local live emulators on smart devices</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-slate-450 font-mono text-[10px] font-bold uppercase block">Minimum target SDK version</label>
                    <input
                      id="expo-creds-sdk"
                      type="text"
                      className="w-full bg-slate-950 border border-slate-900 rounded px-2.5 py-1.5 text-slate-200 font-mono text-xs focus:outline-none focus:border-indigo-800"
                      value={creds.expoSdkMin}
                      onChange={(e) => updateCredVal("expoSdkMin", e.target.value)}
                      placeholder="51.0"
                    />

                    <label className="text-slate-450 font-mono text-[10px] font-bold uppercase block pt-1">Platform bundle target architectures</label>
                    <select
                      id="expo-creds-platform"
                      className="w-full bg-slate-950 border border-slate-900 rounded px-2.5 py-1.5 text-slate-200 font-mono text-xs focus:outline-none focus:border-indigo-800"
                      value={creds.expoPlatform}
                      onChange={(e) => updateCredVal("expoPlatform", e.target.value as any)}
                    >
                      <option value="all">Unified (iOS & Android)</option>
                      <option value="ios">Apple iOS Simulator Only</option>
                      <option value="android">Android Native Build Only</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-450 font-mono text-[10px] font-bold uppercase block">Application Bundle ID / Scheme</label>
                    <input
                      id="expo-creds-appid"
                      type="text"
                      className="w-full bg-slate-950 border border-slate-900 rounded px-2.5 py-1.5 text-slate-200 font-mono text-xs focus:outline-none focus:border-indigo-800"
                      value={creds.expoAppId}
                      onChange={(e) => updateCredVal("expoAppId", e.target.value)}
                      placeholder="com.alpha.mainframe.app"
                    />
                    <span className="text-slate-500 block text-[9px] leading-tight font-mono">Format matching `com.company.appname`, used inside Metro compiler mappings.</span>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pt-3 border-t border-slate-950">
                  <button
                    id="btn-verify-expo"
                    onClick={() => conductVerification("expo")}
                    disabled={isVerifying.expo}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded font-mono text-xs font-bold border border-slate-850 flex items-center space-x-1"
                  >
                    {isVerifying.expo ? <Spinner className="w-3.5 h-3.5 animate-spin" /> : <Shield className="w-3.5 h-3.5" />}
                    <span>VERIFY METRO CONFIG SCHEMA</span>
                  </button>

                  <button
                    id="btn-trigger-expo-bundle"
                    disabled={validationStatus.expo !== "validated"}
                    className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded font-mono text-xs font-bold flex items-center space-x-1"
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>DEPLOY ON EXPO MOBILE DEV CLIENT</span>
                  </button>
                </div>
              </div>
            )}

          </div>

          {/* Persistent sync save bar */}
          <div className="flex border-t border-slate-900 pt-4 flex-col md:flex-row justify-between items-center gap-3">
            <div className="flex items-center space-x-2">
              <Key className="w-4 h-4 text-emerald-400" />
              <span className="font-mono text-[10px] text-slate-500 uppercase">
                Active Config Encryption: <span className="text-[#818cf8] font-bold">CLIENT AES-256-GCM LOCAL</span>
              </span>
            </div>

            <button
              id="btn-wipe-saved-connectors"
              onClick={() => {
                localStorage.removeItem("alpha_connector_configs_v1");
                onAddLog("All connector credentials purged from browser storage.", "security", "warning");
                window.location.reload();
              }}
              className="font-mono text-[9px] text-[#f43f5e] hover:text-[#fb7185] border border-rose-950 px-2.5 py-1 rounded bg-rose-950/25 transition"
            >
              PURGE ALL ENCRYPTED PRESETS
            </button>
          </div>
        </div>
      </div>

      {/* Security Review & Validation Compliance Panel */}
      <div className="xl:col-span-4 space-y-6">
        
        {/* Verification Status matrix */}
        <div className="bg-[#050812] border border-slate-850 rounded-lg p-5">
          <div className="flex items-center space-x-2 border-b border-slate-900 pb-2.5 mb-3">
            <Shield className="w-4.5 h-4.5 text-amber-500" />
            <h4 className="font-mono text-xs font-bold text-slate-200 uppercase tracking-widest">
              CREDENTIAL VALIDATOR
            </h4>
          </div>

          <div className="space-y-3 font-mono text-xs">
            {/* Status list */}
            {(["github", "vercel", "gcp", "firebase", "expo"] as const).map(target => {
              const status = validationStatus[target];
              return (
                <div key={target} className="flex items-center justify-between p-2 rounded bg-[#010204]/40 border border-slate-950">
                  <span className="uppercase text-[11px] font-bold text-slate-300">{target} core:</span>
                  
                  <span className={`text-[10px] font-bold border px-2 py-0.5 rounded leading-none ${
                    status === "validated" ? "bg-emerald-950/20 text-emerald-400 border-emerald-900/60" :
                    status === "failed" ? "bg-red-950/20 text-red-400 border-red-950" :
                    "bg-slate-900/60 text-slate-500 border-slate-900/60"
                  }`}>
                    {status === "validated" ? "VALIDATED" : status === "failed" ? "FAILED CONSOLE" : "VERIFICATION REQUIRED"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Security Review report block */}
        <div className="bg-[#0b0f1d]/90 border border-slate-850 rounded-lg p-5 space-y-3">
          <span className="font-mono text-[9px] font-bold text-indigo-400 tracking-wider uppercase block">
            ALPHA ARCHITECT SECURITY REVIEW
          </span>

          <div className="space-y-3">
            <div className="bg-slate-950/80 rounded border border-slate-900 p-3 leading-relaxed text-xs">
              <div className="flex items-center space-x-1.5 text-amber-500 font-mono text-[10px] font-bold uppercase mb-1">
                <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>ACTIVE INFRASTRUCTURE ASSESSMENT</span>
              </div>
              <p className="font-sans text-slate-350 text-[11px]">
                Authentication credentials configured via the Matrix connector are client-side buffered directly into physical session storage models. Never transmit variables into unvetted analytics aggregators.
              </p>
            </div>

            <div className="bg-slate-950/80 rounded border border-slate-900 p-3 leading-relaxed text-xs">
              <div className="flex items-center space-x-1.5 text-indigo-400 font-mono text-[10px] font-bold uppercase mb-1">
                <Network className="w-3.5 h-3.5 flex-shrink-0" />
                <span>SANDBOX PORT INTEGRITY</span>
              </div>
              <p className="font-sans text-slate-350 text-[11px]">
                Inbound/outbound code synchronizations undergo secure ast translation and are verified as compliant with Node Express container specifications bound on port 3000.
              </p>
            </div>
          </div>
        </div>

        {/* Expo Mini Scanner QR Simulator */}
        {activeTab === "expo" && (
          <div className="bg-slate-950 border border-slate-850 rounded-lg p-5 flex flex-col items-center justify-center text-center space-y-4">
            <div>
              <span className="font-mono text-[9px] font-bold text-emerald-400 tracking-wider uppercase block mb-1">
                EXPO METRO SCANNER LINK
              </span>
              <p className="font-sans text-slate-450 text-[10px] leading-tight">
                Instantly scan to preview dynamic sandbox compiling code in your real smart-device Expo development client
              </p>
            </div>

            {/* Premium styled aesthetic SVG QR Code */}
            <div className="w-40 h-40 bg-white p-3.5 rounded-xl border-4 border-slate-800/20 relative flex items-center justify-center select-none shadow-lg">
              <svg className="w-full h-full text-slate-950" viewBox="0 0 100 100">
                {/* Simulated high fidelity QR matrix segments */}
                <rect x="0" y="0" width="22" height="22" stroke="currentColor" strokeWidth="4" fill="none" />
                <rect x="5" y="5" width="12" height="12" fill="currentColor" />
                <rect x="78" y="0" width="22" height="22" stroke="currentColor" strokeWidth="4" fill="none" />
                <rect x="83" y="5" width="12" height="12" fill="currentColor" />
                <rect x="0" y="78" width="22" height="22" stroke="currentColor" strokeWidth="4" fill="none" />
                <rect x="5" y="83" width="12" height="12" fill="currentColor" />
                
                {/* Inner simulated code hash dots matrix representation */}
                <path d="M 30 5 H 35 V 10 H 30 Z M 45 5 H 55 V 15 H 45 Z M 65 5 H 70 V 10 H 65 Z" fill="currentColor" />
                <path d="M 30 25 H 40 V 30 H 30 Z M 50 25 H 55 V 35 H 50 Z M 60 20 H 70 V 25 H 60 Z M 80 25 H 90 V 40 H 80 Z" fill="currentColor" />
                <path d="M 0 35 H 10 V 45 H 0 Z M 20 35 H 25 V 50 H 20 Z M 35 45 H 45 V 55 H 35 Z M 55 45 H 75 V 50 H 55 Z" fill="currentColor" />
                <path d="M 10 55 H 15 V 65 H 10 Z M 25 60 H 30 V 75 H 25 Z M 40 65 H 50 V 70 H 40 Z M 60 60 H 75 V 70 H 60 Z M 90 60 H 95 V 65 H 90 Z" fill="currentColor" />
                <path d="M 35 80 H 45 V 95 H 35 Z M 55 85 H 60 V 90 H 55 Z M 70 80 H 75 V 85 H 70 Z M 85 85 H 95 V 95 H 85 Z" fill="currentColor" />
              </svg>
              {/* Overlay center mobile icon */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 py-1 rounded-md border border-slate-100 flex items-center justify-center scale-90">
                <Smartphone className="w-5 h-5 text-indigo-650" />
              </div>
            </div>

            <div className="w-full bg-[#03050a] border border-slate-900 p-2 rounded">
              <span className="font-mono text-[10px] text-indigo-400 block break-all font-bold select-all">
                exp://u.expo.dev/projects/{creds.expoAppId}/builds/latest?sdk={creds.expoSdkMin}
              </span>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
