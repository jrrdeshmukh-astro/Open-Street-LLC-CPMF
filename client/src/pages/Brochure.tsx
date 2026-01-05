import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Printer, ArrowRight, Shield, Globe, Zap, FileText } from "lucide-react";
import Logo from "@assets/logo_1767655886239.png";

export default function Brochure() {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] print:bg-white text-slate-900 font-sans">
      {/* Print Button - Hidden when printing */}
      <div className="fixed bottom-8 right-8 z-50 no-print animate-in fade-in slide-in-from-bottom-4 duration-500">
        <Button 
          onClick={handlePrint} 
          size="lg" 
          className="shadow-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-full px-8 py-6 h-auto flex items-center gap-3 transition-all hover:scale-105"
        >
          <Printer className="w-5 h-5" />
          Save as PDF
        </Button>
      </div>

      {/* A4 Container */}
      <div className="max-w-[210mm] mx-auto bg-white min-h-screen shadow-2xl print:shadow-none print:max-w-none print:w-full print:mx-0 overflow-hidden relative">
        
        {/* Decorative Top Border */}
        <div className="h-2 w-full bg-gradient-to-r from-primary via-[#bfa15f] to-primary"></div>

        {/* Content Padding */}
        <div className="p-12 md:p-16 print:p-0">
          
          {/* Header Section */}
          <header className="flex flex-col items-center text-center mb-12 border-b-2 border-[#bfa15f]/20 pb-12">
            <div className="mb-8 relative">
              <div className="absolute inset-0 bg-[#bfa15f]/20 blur-3xl rounded-full opacity-50"></div>
              <img 
                src={Logo} 
                alt="Open Street LLC Logo" 
                className="w-32 h-32 md:w-40 md:h-40 object-contain relative z-10 drop-shadow-sm"
              />
            </div>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-primary mb-4 tracking-tight leading-tight">
              Codified Program Management Framework
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground font-light max-w-2xl">
              Strategic Engagement for the Government-Industry-Academia Ecosystem
            </p>
          </header>

          {/* Intro Text */}
          <section className="mb-12 print:mb-8">
            <p className="text-lg leading-relaxed text-slate-700">
              This document outlines how Indian and international companies can leverage the <strong className="text-primary font-semibold">Codified Program Management Framework (CPMF)</strong> to engage with the government-industry-academia ecosystem effectively and compliantly.
            </p>
          </section>

          {/* Two Column Layout for Q&A */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 print:gap-6 print:mb-8">
            
            {/* Column 1 */}
            <div className="space-y-8 print:space-y-6">
              <Section 
                icon={<Shield className="w-5 h-5 text-[#bfa15f]" />}
                title="The Strategic Value"
              >
                <QA 
                  q="Why should a company participate in an Open Street–managed program?"
                  a="Participation provides a 'neutral ground' to understand complex requirements and share technical insights. By using a codified framework, we eliminate the typical ambiguity of multi-stakeholder meetings. You get a structured environment where the rules of engagement are clear."
                />
                <QA 
                  q="How does this help international or Indian firms specifically?"
                  a={
                    <ul className="list-none space-y-2 mt-2">
                      <li className="flex gap-2 text-sm">
                        <span className="text-[#bfa15f] font-bold">•</span>
                        <span><strong>International Firms:</strong> Compliant pathway to understand regional landscapes without violating non-solicitation rules.</span>
                      </li>
                      <li className="flex gap-2 text-sm">
                        <span className="text-[#bfa15f] font-bold">•</span>
                        <span><strong>Indian Firms:</strong> Structured platform to interface with global leaders and bridge the gap to international standards.</span>
                      </li>
                    </ul>
                  }
                />
              </Section>

              <Section 
                icon={<FileText className="w-5 h-5 text-[#bfa15f]" />}
                title="Operational Benefits"
              >
                <QA 
                  q="What does 'Codified' mean for my company’s compliance team?"
                  a="It means every interaction is auditable and documented. Our framework includes explicit Rules of Engagement and Moderator Scripts that prevent out-of-scope discussions, protecting your company from legal risks."
                />
                <QA 
                  q="We are a technical firm. How does this framework handle complex data or IP?"
                  a="The framework utilizes Non-Attributable Insight Capture. We focus on synthesizing high-level themes and technical requirements rather than capturing proprietary 'secret sauce.' Our role is to facilitate the flow of information, not to own your IP."
                />
              </Section>
            </div>

            {/* Column 2 */}
            <div className="space-y-8 print:space-y-6">
              <Section 
                icon={<Zap className="w-5 h-5 text-[#bfa15f]" />}
                title="Engagement and Outcomes"
              >
                <QA 
                  q="Does participation guarantee us a government contract?"
                  a="No. Open Street is outcome-agnostic. We manage the process of engagement, not the results of procurement. Companies benefit by gaining a clearer understanding of the strategic direction of the ecosystem."
                />
                <QA 
                  q="What is the 'durable value' mentioned in the framework?"
                  a="Our programs produce Synthesis Reports. These summarized insights serve as a roadmap for your internal R&D or strategic planning teams, providing durable value beyond just networking."
                />
                <QA 
                  q="Can we adopt this framework for our own internal programs?"
                  a="Yes. Organizations can license the Codified Program Management Framework to govern their own internal cross-functional groups or to manage external stakeholder ecosystems with discipline and transparency."
                />
              </Section>

              {/* Benefits Table */}
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-6 print:break-inside-avoid shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-[#bfa15f]/10 p-2 rounded-lg">
                    <Globe className="w-5 h-5 text-[#bfa15f]" />
                  </div>
                  <h3 className="text-xl font-serif font-bold text-primary">Summary of Benefits</h3>
                </div>
                
                <div className="rounded-lg border border-slate-200 bg-white overflow-hidden shadow-sm">
                  <Table>
                    <TableHeader className="bg-primary">
                      <TableRow className="hover:bg-primary border-none">
                        <TableHead className="w-[120px] text-primary-foreground/90 font-bold py-4">Benefit</TableHead>
                        <TableHead className="text-primary-foreground/90 font-bold py-4">Indian Firms</TableHead>
                        <TableHead className="text-primary-foreground/90 font-bold py-4">International Firms</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow className="even:bg-slate-50 hover:bg-slate-100/50 transition-colors border-slate-100">
                        <TableCell className="font-bold text-xs uppercase tracking-wider text-primary py-4 align-top">
                          <span className="bg-[#bfa15f]/10 text-[#8a7238] px-2 py-1 rounded">Market Intel</span>
                        </TableCell>
                        <TableCell className="text-sm text-slate-700 py-4 align-top">Understand global standards</TableCell>
                        <TableCell className="text-sm text-slate-700 py-4 align-top">Gain local ecosystem insights</TableCell>
                      </TableRow>
                      <TableRow className="even:bg-slate-50 hover:bg-slate-100/50 transition-colors border-slate-100">
                        <TableCell className="font-bold text-xs uppercase tracking-wider text-primary py-4 align-top">
                          <span className="bg-[#bfa15f]/10 text-[#8a7238] px-2 py-1 rounded">Risk Mitigation</span>
                        </TableCell>
                        <TableCell className="text-sm text-slate-700 py-4 align-top">Clear guardrails against risks</TableCell>
                        <TableCell className="text-sm text-slate-700 py-4 align-top">Adherence to non-advocacy standards</TableCell>
                      </TableRow>
                      <TableRow className="even:bg-slate-50 hover:bg-slate-100/50 transition-colors border-slate-100">
                        <TableCell className="font-bold text-xs uppercase tracking-wider text-primary py-4 align-top">
                          <span className="bg-[#bfa15f]/10 text-[#8a7238] px-2 py-1 rounded">Visibility</span>
                        </TableCell>
                        <TableCell className="text-sm text-slate-700 py-4 align-top">Showcase expertise globally</TableCell>
                        <TableCell className="text-sm text-slate-700 py-4 align-top">Connect with local academic hubs</TableCell>
                      </TableRow>
                      <TableRow className="even:bg-slate-50 hover:bg-slate-100/50 transition-colors border-slate-100">
                        <TableCell className="font-bold text-xs uppercase tracking-wider text-primary py-4 align-top">
                          <span className="bg-[#bfa15f]/10 text-[#8a7238] px-2 py-1 rounded">Efficiency</span>
                        </TableCell>
                        <TableCell className="text-sm text-slate-700 py-4 align-top">Faster synthesis of themes</TableCell>
                        <TableCell className="text-sm text-slate-700 py-4 align-top">Repeatable process for regional entry</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          </div>

          {/* Compliance Footer */}
          <footer className="mt-12 pt-8 border-t border-slate-200 text-center print:mt-auto print:pt-4">
            <div className="inline-block bg-slate-50 px-6 py-4 rounded-lg border border-slate-100 mb-4">
              <p className="text-sm text-slate-500 italic">
                <span className="font-semibold not-italic text-primary">Compliance Note:</span> Open Street LLC operates as a neutral facilitator. Participation is informational only and does not imply endorsement, obligation, or contractual commitment from any government or academic entity.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 mt-4 text-xs text-slate-400 uppercase tracking-widest font-medium">
              <span>Open Street LLC</span>
              <span>•</span>
              <span>ESTD. 2020</span>
            </div>
          </footer>

        </div>
      </div>
    </div>
  );
}

function Section({ title, icon, children }: { title: string, icon: React.ReactNode, children: React.ReactNode }) {
  return (
    <div className="page-break-inside-avoid">
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-[#bfa15f]/10 p-2 rounded-lg">
          {icon}
        </div>
        <h3 className="text-xl font-serif font-bold text-primary">{title}</h3>
      </div>
      <div className="space-y-6">
        {children}
      </div>
    </div>
  );
}

function QA({ q, a }: { q: string, a: React.ReactNode }) {
  return (
    <div className="group">
      <h4 className="font-medium text-primary mb-2 flex gap-2">
        <span className="text-[#bfa15f] font-bold">Q:</span>
        {q}
      </h4>
      <div className="text-slate-600 text-sm leading-relaxed pl-6 border-l-2 border-slate-100 group-hover:border-[#bfa15f]/50 transition-colors">
        {a}
      </div>
    </div>
  );
}
