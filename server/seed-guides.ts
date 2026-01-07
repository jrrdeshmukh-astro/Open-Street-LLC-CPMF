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
  },
  governance_framework: {
    initiation: {
      title: "Governance Charter Form",
      description: "Establish the governance structure for your program.",
      schema: {
        fields: [
          { id: "governance_model", type: "select", label: "Governance Model", options: ["Hierarchical", "Collaborative", "Federated", "Matrix"], required: true },
          { id: "decision_authority", type: "textarea", label: "Decision Authority Matrix", required: true, placeholder: "Define who has authority over what decisions..." },
          { id: "escalation_process", type: "textarea", label: "Escalation Process", required: true, placeholder: "Describe how issues are escalated..." },
          { id: "compliance_requirements", type: "textarea", label: "Compliance Requirements", required: true, placeholder: "List applicable regulations (FAR, DFARS, etc.)..." },
          { id: "risk_tolerance", type: "select", label: "Risk Tolerance Level", options: ["Low", "Medium", "High"], required: true },
          { id: "audit_frequency", type: "select", label: "Audit Frequency", options: ["Monthly", "Quarterly", "Semi-annually", "Annually"] },
          { id: "governance_lead", type: "text", label: "Governance Lead Name", required: true },
          { id: "governance_committee", type: "textarea", label: "Governance Committee Members", placeholder: "List committee members and their roles..." }
        ]
      }
    },
    engagement: {
      title: "Compliance Monitoring Checklist",
      description: "Track ongoing compliance and governance activities.",
      schema: {
        fields: [
          { id: "review_date", type: "date", label: "Review Date", required: true },
          { id: "far_compliance", type: "checkbox", label: "FAR compliance verified" },
          { id: "dfars_compliance", type: "checkbox", label: "DFARS compliance verified (if applicable)" },
          { id: "oci_review", type: "checkbox", label: "OCI screening completed" },
          { id: "small_business_goals", type: "checkbox", label: "Small business participation on track" },
          { id: "cost_accounting_compliant", type: "checkbox", label: "Cost accounting standards met" },
          { id: "decisions_documented", type: "checkbox", label: "All governance decisions documented" },
          { id: "issues_identified", type: "textarea", label: "Issues Identified", placeholder: "Describe any compliance issues..." },
          { id: "corrective_actions", type: "textarea", label: "Corrective Actions Taken" },
          { id: "next_review_date", type: "date", label: "Next Review Date" }
        ]
      }
    },
    synthesis: {
      title: "Governance Effectiveness Assessment",
      description: "Evaluate how well governance structures served the program.",
      schema: {
        fields: [
          { id: "decision_timeliness", type: "select", label: "Decision Timeliness", options: ["Excellent", "Good", "Adequate", "Needs Improvement"], required: true },
          { id: "stakeholder_satisfaction", type: "select", label: "Stakeholder Satisfaction with Governance", options: ["Very Satisfied", "Satisfied", "Neutral", "Dissatisfied"], required: true },
          { id: "compliance_issues_count", type: "text", label: "Number of Compliance Issues", required: true },
          { id: "escalations_count", type: "text", label: "Number of Escalations Required" },
          { id: "process_bottlenecks", type: "textarea", label: "Process Bottlenecks Identified", required: true },
          { id: "governance_strengths", type: "textarea", label: "Governance Strengths" },
          { id: "improvement_recommendations", type: "textarea", label: "Improvement Recommendations", required: true },
          { id: "lessons_learned", type: "textarea", label: "Lessons Learned" }
        ]
      }
    },
    continuation: {
      title: "Governance Transition Checklist",
      description: "Transfer governance responsibilities and documentation.",
      schema: {
        fields: [
          { id: "successor_governance_lead", type: "text", label: "Successor Governance Lead", required: true },
          { id: "authority_transferred", type: "checkbox", label: "Decision authority formally transferred" },
          { id: "governance_docs_transferred", type: "checkbox", label: "All governance documentation transferred" },
          { id: "compliance_records_archived", type: "checkbox", label: "Compliance records properly archived" },
          { id: "successor_trained", type: "checkbox", label: "Successor trained on governance protocols" },
          { id: "outstanding_issues_documented", type: "checkbox", label: "Outstanding issues documented and assigned" },
          { id: "transition_overlap_period", type: "select", label: "Transition Overlap Period", options: ["1 week", "2 weeks", "1 month", "2 months"] },
          { id: "handoff_notes", type: "textarea", label: "Handoff Notes" }
        ]
      }
    }
  },
  facilitation_model: {
    initiation: {
      title: "Facilitation Planning Form",
      description: "Design your outcome agnostic facilitation approach.",
      schema: {
        fields: [
          { id: "facilitation_approach", type: "select", label: "Primary Facilitation Approach", options: ["Structured Dialogue", "Open Forum", "Design Thinking", "Consensus Building", "Hybrid"], required: true },
          { id: "facilitator_name", type: "text", label: "Lead Facilitator", required: true },
          { id: "facilitator_credentials", type: "textarea", label: "Facilitator Qualifications", placeholder: "List relevant certifications and experience..." },
          { id: "session_objectives", type: "textarea", label: "Session Objectives (Process-focused)", required: true, placeholder: "Describe what the facilitation process aims to achieve..." },
          { id: "stakeholder_groups", type: "textarea", label: "Stakeholder Groups to Engage", required: true },
          { id: "potential_challenges", type: "textarea", label: "Potential Facilitation Challenges", placeholder: "Identify possible obstacles..." },
          { id: "mitigation_strategies", type: "textarea", label: "Challenge Mitigation Strategies" },
          { id: "outcome_agnostic_commitment", type: "checkbox", label: "Facilitator commits to outcome agnostic stance" },
          { id: "documentation_method", type: "select", label: "Documentation Method", options: ["Real-time notes", "Audio recording", "Video recording", "Combination"], required: true }
        ]
      }
    },
    engagement: {
      title: "Session Planning Template",
      description: "Plan individual facilitated sessions.",
      schema: {
        fields: [
          { id: "session_type", type: "select", label: "Session Type", options: ["Discovery", "Working Session", "Review", "Decision", "Brainstorming", "Validation"], required: true },
          { id: "session_date", type: "date", label: "Session Date", required: true },
          { id: "session_duration", type: "select", label: "Session Duration", options: ["1 hour", "2 hours", "Half day", "Full day"], required: true },
          { id: "attendees", type: "textarea", label: "Expected Attendees", required: true },
          { id: "agenda", type: "textarea", label: "Session Agenda", required: true, placeholder: "List agenda items with time allocations..." },
          { id: "materials_needed", type: "textarea", label: "Materials/Tools Needed", placeholder: "Whiteboard, sticky notes, virtual tools, etc." },
          { id: "ground_rules", type: "textarea", label: "Ground Rules", placeholder: "Respectful dialogue, equal participation, etc." },
          { id: "expected_outputs", type: "textarea", label: "Expected Session Outputs" },
          { id: "backup_facilitator", type: "text", label: "Backup Facilitator" }
        ]
      }
    },
    synthesis: {
      title: "Session Outcomes Summary",
      description: "Document outcomes from facilitated sessions.",
      schema: {
        fields: [
          { id: "session_date_completed", type: "date", label: "Session Date", required: true },
          { id: "attendance_count", type: "text", label: "Number of Attendees", required: true },
          { id: "key_discussion_points", type: "textarea", label: "Key Discussion Points", required: true },
          { id: "agreements_reached", type: "textarea", label: "Agreements Reached" },
          { id: "disagreements_noted", type: "textarea", label: "Areas of Disagreement" },
          { id: "action_items", type: "textarea", label: "Action Items Generated", required: true, placeholder: "List action items with owners and due dates..." },
          { id: "parking_lot_items", type: "textarea", label: "Parking Lot Items", placeholder: "Topics to address later..." },
          { id: "participant_feedback", type: "select", label: "Overall Participant Feedback", options: ["Very Positive", "Positive", "Mixed", "Negative"], required: true },
          { id: "facilitator_observations", type: "textarea", label: "Facilitator Observations" },
          { id: "followup_needed", type: "checkbox", label: "Follow-up session needed" }
        ]
      }
    },
    continuation: {
      title: "Facilitation Knowledge Transfer",
      description: "Document facilitation methods and lessons for future use.",
      schema: {
        fields: [
          { id: "effective_techniques", type: "textarea", label: "Most Effective Facilitation Techniques", required: true },
          { id: "ineffective_approaches", type: "textarea", label: "Approaches That Didn't Work" },
          { id: "stakeholder_dynamics", type: "textarea", label: "Stakeholder Dynamics Observed", required: true },
          { id: "cultural_considerations", type: "textarea", label: "Cultural/Organizational Considerations" },
          { id: "templates_created", type: "textarea", label: "Templates/Tools Created", placeholder: "List reusable facilitation assets..." },
          { id: "recommended_facilitators", type: "textarea", label: "Recommended Facilitators for Similar Work" },
          { id: "lessons_learned", type: "textarea", label: "Key Lessons Learned", required: true },
          { id: "documentation_location", type: "text", label: "Location of Session Documentation" },
          { id: "knowledge_transfer_complete", type: "checkbox", label: "Knowledge transfer to successor complete" }
        ]
      }
    }
  },
  analysis_framework: {
    initiation: {
      title: "Analysis Methodology Form",
      description: "Define your analytical approach and data requirements.",
      schema: {
        fields: [
          { id: "analysis_scope", type: "textarea", label: "Analysis Scope", required: true, placeholder: "Define what will and won't be analyzed..." },
          { id: "analysis_types", type: "textarea", label: "Types of Analysis to Conduct", required: true, placeholder: "Policy analysis, gap assessment, comparative analysis, etc." },
          { id: "data_sources", type: "textarea", label: "Data Sources Required", required: true },
          { id: "data_access_method", type: "select", label: "Data Access Method", options: ["Direct access", "Stakeholder provided", "Public sources", "Combination"], required: true },
          { id: "data_sensitivity", type: "select", label: "Data Sensitivity Level", options: ["Public", "Controlled Unclassified", "Confidential", "Secret"], required: true },
          { id: "analysis_lead", type: "text", label: "Analysis Lead", required: true },
          { id: "analysis_team", type: "textarea", label: "Analysis Team Members" },
          { id: "methodology_description", type: "textarea", label: "Methodology Description", required: true },
          { id: "timeline", type: "textarea", label: "Analysis Timeline", required: true },
          { id: "deliverables", type: "textarea", label: "Expected Deliverables", required: true }
        ]
      }
    },
    engagement: {
      title: "Data Collection Tracker",
      description: "Track data collection and preliminary findings.",
      schema: {
        fields: [
          { id: "collection_date", type: "date", label: "Collection Date", required: true },
          { id: "data_source", type: "text", label: "Data Source", required: true },
          { id: "data_type", type: "select", label: "Data Type", options: ["Quantitative", "Qualitative", "Mixed"], required: true },
          { id: "collection_method", type: "select", label: "Collection Method", options: ["Interview", "Survey", "Document review", "Database query", "Observation"], required: true },
          { id: "sample_size", type: "text", label: "Sample Size/Volume" },
          { id: "data_quality", type: "select", label: "Data Quality Assessment", options: ["High", "Medium", "Low"], required: true },
          { id: "preliminary_findings", type: "textarea", label: "Preliminary Findings", required: true },
          { id: "gaps_identified", type: "textarea", label: "Data Gaps Identified" },
          { id: "validation_status", type: "select", label: "Validation Status", options: ["Not started", "In progress", "Validated", "Issues found"], required: true },
          { id: "notes", type: "textarea", label: "Collection Notes" }
        ]
      }
    },
    synthesis: {
      title: "Analysis Findings Report",
      description: "Document integrated analysis findings and recommendations.",
      schema: {
        fields: [
          { id: "executive_summary", type: "textarea", label: "Executive Summary", required: true },
          { id: "policy_context_findings", type: "textarea", label: "Policy Context Findings", required: true },
          { id: "gap_assessment_results", type: "textarea", label: "Gap Assessment Results", required: true },
          { id: "comparative_analysis", type: "textarea", label: "Comparative Analysis Results" },
          { id: "impact_assessment", type: "textarea", label: "Impact Assessment" },
          { id: "key_insights", type: "textarea", label: "Key Insights", required: true },
          { id: "recommendations", type: "textarea", label: "Recommendations", required: true },
          { id: "implementation_roadmap", type: "textarea", label: "Implementation Roadmap" },
          { id: "limitations", type: "textarea", label: "Analysis Limitations" },
          { id: "confidence_level", type: "select", label: "Overall Confidence Level", options: ["High", "Medium", "Low"], required: true },
          { id: "stakeholder_review_complete", type: "checkbox", label: "Stakeholder review completed" }
        ]
      }
    },
    continuation: {
      title: "Analysis Handoff Package",
      description: "Prepare analysis products for transfer and continued use.",
      schema: {
        fields: [
          { id: "report_archive_location", type: "text", label: "Report Archive Location", required: true },
          { id: "data_package_location", type: "text", label: "Data Package Location", required: true },
          { id: "methodology_documented", type: "checkbox", label: "Methodology fully documented" },
          { id: "data_dictionary_complete", type: "checkbox", label: "Data dictionary complete" },
          { id: "update_procedures_defined", type: "checkbox", label: "Update procedures defined" },
          { id: "refresh_frequency", type: "select", label: "Recommended Refresh Frequency", options: ["Monthly", "Quarterly", "Semi-annually", "Annually", "As needed"] },
          { id: "successor_trained", type: "checkbox", label: "Successor trained on analysis methods" },
          { id: "access_credentials_transferred", type: "checkbox", label: "Data access credentials transferred" },
          { id: "outstanding_analysis", type: "textarea", label: "Outstanding Analysis Work" },
          { id: "handoff_notes", type: "textarea", label: "Handoff Notes" }
        ]
      }
    }
  },
  continuation_strategy: {
    initiation: {
      title: "Sustainability Planning Form",
      description: "Establish framework for sustainable program continuation.",
      schema: {
        fields: [
          { id: "continuation_vision", type: "textarea", label: "Continuation Vision", required: true, placeholder: "Describe the desired future state..." },
          { id: "sustainability_owner", type: "text", label: "Sustainability Planning Owner", required: true },
          { id: "key_stakeholders", type: "textarea", label: "Key Stakeholders for Continuation", required: true },
          { id: "resource_requirements", type: "textarea", label: "Ongoing Resource Requirements", required: true, placeholder: "Funding, personnel, technology, etc." },
          { id: "funding_sources", type: "textarea", label: "Potential Funding Sources" },
          { id: "transition_timeline", type: "textarea", label: "Transition Timeline", required: true },
          { id: "success_metrics", type: "textarea", label: "Long-term Success Metrics", required: true },
          { id: "risks_to_sustainability", type: "textarea", label: "Risks to Sustainability" },
          { id: "mitigation_strategies", type: "textarea", label: "Risk Mitigation Strategies" },
          { id: "governance_model", type: "select", label: "Post-transition Governance Model", options: ["Same organization", "Transfer to government", "Transfer to industry", "Joint ownership", "TBD"], required: true }
        ]
      }
    },
    engagement: {
      title: "Capability Building Tracker",
      description: "Track preparation activities for sustainable continuation.",
      schema: {
        fields: [
          { id: "successor_organization", type: "text", label: "Successor Organization/Individual", required: true },
          { id: "capability_gaps", type: "textarea", label: "Identified Capability Gaps", required: true },
          { id: "training_completed", type: "textarea", label: "Training Completed", placeholder: "List training sessions with dates..." },
          { id: "training_remaining", type: "textarea", label: "Training Remaining" },
          { id: "relationship_building", type: "textarea", label: "Relationship Building Activities" },
          { id: "resource_commitments", type: "textarea", label: "Resource Commitments Secured" },
          { id: "documentation_progress", type: "select", label: "Documentation Progress", options: ["Not started", "25%", "50%", "75%", "Complete"], required: true },
          { id: "champion_identified", type: "checkbox", label: "Continuation champion identified" },
          { id: "commitment_letters", type: "checkbox", label: "Commitment letters obtained" },
          { id: "notes", type: "textarea", label: "Progress Notes" }
        ]
      }
    },
    synthesis: {
      title: "Continuation Readiness Assessment",
      description: "Evaluate readiness for sustainable program continuation.",
      schema: {
        fields: [
          { id: "leadership_readiness", type: "select", label: "Leadership Continuity Readiness", options: ["Ready", "Mostly ready", "Gaps exist", "Not ready"], required: true },
          { id: "resource_readiness", type: "select", label: "Resource Availability", options: ["Fully secured", "Mostly secured", "Partially secured", "Not secured"], required: true },
          { id: "knowledge_transfer_status", type: "select", label: "Knowledge Transfer Status", options: ["Complete", "In progress", "Not started"], required: true },
          { id: "stakeholder_commitment", type: "select", label: "Stakeholder Commitment Level", options: ["Strong", "Moderate", "Weak", "Unknown"], required: true },
          { id: "identified_gaps", type: "textarea", label: "Identified Continuation Gaps", required: true },
          { id: "remediation_plans", type: "textarea", label: "Gap Remediation Plans", required: true },
          { id: "remediation_timeline", type: "textarea", label: "Remediation Timeline" },
          { id: "go_nogo_recommendation", type: "select", label: "Go/No-Go Recommendation", options: ["Go - proceed with transition", "Conditional - address gaps first", "No-Go - significant gaps remain"], required: true },
          { id: "risk_assessment", type: "textarea", label: "Risk Assessment" },
          { id: "contingency_plans", type: "textarea", label: "Contingency Plans" }
        ]
      }
    },
    continuation: {
      title: "Transition Execution Checklist",
      description: "Execute transition plan and confirm sustainability.",
      schema: {
        fields: [
          { id: "transition_date", type: "date", label: "Transition Date", required: true },
          { id: "formal_handoff_complete", type: "checkbox", label: "Formal handoff ceremony completed" },
          { id: "responsibilities_transferred", type: "checkbox", label: "All responsibilities transferred" },
          { id: "knowledge_sessions_complete", type: "checkbox", label: "Knowledge transfer sessions complete" },
          { id: "documentation_delivered", type: "checkbox", label: "All documentation delivered" },
          { id: "access_transferred", type: "checkbox", label: "System access transferred" },
          { id: "contacts_introduced", type: "checkbox", label: "Key contacts introduced" },
          { id: "monitoring_established", type: "checkbox", label: "Post-transition monitoring established" },
          { id: "followup_schedule", type: "textarea", label: "Follow-up Schedule", required: true },
          { id: "lessons_learned", type: "textarea", label: "Lessons Learned", required: true },
          { id: "final_notes", type: "textarea", label: "Final Transition Notes" },
          { id: "transition_success", type: "select", label: "Transition Success Rating", options: ["Excellent", "Good", "Adequate", "Needs improvement"], required: true }
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
