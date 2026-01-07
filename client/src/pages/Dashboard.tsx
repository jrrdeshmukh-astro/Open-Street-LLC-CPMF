import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  ChevronRight, 
  FileText, 
  LogOut, 
  CheckCircle2,
  Circle,
  Users,
  Shield,
  RefreshCw,
  Search,
  Target,
  Home,
  Save,
  Loader2
} from "lucide-react";
import { Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import type { WorkflowProgress, Artifact } from "@shared/schema";

const FRAMEWORK_COMPONENTS = [
  {
    id: "engagement_structure",
    name: "Engagement Structure",
    icon: Users,
    description: "Program charter, stakeholder roles, and meeting cadence",
    stages: ["initiation", "engagement", "synthesis", "continuation"],
    artifacts: ["program_charter", "stakeholder_map", "meeting_schedule"]
  },
  {
    id: "governance_framework",
    name: "Governance Framework",
    icon: Shield,
    description: "Decision rights, compliance procedures, and risk management",
    stages: ["initiation", "engagement", "synthesis", "continuation"],
    artifacts: ["governance_charter", "compliance_checklist", "risk_register"]
  },
  {
    id: "facilitation_model",
    name: "Facilitation Model",
    icon: RefreshCw,
    description: "Outcome agnostic facilitation and process documentation",
    stages: ["initiation", "engagement", "synthesis", "continuation"],
    artifacts: ["facilitation_guide", "session_templates", "process_docs"]
  },
  {
    id: "analysis_framework",
    name: "Analysis Framework",
    icon: Search,
    description: "Policy context analysis and gap identification",
    stages: ["initiation", "engagement", "synthesis", "continuation"],
    artifacts: ["policy_analysis", "gap_assessment", "recommendation_report"]
  },
  {
    id: "continuation_strategy",
    name: "Continuation Strategy",
    icon: Target,
    description: "Transition planning and knowledge transfer protocols",
    stages: ["initiation", "engagement", "synthesis", "continuation"],
    artifacts: ["transition_plan", "knowledge_base", "sustainability_report"]
  }
];

const STAGE_LABELS: Record<string, string> = {
  initiation: "Initiation",
  engagement: "Engagement",
  synthesis: "Synthesis",
  continuation: "Continuation"
};

export default function Dashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeComponent, setActiveComponent] = useState(FRAMEWORK_COMPONENTS[0].id);
  const [notes, setNotes] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!authLoading && !user) {
      toast({ title: "Unauthorized", description: "Logging in again...", variant: "destructive" });
      setTimeout(() => { window.location.href = "/api/login"; }, 500);
    }
  }, [user, authLoading, toast]);

  const { data: workflowProgress = [], isLoading: progressLoading } = useQuery<WorkflowProgress[]>({
    queryKey: ["/api/workflow/progress"],
    enabled: !!user,
  });

  const { data: artifacts = [], isLoading: artifactsLoading } = useQuery<Artifact[]>({
    queryKey: ["/api/artifacts"],
    enabled: !!user,
  });

  const progressMutation = useMutation({
    mutationFn: async (data: { componentId: string; stage: string; completed: boolean; notes?: string }) => {
      const res = await fetch("/api/workflow/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to save progress");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workflow/progress"] });
      toast({ title: "Progress saved" });
    },
    onError: () => {
      toast({ title: "Failed to save progress", variant: "destructive" });
    }
  });

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const getComponentProgress = (componentId: string) => {
    const componentProgresses = workflowProgress.filter(p => p.componentId === componentId);
    const completedStages = componentProgresses.filter(p => p.completed).length;
    return (completedStages / 4) * 100;
  };

  const getStageStatus = (componentId: string, stage: string) => {
    return workflowProgress.find(p => p.componentId === componentId && p.stage === stage);
  };

  const handleStageToggle = (componentId: string, stage: string, currentStatus: boolean) => {
    progressMutation.mutate({
      componentId,
      stage,
      completed: !currentStatus,
      notes: notes[`${componentId}_${stage}`] || "",
    });
  };

  const handleSaveNotes = (componentId: string, stage: string) => {
    const stageStatus = getStageStatus(componentId, stage);
    progressMutation.mutate({
      componentId,
      stage,
      completed: stageStatus?.completed || false,
      notes: notes[`${componentId}_${stage}`] || "",
    });
  };

  const totalProgress = FRAMEWORK_COMPONENTS.reduce((acc, comp) => acc + getComponentProgress(comp.id), 0) / FRAMEWORK_COMPONENTS.length;

  const currentComponent = FRAMEWORK_COMPONENTS.find(c => c.id === activeComponent)!;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-primary text-white py-4 px-6 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-serif font-bold">CPMF Dashboard</h1>
            <Badge variant="secondary" className="bg-[#bfa15f] text-primary">
              {Math.round(totalProgress)}% Complete
            </Badge>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-300">
              Welcome, {user.firstName || user.email || "User"}
            </span>
            <Link href="/" className="text-sm text-slate-300 hover:text-white flex items-center gap-1" data-testid="link-home">
              <Home className="w-4 h-4" /> Home
            </Link>
            <a href="/api/logout" className="text-sm text-slate-300 hover:text-white flex items-center gap-1" data-testid="button-logout">
              <LogOut className="w-4 h-4" /> Logout
            </a>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        {/* Overall Progress */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg font-serif">Framework Implementation Progress</CardTitle>
            <CardDescription>Track your progress across all five CPMF components</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Progress value={totalProgress} className="h-3" />
              <div className="grid grid-cols-5 gap-4">
                {FRAMEWORK_COMPONENTS.map((comp) => {
                  const progress = getComponentProgress(comp.id);
                  const Icon = comp.icon;
                  return (
                    <button
                      key={comp.id}
                      onClick={() => setActiveComponent(comp.id)}
                      className={`p-4 rounded-lg border transition-all text-left ${
                        activeComponent === comp.id 
                          ? "border-primary bg-primary/5 shadow-md" 
                          : "border-slate-200 hover:border-primary/50"
                      }`}
                      data-testid={`button-component-${comp.id}`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Icon className={`w-5 h-5 ${activeComponent === comp.id ? "text-primary" : "text-slate-500"}`} />
                        <span className="text-xs font-medium text-[#bfa15f]">{Math.round(progress)}%</span>
                      </div>
                      <p className="text-sm font-medium text-primary truncate">{comp.name}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Component Detail */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Stage Checklist */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center gap-3">
                <currentComponent.icon className="w-6 h-6 text-primary" />
                <div>
                  <CardTitle className="font-serif">{currentComponent.name}</CardTitle>
                  <CardDescription>{currentComponent.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="initiation" className="w-full">
                <TabsList className="grid grid-cols-4 mb-6">
                  {Object.entries(STAGE_LABELS).map(([key, label]) => {
                    const status = getStageStatus(currentComponent.id, key);
                    return (
                      <TabsTrigger key={key} value={key} className="flex items-center gap-2">
                        {status?.completed ? (
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                        ) : (
                          <Circle className="w-4 h-4 text-slate-300" />
                        )}
                        {label}
                      </TabsTrigger>
                    );
                  })}
                </TabsList>
                
                {Object.entries(STAGE_LABELS).map(([key, label]) => {
                  const status = getStageStatus(currentComponent.id, key);
                  const noteKey = `${currentComponent.id}_${key}`;
                  
                  return (
                    <TabsContent key={key} value={key} className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Checkbox 
                            id={`stage-${key}`}
                            checked={status?.completed || false}
                            onCheckedChange={() => handleStageToggle(currentComponent.id, key, status?.completed || false)}
                            data-testid={`checkbox-stage-${currentComponent.id}-${key}`}
                          />
                          <label htmlFor={`stage-${key}`} className="font-medium cursor-pointer">
                            Mark {label} Stage as Complete
                          </label>
                        </div>
                        {status?.completedAt && (
                          <span className="text-xs text-slate-500">
                            Completed: {new Date(status.completedAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Notes & Documentation</label>
                        <Textarea
                          placeholder={`Add notes for the ${label} stage...`}
                          value={notes[noteKey] ?? status?.notes ?? ""}
                          onChange={(e) => setNotes({ ...notes, [noteKey]: e.target.value })}
                          className="min-h-[120px]"
                          data-testid={`textarea-notes-${currentComponent.id}-${key}`}
                        />
                        <Button 
                          size="sm" 
                          onClick={() => handleSaveNotes(currentComponent.id, key)}
                          disabled={progressMutation.isPending}
                          data-testid={`button-save-notes-${currentComponent.id}-${key}`}
                        >
                          {progressMutation.isPending ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Save className="w-4 h-4 mr-2" />
                          )}
                          Save Notes
                        </Button>
                      </div>
                    </TabsContent>
                  );
                })}
              </Tabs>
            </CardContent>
          </Card>

          {/* Artifacts Panel */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-serif flex items-center gap-2">
                <FileText className="w-5 h-5" /> Artifacts
              </CardTitle>
              <CardDescription>Documents and deliverables for this component</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {currentComponent.artifacts.map((artifactType) => {
                    const artifact = artifacts.find(
                      a => a.componentId === currentComponent.id && a.artifactType === artifactType
                    );
                    const artifactLabel = artifactType
                      .split("_")
                      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
                      .join(" ");
                    
                    return (
                      <div 
                        key={artifactType}
                        className={`p-3 rounded-lg border ${
                          artifact ? "border-green-200 bg-green-50" : "border-slate-200 bg-slate-50"
                        }`}
                        data-testid={`artifact-${currentComponent.id}-${artifactType}`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{artifactLabel}</span>
                          {artifact ? (
                            <Badge variant="outline" className="text-green-600 border-green-300">
                              <CheckCircle2 className="w-3 h-3 mr-1" /> Created
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-slate-400">
                              Pending
                            </Badge>
                          )}
                        </div>
                        {artifact && (
                          <p className="text-xs text-slate-500 mt-1">
                            Updated: {new Date(artifact.updatedAt!).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
