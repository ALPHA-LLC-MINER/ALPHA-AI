export type SystemStatus = "SECURE" | "WARNING" | "CRITICAL";

export interface NetworkNode {
  id: string;
  name: string;
  type: "gateway" | "router" | "database" | "balancer" | "node" | "vm";
  status: "active" | "warning" | "error";
  ip: string;
  load: number; // percentage
  latency: number; // ms
  traffic: number; // mb/s
  ports: number[];
  connections: string[]; // connected node IDs
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  source: string;
  category: "security" | "network" | "recovery" | "terminal" | "system";
  message: string;
  level: "info" | "warning" | "error" | "success";
}

export interface VaultKey {
  id: string;
  service: string;
  type: "RSA-2048" | "AES-256-GCM" | "ECC-384" | "API-Credential";
  key: string;
  lastRotated: string;
  strength: "High" | "Robust" | "Critical-Action-Required";
}

export interface DeploymentConfig {
  region: string;
  replicas: number;
  cpuLimit: number; // cores
  memLimit: number; // GB
  status: "PROVISIONED" | "SCALING" | "DECOMMISSIONED";
}

export interface DiagnosticResult {
  analysis: string;
  status: SystemStatus;
  fixedCode: string;
  recoverySteps: string[];
}

export interface UserAccount {
  username: string;
  password?: string;
  fullName: string;
  role: string;
  computerLiteracy: string;
  pronoun: string;
  title: string;
  createdAt: string;
}

export interface UserSessionData {
  nodes: NetworkNode[];
  activityLogs: ActivityLog[];
  systemPrompt: string;
  editorBuffer: string;
  mfaActive: boolean;
  activeTab: "topology" | "lab" | "crypto" | "cloud" | "connectors" | "companion" | "support";
}

