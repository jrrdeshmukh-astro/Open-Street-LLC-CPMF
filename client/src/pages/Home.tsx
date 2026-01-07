import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  FileText, 
  RefreshCw, 
  Shield, 
  Search, 
  Users, 
  Target, 
  Layers,
  MessageSquare,
  UserCheck,
  Lightbulb,
  XCircle,
  Building2,
  Phone,
  ArrowRight,
  CheckCircle2,
  Send,
  Loader2,
  LayoutDashboard,
  LogIn,
  LogOut
} from "lucide-react";
import Logo from "@assets/logo_1767656771540.png";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";

export default function Home() {
  const { user, isLoading } = useAuth();

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-serif font-bold text-primary text-lg">Open Street LLC</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm">
            <a href="#overview" className="text-muted-foreground hover:text-primary transition-colors" data-testid="link-overview">Overview</a>
            <a href="#framework" className="text-muted-foreground hover:text-primary transition-colors" data-testid="link-framework">Framework</a>
            <a href="#usage" className="text-muted-foreground hover:text-primary transition-colors" data-testid="link-usage">Usage</a>
            <a href="#contact" className="text-muted-foreground hover:text-primary transition-colors" data-testid="link-contact">Contact</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/brochure" className="hidden md:inline-flex items-center gap-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 rounded-md px-3 text-sm font-medium transition-colors" data-testid="button-brochure">
              <FileText className="w-4 h-4" />
              Brochure
            </Link>
            {!isLoading && (
              user ? (
                <>
                  <Link href="/dashboard" className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white h-9 rounded-md px-3 text-sm font-medium transition-colors" data-testid="button-dashboard">
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </Link>
                  <a href="/api/logout" className="inline-flex items-center gap-2 border border-slate-200 hover:bg-slate-100 h-9 rounded-md px-3 text-sm font-medium transition-colors text-muted-foreground" data-testid="button-logout">
                    <LogOut className="w-4 h-4" />
                  </a>
                </>
              ) : (
                <a href="/api/login" className="inline-flex items-center gap-2 bg-[#bfa15f] hover:bg-[#bfa15f]/90 text-white h-9 rounded-md px-3 text-sm font-medium transition-colors" data-testid="button-login">
                  <LogIn className="w-4 h-4" />
                  Login
                </a>
              )
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-slate-100"></div>
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #1a202c 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
        
        {/* Decorative Elements */}
        <div className="absolute top-20 right-10 w-72 h-72 bg-[#bfa15f]/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <div className="mb-8 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-[#bfa15f]/20 blur-2xl rounded-full scale-125"></div>
              <img 
                src={Logo} 
                alt="Open Street LLC Logo" 
                className="w-40 h-40 md:w-48 md:h-48 object-contain relative z-10 drop-shadow-lg rounded-full"
              />
            </div>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-primary mb-6 leading-tight">
            Codified Program<br/>Management Framework
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-8 font-light leading-relaxed">
            A Structured, Compliant Approach to Multi-Stakeholder Engagement
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="#overview" 
              className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white px-8 py-4 text-lg rounded-md font-medium transition-colors"
              data-testid="button-learn-more"
            >
              Learn More <ArrowRight className="w-5 h-5" />
            </a>
            <a 
              href="#contact" 
              className="inline-flex items-center justify-center gap-2 border border-[#bfa15f] text-[#bfa15f] hover:bg-[#bfa15f]/10 px-8 py-4 text-lg rounded-md font-medium transition-colors"
              data-testid="button-contact-hero"
            >
              <Phone className="w-5 h-5" /> Contact Us
            </a>
          </div>
        </div>
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-primary/30 rounded-full flex justify-center pt-2">
            <div className="w-1.5 h-3 bg-primary/50 rounded-full"></div>
          </div>
        </div>
      </section>

      {/* Overview Section */}
      <section id="overview" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-[#bfa15f] uppercase tracking-widest text-sm font-semibold mb-4 block">Overview</span>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary mb-6">
              Structured Engagement That Works
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Open Street LLC offers a Codified Program Management Framework — a documented, repeatable approach to designing, governing, and facilitating structured engagement between government, industry, and academia.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100">
              <h3 className="text-xl font-bold text-primary mb-4">What We Do</h3>
              <p className="text-muted-foreground leading-relaxed">
                This framework formalizes how engagement is planned, conducted, and sustained, ensuring consistency, transparency, and compliance across programs.
              </p>
            </div>
            <div className="bg-primary text-white p-8 rounded-2xl">
              <h3 className="text-xl font-bold text-[#bfa15f] mb-4">Our Focus</h3>
              <p className="text-slate-300 leading-relaxed">
                It focuses on <strong className="text-white">process and governance</strong>, not outcomes, access, or decision-making. We manage how engagement happens, not what decisions are made.
              </p>
            </div>
          </div>

          {/* What Codified Means */}
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-8 md:p-12 rounded-2xl border border-slate-200">
            <h3 className="text-2xl font-serif font-bold text-primary mb-8 text-center">
              What "Codified" Means
            </h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <FeatureCard 
                icon={<FileText className="w-6 h-6" />}
                title="Documented"
                description="Roles, rules, and workflows are written and explicit"
              />
              <FeatureCard 
                icon={<RefreshCw className="w-6 h-6" />}
                title="Repeatable"
                description="Programs follow a consistent lifecycle and structure"
              />
              <FeatureCard 
                icon={<Shield className="w-6 h-6" />}
                title="Governed"
                description="Engagement operates within defined compliance guardrails"
              />
              <FeatureCard 
                icon={<Search className="w-6 h-6" />}
                title="Auditable"
                description="Artifacts and decisions are traceable to documented process"
              />
            </div>
            <p className="text-center text-muted-foreground mt-8 text-sm">
              The framework reduces reliance on ad hoc practices or individual discretion.
            </p>
          </div>
        </div>
      </section>

      {/* Core Framework Components */}
      <section id="framework" className="py-24 bg-slate-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-[#bfa15f] uppercase tracking-widest text-sm font-semibold mb-4 block">The Framework</span>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary mb-6">
              Core Framework Components
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Five interconnected pillars that ensure structured, compliant, and valuable engagement.
            </p>
          </div>

          <div className="grid gap-8">
            <FrameworkComponent 
              number="01"
              icon={<Layers className="w-8 h-8" />}
              title="Engagement Structure"
              description="Defines how engagement is organized"
              items={[
                "Program objectives and scope",
                "Engagement formats (forums, roundtables, working groups)",
                "Participant roles and responsibilities",
                "Program lifecycle stages (initiation, engagement, synthesis, continuation)"
              ]}
              artifacts={["Program Charter", "Engagement Architecture Guide"]}
            />
            
            <FrameworkComponent 
              number="02"
              icon={<Shield className="w-8 h-8" />}
              title="Governance & Compliance Guardrails"
              description="Establishes clear rules of engagement"
              items={[
                "Non-solicitation standards",
                "Neutrality and independence principles",
                "Prohibited activities (procurement, advocacy, endorsement)",
                "Moderator authority and escalation paths"
              ]}
              artifacts={["Governance Framework", "Rules of Engagement"]}
              dark
            />
            
            <FrameworkComponent 
              number="03"
              icon={<MessageSquare className="w-8 h-8" />}
              title="Facilitation & Moderation Playbooks"
              description="Standardizes how engagement is run in practice"
              items={[
                "Approved session scripts and prompts",
                "Facilitation techniques to ensure balanced participation",
                "Language for redirecting sales or out-of-scope discussions",
                "Session opening and closing protocols"
              ]}
              artifacts={["Facilitator Guide", "Moderator Scripts"]}
            />
            
            <FrameworkComponent 
              number="04"
              icon={<UserCheck className="w-8 h-8" />}
              title="Stakeholder Coordination"
              description="Defines how participants are onboarded and supported"
              items={[
                "Participant briefing materials",
                "Role-specific onboarding guidance",
                "Communication and coordination workflows"
              ]}
              artifacts={["Participant Briefings", "Onboarding Packets"]}
              dark
            />
            
            <FrameworkComponent 
              number="05"
              icon={<Lightbulb className="w-8 h-8" />}
              title="Insight Capture & Continuity"
              description="Ensures engagement produces durable value"
              items={[
                "Non-attributable insight capture",
                "Cross-sector synthesis of themes",
                "Documentation of what is in and out of scope",
                "Options for follow-on, program-managed engagement"
              ]}
              artifacts={["Synthesis Reports", "Engagement Roadmaps"]}
            />
          </div>
        </div>
      </section>

      {/* What Framework Is Not */}
      <section className="py-24 bg-primary text-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <span className="text-[#bfa15f] uppercase tracking-widest text-sm font-semibold mb-4 block">Important Distinction</span>
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-6">
              What the Framework Is <span className="text-[#bfa15f]">Not</span>
            </h2>
            <p className="text-lg text-slate-300 max-w-2xl mx-auto">
              The framework governs how engagement occurs, not what decisions are made.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <NotCard text="Influence decisions or outcomes" />
            <NotCard text="Provide access to government officials" />
            <NotCard text="Support procurement or contracting activities" />
            <NotCard text="Endorse participants or solutions" />
          </div>
        </div>
      </section>

      {/* How Organizations Use It */}
      <section id="usage" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-[#bfa15f] uppercase tracking-widest text-sm font-semibold mb-4 block">Usage</span>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary mb-6">
              How Organizations Use the Framework
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <UsageCard 
              icon={<Users className="w-8 h-8" />}
              title="Participate"
              description="Participate in Open Street–managed engagement programs with confidence in the process."
            />
            <UsageCard 
              icon={<Building2 className="w-8 h-8" />}
              title="Adopt Internally"
              description="Adopt structured engagement practices internally within your own organization."
            />
            <UsageCard 
              icon={<Target className="w-8 h-8" />}
              title="Ensure Compliance"
              description="Ensure compliant interaction across diverse stakeholders in complex ecosystems."
            />
          </div>

          <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 text-center">
            <p className="text-muted-foreground text-sm">
              Engagement scope and commercial terms are defined separately.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 bg-slate-50">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <span className="text-[#bfa15f] uppercase tracking-widest text-sm font-semibold mb-4 block">Get In Touch</span>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary mb-6">
              Ready to Learn More?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Contact us to discuss how the Codified Program Management Framework can support your organization's engagement needs.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Contact Form */}
            <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200">
              <h3 className="text-xl font-bold text-primary mb-6">Send Us a Message</h3>
              <ContactForm />
            </div>

            {/* Contact Info */}
            <div className="bg-primary p-8 rounded-2xl text-white flex flex-col justify-center">
              <h3 className="text-xl font-bold text-[#bfa15f] mb-6">Contact Information</h3>
              
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
                  <Phone className="w-5 h-5 text-[#bfa15f]" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">Call Us</p>
                  <p className="text-lg font-bold">+1(908)848-1562</p>
                </div>
              </div>

              <div className="border-t border-white/10 pt-8">
                <p className="text-sm text-slate-400 leading-relaxed">
                  We typically respond within 1-2 business days. For urgent inquiries, please call us directly.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-primary text-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <img src={Logo} alt="Open Street LLC" className="w-12 h-12 rounded-full" />
              <div>
                <p className="font-bold">Open Street LLC</p>
                <p className="text-sm text-[#bfa15f]">ESTD. 2020</p>
              </div>
            </div>
            
            <p className="text-sm text-slate-400 max-w-lg text-center md:text-right">
              <strong className="text-slate-300">Compliance Statement:</strong> Open Street LLC operates as an outcome agnostic program manager. All engagement under this framework is informational and non-solicitation in nature.
            </p>
          </div>
          
          <div className="border-t border-white/10 mt-8 pt-8 text-center">
            <p className="text-sm text-slate-400">
              Open Street codifies engagement so collaboration is structured, governed, and sustainable.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 text-center hover:shadow-md transition-shadow">
      <div className="w-12 h-12 bg-[#bfa15f]/10 rounded-full flex items-center justify-center mx-auto mb-4 text-[#bfa15f]">
        {icon}
      </div>
      <h4 className="font-bold text-primary mb-2">{title}</h4>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function FrameworkComponent({ 
  number, 
  icon, 
  title, 
  description, 
  items, 
  artifacts,
  dark = false 
}: { 
  number: string, 
  icon: React.ReactNode, 
  title: string, 
  description: string, 
  items: string[], 
  artifacts: string[],
  dark?: boolean 
}) {
  return (
    <div className={`p-8 rounded-2xl ${dark ? 'bg-primary text-white' : 'bg-white border border-slate-200'}`}>
      <div className="flex flex-col lg:flex-row lg:items-start gap-6">
        <div className="flex items-center gap-4 lg:w-1/3">
          <span className={`text-4xl font-serif font-bold ${dark ? 'text-[#bfa15f]' : 'text-[#bfa15f]/30'}`}>{number}</span>
          <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${dark ? 'bg-white/10 text-[#bfa15f]' : 'bg-[#bfa15f]/10 text-[#bfa15f]'}`}>
            {icon}
          </div>
          <div>
            <h3 className={`font-bold text-lg ${dark ? 'text-white' : 'text-primary'}`}>{title}</h3>
            <p className={`text-sm ${dark ? 'text-slate-400' : 'text-muted-foreground'}`}>{description}</p>
          </div>
        </div>
        
        <div className="lg:w-1/2">
          <ul className="space-y-2">
            {items.map((item, i) => (
              <li key={i} className={`flex items-start gap-2 text-sm ${dark ? 'text-slate-300' : 'text-muted-foreground'}`}>
                <CheckCircle2 className={`w-4 h-4 mt-0.5 shrink-0 ${dark ? 'text-[#bfa15f]' : 'text-[#bfa15f]'}`} />
                {item}
              </li>
            ))}
          </ul>
        </div>
        
        <div className="lg:w-1/4">
          <p className={`text-xs uppercase tracking-wider mb-2 font-semibold ${dark ? 'text-[#bfa15f]' : 'text-[#bfa15f]'}`}>Key Artifacts</p>
          <div className="flex flex-wrap gap-2">
            {artifacts.map((artifact, i) => (
              <span key={i} className={`text-xs px-3 py-1 rounded-full ${dark ? 'bg-white/10 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
                {artifact}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function NotCard({ text }: { text: string }) {
  return (
    <div className="bg-white/5 border border-white/10 p-6 rounded-xl text-center">
      <XCircle className="w-8 h-8 text-red-400 mx-auto mb-3" />
      <p className="text-sm text-slate-300">{text}</p>
    </div>
  );
}

function UsageCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <Card className="text-center hover:shadow-lg transition-shadow border-slate-200">
      <CardHeader>
        <div className="w-16 h-16 bg-[#bfa15f]/10 rounded-full flex items-center justify-center mx-auto mb-4 text-[#bfa15f]">
          {icon}
        </div>
        <CardTitle className="text-primary">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-sm">{description}</p>
      </CardContent>
    </Card>
  );
}

function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    organization: "",
    message: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8 text-green-600" />
        </div>
        <h4 className="text-xl font-bold text-primary mb-2">Message Sent!</h4>
        <p className="text-muted-foreground text-sm">
          Thank you for reaching out. We'll get back to you within 1-2 business days.
        </p>
        <Button 
          variant="outline" 
          className="mt-6"
          onClick={() => {
            setIsSubmitted(false);
            setFormData({ name: "", email: "", organization: "", message: "" });
          }}
          data-testid="button-send-another"
        >
          Send Another Message
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input 
            id="name"
            placeholder="Your name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            data-testid="input-name"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input 
            id="email"
            type="email"
            placeholder="your@email.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            data-testid="input-email"
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="organization">Organization</Label>
        <Input 
          id="organization"
          placeholder="Your company or organization"
          value={formData.organization}
          onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
          data-testid="input-organization"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="message">Message</Label>
        <Textarea 
          id="message"
          placeholder="How can we help you?"
          rows={4}
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          required
          data-testid="input-message"
        />
      </div>
      
      <Button 
        type="submit" 
        className="w-full bg-primary hover:bg-primary/90"
        disabled={isSubmitting}
        data-testid="button-submit-contact"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Sending...
          </>
        ) : (
          <>
            <Send className="w-4 h-4 mr-2" />
            Send Message
          </>
        )}
      </Button>
    </form>
  );
}
