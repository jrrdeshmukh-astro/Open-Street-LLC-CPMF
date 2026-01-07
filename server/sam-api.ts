const SAM_API_BASE = "https://api.sam.gov/opportunities/v2";

export interface SamOpportunityResult {
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

interface SamSearchParams {
  keyword?: string;
  naicsCode?: string;
  pscCode?: string;
  agency?: string;
  noticeType?: string;
  setAsideType?: string;
  postedFrom?: string;
  postedTo?: string;
  responseDeadlineFrom?: string;
  responseDeadlineTo?: string;
  limit?: number;
  offset?: number;
}

interface SamOpportunity {
  noticeId: string;
  title: string;
  solicitationNumber?: string;
  department?: string;
  subTier?: string;
  office?: string;
  type?: string;
  baseType?: string;
  naicsCode?: string;
  classificationCode?: string;
  setAsideCode?: string;
  responseDeadLine?: string;
  postedDate?: string;
  archiveDate?: string;
  placeOfPerformance?: {
    city?: { name?: string };
    state?: { code?: string; name?: string };
    country?: { code?: string; name?: string };
  };
  description?: string;
  pointOfContact?: Array<{
    type?: string;
    fullName?: string;
    email?: string;
    phone?: string;
  }>;
  links?: Array<{
    rel?: string;
    href?: string;
  }>;
}

interface SamSearchResponse {
  totalRecords: number;
  limit: number;
  offset: number;
  opportunitiesData: SamOpportunity[];
}

export async function searchSamOpportunities(
  apiKey: string,
  params: SamSearchParams
): Promise<{ opportunities: SamOpportunityResult[]; totalRecords: number }> {
  const queryParams = new URLSearchParams();
  
  if (params.keyword) queryParams.set("keyword", params.keyword);
  if (params.naicsCode) queryParams.set("naics", params.naicsCode);
  if (params.pscCode) queryParams.set("psc", params.pscCode);
  if (params.agency) queryParams.set("deptname", params.agency);
  if (params.noticeType) queryParams.set("ptype", params.noticeType);
  if (params.setAsideType) queryParams.set("typeOfSetAside", params.setAsideType);
  if (params.postedFrom) queryParams.set("postedFrom", params.postedFrom);
  if (params.postedTo) queryParams.set("postedTo", params.postedTo);
  if (params.responseDeadlineFrom) queryParams.set("rdlfrom", params.responseDeadlineFrom);
  if (params.responseDeadlineTo) queryParams.set("rdlto", params.responseDeadlineTo);
  queryParams.set("limit", String(params.limit || 25));
  queryParams.set("offset", String(params.offset || 0));
  
  const url = `${SAM_API_BASE}/search?${queryParams.toString()}`;
  
  const response = await fetch(url, {
    headers: {
      "X-Api-Key": apiKey,
      "Accept": "application/json",
    },
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`SAM.gov API error: ${response.status} - ${errorText}`);
  }
  
  const data: SamSearchResponse = await response.json();
  
  const opportunities = (data.opportunitiesData || []).map(opp => ({
    externalId: opp.noticeId,
    title: opp.title || "Untitled Opportunity",
    solicitationNumber: opp.solicitationNumber || null,
    agency: opp.department || null,
    subAgency: opp.subTier || null,
    office: opp.office || null,
    noticeType: opp.type || opp.baseType || null,
    contractType: null,
    naicsCodes: opp.naicsCode ? JSON.stringify([opp.naicsCode]) : null,
    pscCodes: opp.classificationCode ? JSON.stringify([opp.classificationCode]) : null,
    setAsideType: opp.setAsideCode || null,
    responseDeadline: opp.responseDeadLine || null,
    postedDate: opp.postedDate || null,
    archiveDate: opp.archiveDate || null,
    placeOfPerformance: opp.placeOfPerformance ? JSON.stringify(opp.placeOfPerformance) : null,
    description: opp.description || null,
    synopsis: null,
    contactInfo: opp.pointOfContact ? JSON.stringify(opp.pointOfContact) : null,
    attachmentLinks: opp.links ? JSON.stringify(opp.links) : null,
    rawJson: JSON.stringify(opp),
  }));
  
  return {
    opportunities,
    totalRecords: data.totalRecords || 0,
  };
}

export async function getSamOpportunityDetails(
  apiKey: string,
  noticeId: string
): Promise<SamOpportunityResult | null> {
  const url = `${SAM_API_BASE}/synopsis/${noticeId}`;
  
  const response = await fetch(url, {
    headers: {
      "X-Api-Key": apiKey,
      "Accept": "application/json",
    },
  });
  
  if (!response.ok) {
    if (response.status === 404) return null;
    const errorText = await response.text();
    throw new Error(`SAM.gov API error: ${response.status} - ${errorText}`);
  }
  
  const opp: SamOpportunity = await response.json();
  
  return {
    externalId: opp.noticeId,
    title: opp.title || "Untitled Opportunity",
    solicitationNumber: opp.solicitationNumber || null,
    agency: opp.department || null,
    subAgency: opp.subTier || null,
    office: opp.office || null,
    noticeType: opp.type || opp.baseType || null,
    contractType: null,
    naicsCodes: opp.naicsCode ? JSON.stringify([opp.naicsCode]) : null,
    pscCodes: opp.classificationCode ? JSON.stringify([opp.classificationCode]) : null,
    setAsideType: opp.setAsideCode || null,
    responseDeadline: opp.responseDeadLine || null,
    postedDate: opp.postedDate || null,
    archiveDate: opp.archiveDate || null,
    placeOfPerformance: opp.placeOfPerformance ? JSON.stringify(opp.placeOfPerformance) : null,
    description: opp.description || null,
    synopsis: null,
    contactInfo: opp.pointOfContact ? JSON.stringify(opp.pointOfContact) : null,
    attachmentLinks: opp.links ? JSON.stringify(opp.links) : null,
    rawJson: JSON.stringify(opp),
  };
}

export const NOTICE_TYPES = [
  { value: "p", label: "Presolicitation" },
  { value: "o", label: "Solicitation" },
  { value: "k", label: "Combined Synopsis/Solicitation" },
  { value: "r", label: "Sources Sought" },
  { value: "g", label: "Sale of Surplus Property" },
  { value: "s", label: "Special Notice" },
  { value: "i", label: "Intent to Bundle Requirements" },
  { value: "a", label: "Award Notice" },
  { value: "u", label: "Justification and Approval" },
];

export const SET_ASIDE_TYPES = [
  { value: "SBA", label: "Small Business" },
  { value: "8A", label: "8(a)" },
  { value: "HZC", label: "HUBZone" },
  { value: "SDVOSBC", label: "Service-Disabled Veteran-Owned" },
  { value: "WOSB", label: "Women-Owned Small Business" },
  { value: "EDWOSB", label: "Economically Disadvantaged WOSB" },
  { value: "VSA", label: "Veteran Set-Aside" },
];
