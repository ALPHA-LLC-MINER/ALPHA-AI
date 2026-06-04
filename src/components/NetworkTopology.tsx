import React, { useState, useEffect } from "react";
import { NetworkNode, ActivityLog } from "../types";
import { 
  Server, Database, Shuffle, Globe, Cpu, Laptop, 
  Play, ShieldCheck, ShieldAlert, Zap, Radio, RefreshCw, Layers 
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface NetworkTopologyProps {
  nodes: NetworkNode[];
  onSelectNode: (node: NetworkNode) => void;
  selectedNode: NetworkNode | null;
  activityLogs: ActivityLog[];
  setActivityLogs: React.Dispatch<React.SetStateAction<ActivityLog[]>>;
  updateNodeStatus: (nodeId: string, status: "active" | "warning" | "error", extra?: Partial<NetworkNode>) => void;
}

export default function NetworkTopology({
  nodes,
  onSelectNode,
  selectedNode,
  activityLogs,
  setActivityLogs,
  updateNodeStatus
}: NetworkTopologyProps) {
  const [activeSimulation, setActiveSimulation] = useState<string | null>(null);
  const [simulationProgress, setSimulationProgress] = useState<number>(0);
  const [recoveryLog, setRecoveryLog] = useState<string[]>([]);
  const [packetTime, setPacketTime] = useState<number>(0);

  // Simple packet ticker for animated dotted lines
  useEffect(() => {
    const timer = setInterval(() => {
      setPacketTime(p => (p + 1) % 40);
    }, 150);
    return () => clearInterval(timer);
  }, []);

  const addLog = (message: string, category: "security" | "network" | "recovery" | "system", level: "info" | "warning" | "error" | "success") => {
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

  const handleSimulateFailure = (scenario: "ddos" | "db_leak" | "dns_expire") => {
    if (activeSimulation) return;
    setSimulationProgress(0);
    setRecoveryLog([]);

    if (scenario === "ddos") {
      setActiveSimulation("API Load Balancer - DDoS Flooding Protocol");
      // update nodes
      updateNodeStatus("balancer", "error", { load: 99, latency: 1240, traffic: 480.5 });
      updateNodeStatus("gateway", "warning", { load: 85, latency: 450 });
      addLog("CRITICAL: Incoming DDoS attack detected on Web Balancer (192.168.1.1). Bandwidth limit exceeded 480MB/s.", "security", "error");
      addLog("ALPHA AI initiated Traffic Sifting Protection Protocol.", "recovery", "info");
    } else if (scenario === "db_leak") {
      setActiveSimulation("Main SQL Database - Memory Leak & Port Locked");
      updateNodeStatus("database", "error", { load: 98, latency: 890, traffic: 15.2 });
      addLog("CRITICAL: Memory footprint for Main Database (10.0.3.14) exceeded critical allocation threshold.", "system", "error");
      addLog("ALPHA AI engaged Autonomous Dump and Relational Stream Mirroring.", "recovery", "info");
    } else if (scenario === "dns_expire") {
      setActiveSimulation("Router WAN Link - DNS Name Resolution Breakdown");
      updateNodeStatus("router", "error", { load: 40, latency: 2500, traffic: 0 });
      updateNodeStatus("vm", "warning", { latency: 680 });
      addLog("CRITICAL: Router Domain Name Resolution failed. Local containers lost external resolution sockets.", "network", "error");
      addLog("ALPHA AI triggered redundant Route DNS lease injection.", "recovery", "info");
    }
  };

  // Run structured mock recovery simulation steps
  useEffect(() => {
    if (!activeSimulation) return;

    const timer = setInterval(() => {
      setSimulationProgress(prev => {
        const next = prev + 10;
        if (next >= 100) {
          clearInterval(timer);
          setTimeout(() => {
            // Apply healthy states
            if (activeSimulation.includes("DDoS")) {
              updateNodeStatus("balancer", "active", { load: 38, latency: 12, traffic: 42.1 });
              updateNodeStatus("gateway", "active", { load: 24, latency: 8 });
              addLog("SUCCESS: Traffic Sifting complete. Cloud ingress scrubbed. 34,204 malicious client bot sockets pruned.", "recovery", "success");
            } else if (activeSimulation.includes("Memory Leak")) {
              updateNodeStatus("database", "active", { load: 45, latency: 15, traffic: 8.4 });
              addLog("SUCCESS: Database hot dump executed. Stale worker ports closed. Relational Stream Mirrored safely.", "recovery", "success");
            } else if (activeSimulation.includes("DNS Name")) {
              updateNodeStatus("router", "active", { load: 15, latency: 4, traffic: 145.8 });
              updateNodeStatus("vm", "active", { latency: 5 });
              addLog("SUCCESS: Relational nameservers injected: 8.8.8.8 and 1.1.1.1. Local development container resolution restored.", "recovery", "success");
            }
            setActiveSimulation(null);
            setSimulationProgress(0);
            setRecoveryLog([]);
          }, 800);
          return 100;
        }

        // Add periodic logs to simulation view based on scenario and progress
        if (next === 20) {
          if (activeSimulation.includes("DDoS")) {
            setRecoveryLog(l => [...l, "> Spinning up multi-region Cloud Scrubbing filter..."]);
            addLog("Traffic filtering rules active on Edge router.", "security", "warning");
          } else if (activeSimulation.includes("Memory Leak")) {
            setRecoveryLog(l => [...l, "> Initializing hot thread dump on socket 5432..."]);
          } else {
            setRecoveryLog(l => [...l, "> Flipping router network routing table interface static leases..."]);
          }
        } else if (next === 50) {
          if (activeSimulation.includes("DDoS")) {
            setRecoveryLog(l => [...l, "> Blocking 142 IP subnets flagged by malicious flow vectors."]);
          } else if (activeSimulation.includes("Memory Leak")) {
            setRecoveryLog(l => [...l, "> Recycling dead Postgres connection pool structures..."]);
          } else {
            setRecoveryLog(l => [...l, "> Injecting secondary DNS resolver variables: [\"8.8.8.8\", \"1.1.1.1\"]"]);
          }
        } else if (next === 80) {
          if (activeSimulation.includes("DDoS")) {
            setRecoveryLog(l => [...l, "> Integrity checks: load normalized. Ping latency below 15ms."]);
          } else if (activeSimulation.includes("Memory Leak")) {
            setRecoveryLog(l => [...l, "> Performing memory compacting and heap cleanup protocols."]);
          } else {
            setRecoveryLog(l => [...l, "> Verifying internal VM container DNS resolution sockets."]);
          }
        }

        return next;
      });
    }, 450);

    return () => clearInterval(timer);
  }, [activeSimulation]);

  // Find Node coordinates for network SVG mapping
  const getNodeCoords = (nodeId: string): { x: number; y: number } => {
    switch (nodeId) {
      case "balancer": return { x: 100, y: 150 };
      case "gateway": return { x: 250, y: 150 };
      case "router": return { x: 400, y: 150 };
      case "database": return { x: 550, y: 250 };
      case "vm": return { x: 550, y: 50 };
      case "node": return { x: 400, y: 270 };
      default: return { x: 100, y: 100 };
    }
  };

  const getNodeIcon = (type: string) => {
    switch (type) {
      case "balancer": return <Shuffle className="w-5 h-5 text-indigo-400" />;
      case "gateway": return <Layers className="w-5 h-5 text-blue-400" />;
      case "router": return <Globe className="w-5 h-5 text-sky-400" />;
      case "database": return <Database className="w-5 h-5 text-emerald-400" />;
      case "vm": return <Laptop className="w-5 h-5 text-amber-400" />;
      case "node": return <Cpu className="w-5 h-5 text-purple-400" />;
      default: return <Server className="w-5 h-5 text-gray-400" />;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="network-topology-root">
      {/* Topology Map Panel */}
      <div className="lg:col-span-8 bg-[#0a0f1d] border border-slate-800 rounded-lg p-6 relative overflow-hidden flex flex-col min-h-[500px]">
        {/* Header inside Panel */}
        <div className="flex flex-wrap items-center justify-between mb-4 border-b border-slate-800 pb-3 gap-2">
          <div className="flex items-center space-x-2">
            <Radio className="w-5 h-5 text-emerald-400 animate-pulse animate-duration-1000" />
            <div>
              <h3 className="font-sans font-medium text-slate-200 text-sm tracking-wide">
                CYBERNETIC INSTANT TOPOLOGY
              </h3>
              <p className="font-mono text-slate-500 text-xs">
                Interactive Multi-Host Autonomous Deployment Map
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 text-xs font-mono bg-[#050814] px-3 py-1.5 rounded border border-slate-800">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-slate-400">CORE DEPLOYMENT SENSORS ACTIVE</span>
          </div>
        </div>

        {/* Outer Recovery Overlay Alert */}
        <AnimatePresence>
          {activeSimulation && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute inset-x-4 top-16 bg-[#0f0714] border border-purple-800 text-white rounded p-4 z-40 shadow-2xl backdrop-blur-md"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded bg-purple-950/50 border border-purple-800 flex items-center justify-center text-purple-400 animate-pulse">
                    <Zap className="w-5 h-5 animate-bounce" />
                  </div>
                  <div>
                    <h4 className="font-mono text-purple-400 font-bold uppercase text-xs tracking-wider">
                      AUTONOMOUS DIAGNOSTIC RECOVERY ENGAGED
                    </h4>
                    <p className="font-sans text-slate-300 text-xs font-medium">
                      Scenario: <span className="text-white">{activeSimulation}</span>
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-mono text-purple-400 text-sm font-bold">{simulationProgress}%</span>
                </div>
              </div>

              {/* Progress Slider */}
              <div className="w-full bg-slate-900 rounded-full h-1.5 mt-3 overflow-hidden border border-slate-800">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-indigo-500 h-1.5 rounded-full transition-all duration-300" 
                  style={{ width: `${simulationProgress}%` }}
                />
              </div>

              {/* Active Recovery Ticker Code */}
              <div className="mt-2 bg-[#050308] p-2 rounded border border-purple-950 font-mono text-xs text-purple-300 space-y-1 overflow-y-auto max-h-24">
                <p className="opacity-75">{`> [ALPHA_RECOVERY_DEAMON] init_recovery_protocol_v2_6_4`}</p>
                {recoveryLog.map((log, index) => (
                  <p key={index} className="text-emerald-400">{log}</p>
                ))}
                {simulationProgress < 100 && (
                  <p className="text-slate-500 animate-pulse">Running systemic checks ...</p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Map Stage SVG Container */}
        <div className="flex-1 flex items-center justify-center relative select-none">
          <svg className="w-full max-w-[650px] aspect-[4/3] min-h-[300px]" viewBox="0 0 650 400">
            {/* Grid Line Visualizers */}
            <defs>
              <pattern id="dotGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1" fill="#1e293b" opacity="0.3" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dotGrid)" />

            {/* Connection Lines with interactive packet flows */}
            {nodes.map(node => {
              const startCoords = getNodeCoords(node.id);
              return node.connections.map(targetId => {
                const targetCoords = getNodeCoords(targetId);
                // Draw connection path
                const isPathError = node.status === "error" || nodes.find(n => n.id === targetId)?.status === "error";
                const isPathWarning = node.status === "warning" || nodes.find(n => n.id === targetId)?.status === "warning";
                
                let lineColor = "#1e293b"; // idle
                if (isPathError) lineColor = "#991b1b";
                else if (isPathWarning) lineColor = "#78350f";
                else if (node.status === "active") lineColor = "#312e81";

                let packetColor = "rgba(129, 140, 248, 0.8)";
                if (isPathError) packetColor = "rgba(239, 68, 68, 0.9)";
                else if (isPathWarning) packetColor = "rgba(245, 158, 11, 0.9)";

                // Math to figure packet flow animation offset
                const packetOffsetPercent = (packetTime / 40);
                const packetX = startCoords.x + (targetCoords.x - startCoords.x) * packetOffsetPercent;
                const packetY = startCoords.y + (targetCoords.y - startCoords.y) * packetOffsetPercent;

                return (
                  <g key={`${node.id}-${targetId}`} className="transition-all duration-500">
                    <line 
                      x1={startCoords.x} 
                      y1={startCoords.y} 
                      x2={targetCoords.x} 
                      y2={targetCoords.y} 
                      stroke={lineColor} 
                      strokeWidth={2}
                      strokeDasharray={node.status === "active" ? "" : "4,4"}
                      className="transition-all duration-500"
                    />
                    {/* Pulsing Data Packet */}
                    {node.status !== "error" && (
                      <circle 
                        cx={packetX} 
                        cy={packetY} 
                        r={3} 
                        fill={packetColor}
                        className="shadow transition-colors duration-500"
                      />
                    )}
                  </g>
                );
              });
            })}

            {/* Nodes group SVG */}
            {nodes.map(node => {
              const { x, y } = getNodeCoords(node.id);
              const isSelected = selectedNode?.id === node.id;
              
              let statusBorder = "stroke-slate-800";
              let statusFill = "fill-slate-950";
              let shadowClass = "";

              if (node.status === "active") {
                statusBorder = isSelected ? "stroke-indigo-400" : "stroke-indigo-800";
                statusFill = "fill-[#0c0e22]";
              } else if (node.status === "warning") {
                statusBorder = isSelected ? "stroke-amber-400" : "stroke-amber-700 animate-pulse";
                statusFill = "fill-[#19140a]";
              } else if (node.status === "error") {
                statusBorder = "stroke-red-500 animate-ping animate-duration-1000";
                statusFill = "fill-[#240c0c]";
                shadowClass = "drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]";
              }

              return (
                <g 
                  key={node.id} 
                  id={`node-group-${node.id}`}
                  transform={`translate(${x}, ${y})`}
                  className="cursor-pointer select-none transition-all duration-500"
                  onClick={() => onSelectNode(node)}
                >
                  {/* Outer glowing pulsing aura if error */}
                  {node.status === "error" && (
                    <circle r={22} fill="transparent" stroke="rgba(239, 68, 68, 0.4)" strokeWidth={2} className="animate-ping" />
                  )}

                  {/* Node container */}
                  <circle 
                    r={18} 
                    className={`${statusFill} ${statusBorder} ${shadowClass} transition-all duration-300`} 
                    strokeWidth={2.5} 
                  />

                  {/* Centered Node Icon Representation */}
                  <g transform="translate(-10, -10)">
                    {getNodeIcon(node.type)}
                  </g>

                  {/* Node Label Text */}
                  <text 
                    y={32} 
                    textAnchor="middle" 
                    className={`font-mono font-bold text-[10px] tracking-wider transition-colors duration-300 ${
                      isSelected ? "fill-white" : node.status === 'error' ? "fill-red-400 font-extrabold" : "fill-slate-400"
                    }`}
                  >
                    {node.name}
                  </text>
                  <text 
                    y={43} 
                    textAnchor="middle" 
                    className="font-mono text-[9px] fill-slate-500"
                  >
                    {node.ip}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Right Column Panels: Interactive Scenario & Inspector */}
      <div className="lg:col-span-4 space-y-6">
        {/* Disaster Recovery Scenario Controller */}
        <div className="bg-[#0a0f1d] border border-slate-800 rounded-lg p-5">
          <h4 className="font-sans font-medium text-slate-300 text-xs tracking-wider uppercase mb-3 flex items-center space-x-1">
            <ShieldAlert className="w-4 h-4 text-purple-400" />
            <span>AUTONOMOUS WORKLOAD SIMULATORS</span>
          </h4>
          <p className="font-sans text-slate-400 text-xs mb-4">
            Stress-test logical configurations against malicious flows. Secure core protocols instantly.
          </p>

          <div className="space-y-3">
            <button 
              id="btn-simulate-ddos"
              onClick={() => handleSimulateFailure("ddos")}
              disabled={!!activeSimulation}
              className={`w-full py-2.5 px-3 rounded text-left border text-xs font-mono font-bold transition flex items-center justify-between group ${
                activeSimulation 
                ? "bg-slate-900/50 text-slate-600 border-slate-800 cursor-not-allowed" 
                : "bg-red-950/20 text-red-400 border-red-900/40 hover:bg-red-950/40 hover:border-red-800"
              }`}
            >
              <div className="flex items-center space-x-2">
                <Shuffle className="w-4 h-4 group-hover:rotate-180 transition duration-500" />
                <span>Inject Web ingress DDoS</span>
              </div>
              <Play className="w-3 h-3 text-red-500 opacity-80" />
            </button>

            <button 
              id="btn-simulate-db-leak"
              onClick={() => handleSimulateFailure("db_leak")}
              disabled={!!activeSimulation}
              className={`w-full py-2.5 px-3 rounded text-left border text-xs font-mono font-bold transition flex items-center justify-between group ${
                activeSimulation 
                ? "bg-slate-900/50 text-slate-600 border-slate-800 cursor-not-allowed" 
                : "bg-amber-950/20 text-amber-400 border-amber-900/40 hover:bg-amber-950/40 hover:border-amber-800"
              }`}
            >
              <div className="flex items-center space-x-2">
                <Database className="w-4 h-4" />
                <span>Simulate SQL Port Leak</span>
              </div>
              <Play className="w-3 h-3 text-amber-500 opacity-80" />
            </button>

            <button 
              id="btn-simulate-dns-fail"
              onClick={() => handleSimulateFailure("dns_expire")}
              disabled={!!activeSimulation}
              className={`w-full py-2.5 px-3 rounded text-left border text-xs font-mono font-bold transition flex items-center justify-between group ${
                activeSimulation 
                ? "bg-slate-900/50 text-slate-600 border-slate-800 cursor-not-allowed" 
                : "bg-sky-950/20 text-sky-450 border-sky-900/40 hover:bg-sky-950/40 hover:border-sky-800"
              }`}
            >
              <div className="flex items-center space-x-2">
                <Globe className="w-4 h-4" />
                <span>WAN DNS Nameserver Crash</span>
              </div>
              <Play className="w-3 h-3 text-sky-500 opacity-80" />
            </button>
          </div>
        </div>

        {/* Node inspector panel */}
        <div className="bg-[#0a0f1d] border border-slate-800 rounded-lg p-5">
          <h4 className="font-sans font-medium text-slate-300 text-xs tracking-wider uppercase mb-3 flex items-center space-x-1">
            <Layers className="w-4 h-4 text-indigo-400" />
            <span>NODE TELEMETRY SENSOR</span>
          </h4>

          {selectedNode ? (
            <div id={`node-inspector-${selectedNode.id}`} className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="font-sans font-bold text-slate-200 text-sm">{selectedNode.name}</h5>
                  <p className="font-mono text-slate-500 text-[10px]">{selectedNode.ip}</p>
                </div>
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase ${
                  selectedNode.status === "active" 
                  ? "bg-emerald-950/30 text-emerald-400 border-emerald-900/50"
                  : selectedNode.status === "warning"
                  ? "bg-amber-950/30 text-amber-400 border-amber-900/50"
                  : "bg-red-950/30 text-red-400 border-red-900/50 animate-pulse"
                }`}>
                  {selectedNode.status}
                </span>
              </div>

              {/* Node Stats grid */}
              <div className="grid grid-cols-2 gap-3 border-t border-slate-900 pt-3">
                <div className="bg-[#050814] p-2 rounded border border-slate-900">
                  <span className="block font-mono text-slate-500 text-[9px] uppercase">Node Load</span>
                  <span className="font-mono font-bold text-slate-200 text-sm">{selectedNode.load}%</span>
                  <div className="w-full bg-slate-800 rounded-full h-1 overflow-hidden mt-1.5">
                    <div 
                      className={`h-1 rounded-full transition-all duration-300 ${
                        selectedNode.load > 90 ? "bg-red-500" : selectedNode.load > 70 ? "bg-amber-500" : "bg-indigo-500"
                      }`}
                      style={{ width: `${selectedNode.load}%` }}
                    />
                  </div>
                </div>

                <div className="bg-[#050814] p-2 rounded border border-slate-900">
                  <span className="block font-mono text-slate-500 text-[9px] uppercase">Latency</span>
                  <span className="font-mono font-bold text-slate-200 text-sm">{selectedNode.latency} ms</span>
                </div>

                <div className="bg-[#050814] p-2 rounded border border-slate-900">
                  <span className="block font-mono text-slate-500 text-[9px] uppercase">Throughput</span>
                  <span className="font-mono font-bold text-slate-200 text-sm">{selectedNode.traffic} MB/s</span>
                </div>

                <div className="bg-[#050814] p-2 rounded border border-slate-900">
                  <span className="block font-mono text-slate-500 text-[9px] uppercase">NodeType</span>
                  <span className="font-mono font-bold text-slate-400 text-xs lowercase uppercase">{selectedNode.type}</span>
                </div>
              </div>

              {/* Port scanner representation */}
              <div className="border-t border-slate-900 pt-3">
                <span className="font-mono text-slate-500 text-[9px] uppercase block mb-1.5">Active Ports Scanned</span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedNode.ports.map(port => (
                    <span key={port} className="font-mono text-[10px] bg-slate-900 text-indigo-400 border border-slate-800 px-2 py-0.5 rounded">
                      tcp:{port}
                    </span>
                  ))}
                </div>
              </div>

              {/* Autonomous Repair Option */}
              {selectedNode.status !== "active" && (
                <button
                  id={`btn-manual-repair-${selectedNode.id}`}
                  onClick={() => {
                    updateNodeStatus(selectedNode.id, "active", { load: 15, latency: 4 });
                    addLog(`Manual overriding repair initiated for ${selectedNode.name}. Stream active.`, "recovery", "success");
                  }}
                  className="w-full flex items-center justify-center space-x-1.5 bg-emerald-600 hover:bg-emerald-500 text-white py-1.5 rounded transition font-mono font-bold text-xs"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Manual Recover Host</span>
                </button>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500 text-xs font-sans">
              <RefreshCw className="w-6 h-6 mx-auto mb-2 text-slate-700 animate-spin animate-duration-3000" />
              Click any element on the interactive map to initiate deep TCP packet analysis.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
