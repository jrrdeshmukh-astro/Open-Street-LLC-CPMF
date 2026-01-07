import { db } from "./db";
import { workflowTemplates } from "@shared/schema";

async function seedWorkflowTemplates() {
  console.log("Seeding workflow templates...");

  const templates = [
    {
      name: "IT Services Acquisition",
      description: "Workflow for IT services, software development, and technology-related contracts",
      triggerRules: JSON.stringify({
        naicsCodes: ["541511", "541512", "541513", "541519", "518210"],
        noticeTypes: ["o", "k"],
      }),
      componentStageMatrix: JSON.stringify({
        engagement_structure: { priority: "high", stages: ["initiation", "engagement", "synthesis", "continuation"] },
        governance_framework: { priority: "high", stages: ["initiation", "engagement", "synthesis"] },
        facilitation_model: { priority: "medium", stages: ["engagement", "synthesis"] },
        analysis_framework: { priority: "high", stages: ["initiation", "engagement", "synthesis"] },
        continuation_strategy: { priority: "medium", stages: ["synthesis", "continuation"] },
      }),
      defaultActions: JSON.stringify([
        { title: "Review solicitation documents", daysFromStart: 1, priority: "high" },
        { title: "Identify team members and roles", daysFromStart: 3, priority: "high" },
        { title: "Conduct compliance gap analysis", daysFromStart: 5, priority: "high" },
        { title: "Draft technical approach", daysFromStart: 10, priority: "high" },
        { title: "Develop past performance narratives", daysFromStart: 12, priority: "medium" },
        { title: "Complete pricing analysis", daysFromStart: 15, priority: "high" },
        { title: "Internal review and quality check", daysFromStart: 18, priority: "high" },
        { title: "Final submission preparation", daysFromStart: 20, priority: "urgent" },
      ]),
      estimatedDuration: 30,
    },
    {
      name: "Professional Services Engagement",
      description: "Workflow for consulting, management, and professional service contracts",
      triggerRules: JSON.stringify({
        naicsCodes: ["541611", "541612", "541613", "541614", "541618", "541690"],
        noticeTypes: ["o", "k", "r"],
      }),
      componentStageMatrix: JSON.stringify({
        engagement_structure: { priority: "high", stages: ["initiation", "engagement", "synthesis", "continuation"] },
        governance_framework: { priority: "medium", stages: ["initiation", "engagement"] },
        facilitation_model: { priority: "high", stages: ["initiation", "engagement", "synthesis"] },
        analysis_framework: { priority: "high", stages: ["initiation", "engagement", "synthesis"] },
        continuation_strategy: { priority: "high", stages: ["synthesis", "continuation"] },
      }),
      defaultActions: JSON.stringify([
        { title: "Analyze requirements and scope", daysFromStart: 2, priority: "high" },
        { title: "Identify key personnel", daysFromStart: 4, priority: "high" },
        { title: "Develop methodology approach", daysFromStart: 7, priority: "high" },
        { title: "Create staffing plan", daysFromStart: 10, priority: "medium" },
        { title: "Draft management approach", daysFromStart: 12, priority: "medium" },
        { title: "Quality assurance review", daysFromStart: 16, priority: "high" },
      ]),
      estimatedDuration: 21,
    },
    {
      name: "Research and Development",
      description: "Workflow for R&D, scientific research, and academic collaboration contracts",
      triggerRules: JSON.stringify({
        naicsCodes: ["541711", "541712", "541713", "541714", "541715", "541720"],
        noticeTypes: ["p", "o", "k"],
      }),
      componentStageMatrix: JSON.stringify({
        engagement_structure: { priority: "high", stages: ["initiation", "engagement", "synthesis", "continuation"] },
        governance_framework: { priority: "high", stages: ["initiation", "engagement", "synthesis", "continuation"] },
        facilitation_model: { priority: "high", stages: ["initiation", "engagement", "synthesis"] },
        analysis_framework: { priority: "high", stages: ["initiation", "engagement", "synthesis", "continuation"] },
        continuation_strategy: { priority: "high", stages: ["synthesis", "continuation"] },
      }),
      defaultActions: JSON.stringify([
        { title: "Review research objectives", daysFromStart: 1, priority: "high" },
        { title: "Assemble research team", daysFromStart: 3, priority: "high" },
        { title: "Develop research methodology", daysFromStart: 7, priority: "high" },
        { title: "Create data management plan", daysFromStart: 10, priority: "medium" },
        { title: "Draft intellectual property approach", daysFromStart: 12, priority: "medium" },
        { title: "Establish collaboration framework", daysFromStart: 14, priority: "high" },
        { title: "Budget and resource planning", daysFromStart: 16, priority: "high" },
      ]),
      estimatedDuration: 45,
    },
    {
      name: "Small Business Set-Aside",
      description: "Specialized workflow for 8(a), HUBZone, SDVOSB, and other set-aside contracts",
      triggerRules: JSON.stringify({
        setAsideTypes: ["SBA", "8A", "HZC", "SDVOSBC", "WOSB", "EDWOSB"],
        noticeTypes: ["o", "k"],
      }),
      componentStageMatrix: JSON.stringify({
        engagement_structure: { priority: "high", stages: ["initiation", "engagement", "synthesis", "continuation"] },
        governance_framework: { priority: "high", stages: ["initiation", "engagement", "synthesis"] },
        facilitation_model: { priority: "medium", stages: ["engagement", "synthesis"] },
        analysis_framework: { priority: "high", stages: ["initiation", "engagement", "synthesis"] },
        continuation_strategy: { priority: "medium", stages: ["continuation"] },
      }),
      defaultActions: JSON.stringify([
        { title: "Verify small business certification", daysFromStart: 1, priority: "urgent" },
        { title: "Review set-aside requirements", daysFromStart: 2, priority: "high" },
        { title: "Document size standards compliance", daysFromStart: 3, priority: "high" },
        { title: "Identify teaming opportunities", daysFromStart: 5, priority: "medium" },
        { title: "Prepare capability statement", daysFromStart: 7, priority: "high" },
        { title: "Develop pricing strategy", daysFromStart: 10, priority: "high" },
      ]),
      estimatedDuration: 21,
    },
  ];

  for (const template of templates) {
    await db.insert(workflowTemplates).values(template).onConflictDoNothing();
  }

  console.log(`Seeded ${templates.length} workflow templates.`);
}

seedWorkflowTemplates()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Failed to seed workflow templates:", err);
    process.exit(1);
  });
