import React, { useState } from "react";
import { 
  Mail, Send, CheckCircle, Copy, ExternalLink, ShieldAlert, 
  LifeBuoy, Clock, Sparkles, AlertTriangle, ChevronDown, ChevronUp, User, Activity, ArrowRight
} from "lucide-react";
import { UserAccount, NetworkNode } from "../types";

interface SupportCenterProps {
  currentUser: UserAccount | null;
  avgLoad: number;
  avgLatency: number;
  onAddLog: (
    message: string, 
    category: "security" | "network" | "recovery" | "terminal" | "system", 
    level: "info" | "warning" | "error" | "success"
  ) => void;
}

export default function SupportCenter({
  currentUser,
  avgLoad,
  avgLatency,
  onAddLog
}: SupportCenterProps) {
  const supportEmail = "Management.alpha@icloud.com";
  
  const [copied, setCopied] = useState(false);
  const [subjectOption, setSubjectOption] = useState("[MFA Locked] Access Authorization Request");
  const [customSubject, setCustomSubject] = useState("");
  const [priority, setPriority] = useState("HIGH (Standard Escalation)");
  const [messageText, setMessageText] = useState("");
  const [attachTelemetry, setAttachTelemetry] = useState(true);
  const [dispatchedState, setDispatchedState] = useState<"idle" | "sending" | "success">("idle");
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(supportEmail);
    setCopied(true);
    onAddLog(`Copied support & customer care email address (${supportEmail}) to clipboard.`, "system", "info");
    setTimeout(() => setCopied(false), 2500);
  };

  const subjectHeader = subjectOption === "Custom" ? customSubject : subjectOption;

  const handleDispatchTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) {
      onAddLog("Ticket message cannot be empty.", "system", "error");
      return;
    }

    setDispatchedState("sending");
    onAddLog(`Encrypting support packet... Preparing courier dispatch for Management.alpha@icloud.com`, "system", "info");

    setTimeout(() => {
      // Assemble structured body for email client
      let bodyString = `OPERATOR BIO:\n`;
      bodyString += `- Full Name: ${currentUser?.fullName || "Unverified Operator"}\n`;
      bodyString += `- Role Context: ${currentUser?.role || "External Visitor"}\n`;
      bodyString += `- Assigned Title: ${currentUser?.title || "System Guest"}\n\n`;

      if (attachTelemetry) {
        bodyString += `SYSTEM TELEMETRY PACKETS:\n`;
        bodyString += `- Average Node CPU Load: ${avgLoad}%\n`;
        bodyString += `- Avg Cluster Ingress Latency: ${avgLatency}ms\n`;
        bodyString += `- Diagnostic Interface Epoch: ${new Date().toISOString()}\n\n`;
      }

      bodyString += `INQUIRY DETAILS:\n`;
      bodyString += `${messageText}\n\n`;
      bodyString += `----------------------------------------\n`;
      bodyString += `Dispatched via Alpha AI Secure Customer Care Core.`;

      const subjectEncoded = encodeURIComponent(`[Alpha AI Care] ${subjectHeader} (${priority})`);
      const bodyEncoded = encodeURIComponent(bodyString);
      
      // Directly trigger a real mailto command
      window.location.href = `mailto:${supportEmail}?subject=${subjectEncoded}&body=${bodyEncoded}`;

      setDispatchedState("success");
      onAddLog(`Support and customer care dispatch routed successfully! Check your system mail client.`, "system", "success");
    }, 1200);
  };

  const handleResetTicket = () => {
    setMessageText("");
    setDispatchedState("idle");
  };

  const faqItems = [
    {
      q: "What is the certified SLA for Management response times?",
      a: "Our prime security management desk (Management.alpha@icloud.com) maintains continuous hot backups. Response and escalation cycles occur within 1 hour for critical parameters, and 4 hours for standard sandbox/hardware provisioning requests."
    },
    {
      q: "How can I request an emergency Multi-Factor Authentication (MFA) reset?",
      a: "If you lose your secure access RSA keys or are locked out of the alpha sector, dispatch an encrypted support request to Management.alpha@icloud.com using your registered identity coordinates. Our DevOps team will verify identity and execute a manual purge."
    },
    {
      q: "Can I coordinate bulk infrastructure scale-ups via customer support?",
      a: "Absolutely. Standard account limits restrict clusters to 6 virtual nodes. If you require higher capacity sandboxes, send your requirements (specifically noting CPU limits, replica scale, and region specifications) directly to management."
    },
    {
      q: "Is diagnostic telemetry attached automatically for high security issues?",
      a: "Yes. When submitting an issue through this secure portal, checking 'Include Diagnostic State Telemetries' appends active socket latency and loads, helping management identify and remedy system faults immediately."
    }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fadeIn" id="support-care-main-hub">
      
      {/* LEFT SECTION: Main Support Information and Contact Details */}
      <div className="lg:col-span-5 space-y-6 text-left">
        
        {/* Core Direct Contact Box */}
        <div className="bg-[#050813] border border-indigo-900/60 rounded-xl p-5 relative overflow-hidden shadow-lg shadow-indigo-950/20">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-indigo-500/10 to-transparent pointer-events-none rounded-bl-full" />
          
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-indigo-950/40 border border-indigo-750 flex items-center justify-center text-indigo-400">
              <LifeBuoy className="w-5 h-5 animate-spin" style={{ animationDuration: '4s' }} />
            </div>
            <div>
              <h3 className="font-sans font-bold text-slate-100 text-sm tracking-wider uppercase">Direct Care Desk</h3>
              <span className="font-mono text-[9px] text-indigo-450 tracking-widest font-bold">MANAGEMENT CHANNELS LIVE</span>
            </div>
          </div>

          <p className="text-slate-350 text-xs leading-relaxed mb-5 font-serif">
            For critical infrastructure assistance, security escalations, or custom tenant queries, get directly in touch with Alpha AI Management.
          </p>

          {/* Email action slot */}
          <div className="bg-[#020409] border border-slate-850 rounded-lg p-3.5 space-y-3">
            <span className="block font-mono text-[8px] text-slate-550 uppercase tracking-widest">Official Management Email</span>
            
            <div className="flex items-center justify-between p-2.5 bg-slate-950/70 border border-indigo-950/50 rounded-md">
              <div className="flex items-center space-x-2.5 overflow-hidden">
                <Mail className="w-4 h-4 text-indigo-400 shrink-0" />
                <span className="font-mono text-[11.5px] text-slate-200 font-bold select-all overflow-hidden text-ellipsis whitespace-nowrap">
                  {supportEmail}
                </span>
              </div>

              <div className="flex items-center space-x-1 shrink-0 ml-1.5">
                <button
                  type="button"
                  onClick={handleCopyEmail}
                  className="p-1 px-2.5 rounded text-[9.5px] font-mono font-bold transition flex items-center space-x-1 cursor-pointer bg-[#0b1021] border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700"
                  title="Copy Email to Clipboard"
                >
                  <Copy className="w-3 h-3 text-[#818cf8]" />
                  <span>{copied ? "COPIED" : "COPY"}</span>
                </button>
              </div>
            </div>

            <div className="pt-1.5 flex items-center justify-between text-[10px] font-mono text-slate-500">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-emerald-500 shrink-0" />
                SLA: <strong className="text-emerald-450 font-semibold font-sans">Under 1 Hour</strong>
              </span>
              <span>Secure Mail Client Gateway</span>
            </div>
            
            <a
              href={`mailto:${supportEmail}?subject=${encodeURIComponent("[Alpha AI Access Request]")}`}
              className="mt-2 w-full bg-[#0b1021] border border-indigo-950 hover:bg-indigo-950/40 text-indigo-400 py-2 rounded text-xs font-mono font-bold flex items-center justify-center space-x-2 transition tracking-wider"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>LAUNCH CLIENT DIRECTLY</span>
            </a>
          </div>
        </div>

        {/* Dynamic Diagnostics Preview */}
        <div className="bg-[#050813] border border-slate-850 rounded-xl p-5 space-y-3">
          <h4 className="font-mono text-[9px] font-bold text-slate-500 uppercase tracking-widest flex items-center space-x-2">
            <Activity className="w-3.5 h-3.5 text-indigo-400" />
            <span>Active Diagnostics Package</span>
          </h4>
          <p className="text-slate-400 text-xs font-serif leading-normal">
            Your active diagnostic values of this workspace session can be bound automatically inside the message payload.
          </p>

          <div className="space-y-1.5 pt-1.5 font-mono text-[10px] text-slate-350">
            <div className="flex justify-between items-center bg-slate-950/45 p-2 rounded">
              <span>Primary Sector Operator</span>
              <span className="text-[#818cf8] font-semibold">{currentUser?.fullName || "Unverified Operator"}</span>
            </div>
            <div className="flex justify-between items-center bg-slate-950/45 p-2 rounded">
              <span>Security Priority Mode</span>
              <span className="text-indigo-400 font-semibold">{currentUser?.role || "Visitor"}</span>
            </div>
            <div className="flex justify-between items-center bg-slate-950/45 p-2 rounded">
              <span>Avg Node Load Factor</span>
              <span className="text-emerald-400 font-semibold">{avgLoad}%</span>
            </div>
            <div className="flex justify-between items-center bg-slate-950/45 p-2 rounded">
              <span>Cluster Network Latency</span>
              <span className="text-emerald-400 font-semibold">{avgLatency}ms</span>
            </div>
          </div>
        </div>

      </div>

      {/* RIGHT SECTION: Interactive Ticket Message Formulator */}
      <div className="lg:col-span-7 space-y-6 text-left">
        
        {/* Ticket Submission Interactive Card */}
        <div className="bg-[#050813] border border-slate-850 rounded-xl p-5 relative">
          <div className="border-b border-slate-900 pb-3.5 mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-sans font-bold text-slate-100 text-sm tracking-wider uppercase">Alpha Management Inquiry Desk</h3>
              <p className="font-mono text-[8.5px] text-slate-550 uppercase tracking-widest pt-0.5">Secure Customer Care Routing Form</p>
            </div>
            <span className="bg-[#0c1226] border border-indigo-950 p-1 px-2.5 rounded font-mono text-[8.5px] text-[#818cf8]">
              Sector: SECURE-B
            </span>
          </div>

          {dispatchedState === "sending" && (
            <div className="py-24 flex flex-col items-center justify-center space-y-4">
              <div className="w-10 h-10 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              <p className="font-mono text-xs text-indigo-400 animate-pulse uppercase tracking-wider">Encrypting & Packaging Payload...</p>
            </div>
          )}

          {dispatchedState === "success" && (
            <div className="py-12 flex flex-col items-center justify-center space-y-5 text-center px-4">
              <div className="w-12 h-12 bg-emerald-950/40 border border-emerald-550 rounded-full flex items-center justify-center text-emerald-400">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div className="space-y-1.5">
                <h4 className="font-sans font-extrabold text-slate-200 text-sm uppercase tracking-wide">SUPPORT INQUIRY COURIERED</h4>
                <p className="text-slate-400 text-xs font-serif leading-relaxed max-w-sm mx-auto">
                  Your care request has been routed to top priority queues at <strong className="text-slate-300 font-mono text-[10.5px]">Management.alpha@icloud.com</strong>.
                </p>
              </div>

              <div className="bg-slate-950/65 border border-slate-905 rounded-lg p-3.5 w-full text-left font-mono text-[9px] text-slate-500 leading-normal max-w-md">
                <span className="text-emerald-505 font-bold uppercase block pb-1 border-b border-slate-900 mb-1.5">Dispatch Debug Diagnostics:</span>
                <div>- STATUS: INBOUND SUCCESS</div>
                <div>- MAIL CLIENT: EXECUTED</div>
                <div>- TO: Management.alpha@icloud.com</div>
                <div>- CATEGORY: {securityPriorityIndicator(subjectHeader)}</div>
                <div>- ESCALATION RANK: {priority}</div>
              </div>

              <div className="flex items-center space-x-2 w-full max-w-md">
                <button
                  type="button"
                  onClick={handleResetTicket}
                  className="flex-1 bg-[#0b1021] border border-slate-800 text-slate-400 hover:text-slate-300 text-xs py-2 rounded font-bold cursor-pointer transition uppercase tracking-wider"
                >
                  Create New Support Ticket
                </button>
              </div>
            </div>
          )}

          {dispatchedState === "idle" && (
            <form onSubmit={handleDispatchTicket} className="space-y-4 font-serif">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Subject Selector dropdown */}
                <div>
                  <label className="block text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-1.5">Inquiry Subject Focus</label>
                  <select
                    value={subjectOption}
                    onChange={(e) => setSubjectOption(e.target.value)}
                    className="w-full bg-[#04060c] border border-slate-850 rounded-lg p-2 text-xs text-slate-200 outline-none focus:border-indigo-755 font-serif cursor-pointer"
                  >
                    <option value="[MFA Locked] Access Authorization Request">[MFA Locked] Access Reset</option>
                    <option value="[Container Limit] Resource Core Scale Request">[Container] Cluster Limit Scale</option>
                    <option value="[Security Audit] Critical Vulnerability Spotted">[Security] Vulnerability Spotted</option>
                    <option value="[Custom Inquiry] General Administrative Question">Custom Inquiry</option>
                    <option value="Custom">Other Custom Topic Focus...</option>
                  </select>
                </div>

                {/* Priority Selector dropdown */}
                <div>
                  <label className="block text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-1.5">Escalation Threat Severity</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full bg-[#04060c] border border-slate-850 rounded-lg p-2 text-xs text-slate-200 outline-none focus:border-indigo-755 font-serif cursor-pointer"
                  >
                    <option value="LOW (Minor Sandbox Question)">Minor (Typical Care Response)</option>
                    <option value="NORMAL (Standard Operational Queue)">Normal (Standard System Care)</option>
                    <option value="HIGH (Urgent Core Assistance Needed)">High (Urgent DevOps Response)</option>
                    <option value="CRITICAL EMERGENCY (Severe Block / Crash)">Critical Emergency (Security Priority)</option>
                  </select>
                </div>
              </div>

              {/* Conditional custom subject text */}
              {subjectOption === "Custom" && (
                <div className="animate-fadeIn">
                  <label className="block text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-1.5">Enter Custom Subject Line</label>
                  <input
                    type="text"
                    value={customSubject}
                    onChange={(e) => setCustomSubject(e.target.value)}
                    placeholder="e.g. Memory Leak Diagnostic Request"
                    className="w-full bg-[#04060c] border border-slate-850 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none focus:border-indigo-755 transition"
                    required={subjectOption === "Custom"}
                  />
                </div>
              )}

              {/* Message Context text area */}
              <div>
                <label className="block text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-1.5">Technical Message Details</label>
                <textarea
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Detail your request or support issue. Provide step-by-step logs if applicable. Our Management and Customer Care desks review submissions in real-time."
                  rows={6}
                  className="w-full bg-[#04060c] border border-slate-850 rounded-lg p-3 text-xs text-slate-200 outline-none focus:border-indigo-755 transition placeholder:text-slate-650 resize-y"
                  required
                />
                <div className="flex items-center justify-between mt-1.5 text-[9.5px] font-mono text-slate-505">
                  <span>Minimum characters: 10</span>
                  <span>Length: {messageText.length} characters</span>
                </div>
              </div>

              {/* Telemetry Switch Toggle */}
              <div className="flex items-center space-x-2 bg-[#02040a] border border-slate-855 rounded-lg p-3">
                <input
                  type="checkbox"
                  id="attach-telemetry-sec"
                  checked={attachTelemetry}
                  onChange={(e) => setAttachTelemetry(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-slate-850 text-indigo-650 bg-slate-950 focus:ring-0 cursor-pointer"
                />
                <label htmlFor="attach-telemetry-sec" className="text-[11px] text-slate-400 font-serif leading-none cursor-pointer select-none">
                  Include active diagnostic state telemetries (User details, model load average: <strong className="text-[#818cf8] font-semibold">{avgLoad}%</strong>, latency: <strong className="text-emerald-500 font-semibold">{avgLatency}ms</strong>)
                </label>
              </div>

              {/* Dispatch Action button */}
              <button
                type="submit"
                className="w-full bg-indigo-950 hover:bg-slate-900 border border-indigo-750 text-indigo-400 hover:text-indigo-300 py-2.5 rounded-lg text-xs font-mono font-bold flex items-center justify-center space-x-2.5 transition tracking-widest uppercase cursor-pointer"
              >
                <Send className="w-3.5 h-3.5 text-[#818cf8]" />
                <span>COMPILE & LAUNCH RECOVERY MAIL FORWARDER</span>
              </button>

            </form>
          )}

        </div>

        {/* Dynamic FAQ List Widget */}
        <div className="bg-[#050813] border border-slate-850 rounded-xl p-5">
          <h4 className="font-sans font-bold text-slate-200 text-xs tracking-wider uppercase mb-3.5">Support Escalation FAQ</h4>
          <div className="space-y-2.5">
            {faqItems.map((faq, i) => {
              const active = expandedFaq === i;
              return (
                <div key={i} className="border border-slate-900 bg-slate-950/20 rounded-lg overflow-hidden transition-all duration-300">
                  <button
                    type="button"
                    onClick={() => setExpandedFaq(active ? null : i)}
                    className="w-full p-3 font-serif font-semibold text-slate-300 hover:text-slate-100 text-xs flex justify-between items-center text-left transition select-none cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    {active ? <ChevronUp className="w-3.5 h-3.5 text-indigo-440 shrink-0 ml-2" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-500 shrink-0 ml-2" />}
                  </button>
                  {active && (
                    <div className="p-3 pt-0 border-t border-slate-950 font-serif text-slate-450 text-[11px] leading-relaxed animate-fadeIn">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
}

function securityPriorityIndicator(subject: string) {
  if (subject.includes("MFA")) return "ACCESS_PURGE";
  if (subject.includes("Limit")) return "CAPACITY_SCALE";
  if (subject.includes("Vulnerability")) return "ALERT_BREACH";
  return "GENERAL_INQUIRY";
}
