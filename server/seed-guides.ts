import { db } from "./db";
import { guides, formTemplates } from "@shared/schema";

const COMPONENTS = [
  { id: "engagement_structure", name: "Engagement Structure" },
  { id: "governance_framework", name: "Governance Framework" },
  { id: "facilitation_model", name: "Facilitation Model" },
  { id: "analysis_framework", name: "Analysis Framework" },
  { id: "continuation_strategy", name: "Continuation Strategy" }
];

const STAGES = ["initiation", "engagement", "synthesis", "continuation"];

const GUIDE_CONTENT: Record<string, Record<string, { title: string; summary: string; content: string }>> = {
  engagement_structure: {
    initiation: {
      title: "Program Charter Development",
      summary: "Define program objectives, scope, stakeholder roles, and success metrics.",
      content: `## Program Charter Development Guide

### Overview
The Program Charter establishes the foundation for multi-stakeholder engagement between government, industry, and academia. This document serves as the authoritative reference for program objectives and boundaries.

### Key Elements
1. **Program Objectives** - Clearly articulate what the engagement aims to achieve
2. **Scope Definition** - Define boundaries and deliverables
3. **Stakeholder Identification** - List all participating parties and their roles
4. **Success Metrics** - Establish measurable outcomes

### Prerequisites
- Government sponsor approval
- Preliminary stakeholder interest confirmation
- Budget allocation documentation

### Compliance Considerations
- FAR/DFAR requirements awareness
- OCI (Organizational Conflict of Interest) screening
- Non-disclosure agreement preparation

### Timeline Guidance
Typical initiation phase: 2-4 weeks`
    },
    engagement: {
      title: "Stakeholder Coordination",
      summary: "Establish communication protocols and meeting cadence.",
      content: `## Stakeholder Coordination Guide

### Overview
Active engagement requires structured coordination among all parties while maintaining outcome agnostic facilitation.

### Key Activities
1. **Communication Protocols** - Establish clear channels for information flow
2. **Meeting Cadence** - Define recurring touchpoints (weekly, bi-weekly, monthly)
3. **Working Groups** - Create focused teams for specific deliverables
4. **Progress Tracking** - Implement status reporting mechanisms

### Best Practices
- Use secure, government-approved communication platforms
- Document all decisions and action items
- Maintain stakeholder engagement logs
- Schedule regular check-ins with program sponsor`
    },
    synthesis: {
      title: "Engagement Consolidation",
      summary: "Compile stakeholder inputs and identify consensus areas.",
      content: `## Engagement Consolidation Guide

### Overview
Synthesis brings together diverse stakeholder perspectives into coherent findings and recommendations.

### Process Steps
1. **Input Collection** - Gather all stakeholder contributions
2. **Theme Identification** - Identify common threads and divergent views
3. **Consensus Building** - Facilitate agreement on key points
4. **Documentation** - Create comprehensive synthesis reports

### Deliverables
- Stakeholder input summary
- Consensus areas documentation
- Remaining open items list
- Preliminary recommendations`
    },
    continuation: {
      title: "Engagement Transition Planning",
      summary: "Prepare for program handoff and sustainability.",
      content: `## Engagement Transition Planning Guide

### Overview
Ensure sustainable continuation of engagement outcomes beyond the initial program period.

### Key Elements
1. **Knowledge Transfer** - Document institutional knowledge
2. **Successor Identification** - Identify parties to carry forward initiatives
3. **Resource Planning** - Outline ongoing resource requirements
4. **Sustainability Metrics** - Define long-term success indicators

### Handoff Checklist
- All documentation compiled and accessible
- Key contacts and relationships documented
- Outstanding action items assigned
- Follow-up schedule established`
    }
  },
  governance_framework: {
    initiation: {
      title: "Governance Charter Setup",
      summary: "Establish decision-making authorities and compliance procedures.",
      content: `## Governance Charter Setup Guide

### Overview
The Governance Charter defines how decisions are made, who has authority, and how compliance is maintained.

### Key Components
1. **Decision Rights Matrix** - Who decides what
2. **Escalation Procedures** - How to handle disagreements
3. **Compliance Framework** - Regulatory requirements and controls
4. **Risk Management** - Identification and mitigation strategies

### Government Contracting Considerations
- FAR Part 15 compliance for competitive negotiations
- DFARS requirements for defense contracts
- Small business participation goals
- Cost accounting standards applicability`
    },
    engagement: {
      title: "Governance Execution",
      summary: "Implement governance protocols and monitor compliance.",
      content: `## Governance Execution Guide

### Overview
Active governance ensures decisions are made appropriately and compliance is maintained throughout engagement.

### Activities
1. **Regular Governance Reviews** - Scheduled oversight meetings
2. **Compliance Monitoring** - Ongoing regulatory adherence checks
3. **Issue Resolution** - Address governance challenges promptly
4. **Documentation** - Maintain governance decision logs

### Compliance Checkpoints
- Monthly compliance status reviews
- Quarterly audit preparation
- Annual program reassessment`
    },
    synthesis: {
      title: "Governance Assessment",
      summary: "Evaluate governance effectiveness and identify improvements.",
      content: `## Governance Assessment Guide

### Overview
Assess how well governance structures served the program and identify lessons learned.

### Assessment Areas
1. **Decision Quality** - Were decisions timely and effective?
2. **Compliance Record** - Any issues or near-misses?
3. **Stakeholder Satisfaction** - How did parties perceive governance?
4. **Process Efficiency** - Where were bottlenecks?

### Documentation Requirements
- Governance effectiveness report
- Compliance summary
- Improvement recommendations`
    },
    continuation: {
      title: "Governance Transition",
      summary: "Transfer governance responsibilities and documentation.",
      content: `## Governance Transition Guide

### Overview
Ensure governance continuity through proper handoff and documentation transfer.

### Transition Elements
1. **Authority Transfer** - Formal handoff of decision rights
2. **Documentation Handover** - All governance records transferred
3. **Training** - Successor orientation on governance protocols
4. **Monitoring Transition** - Overlap period for smooth handoff`
    }
  },
  facilitation_model: {
    initiation: {
      title: "Facilitation Framework Design",
      summary: "Design outcome agnostic facilitation approach for multi-stakeholder sessions.",
      content: `## Facilitation Framework Design Guide

### Overview
Establish an outcome agnostic facilitation model that enables productive multi-stakeholder dialogue without predetermined conclusions.

### Core Principles
1. **Outcome Agnostic Stance** - Facilitators remain impartial to outcomes
2. **Inclusive Participation** - All stakeholders have voice
3. **Structured Dialogue** - Clear processes for discussion
4. **Documentation** - Capture all perspectives accurately

### Facilitation Planning
- Define session objectives (process, not outcome)
- Prepare facilitation guides and templates
- Identify potential challenges and mitigation strategies
- Train facilitators on outcome agnostic approach`
    },
    engagement: {
      title: "Active Facilitation",
      summary: "Conduct facilitated sessions maintaining outcome agnostic stance.",
      content: `## Active Facilitation Guide

### Overview
Execute facilitation sessions that bring together diverse perspectives while maintaining impartiality.

### Session Types
1. **Discovery Sessions** - Explore stakeholder needs and constraints
2. **Working Sessions** - Collaborative problem-solving
3. **Review Sessions** - Validate findings and recommendations
4. **Decision Sessions** - Structured decision-making processes

### Facilitator Best Practices
- Use neutral language
- Ensure balanced participation
- Capture all viewpoints accurately
- Manage time effectively
- Document action items clearly`
    },
    synthesis: {
      title: "Facilitation Outcomes Review",
      summary: "Compile and synthesize facilitated session outcomes.",
      content: `## Facilitation Outcomes Review Guide

### Overview
Consolidate outputs from all facilitated sessions into coherent findings.

### Synthesis Process
1. **Session Summary Review** - Compile all session outputs
2. **Theme Analysis** - Identify patterns across sessions
3. **Stakeholder Validation** - Confirm accuracy of captured perspectives
4. **Findings Documentation** - Create comprehensive facilitation report`
    },
    continuation: {
      title: "Facilitation Knowledge Transfer",
      summary: "Document facilitation methods and lessons for future engagements.",
      content: `## Facilitation Knowledge Transfer Guide

### Overview
Preserve facilitation knowledge and methods for future multi-stakeholder engagements.

### Knowledge Transfer Elements
1. **Method Documentation** - What worked, what didn't
2. **Template Library** - Reusable facilitation tools
3. **Lessons Learned** - Insights for future facilitators
4. **Best Practices** - Proven approaches for outcome agnostic facilitation`
    }
  },
  analysis_framework: {
    initiation: {
      title: "Analysis Methodology Setup",
      summary: "Define analytical approaches for policy context and gap assessment.",
      content: `## Analysis Methodology Setup Guide

### Overview
Establish rigorous analytical frameworks for examining policy contexts, identifying gaps, and developing recommendations.

### Analysis Types
1. **Policy Context Analysis** - Current regulatory landscape
2. **Gap Assessment** - Identify shortfalls and opportunities
3. **Comparative Analysis** - Benchmark against similar programs
4. **Impact Analysis** - Assess potential outcomes of recommendations

### Data Requirements
- Identify data sources
- Establish data access protocols
- Define data handling procedures
- Plan for data security and privacy`
    },
    engagement: {
      title: "Active Analysis",
      summary: "Conduct analytical work and gather supporting data.",
      content: `## Active Analysis Guide

### Overview
Execute analytical work plans while engaging stakeholders for input and validation.

### Analysis Activities
1. **Data Collection** - Gather relevant information
2. **Stakeholder Interviews** - Collect qualitative insights
3. **Document Review** - Analyze existing materials
4. **Preliminary Findings** - Develop initial conclusions

### Quality Assurance
- Cross-validate findings with multiple sources
- Seek stakeholder input on interpretations
- Document analytical assumptions`
    },
    synthesis: {
      title: "Analysis Integration",
      summary: "Integrate analytical findings into actionable recommendations.",
      content: `## Analysis Integration Guide

### Overview
Synthesize all analytical work into coherent, actionable recommendations.

### Integration Process
1. **Findings Consolidation** - Bring together all analytical outputs
2. **Recommendation Development** - Create actionable proposals
3. **Impact Assessment** - Evaluate recommendation implications
4. **Stakeholder Review** - Validate recommendations with key parties

### Deliverables
- Comprehensive analysis report
- Executive summary
- Recommendation matrix
- Implementation roadmap`
    },
    continuation: {
      title: "Analysis Handoff",
      summary: "Transfer analytical products and methodologies.",
      content: `## Analysis Handoff Guide

### Overview
Ensure analytical products and knowledge are properly transferred for continued use.

### Handoff Elements
1. **Report Archive** - All analytical documents compiled
2. **Data Package** - Source data with documentation
3. **Methodology Guide** - How analysis was conducted
4. **Update Procedures** - How to refresh analysis over time`
    }
  },
  continuation_strategy: {
    initiation: {
      title: "Continuation Planning Framework",
      summary: "Establish framework for sustainable program continuation.",
      content: `## Continuation Planning Framework Guide

### Overview
From day one, plan for what happens after the current engagement period ends.

### Planning Elements
1. **Sustainability Assessment** - What's needed for continuation?
2. **Resource Planning** - Ongoing requirements identification
3. **Transition Timeline** - When and how handoffs occur
4. **Success Metrics** - Long-term outcome indicators

### Key Questions
- Who will own ongoing activities?
- What resources are required?
- How will progress be measured?
- What are the risks to sustainability?`
    },
    engagement: {
      title: "Continuation Preparation",
      summary: "Build capabilities and relationships for sustainable continuation.",
      content: `## Continuation Preparation Guide

### Overview
Throughout engagement, actively prepare for sustainable continuation.

### Preparation Activities
1. **Capability Building** - Develop successor skills
2. **Relationship Cultivation** - Strengthen key partnerships
3. **Resource Securing** - Identify ongoing funding/support
4. **Documentation** - Create reusable knowledge assets

### Stakeholder Engagement
- Identify continuation champions
- Secure commitments for ongoing participation
- Address sustainability concerns early`
    },
    synthesis: {
      title: "Continuation Assessment",
      summary: "Evaluate readiness for sustainable continuation.",
      content: `## Continuation Assessment Guide

### Overview
Assess whether all elements are in place for successful program continuation.

### Assessment Criteria
1. **Leadership Continuity** - Successor identification complete?
2. **Resource Availability** - Funding and support secured?
3. **Knowledge Transfer** - Documentation complete?
4. **Stakeholder Commitment** - Ongoing participation confirmed?

### Gap Remediation
- Identify continuation gaps
- Develop remediation plans
- Execute before transition`
    },
    continuation: {
      title: "Transition Execution",
      summary: "Execute transition plan and confirm sustainability.",
      content: `## Transition Execution Guide

### Overview
Execute the final transition to ensure sustainable program continuation.

### Execution Steps
1. **Formal Handoff** - Transfer responsibilities officially
2. **Knowledge Transfer Sessions** - Final training and orientation
3. **Documentation Delivery** - All materials transferred
4. **Monitoring Setup** - Post-transition oversight established

### Success Confirmation
- Verify all transition checklist items complete
- Confirm successor readiness
- Establish follow-up schedule
- Document lessons learned`
    }
  }
};

const FORM_TEMPLATES: Record<string, Record<string, { title: string; description: string; schema: object }>> = {
  engagement_structure: {
    initiation: {
      title: "Program Charter Form",
      description: "Complete this form to establish your program charter.",
      schema: {
        fields: [
          { id: "program_name", type: "text", label: "Program Name", required: true },
          { id: "program_objectives", type: "textarea", label: "Program Objectives", required: true, placeholder: "List the primary objectives of this engagement..." },
          { id: "scope_definition", type: "textarea", label: "Scope Definition", required: true },
          { id: "government_sponsor", type: "text", label: "Government Sponsor", required: true },
          { id: "industry_partners", type: "textarea", label: "Industry Partners", placeholder: "List participating industry organizations..." },
          { id: "academic_partners", type: "textarea", label: "Academic Partners", placeholder: "List participating academic institutions..." },
          { id: "timeline_start", type: "date", label: "Engagement Start Date", required: true },
          { id: "timeline_end", type: "date", label: "Expected End Date", required: true },
          { id: "success_metrics", type: "textarea", label: "Success Metrics", required: true },
          { id: "budget_range", type: "select", label: "Budget Range", options: ["Under $100K", "$100K-$500K", "$500K-$1M", "Over $1M"] }
        ]
      }
    },
    engagement: {
      title: "Stakeholder Coordination Checklist",
      description: "Track coordination activities with stakeholders.",
      schema: {
        fields: [
          { id: "communication_protocol", type: "select", label: "Primary Communication Platform", options: ["Government Email", "Teams/Slack", "Secure Portal", "Other"], required: true },
          { id: "meeting_frequency", type: "select", label: "Meeting Cadence", options: ["Weekly", "Bi-weekly", "Monthly"], required: true },
          { id: "working_groups_established", type: "checkbox", label: "Working groups established" },
          { id: "progress_tracking_implemented", type: "checkbox", label: "Progress tracking implemented" },
          { id: "stakeholder_engagement_log", type: "checkbox", label: "Stakeholder engagement log maintained" },
          { id: "notes", type: "textarea", label: "Coordination Notes" }
        ]
      }
    },
    synthesis: {
      title: "Engagement Consolidation Form",
      description: "Document synthesis of stakeholder inputs.",
      schema: {
        fields: [
          { id: "key_themes", type: "textarea", label: "Key Themes Identified", required: true },
          { id: "consensus_areas", type: "textarea", label: "Areas of Consensus", required: true },
          { id: "divergent_views", type: "textarea", label: "Divergent Views" },
          { id: "open_items", type: "textarea", label: "Remaining Open Items" },
          { id: "preliminary_recommendations", type: "textarea", label: "Preliminary Recommendations", required: true }
        ]
      }
    },
    continuation: {
      title: "Transition Readiness Checklist",
      description: "Confirm readiness for program transition.",
      schema: {
        fields: [
          { id: "documentation_complete", type: "checkbox", label: "All documentation compiled and accessible" },
          { id: "contacts_documented", type: "checkbox", label: "Key contacts and relationships documented" },
          { id: "actions_assigned", type: "checkbox", label: "Outstanding action items assigned" },
          { id: "successor_identified", type: "checkbox", label: "Successor organization/individual identified" },
          { id: "followup_scheduled", type: "checkbox", label: "Follow-up schedule established" },
          { id: "transition_notes", type: "textarea", label: "Transition Notes" }
        ]
      }
    }
  }
};

async function seedGuides() {
  console.log("Seeding guides and form templates...");
  
  const existingGuides = await db.select().from(guides);
  if (existingGuides.length > 0) {
    console.log("Guides already exist, skipping seed.");
    return;
  }

  let guideCount = 0;
  let templateCount = 0;

  for (const component of COMPONENTS) {
    for (const stage of STAGES) {
      const guideData = GUIDE_CONTENT[component.id]?.[stage];
      if (guideData) {
        await db.insert(guides).values({
          componentId: component.id,
          stage,
          title: guideData.title,
          summary: guideData.summary,
          content: guideData.content,
          roleVisibility: JSON.stringify(["industry_partner", "academia", "government_compliance_officer", "admin"]),
          orderIndex: guideCount,
          isActive: true
        });
        guideCount++;
      }

      const templateData = FORM_TEMPLATES[component.id]?.[stage];
      if (templateData) {
        await db.insert(formTemplates).values({
          componentId: component.id,
          stage,
          title: templateData.title,
          description: templateData.description,
          formSchema: JSON.stringify(templateData.schema),
          roleVisibility: JSON.stringify(["industry_partner", "academia"]),
          orderIndex: templateCount,
          isActive: true
        });
        templateCount++;
      }
    }
  }

  console.log(`Seeded ${guideCount} guides and ${templateCount} form templates.`);
}

seedGuides()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  });
