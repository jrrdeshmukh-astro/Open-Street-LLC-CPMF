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
  Clock, Calendar, DollarSign, MessageSquare, ClipboardList, Plus, Play, Pause, Building2, BookOpen, FileCheck, ChevronRight, Globe, ExternalLink, Download
} from "lucide-react";
import { Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";
import type { WorkflowProgress, Artifact, Client, TimeEntry, Action, Invoice, DebriefTemplate, Message, Guide, FormTemplate, FormSubmission, Opportunity, WorkflowInstance } from "@shared/schema";

interface SamOpportunityResult {
  externalId: string;
  title: string;
  solicitationNumber: string | null;
  agency: string | null;
  subAgency: string | null;
  office: string | null;
  noticeType: string | null;
  contractType: string | null;
  naicsCodes: string | null;
  pscCodes: string | null;
  setAsideType: string | null;
  responseDeadline: string | null;
  postedDate: string | null;
  archiveDate: string | null;
  placeOfPerformance: string | null;
  description: string | null;
  synopsis: string | null;
  contactInfo: string | null;
  attachmentLinks: string | null;
  rawJson: string;
}

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
  const { data: savedOpportunities = [] } = useQuery<Opportunity[]>({ queryKey: ["/api/opportunities"], enabled: !!user });
  const { data: workflowInstancesData = [] } = useQuery<WorkflowInstance[]>({ queryKey: ["/api/workflow-instances"], enabled: !!user });
  const { data: samRefData } = useQuery<{ noticeTypes: { value: string; label: string }[]; setAsideTypes: { value: string; label: string }[] }>({ queryKey: ["/api/sam/reference-data"], enabled: !!user });
  const [selectedGuide, setSelectedGuide] = useState<Guide | null>(null);
  const [resourceComponent, setResourceComponent] = useState(FRAMEWORK_COMPONENTS[0].id);
  const [resourceStage, setResourceStage] = useState("initiation");
  const [samKeyword, setSamKeyword] = useState("");
  const [samNoticeType, setSamNoticeType] = useState("");
  const [samSearching, setSamSearching] = useState(false);
  const [samResults, setSamResults] = useState<SamOpportunityResult[]>([]);
  const [samNeedsKey, setSamNeedsKey] = useState(false);

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
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/clients"] }); toast({ title: "Client created" }); },
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
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/actions"] }); toast({ title: "Action created" }); },
  });

  const messageMutation = useMutation({
    mutationFn: async (data: Partial<Message>) => {
      const res = await fetch("/api/messages", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data), credentials: "include" });
      if (!res.ok) throw new Error("Failed to send message");
      return res.json();
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/messages"] }); toast({ title: "Message sent" }); },
  });

  const opportunityMutation = useMutation({
    mutationFn: async (data: SamOpportunityResult) => {
      const res = await fetch("/api/opportunities", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data), credentials: "include" });
      if (!res.ok) throw new Error("Failed to save opportunity");
      return res.json();
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/opportunities"] }); toast({ title: "Opportunity saved" }); },
  });

  const workflowInstanceMutation = useMutation({
    mutationFn: async (data: { opportunityId: string; name: string; targetDate?: Date | null }) => {
      const res = await fetch("/api/workflow-instances", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data), credentials: "include" });
      if (!res.ok) throw new Error("Failed to create workflow");
      return res.json();
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/workflow-instances"] }); toast({ title: "Workflow created" }); },
  });

  const handleSamSearch = async () => {
    setSamSearching(true);
    setSamNeedsKey(false);
    try {
      const params = new URLSearchParams();
      if (samKeyword) params.set("keyword", samKeyword);
      if (samNoticeType) params.set("noticeType", samNoticeType);
      const res = await fetch(`/api/sam/search?${params.toString()}`, { credentials: "include" });
      const data = await res.json();
      if (!res.ok) {
        if (data.needsApiKey) {
          setSamNeedsKey(true);
        } else {
          toast({ title: "Search failed", description: data.message, variant: "destructive" });
        }
        setSamResults([]);
        return;
      }
      setSamResults(data.opportunities || []);
    } catch (error: any) {
      toast({ title: "Search failed", description: error.message, variant: "destructive" });
      setSamResults([]);
    } finally {
      setSamSearching(false);
    }
  };

  const handleImportOpportunity = async (opp: InsertOpportunity) => {
    const saved = await opportunityMutation.mutateAsync(opp);
    await workflowInstanceMutation.mutateAsync({
      opportunityId: saved.id,
      name: opp.title,
      targetDate: opp.responseDeadline,
    });
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
      timeEntryMutation.mutate({ description: timerDescription || "Timer entry", startTime: timerStart, endTime: new Date(), durationMinutes });
    }
    setTimerRunning(false); setTimerStart(null); setTimerDescription("");
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
            <button onClick={() => logout()} className="text-sm text-slate-300 hover:text-white flex items-center gap-1" data-testid="button-logout"><LogOut className="w-4 h-4" /> Logout</button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        <Tabs defaultValue="workflow" className="w-full">
          <TabsList className="grid w-full grid-cols-9 mb-6">
            <TabsTrigger value="opportunities" className="flex items-center gap-2"><Globe className="w-4 h-4" /> SAM.gov</TabsTrigger>
            <TabsTrigger value="workflow" className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Workflow</TabsTrigger>
            <TabsTrigger value="resources" className="flex items-center gap-2"><BookOpen className="w-4 h-4" /> Resources</TabsTrigger>
            <TabsTrigger value="clients" className="flex items-center gap-2"><Building2 className="w-4 h-4" /> Clients</TabsTrigger>
            <TabsTrigger value="time" className="flex items-center gap-2"><Clock className="w-4 h-4" /> Time</TabsTrigger>
            <TabsTrigger value="actions" className="flex items-center gap-2"><Calendar className="w-4 h-4" /> Actions</TabsTrigger>
            <TabsTrigger value="billing" className="flex items-center gap-2"><DollarSign className="w-4 h-4" /> Billing</TabsTrigger>
            <TabsTrigger value="debrief" className="flex items-center gap-2"><ClipboardList className="w-4 h-4" /> Debrief</TabsTrigger>
            <TabsTrigger value="messages" className="flex items-center gap-2 relative"><MessageSquare className="w-4 h-4" /> Messages {unreadMessages > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">{unreadMessages}</span>}</TabsTrigger>
          </TabsList>

          {/* SAM.gov Opportunities Tab */}
          <TabsContent value="opportunities">
            <div className="grid lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="font-serif flex items-center gap-2"><Globe className="w-5 h-5" /> SAM.gov Opportunities</CardTitle>
                  <CardDescription>Search and import government contracting opportunities from SAM.gov</CardDescription>
                </CardHeader>
                <CardContent>
                  {samNeedsKey ? (
                    <div className="text-center py-8 space-y-4">
                      <Globe className="w-12 h-12 mx-auto text-muted-foreground opacity-50" />
                      <div>
                        <h3 className="font-medium">SAM.gov API Key Required</h3>
                        <p className="text-sm text-muted-foreground mt-1">To search SAM.gov, you need to configure a SAM.gov API key.</p>
                        <p className="text-sm text-muted-foreground">Get a free API key from your SAM.gov account settings.</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex gap-4 mb-6">
                        <div className="flex-1">
                          <Input 
                            placeholder="Search keywords (e.g., IT services, cybersecurity)..." 
                            value={samKeyword} 
                            onChange={(e) => setSamKeyword(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSamSearch()}
                            data-testid="input-sam-keyword"
                          />
                        </div>
                        <Select value={samNoticeType} onValueChange={setSamNoticeType}>
                          <SelectTrigger className="w-[180px]" data-testid="select-sam-notice-type">
                            <SelectValue placeholder="Notice type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">All Types</SelectItem>
                            {samRefData?.noticeTypes?.map(t => (
                              <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button onClick={handleSamSearch} disabled={samSearching} data-testid="button-sam-search">
                          {samSearching ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Search className="w-4 h-4 mr-2" />}
                          Search
                        </Button>
                      </div>
                      
                      <ScrollArea className="h-[500px]">
                        <div className="space-y-4">
                          {samResults.length === 0 && !samSearching && (
                            <div className="text-center py-12 text-muted-foreground">
                              <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                              <p>Search SAM.gov to find government contracting opportunities.</p>
                            </div>
                          )}
                          
                          {samResults.map((opp, idx) => {
                            const isImported = savedOpportunities.some(o => o.externalId === opp.externalId);
                            return (
                              <Card key={opp.externalId || idx} className={isImported ? "border-green-200 bg-green-50/50" : ""} data-testid={`opp-card-${opp.externalId}`}>
                                <CardHeader className="pb-2">
                                  <div className="flex items-start justify-between gap-4">
                                    <div>
                                      <CardTitle className="text-base font-medium">{opp.title}</CardTitle>
                                      <CardDescription className="mt-1">
                                        {opp.agency}{opp.solicitationNumber && ` - ${opp.solicitationNumber}`}
                                      </CardDescription>
                                    </div>
                                    {isImported ? (
                                      <Badge className="bg-green-500">Imported</Badge>
                                    ) : (
                                      <Button size="sm" onClick={() => handleImportOpportunity(opp)} disabled={opportunityMutation.isPending} data-testid={`button-import-${opp.externalId}`}>
                                        <Download className="w-4 h-4 mr-2" />Import
                                      </Button>
                                    )}
                                  </div>
                                </CardHeader>
                                <CardContent className="pt-0">
                                  <div className="flex flex-wrap gap-2 mb-2">
                                    {opp.noticeType && <Badge variant="outline">{opp.noticeType}</Badge>}
                                    {opp.setAsideType && <Badge variant="secondary">{opp.setAsideType}</Badge>}
                                    {opp.responseDeadline && (
                                      <Badge variant="outline" className="text-orange-600 border-orange-300">
                                        Due: {new Date(opp.responseDeadline).toLocaleDateString()}
                                      </Badge>
                                    )}
                                  </div>
                                  {opp.description && (
                                    <p className="text-sm text-muted-foreground line-clamp-2">{opp.description.substring(0, 200)}...</p>
                                  )}
                                </CardContent>
                              </Card>
                            );
                          })}
                        </div>
                      </ScrollArea>
                    </>
                  )}
                </CardContent>
              </Card>
              
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="font-serif">Active Projects</CardTitle>
                    <CardDescription>Imported opportunities with active workflows</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[300px]">
                      {workflowInstancesData.length === 0 ? (
                        <p className="text-center text-muted-foreground py-4">No active projects. Import an opportunity to get started.</p>
                      ) : (
                        <div className="space-y-3">
                          {workflowInstancesData.map(instance => (
                            <div key={instance.id} className="p-3 rounded-lg border border-slate-200 hover:border-primary/50 transition-colors" data-testid={`workflow-instance-${instance.id}`}>
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-medium text-sm truncate">{instance.name}</span>
                                <Badge variant={instance.status === "active" ? "default" : "secondary"}>{instance.status}</Badge>
                              </div>
                              {instance.targetDate && (
                                <p className="text-xs text-muted-foreground">Due: {new Date(instance.targetDate).toLocaleDateString()}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </ScrollArea>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="font-serif text-base">Quick Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <span>Saved Opportunities</span>
                      <span className="font-bold text-xl">{savedOpportunities.length}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <span>Active Projects</span>
                      <span className="font-bold text-xl text-green-600">{workflowInstancesData.filter(w => w.status === "active").length}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <span>Completed</span>
                      <span className="font-bold text-xl text-blue-600">{workflowInstancesData.filter(w => w.status === "completed").length}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

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
                            <Button size="sm" variant="outline" data-testid={`button-start-form-${template.id}`}>
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
            <div className="grid lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="font-serif">Client Intake</CardTitle>
                  <Dialog>
                    <DialogTrigger asChild><Button data-testid="button-add-client"><Plus className="w-4 h-4 mr-2" />Add Client</Button></DialogTrigger>
                    <DialogContent>
                      <DialogHeader><DialogTitle>New Client Intake</DialogTitle><DialogDescription>Enter client information for the engagement.</DialogDescription></DialogHeader>
                      <form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); clientMutation.mutate({ name: fd.get("name") as string, organization: fd.get("organization") as string, email: fd.get("email") as string, phone: fd.get("phone") as string, sector: fd.get("sector") as string, notes: fd.get("notes") as string }); }} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4"><div className="space-y-2"><Label htmlFor="name">Contact Name</Label><Input id="name" name="name" required data-testid="input-client-name" /></div><div className="space-y-2"><Label htmlFor="organization">Organization</Label><Input id="organization" name="organization" data-testid="input-client-org" /></div></div>
                        <div className="grid grid-cols-2 gap-4"><div className="space-y-2"><Label htmlFor="email">Email</Label><Input id="email" name="email" type="email" data-testid="input-client-email" /></div><div className="space-y-2"><Label htmlFor="phone">Phone</Label><Input id="phone" name="phone" data-testid="input-client-phone" /></div></div>
                        <div className="space-y-2"><Label htmlFor="sector">Sector</Label><Select name="sector"><SelectTrigger data-testid="select-client-sector"><SelectValue placeholder="Select sector" /></SelectTrigger><SelectContent><SelectItem value="government">Government</SelectItem><SelectItem value="industry">Industry</SelectItem><SelectItem value="academia">Academia</SelectItem></SelectContent></Select></div>
                        <div className="space-y-2"><Label htmlFor="notes">Notes</Label><Textarea id="notes" name="notes" placeholder="Additional information..." data-testid="textarea-client-notes" /></div>
                        <Button type="submit" className="w-full" disabled={clientMutation.isPending} data-testid="button-submit-client">{clientMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}Create Client</Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-3">
                      {clients.length === 0 ? <p className="text-center text-muted-foreground py-8">No clients yet. Add your first client to get started.</p> : clients.map((client) => (
                        <div key={client.id} className="p-4 rounded-lg border border-slate-200 hover:border-primary/50 transition-colors" data-testid={`client-card-${client.id}`}>
                          <div className="flex items-center justify-between mb-2"><span className="font-medium">{client.name}</span><Badge variant="outline">{client.sector || "N/A"}</Badge></div>
                          <p className="text-sm text-muted-foreground">{client.organization}</p>
                          <p className="text-sm text-muted-foreground">{client.email}</p>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="font-serif">Quick Stats</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"><span>Total Clients</span><span className="font-bold text-xl">{clients.length}</span></div>
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"><span>Active</span><span className="font-bold text-xl text-green-600">{clients.filter(c => c.status === "active").length}</span></div>
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"><span>Completed</span><span className="font-bold text-xl text-blue-600">{clients.filter(c => c.status === "completed").length}</span></div>
                </CardContent>
              </Card>
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
                          <DialogHeader><DialogTitle>Start Timer</DialogTitle></DialogHeader>
                          <div className="space-y-4">
                            <div className="space-y-2"><Label>Description</Label><Input value={timerDescription} onChange={(e) => setTimerDescription(e.target.value)} placeholder="What are you working on?" data-testid="input-timer-description" /></div>
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
                      <div><span className="font-medium text-green-700">Timer Running</span><p className="text-sm text-green-600">{timerDescription || "No description"}</p></div>
                      <span className="font-mono text-2xl text-green-700">{Math.floor((new Date().getTime() - timerStart.getTime()) / 60000)}m</span>
                    </div>
                  )}
                  <ScrollArea className="h-[350px]">
                    <div className="space-y-3">
                      {timeEntries.length === 0 ? <p className="text-center text-muted-foreground py-8">No time entries yet. Start tracking your time.</p> : timeEntries.map((entry) => (
                        <div key={entry.id} className="p-4 rounded-lg border border-slate-200" data-testid={`time-entry-${entry.id}`}>
                          <div className="flex items-center justify-between mb-2"><span className="font-medium">{entry.description}</span><Badge variant={entry.billable ? "default" : "secondary"}>{entry.billable ? "Billable" : "Non-billable"}</Badge></div>
                          <div className="flex items-center justify-between text-sm text-muted-foreground"><span>{new Date(entry.startTime).toLocaleDateString()}</span><span className="font-mono">{entry.durationMinutes ? `${Math.floor(entry.durationMinutes / 60)}h ${entry.durationMinutes % 60}m` : "In progress"}</span></div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="font-serif">Summary</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"><span>Total Hours</span><span className="font-bold text-xl">{totalHours.toFixed(1)}</span></div>
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"><span>Billable</span><span className="font-bold text-xl text-green-600">{(timeEntries.filter(e => e.billable).reduce((a, e) => a + (e.durationMinutes || 0), 0) / 60).toFixed(1)}</span></div>
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"><span>This Week</span><span className="font-bold text-xl">{timeEntries.filter(e => new Date(e.startTime) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).reduce((a, e) => a + (e.durationMinutes || 0), 0) / 60}h</span></div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Actions Tab */}
          <TabsContent value="actions">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="font-serif">Action Waterfall</CardTitle>
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
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {actions.length === 0 ? <p className="text-center text-muted-foreground py-8">No actions scheduled. Create your first action item.</p> : actions.map((action) => {
                    const isOverdue = new Date(action.dueDate) < new Date() && action.status !== "completed";
                    return (
                      <div key={action.id} className={`p-4 rounded-lg border ${isOverdue ? "border-red-200 bg-red-50" : "border-slate-200"}`} data-testid={`action-card-${action.id}`}>
                        <div className="flex items-center justify-between mb-2"><span className="font-medium">{action.title}</span><div className="flex items-center gap-2"><Badge variant={action.priority === "urgent" ? "destructive" : action.priority === "high" ? "default" : "secondary"}>{action.priority}</Badge><Badge variant={action.status === "completed" ? "default" : "outline"}>{action.status}</Badge></div></div>
                        <p className="text-sm text-muted-foreground mb-2">{action.description}</p>
                        <div className="flex items-center justify-between text-sm"><span>Start: {new Date(action.startDate).toLocaleDateString()}</span><span className={isOverdue ? "text-red-600 font-medium" : ""}>Due: {new Date(action.dueDate).toLocaleDateString()}</span></div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Billing Tab */}
          <TabsContent value="billing">
            <div className="grid lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader><CardTitle className="font-serif">Invoices</CardTitle></CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-3">
                      {invoices.length === 0 ? <p className="text-center text-muted-foreground py-8">No invoices yet. Create your first invoice.</p> : invoices.map((invoice) => (
                        <div key={invoice.id} className="p-4 rounded-lg border border-slate-200" data-testid={`invoice-card-${invoice.id}`}>
                          <div className="flex items-center justify-between mb-2"><span className="font-medium">{invoice.invoiceNumber}</span><Badge variant={invoice.status === "paid" ? "default" : invoice.status === "overdue" ? "destructive" : "secondary"}>{invoice.status}</Badge></div>
                          <div className="flex items-center justify-between text-sm text-muted-foreground"><span>Issued: {invoice.issueDate ? new Date(invoice.issueDate).toLocaleDateString() : "N/A"}</span><span className="font-bold text-lg">${Number(invoice.total || 0).toFixed(2)}</span></div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="font-serif">Billing Summary</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"><span>Unbilled Hours</span><span className="font-bold text-xl">{(timeEntries.filter(e => e.billable && !e.invoiced).reduce((a, e) => a + (e.durationMinutes || 0), 0) / 60).toFixed(1)}</span></div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg"><span>Paid</span><span className="font-bold text-xl text-green-600">${invoices.filter(i => i.status === "paid").reduce((a, i) => a + Number(i.total || 0), 0).toFixed(2)}</span></div>
                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg"><span>Outstanding</span><span className="font-bold text-xl text-yellow-600">${invoices.filter(i => i.status !== "paid").reduce((a, i) => a + Number(i.total || 0), 0).toFixed(2)}</span></div>
                </CardContent>
              </Card>
            </div>
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
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="font-serif">Async Communication</CardTitle>
                <Dialog>
                  <DialogTrigger asChild><Button data-testid="button-new-message"><Plus className="w-4 h-4 mr-2" />New Message</Button></DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>Send Message</DialogTitle></DialogHeader>
                    <form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); messageMutation.mutate({ subject: fd.get("subject") as string, content: fd.get("content") as string }); }} className="space-y-4">
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
                    {messages.length === 0 ? <p className="text-center text-muted-foreground py-8">No messages yet.</p> : messages.map((message) => (
                      <div key={message.id} className={`p-4 rounded-lg border ${message.readAt ? "border-slate-200" : "border-primary bg-primary/5"}`} data-testid={`message-${message.id}`}>
                        <div className="flex items-center justify-between mb-2"><span className="font-medium">{message.subject || "No Subject"}</span>{!message.readAt && <Badge>New</Badge>}</div>
                        <p className="text-sm text-muted-foreground mb-2">{message.content}</p>
                        <span className="text-xs text-muted-foreground">{new Date(message.createdAt!).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
