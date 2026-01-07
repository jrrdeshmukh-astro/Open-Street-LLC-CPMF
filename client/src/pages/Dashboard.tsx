import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  FileText, LogOut, CheckCircle2, Circle, Users, Shield, RefreshCw, Search, Target, Home, Save, Loader2,
  Clock, Calendar, DollarSign, MessageSquare, ClipboardList, Plus, Play, Pause, Building2, BookOpen, FileCheck, ChevronRight,
  UserPlus, Check, X, Share2
} from "lucide-react";
import { Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";
import type { WorkflowProgress, Artifact, Client, TimeEntry, Action, Invoice, DebriefTemplate, Message, Guide, FormTemplate, FormSubmission, Collaboration, BillingRate, TaskCode, Contract, ContractTemplate } from "@shared/schema";

const FRAMEWORK_COMPONENTS = [
  { id: "engagement_structure", name: "Engagement Structure", icon: Users, description: "Program charter, stakeholder roles, and meeting cadence", artifacts: ["program_charter", "stakeholder_map", "meeting_schedule"] },
  { id: "governance_framework", name: "Governance Framework", icon: Shield, description: "Decision rights, compliance procedures, and risk management", artifacts: ["governance_charter", "compliance_checklist", "risk_register"] },
  { id: "facilitation_model", name: "Facilitation Model", icon: RefreshCw, description: "Outcome agnostic facilitation and process documentation", artifacts: ["facilitation_guide", "session_templates", "process_docs"] },
  { id: "analysis_framework", name: "Analysis Framework", icon: Search, description: "Policy context analysis and gap identification", artifacts: ["policy_analysis", "gap_assessment", "recommendation_report"] },
  { id: "continuation_strategy", name: "Continuation Strategy", icon: Target, description: "Transition planning and knowledge transfer protocols", artifacts: ["transition_plan", "knowledge_base", "sustainability_report"] }
];

const STAGE_LABELS: Record<string, string> = { initiation: "Initiation", engagement: "Engagement", synthesis: "Synthesis", continuation: "Continuation" };

const ROLE_LABELS: Record<string, string> = {
  admin: "Administrator",
  government_compliance_officer: "Government Compliance Officer", 
  industry_partner: "Industry Partner",
  academia: "Academia"
};

const CONTRACTING_STAGES: { value: string; label: string; description: string }[] = [
  { value: "sources_sought", label: "Sources Sought", description: "Market research - gathering industry capabilities" },
  { value: "rfi", label: "RFI/Market Research", description: "Request for Information - government seeking info" },
  { value: "presolicitation", label: "Pre-Solicitation", description: "Preparing for formal solicitation" },
  { value: "solicitation", label: "Solicitation", description: "Active bidding - submit proposals" },
  { value: "award", label: "Award", description: "Contract awarded" },
  { value: "post_award", label: "Post-Award", description: "Contract execution phase" },
  { value: "completed", label: "Completed", description: "Engagement complete" }
];

const SET_ASIDE_OPTIONS = [
  { value: "none", label: "None / Full & Open" },
  { value: "small_business", label: "Small Business" },
  { value: "sdvosb", label: "SDVOSB (Service-Disabled Veteran)" },
  { value: "wosb", label: "WOSB (Women-Owned)" },
  { value: "hubzone", label: "HUBZone" },
  { value: "8a", label: "8(a)" }
];

const CONTRACT_TYPES = [
  { value: "nda", label: "Non-Disclosure Agreement (NDA)" },
  { value: "msa", label: "Master Service Agreement (MSA)" },
  { value: "sow", label: "Statement of Work (SOW)" },
  { value: "teaming_agreement", label: "Teaming Agreement" },
  { value: "subcontract", label: "Subcontract" },
  { value: "consulting", label: "Consulting Agreement" }
];

const TASK_CATEGORIES = [
  { value: "business_development", label: "Business Development" },
  { value: "delivery", label: "Project Delivery" },
  { value: "admin", label: "Administrative" },
  { value: "training", label: "Training" }
];

export default function Dashboard() {
  const { user, isLoading: authLoading, logout } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeComponent, setActiveComponent] = useState(FRAMEWORK_COMPONENTS[0].id);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerStart, setTimerStart] = useState<Date | null>(null);
  const [timerDescription, setTimerDescription] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      toast({ title: "Unauthorized", description: "Redirecting to login...", variant: "destructive" });
      setTimeout(() => { window.location.href = "/login"; }, 500);
    }
  }, [user, authLoading, toast]);

  const { data: workflowProgress = [] } = useQuery<WorkflowProgress[]>({ queryKey: ["/api/workflow/progress"], enabled: !!user });
  const { data: artifacts = [] } = useQuery<Artifact[]>({ queryKey: ["/api/artifacts"], enabled: !!user });
  const { data: clients = [] } = useQuery<Client[]>({ queryKey: ["/api/clients"], enabled: !!user });
  const { data: timeEntries = [] } = useQuery<TimeEntry[]>({ queryKey: ["/api/time-entries"], enabled: !!user });
  const { data: actions = [] } = useQuery<Action[]>({ queryKey: ["/api/actions"], enabled: !!user });
  const { data: invoices = [] } = useQuery<Invoice[]>({ queryKey: ["/api/invoices"], enabled: !!user });
  const { data: debriefTemplates = [] } = useQuery<DebriefTemplate[]>({ queryKey: ["/api/debrief-templates"], enabled: !!user });
  const { data: messages = [] } = useQuery<Message[]>({ queryKey: ["/api/messages"], enabled: !!user });
  const { data: allGuides = [] } = useQuery<Guide[]>({ queryKey: ["/api/guides"], enabled: !!user });
  const { data: allFormTemplates = [] } = useQuery<FormTemplate[]>({ queryKey: ["/api/form-templates"], enabled: !!user });
  const { data: formSubmissions = [] } = useQuery<FormSubmission[]>({ queryKey: ["/api/form-submissions"], enabled: !!user });
  const { data: collaborations = [] } = useQuery<Collaboration[]>({ queryKey: ["/api/collaborations"], enabled: !!user });
  const { data: pendingInvites = [] } = useQuery<Collaboration[]>({ queryKey: ["/api/collaborations/pending"], enabled: !!user });
  const { data: billingRates = [] } = useQuery<BillingRate[]>({ queryKey: ["/api/billing-rates"], enabled: !!user });
  const { data: taskCodes = [] } = useQuery<TaskCode[]>({ queryKey: ["/api/task-codes"], enabled: !!user });
  const { data: contracts = [] } = useQuery<Contract[]>({ queryKey: ["/api/contracts"], enabled: !!user });
  const { data: contractTemplates = [] } = useQuery<ContractTemplate[]>({ queryKey: ["/api/contract-templates"], enabled: !!user });
  const { data: legalSettings } = useQuery<any>({ queryKey: ["/api/legal/settings"], enabled: !!user });
  const [selectedGuide, setSelectedGuide] = useState<Guide | null>(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [selectedClientForCollab, setSelectedClientForCollab] = useState<string | null>(null);
  const [resourceComponent, setResourceComponent] = useState(FRAMEWORK_COMPONENTS[0].id);
  const [resourceStage, setResourceStage] = useState("initiation");
  const [selectedFormTemplate, setSelectedFormTemplate] = useState<FormTemplate | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  
  // Jira integration state
  const [jiraSettingsOpen, setJiraSettingsOpen] = useState(false);
  const [jiraDomain, setJiraDomain] = useState("");
  const [jiraEmail, setJiraEmail] = useState("");
  const [jiraApiToken, setJiraApiToken] = useState("");
  const [jiraDefaultProject, setJiraDefaultProject] = useState("");

  // Session activity & logout summary state
  const [logoutSummaryOpen, setLogoutSummaryOpen] = useState(false);
  const [sessionSummary, setSessionSummary] = useState<{ activityCount: number; activities: any[]; summary: Record<string, number> } | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Slack integration state
  const [slackSettingsOpen, setSlackSettingsOpen] = useState(false);
  const [slackWebhookUrl, setSlackWebhookUrl] = useState("");
  const [slackChannelName, setSlackChannelName] = useState("");
  const [slackWorkspaceName, setSlackWorkspaceName] = useState("");

  // Asana integration state
  const [asanaSettingsOpen, setAsanaSettingsOpen] = useState(false);
  const [asanaAccessToken, setAsanaAccessToken] = useState("");
  const [asanaWorkspaceId, setAsanaWorkspaceId] = useState("");
  const [asanaProjectId, setAsanaProjectId] = useState("");
  const [stageFilter, setStageFilter] = useState<string>("all");

  // Enhanced time tracking and billing state
  const [billingRateDialogOpen, setBillingRateDialogOpen] = useState(false);
  const [taskCodeDialogOpen, setTaskCodeDialogOpen] = useState(false);
  const [contractDialogOpen, setContractDialogOpen] = useState(false);
  const [contractTemplateDialogOpen, setContractTemplateDialogOpen] = useState(false);
  const [generateInvoiceDialogOpen, setGenerateInvoiceDialogOpen] = useState(false);
  const [selectedClientForTimer, setSelectedClientForTimer] = useState<string | null>(null);
  const [selectedBillingRateForTimer, setSelectedBillingRateForTimer] = useState<string | null>(null);
  const [selectedClientForInvoice, setSelectedClientForInvoice] = useState<string | null>(null);
  const [selectedTemplateForContract, setSelectedTemplateForContract] = useState<string | null>(null);
  const [legalSettingsOpen, setLegalSettingsOpen] = useState(false);
  const [selectedContractForSigning, setSelectedContractForSigning] = useState<string | null>(null);
  const [signContractDialogOpen, setSignContractDialogOpen] = useState(false);
  const [signatories, setSignatories] = useState<Array<{name: string; email: string; role: string}>>([{name: "", email: "", role: "signer"}]);

  // Jira queries
  const { data: jiraSettings } = useQuery<any>({ queryKey: ["/api/jira/settings"], enabled: !!user });
  const { data: jiraProjects = [] } = useQuery<{ id: string; key: string; name: string }[]>({ 
    queryKey: ["/api/jira/projects"], 
    enabled: !!user && !!jiraSettings?.hasApiToken 
  });

  // Slack queries
  const { data: slackSettings } = useQuery<any>({ queryKey: ["/api/slack/settings"], enabled: !!user });

  // Asana queries
  const { data: asanaSettings } = useQuery<any>({ queryKey: ["/api/asana/settings"], enabled: !!user });
  const { data: asanaWorkspaces = [] } = useQuery<{ gid: string; name: string }[]>({
    queryKey: ["/api/asana/workspaces"],
    enabled: !!user && !!asanaSettings?.hasAccessToken
  });
  const { data: asanaProjects = [] } = useQuery<{ gid: string; name: string }[]>({
    queryKey: ["/api/asana/projects"],
    enabled: !!user && !!asanaSettings?.workspaceId
  });

  // Slack mutations
  const saveSlackSettingsMutation = useMutation({
    mutationFn: async (data: { webhookUrl?: string; defaultChannelName?: string; workspaceName?: string; syncEnabled?: boolean }) => {
      const res = await fetch("/api/slack/settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data), credentials: "include" });
      if (!res.ok) throw new Error("Failed to save");
      return res.json();
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/slack/settings"] }); toast({ title: "Slack settings saved" }); setSlackSettingsOpen(false); },
    onError: () => toast({ title: "Failed to save Slack settings", variant: "destructive" }),
  });

  const testSlackConnectionMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/slack/test", { method: "POST", credentials: "include" });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => toast({ title: "Test message sent to Slack!" }),
    onError: () => toast({ title: "Failed to send test message", variant: "destructive" }),
  });

  const sendToSlackMutation = useMutation({
    mutationFn: async (messageId: string) => {
      const res = await fetch("/api/slack/send", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messageId }), credentials: "include" });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/messages"] }); toast({ title: "Message sent to Slack" }); },
    onError: () => toast({ title: "Failed to send to Slack", variant: "destructive" }),
  });

  // Asana mutations
  const saveAsanaSettingsMutation = useMutation({
    mutationFn: async (data: { accessToken?: string; workspaceId?: string; workspaceName?: string; defaultProjectId?: string; defaultProjectName?: string }) => {
      const res = await fetch("/api/asana/settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data), credentials: "include" });
      if (!res.ok) throw new Error("Failed to save");
      return res.json();
    },
    onSuccess: () => { 
      queryClient.invalidateQueries({ queryKey: ["/api/asana/settings"] }); 
      queryClient.invalidateQueries({ queryKey: ["/api/asana/workspaces"] });
      queryClient.invalidateQueries({ queryKey: ["/api/asana/projects"] });
      toast({ title: "Asana settings saved" }); 
      setAsanaSettingsOpen(false);
      setAsanaAccessToken("");
    },
    onError: () => toast({ title: "Failed to save Asana settings", variant: "destructive" }),
  });

  const testAsanaConnectionMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/asana/test", { method: "POST", credentials: "include" });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: (data) => toast({ title: `Connected to Asana as ${data.user}` }),
    onError: () => toast({ title: "Failed to connect to Asana", variant: "destructive" }),
  });

  const pushClientToAsanaMutation = useMutation({
    mutationFn: async (clientId: string) => {
      const res = await fetch("/api/asana/push-client", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ clientId }), credentials: "include" });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/clients"] }); toast({ title: "Client pushed to Asana" }); logActivity("create", "asana_task", undefined, undefined, "Pushed client to Asana"); },
    onError: () => toast({ title: "Failed to push to Asana", variant: "destructive" }),
  });

  const syncClientToAsanaMutation = useMutation({
    mutationFn: async (clientId: string) => {
      const res = await fetch("/api/asana/sync-client", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ clientId }), credentials: "include" });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/clients"] }); toast({ title: "Client synced with Asana" }); },
    onError: () => toast({ title: "Failed to sync with Asana", variant: "destructive" }),
  });

  const updateClientStageMutation = useMutation({
    mutationFn: async ({ clientId, stage, notes }: { clientId: string; stage: string; notes?: string }) => {
      const res = await fetch(`/api/clients/${clientId}/stage`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ stage, notes }), credentials: "include" });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/clients"] }); toast({ title: "Client stage updated" }); logActivity("update", "client_stage", undefined, undefined, "Updated client contracting stage"); },
    onError: () => toast({ title: "Failed to update stage", variant: "destructive" }),
  });

  // Session activity - log actions
  const logActivity = async (activityType: string, entityType: string, entityId?: string, entityName?: string, description?: string) => {
    try {
      await fetch("/api/session-activity", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ activityType, entityType, entityId, entityName, description }), credentials: "include" });
    } catch (e) { /* silent fail */ }
  };

  // Enhanced logout with session summary
  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const res = await fetch("/api/session-summary", { credentials: "include" });
      if (res.ok) {
        const summary = await res.json();
        setSessionSummary(summary);
        setLogoutSummaryOpen(true);
      } else {
        logout();
      }
    } catch {
      logout();
    } finally {
      setIsLoggingOut(false);
    }
  };

  const confirmLogout = () => {
    setLogoutSummaryOpen(false);
    logout();
  };

  const progressMutation = useMutation({
    mutationFn: async (data: { componentId: string; stage: string; completed: boolean; notes?: string }) => {
      const res = await fetch("/api/workflow/progress", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data), credentials: "include" });
      if (!res.ok) throw new Error("Failed to save");
      return res.json();
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/workflow/progress"] }); toast({ title: "Progress saved" }); },
  });

  const clientMutation = useMutation({
    mutationFn: async (data: Partial<Client>) => {
      const res = await fetch("/api/clients", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data), credentials: "include" });
      if (!res.ok) throw new Error("Failed to create client");
      return res.json();
    },
    onSuccess: (data) => { queryClient.invalidateQueries({ queryKey: ["/api/clients"] }); toast({ title: "Client created" }); logActivity("create", "client", data.id, data.name, "Created a new client"); },
  });

  const timeEntryMutation = useMutation({
    mutationFn: async (data: Partial<TimeEntry>) => {
      const res = await fetch("/api/time-entries", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data), credentials: "include" });
      if (!res.ok) throw new Error("Failed to create time entry");
      return res.json();
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/time-entries"] }); toast({ title: "Time entry saved" }); },
  });

  const actionMutation = useMutation({
    mutationFn: async (data: Partial<Action>) => {
      const res = await fetch("/api/actions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data), credentials: "include" });
      if (!res.ok) throw new Error("Failed to create action");
      return res.json();
    },
    onSuccess: (data) => { queryClient.invalidateQueries({ queryKey: ["/api/actions"] }); toast({ title: "Action created" }); logActivity("create", "action", data.id, data.title, "Created a new action"); },
  });

  const messageMutation = useMutation({
    mutationFn: async (data: Partial<Message>) => {
      const res = await fetch("/api/messages", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data), credentials: "include" });
      if (!res.ok) throw new Error("Failed to send message");
      return res.json();
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/messages"] }); toast({ title: "Message sent" }); },
  });

  const formSubmissionMutation = useMutation({
    mutationFn: async (data: { templateId: string; componentId: string; stage: string; formData: Record<string, any> }) => {
      const res = await fetch("/api/form-submissions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data), credentials: "include" });
      if (!res.ok) throw new Error("Failed to submit form");
      return res.json();
    },
    onSuccess: () => { 
      queryClient.invalidateQueries({ queryKey: ["/api/form-submissions"] }); 
      toast({ title: "Form submitted successfully" }); 
      setFormDialogOpen(false);
      setSelectedFormTemplate(null);
      setFormData({});
    },
  });

  const inviteCollaboratorMutation = useMutation({
    mutationFn: async (data: { clientId: string; collaboratorEmail: string }) => {
      const res = await fetch("/api/collaborations", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data), credentials: "include" });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to invite collaborator");
      }
      return res.json();
    },
    onSuccess: () => { 
      queryClient.invalidateQueries({ queryKey: ["/api/collaborations"] }); 
      toast({ title: "Invitation sent", description: "Collaborator will see the invite when they log in." }); 
      setInviteEmail("");
      setSelectedClientForCollab(null);
    },
    onError: (error: Error) => {
      toast({ title: "Failed to invite", description: error.message, variant: "destructive" });
    }
  });

  const acceptInviteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/collaborations/${id}/accept`, { method: "PATCH", credentials: "include" });
      if (!res.ok) throw new Error("Failed to accept invitation");
      return res.json();
    },
    onSuccess: () => { 
      queryClient.invalidateQueries({ queryKey: ["/api/collaborations"] }); 
      queryClient.invalidateQueries({ queryKey: ["/api/collaborations/pending"] }); 
      toast({ title: "Invitation accepted", description: "You can now collaborate on this client's workflow." }); 
    },
  });

  const declineInviteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/collaborations/${id}/decline`, { method: "PATCH", credentials: "include" });
      if (!res.ok) throw new Error("Failed to decline invitation");
      return res.json();
    },
    onSuccess: () => { 
      queryClient.invalidateQueries({ queryKey: ["/api/collaborations/pending"] }); 
      toast({ title: "Invitation declined" }); 
    },
  });

  // Jira mutations
  const saveJiraSettingsMutation = useMutation({
    mutationFn: async (data: { jiraDomain: string; jiraEmail: string; jiraApiToken: string; defaultProjectKey?: string }) => {
      const res = await fetch("/api/jira/settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data), credentials: "include" });
      if (!res.ok) throw new Error("Failed to save Jira settings");
      return res.json();
    },
    onSuccess: () => { 
      queryClient.invalidateQueries({ queryKey: ["/api/jira/settings"] }); 
      queryClient.invalidateQueries({ queryKey: ["/api/jira/projects"] }); 
      toast({ title: "Jira connected", description: "Your Jira settings have been saved." }); 
      setJiraSettingsOpen(false);
      setJiraApiToken("");
    },
    onError: () => toast({ title: "Failed to connect", description: "Check your credentials and try again.", variant: "destructive" })
  });

  const testJiraConnectionMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/jira/test", { method: "POST", credentials: "include" });
      if (!res.ok) throw new Error("Connection failed");
      return res.json();
    },
    onSuccess: (data) => toast({ title: "Connected!", description: `Logged in as ${data.user?.displayName}` }),
    onError: () => toast({ title: "Connection failed", description: "Check your Jira credentials.", variant: "destructive" })
  });

  const pushToJiraMutation = useMutation({
    mutationFn: async ({ actionId, projectKey }: { actionId: string; projectKey?: string }) => {
      const res = await fetch(`/api/jira/push/${actionId}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ projectKey }), credentials: "include" });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message);
      }
      return res.json();
    },
    onSuccess: (data) => { 
      queryClient.invalidateQueries({ queryKey: ["/api/actions"] }); 
      toast({ title: "Pushed to Jira", description: `Created issue ${data.jiraKey}` }); 
    },
    onError: (error: Error) => toast({ title: "Failed to push", description: error.message, variant: "destructive" })
  });

  const pullFromJiraMutation = useMutation({
    mutationFn: async (projectKey?: string) => {
      const res = await fetch("/api/jira/pull", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ projectKey }), credentials: "include" });
      if (!res.ok) throw new Error("Failed to pull from Jira");
      return res.json();
    },
    onSuccess: (data) => { 
      queryClient.invalidateQueries({ queryKey: ["/api/actions"] }); 
      toast({ title: "Synced from Jira", description: `Imported ${data.imported} issues` }); 
    },
    onError: () => toast({ title: "Sync failed", description: "Could not import from Jira", variant: "destructive" })
  });

  const syncActionMutation = useMutation({
    mutationFn: async (actionId: string) => {
      const res = await fetch(`/api/jira/sync/${actionId}`, { method: "POST", credentials: "include" });
      if (!res.ok) throw new Error("Failed to sync");
      return res.json();
    },
    onSuccess: () => { 
      queryClient.invalidateQueries({ queryKey: ["/api/actions"] }); 
      toast({ title: "Synced with Jira" }); 
    }
  });

  // Enhanced billing and time tracking mutations
  const createBillingRateMutation = useMutation({
    mutationFn: async (data: { name: string; rate: string; laborCategory?: string; rateType?: string }) => {
      const res = await fetch("/api/billing-rates", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data), credentials: "include" });
      if (!res.ok) throw new Error("Failed to create billing rate");
      return res.json();
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/billing-rates"] }); toast({ title: "Billing rate created" }); setBillingRateDialogOpen(false); },
    onError: () => toast({ title: "Failed to create billing rate", variant: "destructive" }),
  });

  const createTaskCodeMutation = useMutation({
    mutationFn: async (data: { code: string; name: string; category?: string; isBillable?: boolean }) => {
      const res = await fetch("/api/task-codes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data), credentials: "include" });
      if (!res.ok) throw new Error("Failed to create task code");
      return res.json();
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/task-codes"] }); toast({ title: "Task code created" }); setTaskCodeDialogOpen(false); },
    onError: () => toast({ title: "Failed to create task code", variant: "destructive" }),
  });

  const createContractMutation = useMutation({
    mutationFn: async (data: { clientId: string; contractType: string; title: string; content?: string; status?: string }) => {
      const res = await fetch("/api/contracts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data), credentials: "include" });
      if (!res.ok) throw new Error("Failed to create contract");
      return res.json();
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/contracts"] }); toast({ title: "Contract created" }); setContractDialogOpen(false); },
    onError: () => toast({ title: "Failed to create contract", variant: "destructive" }),
  });

  const createContractFromTemplateMutation = useMutation({
    mutationFn: async ({ templateId, clientId, variables }: { templateId: string; clientId: string; variables?: Record<string, string> }) => {
      const res = await fetch(`/api/contracts/from-template/${templateId}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ clientId, variables }), credentials: "include" });
      if (!res.ok) throw new Error("Failed to create contract from template");
      return res.json();
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/contracts"] }); toast({ title: "Contract created from template" }); setContractDialogOpen(false); },
    onError: () => toast({ title: "Failed to create contract from template", variant: "destructive" }),
  });

  const createContractTemplateMutation = useMutation({
    mutationFn: async (data: { name: string; templateType: string; content: string; description?: string; variables?: string }) => {
      const res = await fetch("/api/contract-templates", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data), credentials: "include" });
      if (!res.ok) throw new Error("Failed to create contract template");
      return res.json();
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/contract-templates"] }); toast({ title: "Contract template created" }); setContractTemplateDialogOpen(false); },
    onError: () => toast({ title: "Failed to create contract template", variant: "destructive" }),
  });

  const generateInvoiceMutation = useMutation({
    mutationFn: async (data: { clientId: string }) => {
      const res = await fetch("/api/invoices/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data), credentials: "include" });
      if (!res.ok) throw new Error("Failed to generate invoice");
      return res.json();
    },
    onSuccess: () => { 
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] }); 
      queryClient.invalidateQueries({ queryKey: ["/api/time-entries"] }); 
      toast({ title: "Invoice generated" }); 
      setGenerateInvoiceDialogOpen(false);
      setSelectedClientForInvoice(null);
    },
    onError: () => toast({ title: "Failed to generate invoice", variant: "destructive" }),
  });

  const saveLegalSettingsMutation = useMutation({
    mutationFn: async (data: { preferredService?: string; docusignAccountId?: string; docusignAccessToken?: string; docusignEnvironment?: string; pandadocApiKey?: string; defaultReviewerEmail?: string; requireLegalReview?: boolean }) => {
      const res = await fetch("/api/legal/settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data), credentials: "include" });
      if (!res.ok) throw new Error("Failed to save legal settings");
      return res.json();
    },
    onSuccess: () => { 
      queryClient.invalidateQueries({ queryKey: ["/api/legal/settings"] }); 
      toast({ title: "Legal settings saved" }); 
      setLegalSettingsOpen(false);
    },
    onError: () => toast({ title: "Failed to save legal settings", variant: "destructive" }),
  });

  const sendContractForSignatureMutation = useMutation({
    mutationFn: async ({ contractId, signatories }: { contractId: string; signatories: Array<{name: string; email: string; role: string}> }) => {
      const res = await fetch(`/api/contracts/${contractId}/send-for-signature`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ signatories }), credentials: "include" });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to send contract for signature");
      }
      return res.json();
    },
    onSuccess: (data) => { 
      queryClient.invalidateQueries({ queryKey: ["/api/contracts"] }); 
      toast({ title: "Contract sent for signature", description: data.message }); 
      setSignContractDialogOpen(false);
      setSelectedContractForSigning(null);
      setSignatories([{name: "", email: "", role: "signer"}]);
    },
    onError: (error: Error) => toast({ title: "Failed to send contract", description: error.message, variant: "destructive" }),
  });

  const handleStartForm = (template: FormTemplate) => {
    setSelectedFormTemplate(template);
    setFormData({});
    setFormDialogOpen(true);
  };

  const handleFormFieldChange = (fieldId: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
  };

  const handleSubmitForm = () => {
    if (!selectedFormTemplate) return;
    
    try {
      const schema = JSON.parse(selectedFormTemplate.formSchema);
      const requiredFields = schema.fields?.filter((f: any) => f.required) || [];
      const missingRequired = requiredFields.filter((f: any) => !formData[f.id] || formData[f.id] === '');
      
      if (missingRequired.length > 0) {
        toast({ 
          title: "Required fields missing", 
          description: `Please fill in: ${missingRequired.map((f: any) => f.label).join(', ')}`,
          variant: "destructive" 
        });
        return;
      }
    } catch {
      toast({ title: "Form error", description: "Unable to validate form", variant: "destructive" });
      return;
    }
    
    formSubmissionMutation.mutate({
      templateId: selectedFormTemplate.id,
      componentId: selectedFormTemplate.componentId,
      stage: selectedFormTemplate.stage,
      formData
    });
  };

  const renderFormField = (field: { id: string; type: string; label: string; required?: boolean; placeholder?: string; options?: string[] }) => {
    const value = formData[field.id] || '';
    switch (field.type) {
      case 'text':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>{field.label}{field.required && <span className="text-red-500 ml-1">*</span>}</Label>
            <Input id={field.id} placeholder={field.placeholder} value={value} onChange={(e) => handleFormFieldChange(field.id, e.target.value)} data-testid={`form-field-${field.id}`} />
          </div>
        );
      case 'textarea':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>{field.label}{field.required && <span className="text-red-500 ml-1">*</span>}</Label>
            <Textarea id={field.id} placeholder={field.placeholder} value={value} onChange={(e) => handleFormFieldChange(field.id, e.target.value)} className="min-h-[100px]" data-testid={`form-field-${field.id}`} />
          </div>
        );
      case 'date':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>{field.label}{field.required && <span className="text-red-500 ml-1">*</span>}</Label>
            <Input id={field.id} type="date" value={value} onChange={(e) => handleFormFieldChange(field.id, e.target.value)} data-testid={`form-field-${field.id}`} />
          </div>
        );
      case 'select':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>{field.label}{field.required && <span className="text-red-500 ml-1">*</span>}</Label>
            <Select value={value} onValueChange={(v) => handleFormFieldChange(field.id, v)}>
              <SelectTrigger data-testid={`form-field-${field.id}`}><SelectValue placeholder="Select an option" /></SelectTrigger>
              <SelectContent>
                {field.options?.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        );
      case 'checkbox':
        return (
          <div key={field.id} className="flex items-center gap-2">
            <Checkbox id={field.id} checked={!!value} onCheckedChange={(checked) => handleFormFieldChange(field.id, checked)} data-testid={`form-field-${field.id}`} />
            <Label htmlFor={field.id} className="cursor-pointer">{field.label}</Label>
          </div>
        );
      default:
        return null;
    }
  };

  if (authLoading || !user) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  const getComponentProgress = (componentId: string) => {
    const componentProgresses = workflowProgress.filter(p => p.componentId === componentId);
    return (componentProgresses.filter(p => p.completed).length / 4) * 100;
  };

  const getStageStatus = (componentId: string, stage: string) => workflowProgress.find(p => p.componentId === componentId && p.stage === stage);
  const totalProgress = FRAMEWORK_COMPONENTS.reduce((acc, comp) => acc + getComponentProgress(comp.id), 0) / FRAMEWORK_COMPONENTS.length;
  const currentComponent = FRAMEWORK_COMPONENTS.find(c => c.id === activeComponent)!;

  const handleStageToggle = (componentId: string, stage: string, currentStatus: boolean) => {
    progressMutation.mutate({ componentId, stage, completed: !currentStatus, notes: notes[`${componentId}_${stage}`] || "" });
  };

  const handleStartTimer = () => { setTimerRunning(true); setTimerStart(new Date()); };
  const handleStopTimer = () => {
    if (timerStart) {
      const durationMinutes = Math.round((new Date().getTime() - timerStart.getTime()) / 60000);
      const selectedRate = billingRates.find(r => r.id === selectedBillingRateForTimer);
      timeEntryMutation.mutate({ 
        description: timerDescription || "Timer entry", 
        startTime: timerStart, 
        endTime: new Date(), 
        durationMinutes,
        clientId: selectedClientForTimer || undefined,
        hourlyRate: selectedRate?.rate || undefined,
        billingRateId: selectedBillingRateForTimer || undefined,
      });
    }
    setTimerRunning(false); setTimerStart(null); setTimerDescription(""); setSelectedClientForTimer(null); setSelectedBillingRateForTimer(null);
  };

  const totalHours = timeEntries.reduce((acc, e) => acc + (e.durationMinutes || 0), 0) / 60;
  const pendingActions = actions.filter(a => a.status !== "completed").length;
  const unreadMessages = messages.filter(m => !m.readAt).length;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-primary text-white py-4 px-6 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-serif font-bold">CPMF Dashboard</h1>
            <Badge variant="secondary" className="bg-[#bfa15f] text-primary">{Math.round(totalProgress)}% Complete</Badge>
            {user.role && <Badge variant="outline" className="border-white/30 text-white/80">{ROLE_LABELS[user.role] || user.role}</Badge>}
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-300">Welcome, {user.firstName || user.email}</span>
            <Link href="/" className="text-sm text-slate-300 hover:text-white flex items-center gap-1" data-testid="link-home"><Home className="w-4 h-4" /> Home</Link>
            <button onClick={handleLogout} disabled={isLoggingOut} className="text-sm text-slate-300 hover:text-white flex items-center gap-1" data-testid="button-logout">{isLoggingOut ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />} Logout</button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        <Tabs defaultValue="workflow" className="w-full">
          <TabsList className="grid w-full grid-cols-8 mb-6">
            <TabsTrigger value="workflow" className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Workflow</TabsTrigger>
            <TabsTrigger value="resources" className="flex items-center gap-2"><BookOpen className="w-4 h-4" /> Resources</TabsTrigger>
            <TabsTrigger value="clients" className="flex items-center gap-2"><Building2 className="w-4 h-4" /> Clients</TabsTrigger>
            <TabsTrigger value="time" className="flex items-center gap-2"><Clock className="w-4 h-4" /> Time</TabsTrigger>
            <TabsTrigger value="actions" className="flex items-center gap-2"><Calendar className="w-4 h-4" /> Actions</TabsTrigger>
            <TabsTrigger value="billing" className="flex items-center gap-2"><DollarSign className="w-4 h-4" /> Billing</TabsTrigger>
            <TabsTrigger value="debrief" className="flex items-center gap-2"><ClipboardList className="w-4 h-4" /> Debrief</TabsTrigger>
            <TabsTrigger value="messages" className="flex items-center gap-2 relative"><MessageSquare className="w-4 h-4" /> Messages {unreadMessages > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">{unreadMessages}</span>}</TabsTrigger>
          </TabsList>

          {/* Workflow Tab */}
          <TabsContent value="workflow">
            <Card className="mb-6">
              <CardHeader><CardTitle className="text-lg font-serif">Framework Implementation Progress</CardTitle></CardHeader>
              <CardContent>
                <Progress value={totalProgress} className="h-3 mb-4" />
                <div className="grid grid-cols-5 gap-4">
                  {FRAMEWORK_COMPONENTS.map((comp) => {
                    const progress = getComponentProgress(comp.id);
                    const Icon = comp.icon;
                    return (
                      <button key={comp.id} onClick={() => setActiveComponent(comp.id)} className={`p-4 rounded-lg border transition-all text-left ${activeComponent === comp.id ? "border-primary bg-primary/5 shadow-md" : "border-slate-200 hover:border-primary/50"}`} data-testid={`button-component-${comp.id}`}>
                        <div className="flex items-center gap-2 mb-2"><Icon className={`w-5 h-5 ${activeComponent === comp.id ? "text-primary" : "text-slate-500"}`} /><span className="text-xs font-medium text-[#bfa15f]">{Math.round(progress)}%</span></div>
                        <p className="text-sm font-medium text-primary truncate">{comp.name}</p>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
            <div className="grid lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader><div className="flex items-center gap-3"><currentComponent.icon className="w-6 h-6 text-primary" /><div><CardTitle className="font-serif">{currentComponent.name}</CardTitle><CardDescription>{currentComponent.description}</CardDescription></div></div></CardHeader>
                <CardContent>
                  <Tabs defaultValue="initiation" className="w-full">
                    <TabsList className="grid grid-cols-4 mb-6">
                      {Object.entries(STAGE_LABELS).map(([key, label]) => {
                        const status = getStageStatus(currentComponent.id, key);
                        return <TabsTrigger key={key} value={key} className="flex items-center gap-2">{status?.completed ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Circle className="w-4 h-4 text-slate-300" />}{label}</TabsTrigger>;
                      })}
                    </TabsList>
                    {Object.entries(STAGE_LABELS).map(([key, label]) => {
                      const status = getStageStatus(currentComponent.id, key);
                      const noteKey = `${currentComponent.id}_${key}`;
                      return (
                        <TabsContent key={key} value={key} className="space-y-4">
                          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <Checkbox id={`stage-${key}`} checked={status?.completed || false} onCheckedChange={() => handleStageToggle(currentComponent.id, key, status?.completed || false)} data-testid={`checkbox-stage-${currentComponent.id}-${key}`} />
                              <label htmlFor={`stage-${key}`} className="font-medium cursor-pointer">Mark {label} Stage as Complete</label>
                            </div>
                            {status?.completedAt && <span className="text-xs text-slate-500">Completed: {new Date(status.completedAt).toLocaleDateString()}</span>}
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Notes</label>
                            <Textarea placeholder={`Add notes for the ${label} stage...`} value={notes[noteKey] ?? status?.notes ?? ""} onChange={(e) => setNotes({ ...notes, [noteKey]: e.target.value })} className="min-h-[100px]" data-testid={`textarea-notes-${currentComponent.id}-${key}`} />
                            <Button size="sm" onClick={() => progressMutation.mutate({ componentId: currentComponent.id, stage: key, completed: status?.completed || false, notes: notes[noteKey] || "" })} disabled={progressMutation.isPending} data-testid={`button-save-notes-${currentComponent.id}-${key}`}><Save className="w-4 h-4 mr-2" />Save Notes</Button>
                          </div>
                        </TabsContent>
                      );
                    })}
                  </Tabs>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-lg font-serif flex items-center gap-2"><FileText className="w-5 h-5" /> Artifacts</CardTitle></CardHeader>
                <CardContent>
                  <ScrollArea className="h-[300px]">
                    <div className="space-y-3">
                      {currentComponent.artifacts.map((artifactType) => {
                        const artifact = artifacts.find(a => a.componentId === currentComponent.id && a.artifactType === artifactType);
                        const artifactLabel = artifactType.split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
                        return (
                          <div key={artifactType} className={`p-3 rounded-lg border ${artifact ? "border-green-200 bg-green-50" : "border-slate-200 bg-slate-50"}`} data-testid={`artifact-${currentComponent.id}-${artifactType}`}>
                            <div className="flex items-center justify-between"><span className="text-sm font-medium">{artifactLabel}</span>{artifact ? <Badge variant="outline" className="text-green-600 border-green-300"><CheckCircle2 className="w-3 h-3 mr-1" />Created</Badge> : <Badge variant="outline" className="text-slate-400">Pending</Badge>}</div>
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Resources Tab */}
          <TabsContent value="resources">
            <div className="grid lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="font-serif flex items-center gap-2"><BookOpen className="w-5 h-5" /> Resource Library</CardTitle>
                  <CardDescription>Guides, forms, and documentation for each stage of the CPMF framework</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4 mb-6">
                    <Select value={resourceComponent} onValueChange={setResourceComponent}>
                      <SelectTrigger className="w-[200px]" data-testid="select-resource-component">
                        <SelectValue placeholder="Select component" />
                      </SelectTrigger>
                      <SelectContent>
                        {FRAMEWORK_COMPONENTS.map(c => (
                          <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={resourceStage} onValueChange={setResourceStage}>
                      <SelectTrigger className="w-[150px]" data-testid="select-resource-stage">
                        <SelectValue placeholder="Select stage" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(STAGE_LABELS).map(([key, label]) => (
                          <SelectItem key={key} value={key}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <ScrollArea className="h-[500px]">
                    <div className="space-y-4">
                      {allGuides
                        .filter(g => g.componentId === resourceComponent && g.stage === resourceStage)
                        .filter(g => !g.roleVisibility || g.roleVisibility.length === 0 || (user?.role && g.roleVisibility.includes(user.role)))
                        .map(guide => (
                        <Card key={guide.id} className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => setSelectedGuide(guide)} data-testid={`guide-card-${guide.id}`}>
                          <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-base font-medium flex items-center gap-2">
                                <BookOpen className="w-4 h-4 text-[#bfa15f]" />
                                {guide.title}
                              </CardTitle>
                              <ChevronRight className="w-4 h-4 text-muted-foreground" />
                            </div>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <p className="text-sm text-muted-foreground">{guide.summary}</p>
                          </CardContent>
                        </Card>
                      ))}
                      
                      {allFormTemplates.filter(t => t.componentId === resourceComponent && t.stage === resourceStage).map(template => (
                        <Card key={template.id} className="border-[#bfa15f]/30 bg-[#bfa15f]/5" data-testid={`form-template-${template.id}`}>
                          <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-base font-medium flex items-center gap-2">
                                <FileCheck className="w-4 h-4 text-[#bfa15f]" />
                                {template.title}
                              </CardTitle>
                              <Badge className="bg-[#bfa15f]">Form</Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <p className="text-sm text-muted-foreground mb-3">{template.description}</p>
                            <Button size="sm" variant="outline" onClick={() => handleStartForm(template)} data-testid={`button-start-form-${template.id}`}>
                              <FileCheck className="w-4 h-4 mr-2" />Start Form
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                      
                      {allGuides.filter(g => g.componentId === resourceComponent && g.stage === resourceStage).filter(g => !g.roleVisibility || g.roleVisibility.length === 0 || (user?.role && g.roleVisibility.includes(user.role))).length === 0 &&
                       allFormTemplates.filter(t => t.componentId === resourceComponent && t.stage === resourceStage).length === 0 && (
                        <div className="text-center py-12 text-muted-foreground">
                          <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p>No resources available for this stage yet.</p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
              
              <div className="space-y-6">
                {selectedGuide ? (
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="font-serif text-lg">{selectedGuide.title}</CardTitle>
                        <Button variant="ghost" size="sm" onClick={() => setSelectedGuide(null)}>Close</Button>
                      </div>
                      <CardDescription>{selectedGuide.summary}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[400px]">
                        <div className="prose prose-sm max-w-none [&>h2]:text-lg [&>h2]:font-semibold [&>h2]:mt-4 [&>h2]:mb-2 [&>h3]:text-base [&>h3]:font-medium [&>h3]:mt-3 [&>h3]:mb-1 [&>ul]:ml-4 [&>ol]:ml-4 [&>li]:ml-4 [&>p]:text-sm [&>p]:text-muted-foreground">
                          <ReactMarkdown>{selectedGuide.content}</ReactMarkdown>
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardHeader>
                      <CardTitle className="font-serif">Quick Stats</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <span>Total Guides</span>
                        <span className="font-bold text-xl">{allGuides.length}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <span>Form Templates</span>
                        <span className="font-bold text-xl">{allFormTemplates.length}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <span>Your Submissions</span>
                        <span className="font-bold text-xl">{formSubmissions.length}</span>
                      </div>
                    </CardContent>
                  </Card>
                )}
                
                <Card>
                  <CardHeader>
                    <CardTitle className="font-serif text-base">Your Form Submissions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[200px]">
                      {formSubmissions.length === 0 ? (
                        <p className="text-center text-muted-foreground py-4">No submissions yet. Complete a form to get started.</p>
                      ) : (
                        <div className="space-y-2">
                          {formSubmissions.map(sub => (
                            <div key={sub.id} className="p-3 rounded-lg border border-slate-200 flex items-center justify-between" data-testid={`submission-${sub.id}`}>
                              <span className="text-sm">{sub.componentId} - {sub.stage}</span>
                              <Badge variant={sub.status === "submitted" ? "default" : "secondary"}>{sub.status}</Badge>
                            </div>
                          ))}
                        </div>
                      )}
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Clients Tab */}
          <TabsContent value="clients">
            {/* Pending Collaboration Invites */}
            {pendingInvites.length > 0 && (
              <Card className="mb-6 border-amber-200 bg-amber-50">
                <CardHeader className="pb-3">
                  <CardTitle className="font-serif text-lg flex items-center gap-2">
                    <UserPlus className="w-5 h-5 text-amber-600" />
                    Pending Collaboration Invites
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {pendingInvites.map((invite) => (
                      <div key={invite.id} className="flex items-center justify-between p-3 bg-white rounded-lg border" data-testid={`invite-${invite.id}`}>
                        <div>
                          <p className="font-medium">Collaboration request</p>
                          <p className="text-sm text-muted-foreground">From: {invite.collaboratorEmail}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => acceptInviteMutation.mutate(invite.id)} disabled={acceptInviteMutation.isPending} data-testid={`accept-invite-${invite.id}`}>
                            <Check className="w-4 h-4 mr-1" />Accept
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => declineInviteMutation.mutate(invite.id)} disabled={declineInviteMutation.isPending} data-testid={`decline-invite-${invite.id}`}>
                            <X className="w-4 h-4 mr-1" />Decline
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                    <CardTitle className="font-serif">Client Pipeline</CardTitle>
                    <Select value={stageFilter} onValueChange={setStageFilter}>
                      <SelectTrigger className="w-[180px]" data-testid="select-stage-filter">
                        <SelectValue placeholder="Filter by stage" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Stages</SelectItem>
                        {CONTRACTING_STAGES.map(s => (
                          <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild><Button data-testid="button-add-client"><Plus className="w-4 h-4 mr-2" />New Opportunity</Button></DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader><DialogTitle>New Client / Opportunity Intake</DialogTitle><DialogDescription>Enter opportunity details from SAM.gov or manual intake.</DialogDescription></DialogHeader>
                      <form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); clientMutation.mutate({ name: fd.get("name") as string, organization: fd.get("organization") as string, email: fd.get("email") as string, phone: fd.get("phone") as string, sector: fd.get("sector") as string, notes: fd.get("notes") as string, contractingStage: fd.get("contractingStage") as string, samOpportunityId: fd.get("samOpportunityId") as string, naicsCode: fd.get("naicsCode") as string, pscCode: fd.get("pscCode") as string, setAside: fd.get("setAside") as string, estimatedValue: fd.get("estimatedValue") as string, responseDeadline: fd.get("responseDeadline") ? new Date(fd.get("responseDeadline") as string) : undefined }); }} className="space-y-4">
                        <div className="border-b pb-3 mb-3"><h4 className="font-medium text-sm text-muted-foreground">Contact Information</h4></div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2"><Label htmlFor="name">Contact Name</Label><Input id="name" name="name" required data-testid="input-client-name" /></div>
                          <div className="space-y-2"><Label htmlFor="organization">Organization</Label><Input id="organization" name="organization" data-testid="input-client-org" /></div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2"><Label htmlFor="email">Email</Label><Input id="email" name="email" type="email" data-testid="input-client-email" /></div>
                          <div className="space-y-2"><Label htmlFor="phone">Phone</Label><Input id="phone" name="phone" data-testid="input-client-phone" /></div>
                        </div>
                        <div className="space-y-2"><Label htmlFor="sector">Sector</Label><Select name="sector" defaultValue="government"><SelectTrigger data-testid="select-client-sector"><SelectValue placeholder="Select sector" /></SelectTrigger><SelectContent><SelectItem value="government">Government</SelectItem><SelectItem value="industry">Industry</SelectItem><SelectItem value="academia">Academia</SelectItem></SelectContent></Select></div>
                        
                        <div className="border-b pb-3 mb-3 mt-6"><h4 className="font-medium text-sm text-muted-foreground">SAM.gov Opportunity Details</h4></div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2"><Label htmlFor="samOpportunityId">SAM.gov Opportunity ID</Label><Input id="samOpportunityId" name="samOpportunityId" placeholder="e.g., 12345ABC" data-testid="input-sam-id" /></div>
                          <div className="space-y-2"><Label htmlFor="contractingStage">Contracting Stage</Label><Select name="contractingStage" defaultValue="sources_sought"><SelectTrigger data-testid="select-contracting-stage"><SelectValue /></SelectTrigger><SelectContent>{CONTRACTING_STAGES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent></Select></div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="space-y-2"><Label htmlFor="naicsCode">NAICS Code</Label><Input id="naicsCode" name="naicsCode" placeholder="e.g., 541611" data-testid="input-naics" /></div>
                          <div className="space-y-2"><Label htmlFor="pscCode">PSC Code</Label><Input id="pscCode" name="pscCode" placeholder="e.g., R425" data-testid="input-psc" /></div>
                          <div className="space-y-2"><Label htmlFor="setAside">Set-Aside</Label><Select name="setAside" defaultValue="none"><SelectTrigger data-testid="select-set-aside"><SelectValue /></SelectTrigger><SelectContent>{SET_ASIDE_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent></Select></div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2"><Label htmlFor="estimatedValue">Estimated Value</Label><Input id="estimatedValue" name="estimatedValue" placeholder="e.g., $1M - $5M" data-testid="input-value" /></div>
                          <div className="space-y-2"><Label htmlFor="responseDeadline">Response Deadline</Label><Input id="responseDeadline" name="responseDeadline" type="date" data-testid="input-deadline" /></div>
                        </div>
                        <div className="space-y-2"><Label htmlFor="notes">Notes</Label><Textarea id="notes" name="notes" placeholder="Additional details, strategy notes..." data-testid="textarea-client-notes" /></div>
                        <Button type="submit" className="w-full" disabled={clientMutation.isPending} data-testid="button-submit-client">{clientMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}Create Opportunity</Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[500px]">
                    <div className="space-y-3">
                      {clients.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">No clients yet. Add your first opportunity to get started.</p>
                      ) : (
                        clients.filter(c => stageFilter === "all" || c.contractingStage === stageFilter).map((client) => {
                          const clientCollabs = collaborations.filter(c => c.clientId === client.id && c.status === "accepted");
                          const stageInfo = CONTRACTING_STAGES.find(s => s.value === client.contractingStage) || CONTRACTING_STAGES[0];
                          return (
                            <div key={client.id} className="p-4 rounded-lg border border-slate-200 hover:border-primary/50 transition-colors" data-testid={`client-card-${client.id}`}>
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-medium">{client.name}</span>
                                <div className="flex items-center gap-2 flex-wrap justify-end">
                                  <Badge className="bg-[#bfa15f] text-white hover:bg-[#a8893f]">{stageInfo.label}</Badge>
                                  {client.asanaTaskId && <Badge variant="outline" className="text-xs">Asana</Badge>}
                                  {clientCollabs.length > 0 && <Badge variant="secondary" className="flex items-center gap-1"><Share2 className="w-3 h-3" />{clientCollabs.length}</Badge>}
                                </div>
                              </div>
                              <p className="text-sm font-medium text-slate-700">{client.organization}</p>
                              <div className="flex flex-wrap gap-2 mt-2 text-xs text-muted-foreground">
                                {client.samOpportunityId && <span>SAM: {client.samOpportunityId}</span>}
                                {client.naicsCode && <span>NAICS: {client.naicsCode}</span>}
                                {client.setAside && client.setAside !== "none" && <span className="text-amber-600">Set-Aside: {SET_ASIDE_OPTIONS.find(o => o.value === client.setAside)?.label}</span>}
                                {client.estimatedValue && <span className="text-green-600">{client.estimatedValue}</span>}
                              </div>
                              {client.responseDeadline && (
                                <p className="text-xs mt-1 text-red-600">Deadline: {new Date(client.responseDeadline).toLocaleDateString()}</p>
                              )}
                              
                              <div className="pt-3 mt-3 border-t flex flex-wrap gap-2 items-center">
                                <Select value={client.contractingStage || "sources_sought"} onValueChange={(stage) => updateClientStageMutation.mutate({ clientId: client.id, stage })}>
                                  <SelectTrigger className="w-[160px] h-8 text-xs" data-testid={`select-stage-${client.id}`}>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {CONTRACTING_STAGES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                                  </SelectContent>
                                </Select>
                                
                                {asanaSettings?.hasAccessToken && asanaSettings?.defaultProjectId && (
                                  client.asanaTaskId ? (
                                    <Button size="sm" variant="outline" onClick={() => syncClientToAsanaMutation.mutate(client.id)} disabled={syncClientToAsanaMutation.isPending} data-testid={`sync-asana-${client.id}`}>
                                      <RefreshCw className={`w-3 h-3 mr-1 ${syncClientToAsanaMutation.isPending ? 'animate-spin' : ''}`} />Sync Asana
                                    </Button>
                                  ) : (
                                    <Button size="sm" variant="outline" onClick={() => pushClientToAsanaMutation.mutate(client.id)} disabled={pushClientToAsanaMutation.isPending} data-testid={`push-asana-${client.id}`}>
                                      <ChevronRight className="w-3 h-3 mr-1" />Push to Asana
                                    </Button>
                                  )
                                )}
                                
                                {(user?.role === "industry_partner" || user?.role === "academia") && (
                                  selectedClientForCollab === client.id ? (
                                    <div className="flex gap-1 flex-1">
                                      <Input placeholder="Collaborator email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} className="h-8 text-xs flex-1" data-testid={`input-invite-email-${client.id}`} />
                                      <Button size="sm" variant="outline" onClick={() => inviteCollaboratorMutation.mutate({ clientId: client.id, collaboratorEmail: inviteEmail })} disabled={inviteCollaboratorMutation.isPending || !inviteEmail} data-testid={`button-send-invite-${client.id}`}>
                                        {inviteCollaboratorMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : "Send"}
                                      </Button>
                                      <Button size="sm" variant="ghost" onClick={() => { setSelectedClientForCollab(null); setInviteEmail(""); }}>X</Button>
                                    </div>
                                  ) : (
                                    <Button size="sm" variant="ghost" onClick={() => setSelectedClientForCollab(client.id)} data-testid={`button-invite-collaborator-${client.id}`}>
                                      <UserPlus className="w-3 h-3 mr-1" />Invite
                                    </Button>
                                  )
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
              
              <div className="space-y-6">
                {/* Asana Integration Card */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="font-serif text-base flex items-center justify-between">
                      Asana Integration
                      <Dialog open={asanaSettingsOpen} onOpenChange={setAsanaSettingsOpen}>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline" data-testid="button-asana-settings">Settings</Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader><DialogTitle>Asana Settings</DialogTitle><DialogDescription>Connect your Asana workspace to sync client opportunities.</DialogDescription></DialogHeader>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label>Personal Access Token</Label>
                              <Input type="password" value={asanaAccessToken} onChange={(e) => setAsanaAccessToken(e.target.value)} placeholder={asanaSettings?.hasAccessToken ? "••••••••" : "Enter token"} data-testid="input-asana-token" />
                              <p className="text-xs text-muted-foreground">Get your token from Asana Developer Console</p>
                            </div>
                            {asanaSettings?.hasAccessToken && (
                              <>
                                <div className="space-y-2">
                                  <Label>Workspace</Label>
                                  <Select value={asanaWorkspaceId || asanaSettings?.workspaceId || ""} onValueChange={(v) => { setAsanaWorkspaceId(v); const ws = asanaWorkspaces.find(w => w.gid === v); saveAsanaSettingsMutation.mutate({ workspaceId: v, workspaceName: ws?.name }); }}>
                                    <SelectTrigger data-testid="select-asana-workspace"><SelectValue placeholder="Select workspace" /></SelectTrigger>
                                    <SelectContent>{asanaWorkspaces.map(w => <SelectItem key={w.gid} value={w.gid}>{w.name}</SelectItem>)}</SelectContent>
                                  </Select>
                                </div>
                                {(asanaSettings?.workspaceId || asanaWorkspaceId) && (
                                  <div className="space-y-2">
                                    <Label>Default Project</Label>
                                    <Select value={asanaProjectId || asanaSettings?.defaultProjectId || ""} onValueChange={(v) => { setAsanaProjectId(v); const p = asanaProjects.find(proj => proj.gid === v); saveAsanaSettingsMutation.mutate({ defaultProjectId: v, defaultProjectName: p?.name }); }}>
                                      <SelectTrigger data-testid="select-asana-project"><SelectValue placeholder="Select project" /></SelectTrigger>
                                      <SelectContent>{asanaProjects.map(p => <SelectItem key={p.gid} value={p.gid}>{p.name}</SelectItem>)}</SelectContent>
                                    </Select>
                                  </div>
                                )}
                              </>
                            )}
                            <div className="flex gap-2">
                              {asanaAccessToken && (
                                <Button onClick={() => saveAsanaSettingsMutation.mutate({ accessToken: asanaAccessToken })} disabled={saveAsanaSettingsMutation.isPending} data-testid="button-save-asana">
                                  {saveAsanaSettingsMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}Save Token
                                </Button>
                              )}
                              {asanaSettings?.hasAccessToken && (
                                <Button variant="outline" onClick={() => testAsanaConnectionMutation.mutate()} disabled={testAsanaConnectionMutation.isPending} data-testid="button-test-asana">
                                  {testAsanaConnectionMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}Test Connection
                                </Button>
                              )}
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {asanaSettings?.hasAccessToken ? (
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-green-600"><CheckCircle2 className="w-4 h-4" />Connected</div>
                        {asanaSettings.workspaceName && <p className="text-muted-foreground">Workspace: {asanaSettings.workspaceName}</p>}
                        {asanaSettings.defaultProjectName && <p className="text-muted-foreground">Project: {asanaSettings.defaultProjectName}</p>}
                        {asanaSettings.lastSyncAt && <p className="text-xs text-muted-foreground">Last sync: {new Date(asanaSettings.lastSyncAt).toLocaleString()}</p>}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">Connect Asana to sync opportunities as tasks.</p>
                    )}
                  </CardContent>
                </Card>

                {/* Pipeline Stats */}
                <Card>
                  <CardHeader><CardTitle className="font-serif text-base">Pipeline by Stage</CardTitle></CardHeader>
                  <CardContent className="space-y-2">
                    {CONTRACTING_STAGES.map(stage => {
                      const count = clients.filter(c => c.contractingStage === stage.value).length;
                      return (
                        <div key={stage.value} className="flex items-center justify-between p-2 bg-slate-50 rounded cursor-pointer hover:bg-slate-100" onClick={() => setStageFilter(stage.value)} data-testid={`stage-stat-${stage.value}`}>
                          <span className="text-sm">{stage.label}</span>
                          <Badge variant="secondary">{count}</Badge>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
                
                {/* Quick Stats */}
                <Card>
                  <CardHeader><CardTitle className="font-serif text-base">Quick Stats</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg"><span className="text-sm">Total Opportunities</span><span className="font-bold">{clients.length}</span></div>
                    <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg"><span className="text-sm">Active Solicitations</span><span className="font-bold text-amber-600">{clients.filter(c => c.contractingStage === "solicitation").length}</span></div>
                    <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg"><span className="text-sm">Awards</span><span className="font-bold text-green-600">{clients.filter(c => c.contractingStage === "award" || c.contractingStage === "post_award").length}</span></div>
                  </CardContent>
                </Card>
                
                {/* Active Collaborations */}
                {collaborations.filter(c => c.status === "accepted").length > 0 && (
                  <Card>
                    <CardHeader><CardTitle className="font-serif text-base">Active Collaborations</CardTitle></CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {collaborations.filter(c => c.status === "accepted").map(collab => {
                          const collabClient = clients.find(c => c.id === collab.clientId);
                          return (
                            <div key={collab.id} className="p-2 bg-slate-50 rounded-lg text-sm" data-testid={`collab-${collab.id}`}>
                              <p className="font-medium">{collabClient?.name || "Unknown"}</p>
                              <p className="text-muted-foreground text-xs">{collab.collaboratorEmail}</p>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Time Tracking Tab */}
          <TabsContent value="time">
            <div className="grid lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="font-serif">Time Tracking</CardTitle>
                  <div className="flex items-center gap-2">
                    {timerRunning ? (
                      <Button variant="destructive" onClick={handleStopTimer} data-testid="button-stop-timer"><Pause className="w-4 h-4 mr-2" />Stop Timer</Button>
                    ) : (
                      <Dialog>
                        <DialogTrigger asChild><Button data-testid="button-start-timer"><Play className="w-4 h-4 mr-2" />Start Timer</Button></DialogTrigger>
                        <DialogContent>
                          <DialogHeader><DialogTitle>Start Timer</DialogTitle><DialogDescription>Track time with client and billing rate</DialogDescription></DialogHeader>
                          <div className="space-y-4">
                            <div className="space-y-2"><Label>Description</Label><Input value={timerDescription} onChange={(e) => setTimerDescription(e.target.value)} placeholder="What are you working on?" data-testid="input-timer-description" /></div>
                            <div className="space-y-2">
                              <Label>Client (optional)</Label>
                              <Select value={selectedClientForTimer || ""} onValueChange={setSelectedClientForTimer}>
                                <SelectTrigger data-testid="select-timer-client"><SelectValue placeholder="Select client" /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="">No client</SelectItem>
                                  {clients.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label>Billing Rate (optional)</Label>
                              <Select value={selectedBillingRateForTimer || ""} onValueChange={setSelectedBillingRateForTimer}>
                                <SelectTrigger data-testid="select-timer-billing-rate"><SelectValue placeholder="Select billing rate" /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="">No billing rate</SelectItem>
                                  {billingRates.map(r => <SelectItem key={r.id} value={r.id}>{r.name} - ${Number(r.rate).toFixed(2)}/hr</SelectItem>)}
                                </SelectContent>
                              </Select>
                            </div>
                            <Button onClick={() => { handleStartTimer(); }} className="w-full" data-testid="button-confirm-timer"><Play className="w-4 h-4 mr-2" />Start</Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {timerRunning && timerStart && (
                    <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
                      <div>
                        <span className="font-medium text-green-700">Timer Running</span>
                        <p className="text-sm text-green-600">{timerDescription || "No description"}</p>
                        {selectedClientForTimer && <p className="text-xs text-green-500">Client: {clients.find(c => c.id === selectedClientForTimer)?.name}</p>}
                        {selectedBillingRateForTimer && <p className="text-xs text-green-500">Rate: {billingRates.find(r => r.id === selectedBillingRateForTimer)?.name}</p>}
                      </div>
                      <span className="font-mono text-2xl text-green-700">{Math.floor((new Date().getTime() - timerStart.getTime()) / 60000)}m</span>
                    </div>
                  )}
                  <ScrollArea className="h-[350px]">
                    <div className="space-y-3">
                      {timeEntries.length === 0 ? <p className="text-center text-muted-foreground py-8">No time entries yet. Start tracking your time.</p> : timeEntries.map((entry) => {
                        const entryClient = clients.find(c => c.id === entry.clientId);
                        return (
                          <div key={entry.id} className="p-4 rounded-lg border border-slate-200" data-testid={`time-entry-${entry.id}`}>
                            <div className="flex items-center justify-between mb-2"><span className="font-medium">{entry.description}</span><Badge variant={entry.billable ? "default" : "secondary"}>{entry.billable ? "Billable" : "Non-billable"}</Badge></div>
                            <div className="flex items-center justify-between text-sm text-muted-foreground mb-1">
                              <span>{new Date(entry.startTime).toLocaleDateString()}</span>
                              <span className="font-mono">{entry.durationMinutes ? `${Math.floor(entry.durationMinutes / 60)}h ${entry.durationMinutes % 60}m` : "In progress"}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              {entryClient && <span className="bg-slate-100 px-2 py-0.5 rounded" data-testid={`time-entry-client-${entry.id}`}><Building2 className="w-3 h-3 inline mr-1" />{entryClient.name}</span>}
                              {entry.hourlyRate && <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded" data-testid={`time-entry-rate-${entry.id}`}><DollarSign className="w-3 h-3 inline" />{Number(entry.hourlyRate).toFixed(2)}/hr</span>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
              
              <div className="space-y-6">
                <Card>
                  <CardHeader><CardTitle className="font-serif">Summary</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"><span>Total Hours</span><span className="font-bold text-xl">{totalHours.toFixed(1)}</span></div>
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"><span>Billable</span><span className="font-bold text-xl text-green-600">{(timeEntries.filter(e => e.billable).reduce((a, e) => a + (e.durationMinutes || 0), 0) / 60).toFixed(1)}</span></div>
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"><span>This Week</span><span className="font-bold text-xl">{timeEntries.filter(e => new Date(e.startTime) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).reduce((a, e) => a + (e.durationMinutes || 0), 0) / 60}h</span></div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="font-serif text-base">Billing Rates</CardTitle>
                    <Dialog open={billingRateDialogOpen} onOpenChange={setBillingRateDialogOpen}>
                      <DialogTrigger asChild><Button size="sm" variant="outline" data-testid="button-add-billing-rate"><Plus className="w-4 h-4 mr-1" />Add</Button></DialogTrigger>
                      <DialogContent>
                        <DialogHeader><DialogTitle>Create Billing Rate</DialogTitle><DialogDescription>Define a reusable billing rate for time tracking</DialogDescription></DialogHeader>
                        <form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); createBillingRateMutation.mutate({ name: fd.get("name") as string, rate: fd.get("rate") as string, laborCategory: fd.get("laborCategory") as string, rateType: fd.get("rateType") as string }); }} className="space-y-4">
                          <div className="space-y-2"><Label>Name</Label><Input name="name" placeholder="e.g., Senior Consultant" required data-testid="input-billing-rate-name" /></div>
                          <div className="space-y-2"><Label>Hourly Rate ($)</Label><Input name="rate" type="number" step="0.01" placeholder="150.00" required data-testid="input-billing-rate-amount" /></div>
                          <div className="space-y-2"><Label>Labor Category</Label><Input name="laborCategory" placeholder="e.g., Professional Services" data-testid="input-billing-rate-category" /></div>
                          <div className="space-y-2">
                            <Label>Rate Type</Label>
                            <Select name="rateType" defaultValue="hourly">
                              <SelectTrigger data-testid="select-billing-rate-type"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="hourly">Hourly</SelectItem>
                                <SelectItem value="daily">Daily</SelectItem>
                                <SelectItem value="fixed">Fixed</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <Button type="submit" className="w-full" disabled={createBillingRateMutation.isPending} data-testid="button-submit-billing-rate">{createBillingRateMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}Create Rate</Button>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[120px]">
                      {billingRates.length === 0 ? <p className="text-sm text-muted-foreground text-center py-4">No billing rates defined</p> : (
                        <div className="space-y-2">
                          {billingRates.map(rate => (
                            <div key={rate.id} className="p-2 bg-slate-50 rounded flex items-center justify-between" data-testid={`billing-rate-${rate.id}`}>
                              <div>
                                <p className="text-sm font-medium">{rate.name}</p>
                                {rate.laborCategory && <p className="text-xs text-muted-foreground">{rate.laborCategory}</p>}
                              </div>
                              <Badge variant="secondary">${Number(rate.rate).toFixed(2)}/{rate.rateType === "daily" ? "day" : "hr"}</Badge>
                            </div>
                          ))}
                        </div>
                      )}
                    </ScrollArea>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="font-serif text-base">Task Codes</CardTitle>
                    <Dialog open={taskCodeDialogOpen} onOpenChange={setTaskCodeDialogOpen}>
                      <DialogTrigger asChild><Button size="sm" variant="outline" data-testid="button-add-task-code"><Plus className="w-4 h-4 mr-1" />Add</Button></DialogTrigger>
                      <DialogContent>
                        <DialogHeader><DialogTitle>Create Task Code</DialogTitle><DialogDescription>Define task codes for categorizing time entries</DialogDescription></DialogHeader>
                        <form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); createTaskCodeMutation.mutate({ code: fd.get("code") as string, name: fd.get("name") as string, category: fd.get("category") as string, isBillable: fd.get("isBillable") === "on" }); }} className="space-y-4">
                          <div className="space-y-2"><Label>Code</Label><Input name="code" placeholder="e.g., BD-001" required data-testid="input-task-code" /></div>
                          <div className="space-y-2"><Label>Name</Label><Input name="name" placeholder="e.g., Proposal Writing" required data-testid="input-task-code-name" /></div>
                          <div className="space-y-2">
                            <Label>Category</Label>
                            <Select name="category" defaultValue="delivery">
                              <SelectTrigger data-testid="select-task-code-category"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                {TASK_CATEGORIES.map(cat => <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>)}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex items-center gap-2">
                            <Checkbox id="isBillable" name="isBillable" defaultChecked data-testid="checkbox-task-billable" />
                            <Label htmlFor="isBillable" className="cursor-pointer">Billable</Label>
                          </div>
                          <Button type="submit" className="w-full" disabled={createTaskCodeMutation.isPending} data-testid="button-submit-task-code">{createTaskCodeMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}Create Task Code</Button>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[120px]">
                      {taskCodes.length === 0 ? <p className="text-sm text-muted-foreground text-center py-4">No task codes defined</p> : (
                        <div className="space-y-2">
                          {taskCodes.map(tc => (
                            <div key={tc.id} className="p-2 bg-slate-50 rounded flex items-center justify-between" data-testid={`task-code-${tc.id}`}>
                              <div>
                                <p className="text-sm font-medium">{tc.code}</p>
                                <p className="text-xs text-muted-foreground">{tc.name}</p>
                              </div>
                              <Badge variant={tc.isBillable ? "default" : "secondary"}>{tc.isBillable ? "Billable" : "Non-billable"}</Badge>
                            </div>
                          ))}
                        </div>
                      )}
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Actions Tab */}
          <TabsContent value="actions">
            <div className="grid lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="font-serif">Action Waterfall</CardTitle>
                  <div className="flex items-center gap-2">
                    {jiraSettings?.hasApiToken && (
                      <Button variant="outline" size="sm" onClick={() => pullFromJiraMutation.mutate(jiraSettings?.defaultProjectKey)} disabled={pullFromJiraMutation.isPending} data-testid="button-jira-pull">
                        {pullFromJiraMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                        Sync from Jira
                      </Button>
                    )}
                    <Dialog>
                      <DialogTrigger asChild><Button data-testid="button-add-action"><Plus className="w-4 h-4 mr-2" />Add Action</Button></DialogTrigger>
                      <DialogContent>
                        <DialogHeader><DialogTitle>New Action</DialogTitle></DialogHeader>
                        <form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); actionMutation.mutate({ title: fd.get("title") as string, description: fd.get("description") as string, startDate: new Date(fd.get("startDate") as string), dueDate: new Date(fd.get("dueDate") as string), priority: fd.get("priority") as string }); }} className="space-y-4">
                          <div className="space-y-2"><Label>Title</Label><Input name="title" required data-testid="input-action-title" /></div>
                          <div className="space-y-2"><Label>Description</Label><Textarea name="description" data-testid="textarea-action-description" /></div>
                          <div className="grid grid-cols-2 gap-4"><div className="space-y-2"><Label>Start Date</Label><Input name="startDate" type="date" required data-testid="input-action-start" /></div><div className="space-y-2"><Label>Due Date</Label><Input name="dueDate" type="date" required data-testid="input-action-due" /></div></div>
                          <div className="space-y-2"><Label>Priority</Label><Select name="priority" defaultValue="medium"><SelectTrigger data-testid="select-action-priority"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="low">Low</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="high">High</SelectItem><SelectItem value="urgent">Urgent</SelectItem></SelectContent></Select></div>
                          <Button type="submit" className="w-full" disabled={actionMutation.isPending} data-testid="button-submit-action">Create Action</Button>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[450px]">
                    <div className="space-y-3">
                      {actions.length === 0 ? <p className="text-center text-muted-foreground py-8">No actions scheduled. Create your first action item.</p> : actions.map((action) => {
                        const isOverdue = new Date(action.dueDate) < new Date() && action.status !== "completed";
                        return (
                          <div key={action.id} className={`p-4 rounded-lg border ${isOverdue ? "border-red-200 bg-red-50" : "border-slate-200"}`} data-testid={`action-card-${action.id}`}>
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium">{action.title}</span>
                              <div className="flex items-center gap-2">
                                {action.jiraKey && (
                                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                    {action.jiraKey}
                                  </Badge>
                                )}
                                <Badge variant={action.priority === "urgent" ? "destructive" : action.priority === "high" ? "default" : "secondary"}>{action.priority}</Badge>
                                <Badge variant={action.status === "completed" ? "default" : "outline"}>{action.status}</Badge>
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{action.description}</p>
                            <div className="flex items-center justify-between text-sm">
                              <span>Start: {new Date(action.startDate).toLocaleDateString()}</span>
                              <span className={isOverdue ? "text-red-600 font-medium" : ""}>Due: {new Date(action.dueDate).toLocaleDateString()}</span>
                            </div>
                            {jiraSettings?.hasApiToken && (
                              <div className="mt-3 pt-3 border-t flex items-center gap-2">
                                {action.jiraKey ? (
                                  <>
                                    <Button size="sm" variant="ghost" onClick={() => syncActionMutation.mutate(action.id)} disabled={syncActionMutation.isPending}>
                                      <RefreshCw className="w-3 h-3 mr-1" />Sync
                                    </Button>
                                    {action.jiraStatus && <span className="text-xs text-muted-foreground">Jira: {action.jiraStatus}</span>}
                                  </>
                                ) : (
                                  <Button size="sm" variant="outline" onClick={() => pushToJiraMutation.mutate({ actionId: action.id })} disabled={pushToJiraMutation.isPending} data-testid={`button-push-jira-${action.id}`}>
                                    {pushToJiraMutation.isPending ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : null}
                                    Push to Jira
                                  </Button>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Jira Integration Panel */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-serif text-lg flex items-center gap-2">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M11.53 2c0 2.4 1.97 4.35 4.35 4.35h1.78v1.7c0 2.4 1.94 4.34 4.34 4.35V2.84A.84.84 0 0 0 21.16 2H11.53zm-2.77 5.19c0 2.4 1.94 4.35 4.34 4.36h1.78v1.7c0 2.4 1.94 4.35 4.35 4.35V8.04a.84.84 0 0 0-.84-.85H8.76zm-2.77 5.19c0 2.4 1.94 4.35 4.35 4.35h1.7v1.78c0 2.4 1.95 4.34 4.35 4.35v-9.63a.84.84 0 0 0-.84-.85H5.99z"/></svg>
                    Jira Integration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {jiraSettings?.hasApiToken ? (
                    <>
                      <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-center gap-2 text-green-700">
                          <CheckCircle2 className="w-4 h-4" />
                          <span className="font-medium">Connected</span>
                        </div>
                        <p className="text-sm text-green-600 mt-1">{jiraSettings.jiraDomain}</p>
                      </div>
                      
                      {jiraSettings.defaultProjectKey && (
                        <div className="p-3 bg-slate-50 rounded-lg">
                          <p className="text-sm text-muted-foreground">Default Project</p>
                          <p className="font-medium">{jiraSettings.defaultProjectKey}</p>
                        </div>
                      )}

                      <div className="space-y-2">
                        <Button variant="outline" className="w-full" onClick={() => testJiraConnectionMutation.mutate()} disabled={testJiraConnectionMutation.isPending} data-testid="button-test-jira">
                          {testJiraConnectionMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                          Test Connection
                        </Button>
                        <Button variant="ghost" className="w-full" onClick={() => {
                          setJiraDomain(jiraSettings?.jiraDomain || "");
                          setJiraEmail(jiraSettings?.jiraEmail || "");
                          setJiraDefaultProject(jiraSettings?.defaultProjectKey || "");
                          setJiraSettingsOpen(true);
                        }}>
                          Update Settings
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="text-sm text-muted-foreground">
                        Connect to Jira to sync your actions with Jira issues. You can push actions to Jira or import issues as actions.
                      </p>
                      <Button className="w-full" onClick={() => setJiraSettingsOpen(true)} data-testid="button-connect-jira">
                        Connect to Jira
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Jira Settings Dialog */}
            <Dialog open={jiraSettingsOpen} onOpenChange={setJiraSettingsOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Jira Settings</DialogTitle>
                  <DialogDescription>Enter your Jira Cloud credentials to enable two-way sync.</DialogDescription>
                </DialogHeader>
                <form onSubmit={(e) => { e.preventDefault(); saveJiraSettingsMutation.mutate({ jiraDomain, jiraEmail, jiraApiToken, defaultProjectKey: jiraDefaultProject }); }} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="jiraDomain">Jira Domain</Label>
                    <Input id="jiraDomain" placeholder="yourcompany.atlassian.net" value={jiraDomain} onChange={(e) => setJiraDomain(e.target.value)} required data-testid="input-jira-domain" />
                    <p className="text-xs text-muted-foreground">Your Atlassian domain (without https://)</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="jiraEmail">Email</Label>
                    <Input id="jiraEmail" type="email" placeholder="you@example.com" value={jiraEmail} onChange={(e) => setJiraEmail(e.target.value)} required data-testid="input-jira-email" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="jiraApiToken">API Token</Label>
                    <Input id="jiraApiToken" type="password" placeholder="Your Jira API token" value={jiraApiToken} onChange={(e) => setJiraApiToken(e.target.value)} required data-testid="input-jira-token" />
                    <p className="text-xs text-muted-foreground">
                      <a href="https://id.atlassian.com/manage-profile/security/api-tokens" target="_blank" rel="noopener noreferrer" className="text-primary underline">Create an API token</a> in your Atlassian account settings
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="jiraProject">Default Project Key (optional)</Label>
                    <Input id="jiraProject" placeholder="PROJ" value={jiraDefaultProject} onChange={(e) => setJiraDefaultProject(e.target.value)} data-testid="input-jira-project" />
                  </div>
                  <Button type="submit" className="w-full" disabled={saveJiraSettingsMutation.isPending} data-testid="button-save-jira">
                    {saveJiraSettingsMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                    Save & Connect
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </TabsContent>

          {/* Billing Tab */}
          <TabsContent value="billing">
            <div className="grid lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="font-serif">Invoices</CardTitle>
                  <Dialog open={generateInvoiceDialogOpen} onOpenChange={setGenerateInvoiceDialogOpen}>
                    <DialogTrigger asChild><Button data-testid="button-generate-invoice"><DollarSign className="w-4 h-4 mr-2" />Generate Invoice</Button></DialogTrigger>
                    <DialogContent>
                      <DialogHeader><DialogTitle>Generate Invoice</DialogTitle><DialogDescription>Create an invoice from unbilled time entries for a client</DialogDescription></DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Select Client</Label>
                          <Select value={selectedClientForInvoice || ""} onValueChange={setSelectedClientForInvoice}>
                            <SelectTrigger data-testid="select-invoice-client"><SelectValue placeholder="Select a client" /></SelectTrigger>
                            <SelectContent>
                              {clients.map(c => {
                                const unbilledHours = (timeEntries.filter(e => e.clientId === c.id && e.billable && !e.invoiced).reduce((a, e) => a + (e.durationMinutes || 0), 0) / 60);
                                return <SelectItem key={c.id} value={c.id}>{c.name} ({unbilledHours.toFixed(1)} unbilled hours)</SelectItem>;
                              })}
                            </SelectContent>
                          </Select>
                        </div>
                        {selectedClientForInvoice && (
                          <div className="p-3 bg-slate-50 rounded-lg">
                            <p className="text-sm text-muted-foreground">Unbilled entries: {timeEntries.filter(e => e.clientId === selectedClientForInvoice && e.billable && !e.invoiced).length}</p>
                            <p className="text-sm text-muted-foreground">Total hours: {(timeEntries.filter(e => e.clientId === selectedClientForInvoice && e.billable && !e.invoiced).reduce((a, e) => a + (e.durationMinutes || 0), 0) / 60).toFixed(1)}</p>
                          </div>
                        )}
                        <Button onClick={() => { if (selectedClientForInvoice) generateInvoiceMutation.mutate({ clientId: selectedClientForInvoice }); }} className="w-full" disabled={!selectedClientForInvoice || generateInvoiceMutation.isPending} data-testid="button-confirm-generate-invoice">
                          {generateInvoiceMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}Generate Invoice
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[300px]">
                    <div className="space-y-3">
                      {invoices.length === 0 ? <p className="text-center text-muted-foreground py-8">No invoices yet. Generate your first invoice.</p> : invoices.map((invoice) => {
                        const invoiceClient = clients.find(c => c.id === invoice.clientId);
                        return (
                          <div key={invoice.id} className="p-4 rounded-lg border border-slate-200" data-testid={`invoice-card-${invoice.id}`}>
                            <div className="flex items-center justify-between mb-2"><span className="font-medium">{invoice.invoiceNumber}</span><Badge variant={invoice.status === "paid" ? "default" : invoice.status === "overdue" ? "destructive" : "secondary"}>{invoice.status}</Badge></div>
                            <div className="flex items-center justify-between text-sm text-muted-foreground"><span>Issued: {invoice.issueDate ? new Date(invoice.issueDate).toLocaleDateString() : "N/A"}</span><span className="font-bold text-lg">${Number(invoice.total || 0).toFixed(2)}</span></div>
                            {invoiceClient && <p className="text-xs text-muted-foreground mt-1"><Building2 className="w-3 h-3 inline mr-1" />{invoiceClient.name}</p>}
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
              
              <div className="space-y-6">
                <Card>
                  <CardHeader><CardTitle className="font-serif text-base">Billing Summary</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"><span>Unbilled Hours</span><span className="font-bold text-xl">{(timeEntries.filter(e => e.billable && !e.invoiced).reduce((a, e) => a + (e.durationMinutes || 0), 0) / 60).toFixed(1)}</span></div>
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg"><span>Paid</span><span className="font-bold text-xl text-green-600">${invoices.filter(i => i.status === "paid").reduce((a, i) => a + Number(i.total || 0), 0).toFixed(2)}</span></div>
                    <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg"><span>Outstanding</span><span className="font-bold text-xl text-yellow-600">${invoices.filter(i => i.status !== "paid").reduce((a, i) => a + Number(i.total || 0), 0).toFixed(2)}</span></div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="font-serif text-base">Contract Templates</CardTitle>
                    <Dialog open={contractTemplateDialogOpen} onOpenChange={setContractTemplateDialogOpen}>
                      <DialogTrigger asChild><Button size="sm" variant="outline" data-testid="button-add-contract-template"><Plus className="w-4 h-4 mr-1" />Add</Button></DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader><DialogTitle>Create Contract Template</DialogTitle><DialogDescription>Create a reusable template with placeholder variables like {"{{client_name}}"}</DialogDescription></DialogHeader>
                        <form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); createContractTemplateMutation.mutate({ name: fd.get("name") as string, templateType: fd.get("templateType") as string, description: fd.get("description") as string, content: fd.get("content") as string, variables: fd.get("variables") as string }); }} className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2"><Label>Template Name</Label><Input name="name" placeholder="e.g., Standard NDA" required data-testid="input-template-name" /></div>
                            <div className="space-y-2">
                              <Label>Contract Type</Label>
                              <Select name="templateType" defaultValue="nda">
                                <SelectTrigger data-testid="select-template-type"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  {CONTRACT_TYPES.map(ct => <SelectItem key={ct.value} value={ct.value}>{ct.label}</SelectItem>)}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div className="space-y-2"><Label>Description</Label><Input name="description" placeholder="Template description" data-testid="input-template-description" /></div>
                          <div className="space-y-2"><Label>Variables (comma-separated)</Label><Input name="variables" placeholder="client_name, effective_date, scope" data-testid="input-template-variables" /></div>
                          <div className="space-y-2"><Label>Template Content</Label><Textarea name="content" placeholder="Enter contract template with {{placeholders}}..." className="min-h-[150px]" required data-testid="textarea-template-content" /></div>
                          <Button type="submit" className="w-full" disabled={createContractTemplateMutation.isPending} data-testid="button-submit-contract-template">{createContractTemplateMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}Create Template</Button>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[120px]">
                      {contractTemplates.length === 0 ? <p className="text-sm text-muted-foreground text-center py-4">No templates created</p> : (
                        <div className="space-y-2">
                          {contractTemplates.map(template => (
                            <div key={template.id} className="p-2 bg-slate-50 rounded flex items-center justify-between" data-testid={`contract-template-${template.id}`}>
                              <div>
                                <p className="text-sm font-medium">{template.name}</p>
                                <p className="text-xs text-muted-foreground">{CONTRACT_TYPES.find(ct => ct.value === template.templateType)?.label}</p>
                              </div>
                              <Button size="sm" variant="ghost" onClick={() => { setSelectedTemplateForContract(template.id); setContractDialogOpen(true); }} data-testid={`button-use-template-${template.id}`}>Use</Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </ScrollArea>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="font-serif text-base">Contracts</CardTitle>
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost" onClick={() => setLegalSettingsOpen(true)} data-testid="button-legal-settings">
                        <FileCheck className="w-4 h-4 mr-1" />Legal Settings
                      </Button>
                      <Dialog open={contractDialogOpen} onOpenChange={(open) => { setContractDialogOpen(open); if (!open) setSelectedTemplateForContract(null); }}>
                        <DialogTrigger asChild><Button size="sm" variant="outline" data-testid="button-add-contract"><Plus className="w-4 h-4 mr-1" />Add</Button></DialogTrigger>
                      <DialogContent>
                        <DialogHeader><DialogTitle>{selectedTemplateForContract ? "Create Contract from Template" : "Create Contract"}</DialogTitle><DialogDescription>Create a new contract for a client</DialogDescription></DialogHeader>
                        <form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); if (selectedTemplateForContract) { createContractFromTemplateMutation.mutate({ templateId: selectedTemplateForContract, clientId: fd.get("clientId") as string }); } else { createContractMutation.mutate({ clientId: fd.get("clientId") as string, contractType: fd.get("contractType") as string, title: fd.get("title") as string, content: fd.get("content") as string, status: "draft" }); } }} className="space-y-4">
                          <div className="space-y-2">
                            <Label>Client</Label>
                            <Select name="clientId" required>
                              <SelectTrigger data-testid="select-contract-client"><SelectValue placeholder="Select client" /></SelectTrigger>
                              <SelectContent>
                                {clients.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                              </SelectContent>
                            </Select>
                          </div>
                          {selectedTemplateForContract ? (
                            <div className="p-3 bg-slate-50 rounded-lg">
                              <p className="text-sm font-medium">Using template: {contractTemplates.find(t => t.id === selectedTemplateForContract)?.name}</p>
                            </div>
                          ) : (
                            <>
                              <div className="space-y-2"><Label>Title</Label><Input name="title" placeholder="Contract title" required data-testid="input-contract-title" /></div>
                              <div className="space-y-2">
                                <Label>Contract Type</Label>
                                <Select name="contractType" defaultValue="nda">
                                  <SelectTrigger data-testid="select-contract-type"><SelectValue /></SelectTrigger>
                                  <SelectContent>
                                    {CONTRACT_TYPES.map(ct => <SelectItem key={ct.value} value={ct.value}>{ct.label}</SelectItem>)}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-2"><Label>Content (optional)</Label><Textarea name="content" placeholder="Contract content..." className="min-h-[100px]" data-testid="textarea-contract-content" /></div>
                            </>
                          )}
                          <Button type="submit" className="w-full" disabled={createContractMutation.isPending || createContractFromTemplateMutation.isPending} data-testid="button-submit-contract">
                            {(createContractMutation.isPending || createContractFromTemplateMutation.isPending) ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}Create Contract
                          </Button>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[150px]">
                      {contracts.length === 0 ? <p className="text-sm text-muted-foreground text-center py-4">No contracts created</p> : (
                        <div className="space-y-2">
                          {contracts.map(contract => {
                            const contractClient = clients.find(c => c.id === contract.clientId);
                            return (
                              <div key={contract.id} className="p-2 bg-slate-50 rounded flex items-center justify-between" data-testid={`contract-${contract.id}`}>
                                <div className="flex-1">
                                  <p className="text-sm font-medium">{contract.title}</p>
                                  <p className="text-xs text-muted-foreground">{contractClient?.name} • {CONTRACT_TYPES.find(ct => ct.value === contract.contractType)?.label}</p>
                                  {contract.externalService && (
                                    <p className="text-xs text-blue-600 mt-1">Via {contract.externalService === "docusign" ? "DocuSign" : contract.externalService === "pandadoc" ? "PandaDoc" : contract.externalService}</p>
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge variant={contract.status === "signed" ? "default" : contract.status === "pending_signature" ? "secondary" : "outline"} data-testid={`contract-status-${contract.id}`}>
                                    {contract.status === "draft" ? "Draft" : contract.status === "pending_signature" ? "Pending" : contract.status === "signed" ? "Signed" : contract.status}
                                  </Badge>
                                  {contract.status === "draft" && (
                                    <Button size="sm" variant="ghost" onClick={() => { setSelectedContractForSigning(contract.id); setSignContractDialogOpen(true); }} data-testid={`button-send-contract-${contract.id}`}>
                                      <FileCheck className="w-3 h-3" />
                                    </Button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Legal Settings Dialog */}
            <Dialog open={legalSettingsOpen} onOpenChange={setLegalSettingsOpen}>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Legal Services Integration</DialogTitle>
                  <DialogDescription>Configure DocuSign or PandaDoc for contract signing</DialogDescription>
                </DialogHeader>
                <form onSubmit={(e) => { 
                  e.preventDefault(); 
                  const fd = new FormData(e.currentTarget);
                  saveLegalSettingsMutation.mutate({
                    preferredService: fd.get("preferredService") as string,
                    docusignAccountId: fd.get("docusignAccountId") as string,
                    docusignAccessToken: fd.get("docusignAccessToken") as string,
                    docusignEnvironment: fd.get("docusignEnvironment") as string || "demo",
                    pandadocApiKey: fd.get("pandadocApiKey") as string,
                    defaultReviewerEmail: fd.get("defaultReviewerEmail") as string,
                    requireLegalReview: fd.get("requireLegalReview") === "on"
                  });
                }} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Preferred Service</Label>
                    <Select name="preferredService" defaultValue={legalSettings?.preferredService || "docusign"}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="docusign">DocuSign</SelectItem>
                        <SelectItem value="pandadoc">PandaDoc</SelectItem>
                        <SelectItem value="hellosign">HelloSign</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-4 p-4 border rounded-lg">
                    <h4 className="font-medium">DocuSign Settings</h4>
                    <div className="space-y-2">
                      <Label>Account ID</Label>
                      <Input name="docusignAccountId" placeholder="DocuSign Account ID" defaultValue={legalSettings?.docusignAccountId || ""} />
                    </div>
                    <div className="space-y-2">
                      <Label>Access Token</Label>
                      <Input name="docusignAccessToken" type="password" placeholder="DocuSign Access Token" defaultValue={legalSettings?.hasDocusignToken ? "••••••••" : ""} />
                    </div>
                    <div className="space-y-2">
                      <Label>Environment</Label>
                      <Select name="docusignEnvironment" defaultValue={legalSettings?.docusignEnvironment || "demo"}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="demo">Demo/Sandbox</SelectItem>
                          <SelectItem value="production">Production</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-4 p-4 border rounded-lg">
                    <h4 className="font-medium">PandaDoc Settings</h4>
                    <div className="space-y-2">
                      <Label>API Key</Label>
                      <Input name="pandadocApiKey" type="password" placeholder="PandaDoc API Key" defaultValue={legalSettings?.hasPandadocKey ? "••••••••" : ""} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Default Legal Reviewer Email</Label>
                    <Input name="defaultReviewerEmail" type="email" placeholder="reviewer@example.com" defaultValue={legalSettings?.defaultReviewerEmail || ""} />
                  </div>

                  <div className="flex items-center gap-2">
                    <Checkbox id="requireLegalReview" name="requireLegalReview" defaultChecked={legalSettings?.requireLegalReview !== false} />
                    <Label htmlFor="requireLegalReview" className="cursor-pointer">Require legal review before sending</Label>
                  </div>

                  <Button type="submit" className="w-full" disabled={saveLegalSettingsMutation.isPending}>
                    {saveLegalSettingsMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                    Save Settings
                  </Button>
                </form>
              </DialogContent>
            </Dialog>

            {/* Send Contract for Signature Dialog */}
            <Dialog open={signContractDialogOpen} onOpenChange={setSignContractDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Send Contract for Signature</DialogTitle>
                  <DialogDescription>Configure signatories and send via your legal service</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  {!legalSettings?.hasDocusignToken && !legalSettings?.hasPandadocKey && (
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800">No legal service configured. Configure DocuSign or PandaDoc in Legal Settings first.</p>
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <Label>Signatories</Label>
                    {signatories.map((sig, idx) => (
                      <div key={idx} className="flex gap-2">
                        <Input placeholder="Name" value={sig.name} onChange={(e) => {
                          const newSigs = [...signatories];
                          newSigs[idx].name = e.target.value;
                          setSignatories(newSigs);
                        }} />
                        <Input placeholder="Email" type="email" value={sig.email} onChange={(e) => {
                          const newSigs = [...signatories];
                          newSigs[idx].email = e.target.value;
                          setSignatories(newSigs);
                        }} />
                        <Select value={sig.role} onValueChange={(value) => {
                          const newSigs = [...signatories];
                          newSigs[idx].role = value;
                          setSignatories(newSigs);
                        }}>
                          <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="signer">Signer</SelectItem>
                            <SelectItem value="cc">CC</SelectItem>
                            <SelectItem value="reviewer">Reviewer</SelectItem>
                          </SelectContent>
                        </Select>
                        {signatories.length > 1 && (
                          <Button type="button" variant="ghost" size="sm" onClick={() => setSignatories(signatories.filter((_, i) => i !== idx))}>
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button type="button" variant="outline" size="sm" onClick={() => setSignatories([...signatories, {name: "", email: "", role: "signer"}])}>
                      <Plus className="w-4 h-4 mr-1" />Add Signatory
                    </Button>
                  </div>

                  <Button 
                    onClick={() => {
                      if (selectedContractForSigning) {
                        sendContractForSignatureMutation.mutate({ contractId: selectedContractForSigning, signatories });
                      }
                    }} 
                    className="w-full" 
                    disabled={!selectedContractForSigning || sendContractForSignatureMutation.isPending || signatories.some(s => !s.name || !s.email)}
                  >
                    {sendContractForSignatureMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                    Send for Signature
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </TabsContent>

          {/* Debrief Tab */}
          <TabsContent value="debrief">
            <Card>
              <CardHeader><CardTitle className="font-serif">Debrief Templates & Records</CardTitle><CardDescription>Post-engagement tracking and outtake interview templates</CardDescription></CardHeader>
              <CardContent>
                <div className="grid lg:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium mb-3">Templates</h3>
                    <div className="space-y-3">
                      {debriefTemplates.length === 0 ? <p className="text-center text-muted-foreground py-4">No templates created yet.</p> : debriefTemplates.map((template) => (
                        <div key={template.id} className="p-3 rounded-lg border border-slate-200" data-testid={`template-${template.id}`}><span className="font-medium">{template.name}</span><p className="text-sm text-muted-foreground">{template.description}</p></div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium mb-3">Default Questions</h3>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <p>1. What were the key outcomes of this engagement?</p>
                      <p>2. What challenges were encountered and how were they addressed?</p>
                      <p>3. What recommendations would you make for future engagements?</p>
                      <p>4. Were there any compliance concerns raised?</p>
                      <p>5. What knowledge should be transferred for continuation?</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Messages Tab */}
          <TabsContent value="messages">
            <div className="space-y-4">
              {/* Slack Integration Panel */}
              <Card className="border-purple-200 bg-purple-50/30">
                <CardHeader className="py-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-purple-600" />
                      <span className="font-medium">Slack Integration</span>
                      {slackSettings?.webhookUrl ? (
                        <Badge variant="outline" className="border-green-500 text-green-700">Connected</Badge>
                      ) : (
                        <Badge variant="outline" className="border-slate-400 text-slate-600">Not Connected</Badge>
                      )}
                    </div>
                    <Button variant="outline" size="sm" onClick={() => {
                      setSlackWebhookUrl(slackSettings?.webhookUrl || "");
                      setSlackChannelName(slackSettings?.defaultChannelName || "");
                      setSlackWorkspaceName(slackSettings?.workspaceName || "");
                      setSlackSettingsOpen(true);
                    }} data-testid="button-slack-settings">
                      {slackSettings?.webhookUrl ? "Update Settings" : "Connect Slack"}
                    </Button>
                  </div>
                </CardHeader>
                {slackSettings?.webhookUrl && (
                  <CardContent className="pt-0">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Workspace: {slackSettings.workspaceName || "Connected"}</span>
                      {slackSettings.defaultChannelName && <span>Channel: #{slackSettings.defaultChannelName}</span>}
                      <Button variant="ghost" size="sm" onClick={() => testSlackConnectionMutation.mutate()} disabled={testSlackConnectionMutation.isPending} data-testid="button-test-slack">
                        {testSlackConnectionMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Test Connection"}
                      </Button>
                    </div>
                  </CardContent>
                )}
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="font-serif">Async Communication</CardTitle>
                  <Dialog>
                    <DialogTrigger asChild><Button data-testid="button-new-message"><Plus className="w-4 h-4 mr-2" />New Message</Button></DialogTrigger>
                    <DialogContent>
                      <DialogHeader><DialogTitle>Send Message</DialogTitle></DialogHeader>
                      <form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); messageMutation.mutate({ subject: fd.get("subject") as string, content: fd.get("content") as string }); logActivity("create", "message", undefined, fd.get("subject") as string, "Sent a message"); }} className="space-y-4">
                        <div className="space-y-2"><Label>Subject</Label><Input name="subject" data-testid="input-message-subject" /></div>
                        <div className="space-y-2"><Label>Message</Label><Textarea name="content" required placeholder="Type your message..." data-testid="textarea-message-content" /></div>
                        <Button type="submit" className="w-full" disabled={messageMutation.isPending} data-testid="button-send-message">Send Message</Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-3">
                      {messages.length === 0 ? <p className="text-center text-muted-foreground py-8">No messages yet.</p> : messages.map((message: any) => (
                        <div key={message.id} className={`p-4 rounded-lg border ${message.readAt ? "border-slate-200" : "border-primary bg-primary/5"}`} data-testid={`message-${message.id}`}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">{message.subject || "No Subject"}</span>
                            <div className="flex items-center gap-2">
                              {/* Delivery Status Badge */}
                              {message.deliveryStatus && (
                                <Badge variant="outline" className={
                                  message.deliveryStatus === "read" ? "border-green-500 text-green-700" :
                                  message.deliveryStatus === "delivered" ? "border-blue-500 text-blue-700" :
                                  message.deliveryStatus === "failed" ? "border-red-500 text-red-700" :
                                  "border-slate-400 text-slate-600"
                                }>
                                  {message.deliveryStatus === "read" ? "Read" : message.deliveryStatus === "delivered" ? "Delivered" : message.deliveryStatus === "failed" ? "Failed" : "Sent"}
                                </Badge>
                              )}
                              {/* Slack Badge */}
                              {message.slackSyncedAt && (
                                <Badge variant="outline" className="border-purple-500 text-purple-700">Slack</Badge>
                              )}
                              {!message.readAt && <Badge>New</Badge>}
                              {/* Send to Slack Button */}
                              {slackSettings?.webhookUrl && !message.slackSyncedAt && (
                                <Button variant="ghost" size="sm" onClick={() => sendToSlackMutation.mutate(message.id)} disabled={sendToSlackMutation.isPending} data-testid={`button-send-slack-${message.id}`}>
                                  <MessageSquare className="w-4 h-4 text-purple-600" />
                                </Button>
                              )}
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{message.content}</p>
                          <span className="text-xs text-muted-foreground">{new Date(message.createdAt!).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Form Filling Dialog */}
        <Dialog open={formDialogOpen} onOpenChange={setFormDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-serif flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-[#bfa15f]" />
                {selectedFormTemplate?.title}
              </DialogTitle>
              <DialogDescription>{selectedFormTemplate?.description}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {selectedFormTemplate && (() => {
                try {
                  const schema = JSON.parse(selectedFormTemplate.formSchema);
                  if (!schema.fields || schema.fields.length === 0) {
                    return <p className="text-muted-foreground text-center py-4">This form has no fields configured.</p>;
                  }
                  return schema.fields.map((field: any) => renderFormField(field));
                } catch {
                  return (
                    <div className="text-center py-4 space-y-2">
                      <p className="text-red-500 font-medium">Unable to load form fields</p>
                      <p className="text-sm text-muted-foreground">The form template may be corrupted. Please contact an administrator.</p>
                    </div>
                  );
                }
              })()}
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setFormDialogOpen(false)} data-testid="button-cancel-form">Cancel</Button>
              <Button onClick={handleSubmitForm} disabled={formSubmissionMutation.isPending} className="bg-[#bfa15f] hover:bg-[#a88d4f]" data-testid="button-submit-form">
                {formSubmissionMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Submit Form
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Slack Settings Dialog */}
        <Dialog open={slackSettingsOpen} onOpenChange={setSlackSettingsOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-purple-600" />
                Slack Integration Settings
              </DialogTitle>
              <DialogDescription>Connect your Slack workspace to send messages directly to a channel.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Workspace Name</Label>
                <Input value={slackWorkspaceName} onChange={(e) => setSlackWorkspaceName(e.target.value)} placeholder="e.g., My Company" data-testid="input-slack-workspace" />
              </div>
              <div className="space-y-2">
                <Label>Webhook URL</Label>
                <Input value={slackWebhookUrl} onChange={(e) => setSlackWebhookUrl(e.target.value)} placeholder="https://hooks.slack.com/services/..." data-testid="input-slack-webhook" />
                <p className="text-xs text-muted-foreground">Create an incoming webhook at <a href="https://api.slack.com/messaging/webhooks" target="_blank" rel="noopener" className="text-purple-600 hover:underline">api.slack.com</a></p>
              </div>
              <div className="space-y-2">
                <Label>Default Channel Name</Label>
                <Input value={slackChannelName} onChange={(e) => setSlackChannelName(e.target.value)} placeholder="e.g., general" data-testid="input-slack-channel" />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setSlackSettingsOpen(false)}>Cancel</Button>
              <Button onClick={() => saveSlackSettingsMutation.mutate({ webhookUrl: slackWebhookUrl, defaultChannelName: slackChannelName, workspaceName: slackWorkspaceName })} disabled={saveSlackSettingsMutation.isPending} data-testid="button-save-slack">
                {saveSlackSettingsMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Save Settings
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Logout Session Summary Dialog */}
        <Dialog open={logoutSummaryOpen} onOpenChange={setLogoutSummaryOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="font-serif">Session Summary</DialogTitle>
              <DialogDescription>Here's what you accomplished during this session.</DialogDescription>
            </DialogHeader>
            <div className="py-4">
              {sessionSummary && (
                <div className="space-y-4">
                  <div className="text-center p-4 bg-primary/5 rounded-lg">
                    <p className="text-3xl font-bold text-primary">{sessionSummary.activityCount}</p>
                    <p className="text-sm text-muted-foreground">Total Activities</p>
                  </div>
                  {Object.keys(sessionSummary.summary).length > 0 && (
                    <div className="space-y-2">
                      <p className="font-medium text-sm">Activity Breakdown:</p>
                      <div className="grid grid-cols-2 gap-2">
                        {Object.entries(sessionSummary.summary).map(([key, count]) => {
                          const [type, entity] = key.split("_");
                          return (
                            <div key={key} className="flex items-center justify-between p-2 bg-slate-50 rounded text-sm">
                              <span className="capitalize">{entity || type}</span>
                              <Badge variant="secondary">{count}</Badge>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  {sessionSummary.activities.length > 0 && (
                    <div className="space-y-2">
                      <p className="font-medium text-sm">Recent Activities:</p>
                      <ScrollArea className="h-32">
                        <div className="space-y-1">
                          {sessionSummary.activities.slice(0, 5).map((activity: any) => (
                            <div key={activity.id} className="text-xs text-muted-foreground p-2 bg-slate-50 rounded">
                              <span className="capitalize font-medium">{activity.activityType}</span>
                              {activity.entityType && <span className="mx-1">•</span>}
                              {activity.entityName || activity.entityType}
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                  )}
                </div>
              )}
              {(!sessionSummary || sessionSummary.activityCount === 0) && (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No tracked activities this session.</p>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setLogoutSummaryOpen(false)}>Stay Logged In</Button>
              <Button onClick={confirmLogout} data-testid="button-confirm-logout">Logout</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
