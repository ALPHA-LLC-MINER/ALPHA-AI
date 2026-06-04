import React, { useState } from "react";
import { 
  Layers, HardDrive, Cpu, Cloud, Settings, 
  ArrowUpRight, Server, Copy, CheckCircle, RefreshCw 
} from "lucide-react";
import { DeploymentConfig } from "../types";

interface CloudArchitectProps {
  onAddLog: (message: string, category: "security" | "network" | "recovery" | "terminal", level: "info" | "warning" | "error" | "success") => void;
}

const INITIAL_REGIONS: DeploymentConfig[] = [
  { region: "us-east-1", replicas: 3, cpuLimit: 4, memLimit: 16, status: "PROVISIONED" },
  { region: "eu-central-1", replicas: 2, cpuLimit: 2, memLimit: 8, status: "PROVISIONED" },
  { region: "ap-southeast-1", replicas: 1, cpuLimit: 2, memLimit: 4, status: "PROVISIONED" }
];

export default function CloudArchitect({ onAddLog }: CloudArchitectProps) {
  const [regions, setRegions] = useState<DeploymentConfig[]>(INITIAL_REGIONS);
  const [activeRegionIdx, setActiveRegionIdx] = useState<number>(0);
  const [isDeploying, setIsDeploying] = useState<boolean>(false);

  // Generate dynamic Kubernetes / Terraform deployment draft template based on sliders
  const generateYAMLManifest = (config: DeploymentConfig) => {
    return `apiVersion: apps/v1
kind: Deployment
metadata:
  name: alpha-ai-scaling-agent
  namespace: prod-cyber-cores
  labels:
    app.kubernetes.io/name: alpha-core
    region: ${config.region}
spec:
  replicas: ${config.replicas}
  selector:
    matchLabels:
      app: alpha-ai-vector
  template:
    metadata:
      labels:
        app: alpha-ai-vector
    spec:
      containers:
      - name: system-diagnostics
        image: gcr.io/alpha-ai-core/agent:v6.4.2
        ports:
        - containerPort: 3000
        resources:
          limits:
            cpu: "${config.cpuLimit}"
            memory: "${config.memLimit}Gi"
          requests:
            cpu: "${Math.max(1, config.cpuLimit / 2)}"
            memory: "${Math.max(2, config.memLimit / 2)}Gi"
        securityContext:
          readOnlyRootFilesystem: true
          runAsNonRoot: true
        env:
        - name: DEPLOYED_REGION
          value: "${config.region}"
        - name: RECOVERY_DAEMON_ACTIVE
          value: "true"`;
  };

  const handleSliderChange = (idx: number, field: "replicas" | "cpuLimit" | "memLimit", val: number) => {
    setRegions(prev => prev.map((item, i) => {
      if (i === idx) {
        return {
          ...item,
          [field]: val,
          status: "SCALING"
        };
      }
      return item;
    }));
  };

  const triggerRapidDeployment = () => {
    setIsDeploying(true);
    onAddLog(`DEPLOYMENT: Propagating scaled cloud manifests to all active regions.`, "network", "info");

    setTimeout(() => {
      setRegions(prev => prev.map(item => ({ ...item, status: "PROVISIONED" })));
      setIsDeploying(false);
      onAddLog(`SUCCESS: Multi-region rapid scaling complete. Load balancers synchronized.`, "network", "success");
    }, 1800);
  };

  const currentConfig = regions[activeRegionIdx];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="cloud-architect-root">
      
      {/* Visual Ingress Topology & Slider Controllers */}
      <div className="lg:col-span-7 bg-[#0a0f1d] border border-slate-800 rounded-lg p-5 flex flex-col justify-between">
        <div>
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-2.5 mb-3">
            <Cloud className="w-4 h-4 text-sky-450" />
            <h4 className="font-sans font-medium text-slate-200 text-sm tracking-wide">
              MULTI-REGION DEPLOYMENT POOL
            </h4>
          </div>

          <p className="font-sans text-slate-400 text-xs mb-4">
            Select target cloud sub-environments to configure redundant pods dynamically. ALPHA AI balances real-time compute quotas automatically.
          </p>

          {/* Region Tabs */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            {regions.map((reg, idx) => (
              <button
                key={reg.region}
                id={`tab-region-${reg.region}`}
                onClick={() => setActiveRegionIdx(idx)}
                className={`p-2 rounded text-left border transition flex flex-col justify-between ${
                  activeRegionIdx === idx
                  ? "bg-slate-900 border-sky-850/80 text-white"
                  : "bg-slate-950/40 border-slate-900 text-slate-500 hover:text-slate-350"
                }`}
              >
                <span className="font-mono text-[10px] uppercase block tracking-wider font-bold">
                  {reg.region}
                </span>
                <span className="font-mono text-xs text-sky-400 font-bold block pt-1.5 leading-none">
                  {reg.replicas} Pods
                </span>
                <span className="font-sans text-[9px] text-slate-500 mt-1 uppercase block leading-none">
                  Status: <span className={reg.status === "SCALING" ? "text-amber-500 font-bold" : "text-emerald-500"}>{reg.status}</span>
                </span>
              </button>
            ))}
          </div>

          {/* Configuration Sliders for selected activeRegion */}
          <div className="bg-[#050814] border border-slate-900 rounded p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-950 pb-2 mb-1">
              <span className="font-mono text-xs text-sky-400 font-bold uppercase">
                {currentConfig.region} config options
              </span>
              <Settings className="w-4 h-4 text-slate-600 animate-spin animate-duration-5000" />
            </div>

            {/* Slider 1: Replicas */}
            <div className="space-y-1">
              <div className="flex items-center justify-between font-mono text-xs">
                <span className="text-slate-500">Node Replicas / Cluster:</span>
                <span className="text-white font-bold">{currentConfig.replicas} Pods</span>
              </div>
              <input
                id="slider-replicas"
                type="range"
                min={1}
                max={10}
                value={currentConfig.replicas}
                onChange={(e) => handleSliderChange(activeRegionIdx, "replicas", parseInt(e.target.value))}
                className="w-full accent-indigo-500 bg-slate-900 rounded-lg cursor-pointer"
              />
            </div>

            {/* Slider 2: CPU Limit */}
            <div className="space-y-1">
              <div className="flex items-center justify-between font-mono text-xs">
                <span className="text-slate-500">CPU Compute Power (Limits):</span>
                <span className="text-white font-bold">{currentConfig.cpuLimit} cores</span>
              </div>
              <input
                id="slider-cpu-limit"
                type="range"
                min={1}
                max={16}
                value={currentConfig.cpuLimit}
                onChange={(e) => handleSliderChange(activeRegionIdx, "cpuLimit", parseInt(e.target.value))}
                className="w-full accent-indigo-500 bg-slate-900 rounded-lg cursor-pointer"
              />
            </div>

            {/* Slider 3: Memory Limit */}
            <div className="space-y-1">
              <div className="flex items-center justify-between font-mono text-xs">
                <span className="text-slate-500">Virtual RAM Allocations:</span>
                <span className="text-white font-bold">{currentConfig.memLimit} GB</span>
              </div>
              <input
                id="slider-mem-limit"
                type="range"
                min={2}
                max={64}
                step={2}
                value={currentConfig.memLimit}
                onChange={(e) => handleSliderChange(activeRegionIdx, "memLimit", parseInt(e.target.value))}
                className="w-full accent-indigo-500 bg-slate-900 rounded-lg cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Rapid Deploy Button */}
        <div className="mt-5">
          <button
            id="btn-rapid-deploy-scaled"
            onClick={triggerRapidDeployment}
            disabled={isDeploying}
            className="w-full bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-mono font-bold text-xs py-2.5 rounded transition flex items-center justify-center space-x-1.5"
          >
            {isDeploying ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>PROPAGATING SCALABLE REPLICAS GLOBAL...</span>
              </>
            ) : (
              <>
                <ArrowUpRight className="w-4 h-4" />
                <span>ROLLOUT SCALED ORCHESTRATION MANIFESTS</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Code YAML exporter manifest panel */}
      <div className="lg:col-span-5 bg-[#050812] border border-slate-850 rounded-lg p-5 flex flex-col justify-between h-[450px] lg:h-auto">
        <div className="flex-1 flex flex-col">
          <div className="flex items-center justify-between border-b border-slate-900 pb-2.5 mb-2">
            <div className="flex items-center space-x-2">
              <Server className="w-4 h-4 text-emerald-400" />
              <span className="font-mono text-xs font-bold text-slate-300">
                KUBERNETES MANIFEST EXPORT
              </span>
            </div>

            <button
              id="btn-copy-yaml-manifest"
              onClick={() => {
                navigator.clipboard.writeText(generateYAMLManifest(currentConfig));
                onAddLog(`YAML config manifest copied for region ${currentConfig.region}`, "terminal", "success");
              }}
              className="text-slate-500 hover:text-slate-300 text-[10px] font-mono flex items-center space-x-1 hover:bg-slate-900 p-1 rounded border border-slate-900"
            >
              <Copy className="w-3 h-3" />
              <span>COPY YAML</span>
            </button>
          </div>

          <pre className="flex-1 font-mono text-[10px] leading-tight text-emerald-300/90 bg-[#030408] border border-slate-950 p-3 rounded overflow-auto whitespace-pre">
            {generateYAMLManifest(currentConfig)}
          </pre>
        </div>

        <div className="mt-4 border-t border-slate-900 pt-3">
          <div className="flex items-center space-x-1 px-2 py-1.5 bg-[#07130f] border border-emerald-950 rounded text-emerald-400 font-mono text-[10px]">
            <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" />
            <span>Declarative scaling vectors fully compliant with ALPHA Core hosts</span>
          </div>
        </div>
      </div>

    </div>
  );
}
