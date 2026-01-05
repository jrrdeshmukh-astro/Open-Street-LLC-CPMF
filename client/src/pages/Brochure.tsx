import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Printer, Shield, Globe, Zap, FileText, CheckCircle2 } from "lucide-react";
import Logo from "@assets/logo_1767656771540.png";

export default function Brochure() {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-100 print:bg-white text-slate-900 font-sans">
      {/* Print Button - Hidden when printing */}
      <div className="fixed bottom-8 right-8 z-50 no-print animate-in fade-in slide-in-from-bottom-4 duration-500">
        <Button 
          onClick={handlePrint} 
          size="lg" 
          className="shadow-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-full px-8 py-6 h-auto flex items-center gap-3 transition-all hover:scale-105"
        >
          <Printer className="w-5 h-5" />
          Print Trifold PDF
        </Button>
        <div className="mt-2 text-center text-xs text-muted-foreground bg-white/80 backdrop-blur px-2 py-1 rounded shadow-sm">
          Select "Landscape" & "None" for Margins
        </div>
      </div>

      {/* 
        TRIFOLD LAYOUT STRUCTURE
        A standard trifold brochure has 2 sides:
        Side 1 (Outside): [ Inside Flap ] [ Back Cover ] [ Front Cover ]
        Side 2 (Inside):  [ Left Panel  ] [ Center Panel ] [ Right Panel ]
      */}

      {/* --- PAGE 1: OUTSIDE (Front, Back, Flap) --- */}
      {/* On screen, we limit width to A4 landscape equivalent approx 1122px */}
      <div className="print-page w-[297mm] h-[210mm] mx-auto bg-white shadow-2xl print:shadow-none grid grid-cols-3 mb-8 print:mb-0 overflow-hidden relative">
        
        {/* PANEL 1 (Left): Inside Flap (Folded In) */}
        <div className="border-r border-dashed border-slate-200 p-8 flex flex-col justify-center bg-slate-50 relative">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary/20 to-primary/5"></div>
          
          <div className="mb-6">
            <h3 className="text-xl font-serif font-bold text-primary mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#bfa15f]" />
              Strategic Value
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed mb-4">
              <strong>Why Participate?</strong><br/>
              It provides a "neutral ground" to understand complex requirements. Using our codified framework, we eliminate ambiguity, offering a structured environment where engagement rules are clear.
            </p>
          </div>

          <div className="space-y-4">
             <h4 className="text-sm font-bold text-primary uppercase tracking-wider">Target Benefits</h4>
             <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-100">
                <p className="text-xs font-bold text-[#bfa15f] mb-1">FOR INTERNATIONAL FIRMS</p>
                <p className="text-xs text-slate-600">Compliant pathway to understand regional landscapes (e.g., U.S.-India corridor) without violating non-solicitation rules.</p>
             </div>
             <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-100">
                <p className="text-xs font-bold text-[#bfa15f] mb-1">FOR INDIAN FIRMS</p>
                <p className="text-xs text-slate-600">Structured platform to interface with global leaders, bridging the gap between indigenous innovation and international standards.</p>
             </div>
          </div>
        </div>

        {/* PANEL 2 (Center): Back Cover */}
        <div className="border-r border-dashed border-slate-200 p-8 flex flex-col justify-between bg-primary text-white relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
          
          <div className="relative z-10 pt-12">
            <h3 className="text-xl font-serif font-bold text-[#bfa15f] mb-6">Compliance & Integrity</h3>
            <p className="text-sm text-slate-300 mb-6 leading-relaxed">
              <strong>Open Street LLC operates as a neutral facilitator.</strong>
            </p>
            <p className="text-xs text-slate-400 leading-relaxed">
              Participation is informational only and does not imply endorsement, obligation, or contractual commitment from any government or academic entity. Every interaction is auditable and documented to protect your team.
            </p>
          </div>

          <div className="relative z-10 text-center border-t border-white/10 pt-8">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
                 <Globe className="w-6 h-6 text-[#bfa15f]" />
              </div>
            </div>
            <h4 className="text-lg font-bold mb-1">Open Street LLC</h4>
            <p className="text-xs text-[#bfa15f] uppercase tracking-widest mb-4">ESTD. 2020</p>
            <p className="text-xs text-slate-400">
              www.openstreet.quest<br/>
              +1(908)848-1562
            </p>
          </div>
        </div>

        {/* PANEL 3 (Right): Front Cover */}
        <div className="p-12 flex flex-col items-center justify-center text-center bg-white relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#bfa15f]/10 rounded-bl-full"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/5 rounded-tr-full"></div>
          
          <img 
            src={Logo} 
            alt="Open Street LLC Logo" 
            className="w-48 h-48 object-contain mb-8 relative z-10 drop-shadow-md rounded-full"
          />
          
          <div className="relative z-10">
            <h1 className="text-3xl font-serif font-bold text-primary mb-4 leading-tight">
              Codified Program Management Framework
            </h1>
            <div className="w-16 h-1 bg-[#bfa15f] mx-auto mb-6"></div>
            <p className="text-lg text-slate-600 font-light">
              Strategic Engagement for the Government-Industry-Academia Ecosystem
            </p>
          </div>
        </div>

      </div>

      {/* --- PAGE 2: INSIDE (Content Panels) --- */}
      <div className="print-page w-[297mm] h-[210mm] mx-auto bg-white shadow-2xl print:shadow-none grid grid-cols-3 overflow-hidden">
        
        {/* PANEL 4 (Left): Operational Benefits */}
        <div className="border-r border-dashed border-slate-200 p-8 bg-white">
           <div className="flex items-center gap-3 mb-6">
              <div className="bg-[#bfa15f]/10 p-2 rounded-lg">
                <FileText className="w-5 h-5 text-[#bfa15f]" />
              </div>
              <h3 className="text-xl font-serif font-bold text-primary">Operational Benefits</h3>
            </div>

            <div className="space-y-8">
              <div>
                <h4 className="font-bold text-slate-800 mb-2 text-sm">Codified Compliance</h4>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Every interaction is <strong>auditable and documented</strong>. Our framework includes explicit <em>Rules of Engagement</em> and <em>Moderator Scripts</em> that prevent out-of-scope discussions (like sales pitches), protecting you from legal risks of ad-hoc meetings.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 mb-2 text-sm">IP Protection</h4>
                <p className="text-sm text-slate-600 leading-relaxed">
                  We use <strong>Non-Attributable Insight Capture</strong>. We synthesize high-level themes rather than capturing your proprietary "secret sauce." We facilitate flow, we don't own your IP.
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded border border-slate-100 mt-4">
                 <div className="flex gap-2 items-start">
                    <CheckCircle2 className="w-4 h-4 text-[#bfa15f] mt-0.5 shrink-0" />
                    <p className="text-xs text-slate-500 italic">"Focus on sharing expertise rather than navigating bureaucracy."</p>
                 </div>
              </div>
            </div>
        </div>

        {/* PANEL 5 (Center): Engagement & Outcomes */}
        <div className="border-r border-dashed border-slate-200 p-8 bg-white relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-primary/10"></div>
            
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-[#bfa15f]/10 p-2 rounded-lg">
                <Zap className="w-5 h-5 text-[#bfa15f]" />
              </div>
              <h3 className="text-xl font-serif font-bold text-primary">Outcomes</h3>
            </div>

            <div className="space-y-6">
              <div className="prose prose-sm">
                <h4 className="text-primary font-bold text-sm mb-1">Does this guarantee a contract?</h4>
                <p className="text-slate-600 text-sm mb-4">
                  <span className="font-bold text-destructive">No.</span> Open Street is outcome-agnostic. We manage the <em>process</em>, not the <em>results</em>. However, you gain critical intelligence on the ecosystem's strategic direction.
                </p>

                <h4 className="text-primary font-bold text-sm mb-1">Durable Value</h4>
                <p className="text-slate-600 text-sm mb-4">
                  Our programs produce <strong>Synthesis Reports</strong>—documented artifacts summarizing collective insights and gaps. These serve as roadmaps for your internal R&D.
                </p>

                <h4 className="text-primary font-bold text-sm mb-1">Internal Adoption</h4>
                <p className="text-slate-600 text-sm">
                  Organizations can license the CPMF to govern their own internal cross-functional groups with the same discipline.
                </p>
              </div>
            </div>
        </div>

        {/* PANEL 6 (Right): Summary Table */}
        <div className="p-8 bg-slate-50">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-[#bfa15f]/10 p-2 rounded-lg">
                <Globe className="w-5 h-5 text-[#bfa15f]" />
              </div>
              <h3 className="text-xl font-serif font-bold text-primary">Benefits Summary</h3>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden text-[10px]">
              <Table>
                <TableHeader className="bg-primary">
                  <TableRow className="hover:bg-primary">
                    <TableHead className="text-white font-bold h-8">Benefit</TableHead>
                    <TableHead className="text-white font-bold h-8">Indian Firms</TableHead>
                    <TableHead className="text-white font-bold h-8">Intl. Firms</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-bold text-primary py-2">Market Intel</TableCell>
                    <TableCell className="py-2 text-slate-500">Global standards</TableCell>
                    <TableCell className="py-2 text-slate-500">Local insights</TableCell>
                  </TableRow>
                  <TableRow className="bg-slate-50">
                    <TableCell className="font-bold text-primary py-2">Risk Check</TableCell>
                    <TableCell className="py-2 text-slate-500">Clear guardrails</TableCell>
                    <TableCell className="py-2 text-slate-500">Non-advocacy</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-bold text-primary py-2">Visibility</TableCell>
                    <TableCell className="py-2 text-slate-500">Showcase skill</TableCell>
                    <TableCell className="py-2 text-slate-500">Connect to hubs</TableCell>
                  </TableRow>
                  <TableRow className="bg-slate-50">
                    <TableCell className="font-bold text-primary py-2">Efficiency</TableCell>
                    <TableCell className="py-2 text-slate-500">Fast synthesis</TableCell>
                    <TableCell className="py-2 text-slate-500">Repeatable entry</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>

            <div className="mt-8 p-4 bg-[#bfa15f]/10 rounded border border-[#bfa15f]/20">
              <h5 className="font-bold text-primary text-sm mb-1">Key Takeaway</h5>
              <p className="text-xs text-slate-700 italic">
                "A Codified Framework transforms chaotic networking into structured, compliant, and actionable intelligence."
              </p>
            </div>
        </div>

      </div>
    </div>
  );
}
