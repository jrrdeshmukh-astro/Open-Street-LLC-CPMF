import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Download, ZoomIn, ZoomOut, FileText, Shield, Globe, Zap, CheckCircle2 } from "lucide-react";
import Logo from "@assets/logo_1767656771540.png";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function Brochure() {
  const [zoom, setZoom] = useState(0.6);
  const [isExporting, setIsExporting] = useState(false);
  const page1Ref = useRef<HTMLDivElement>(null);
  const page2Ref = useRef<HTMLDivElement>(null);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.1, 1.5));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.1, 0.3));

  const handleExport = async () => {
    if (!page1Ref.current || !page2Ref.current) return;
    
    setIsExporting(true);
    
    try {
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      const captureOptions = {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      };

      const canvas1 = await html2canvas(page1Ref.current, captureOptions);
      const imgData1 = canvas1.toDataURL('image/png');
      pdf.addImage(imgData1, 'PNG', 0, 0, 297, 210);

      pdf.addPage();

      const canvas2 = await html2canvas(page2Ref.current, captureOptions);
      const imgData2 = canvas2.toDataURL('image/png');
      pdf.addImage(imgData2, 'PNG', 0, 0, 297, 210);

      pdf.save('Open_Street_CPMF_Brochure.pdf');
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-800 flex flex-col">
      {/* PDF Viewer Toolbar */}
      <div className="bg-slate-900 border-b border-slate-700 px-6 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="bg-slate-700 p-2 rounded">
            <FileText className="w-5 h-5 text-slate-300" />
          </div>
          <div>
            <h1 className="text-white font-medium text-sm">Open_Street_CPMF_Brochure.pdf</h1>
            <p className="text-slate-400 text-xs">2 pages</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleZoomOut}
            className="text-slate-300 hover:text-white hover:bg-slate-700"
            data-testid="button-zoom-out"
          >
            <ZoomOut className="w-4 h-4" />
          </Button>
          <span className="text-slate-300 text-sm min-w-[60px] text-center">
            {Math.round(zoom * 100)}%
          </span>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleZoomIn}
            className="text-slate-300 hover:text-white hover:bg-slate-700"
            data-testid="button-zoom-in"
          >
            <ZoomIn className="w-4 h-4" />
          </Button>
        </div>

        <Button 
          onClick={handleExport}
          disabled={isExporting}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4"
          data-testid="button-export-pdf"
        >
          <Download className="w-4 h-4 mr-2" />
          {isExporting ? 'Exporting...' : 'Export PDF'}
        </Button>
      </div>

      {/* PDF Viewer Content */}
      <div className="flex-1 overflow-auto p-8 flex flex-col items-center gap-8">
        
        {/* Page 1 */}
        <div className="relative">
          <div className="absolute -top-6 left-0 text-slate-500 text-xs">Page 1 of 2</div>
          <div 
            style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }}
            className="transition-transform duration-200"
          >
            <div 
              ref={page1Ref}
              className="w-[297mm] h-[210mm] bg-white shadow-2xl grid grid-cols-3 overflow-hidden"
              style={{ minWidth: '297mm', minHeight: '210mm' }}
            >
              {/* PANEL 1 (Left): Inside Flap */}
              <div className="border-r border-dashed border-slate-200 p-8 flex flex-col justify-center bg-slate-50 relative">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#1a2744]/20 to-[#1a2744]/5"></div>
                
                <div className="mb-6">
                  <h3 className="text-xl font-serif font-bold text-[#1a2744] mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-[#bfa15f]" />
                    Strategic Value
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed mb-4">
                    <strong>Why Participate?</strong><br/>
                    It provides a "neutral ground" to understand complex requirements. Using our codified framework, we eliminate ambiguity, offering a structured environment where engagement rules are clear.
                  </p>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-[#1a2744] uppercase tracking-wider">Target Benefits</h4>
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
              <div className="border-r border-dashed border-slate-200 p-8 flex flex-col justify-between bg-[#1a2744] text-white relative overflow-hidden">
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
                
                <div className="relative z-10 pt-12">
                  <h3 className="text-xl font-serif font-bold text-[#bfa15f] mb-6">Compliance & Integrity</h3>
                  <p className="text-sm text-slate-300 mb-6 leading-relaxed">
                    <strong>Open Street LLC operates as an outcome agnostic facilitator.</strong>
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
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#1a2744]/5 rounded-tr-full"></div>
                
                <img 
                  src={Logo} 
                  alt="Open Street LLC Logo" 
                  className="w-48 h-48 object-contain mb-8 relative z-10 drop-shadow-md rounded-full"
                />
                
                <div className="relative z-10">
                  <h1 className="text-3xl font-serif font-bold text-[#1a2744] mb-4 leading-tight">
                    Codified Program Management Framework
                  </h1>
                  <div className="w-16 h-1 bg-[#bfa15f] mx-auto mb-6"></div>
                  <p className="text-lg text-slate-600 font-light">
                    Strategic Engagement for the Government-Industry-Academia Ecosystem
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Page 2 */}
        <div className="relative">
          <div className="absolute -top-6 left-0 text-slate-500 text-xs">Page 2 of 2</div>
          <div 
            style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }}
            className="transition-transform duration-200"
          >
            <div 
              ref={page2Ref}
              className="w-[297mm] h-[210mm] bg-white shadow-2xl grid grid-cols-3 overflow-hidden"
              style={{ minWidth: '297mm', minHeight: '210mm' }}
            >
              {/* PANEL 4 (Left): Operational Benefits */}
              <div className="border-r border-dashed border-slate-200 p-8 bg-white">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-[#bfa15f]/10 p-2 rounded-lg">
                    <FileText className="w-5 h-5 text-[#bfa15f]" />
                  </div>
                  <h3 className="text-xl font-serif font-bold text-[#1a2744]">Operational Benefits</h3>
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
                <div className="absolute top-0 left-0 w-full h-1 bg-[#1a2744]/10"></div>
                
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-[#bfa15f]/10 p-2 rounded-lg">
                    <Zap className="w-5 h-5 text-[#bfa15f]" />
                  </div>
                  <h3 className="text-xl font-serif font-bold text-[#1a2744]">Outcomes</h3>
                </div>

                <div className="space-y-6">
                  <div className="prose prose-sm">
                    <h4 className="text-[#1a2744] font-bold text-sm mb-1">Does this guarantee a contract?</h4>
                    <p className="text-slate-600 text-sm mb-4">
                      <span className="font-bold text-red-600">No.</span> Open Street is outcome-agnostic. We manage the <em>process</em>, not the <em>results</em>. However, you gain critical intelligence on the ecosystem's strategic direction.
                    </p>

                    <h4 className="text-[#1a2744] font-bold text-sm mb-1">Durable Value</h4>
                    <p className="text-slate-600 text-sm mb-4">
                      Our programs produce <strong>Synthesis Reports</strong>—documented artifacts summarizing collective insights and gaps. These serve as roadmaps for your internal R&D.
                    </p>

                    <h4 className="text-[#1a2744] font-bold text-sm mb-1">Internal Adoption</h4>
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
                  <h3 className="text-xl font-serif font-bold text-[#1a2744]">Benefits Summary</h3>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden text-[10px]">
                  <Table>
                    <TableHeader className="bg-[#1a2744]">
                      <TableRow className="hover:bg-[#1a2744]">
                        <TableHead className="text-white font-bold h-8">Benefit</TableHead>
                        <TableHead className="text-white font-bold h-8">Indian Firms</TableHead>
                        <TableHead className="text-white font-bold h-8">Intl. Firms</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-bold text-[#1a2744] py-2">Market Intel</TableCell>
                        <TableCell className="py-2 text-slate-500">Global standards</TableCell>
                        <TableCell className="py-2 text-slate-500">Local insights</TableCell>
                      </TableRow>
                      <TableRow className="bg-slate-50">
                        <TableCell className="font-bold text-[#1a2744] py-2">Risk Check</TableCell>
                        <TableCell className="py-2 text-slate-500">Clear guardrails</TableCell>
                        <TableCell className="py-2 text-slate-500">Non-advocacy</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-bold text-[#1a2744] py-2">Visibility</TableCell>
                        <TableCell className="py-2 text-slate-500">Showcase skill</TableCell>
                        <TableCell className="py-2 text-slate-500">Connect to hubs</TableCell>
                      </TableRow>
                      <TableRow className="bg-slate-50">
                        <TableCell className="font-bold text-[#1a2744] py-2">Efficiency</TableCell>
                        <TableCell className="py-2 text-slate-500">Fast synthesis</TableCell>
                        <TableCell className="py-2 text-slate-500">Repeatable entry</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>

                <div className="mt-8 p-4 bg-[#bfa15f]/10 rounded border border-[#bfa15f]/20">
                  <h5 className="font-bold text-[#1a2744] text-sm mb-1">Key Takeaway</h5>
                  <p className="text-xs text-slate-700 italic">
                    "A Codified Framework transforms chaotic networking into structured, compliant, and actionable intelligence."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom spacing */}
        <div className="h-8"></div>
      </div>
    </div>
  );
}
