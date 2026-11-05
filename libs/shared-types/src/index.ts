export type IssueStatus='NEW'|'REVIEWING'|'IN_PROGRESS'|'WAITING'|'RETEST'|'REOPENED'|'DONE'|'CLOSED';
export type IssuePriority='LOW'|'NORMAL'|'HIGH'|'URGENT';
export interface IssueSummary{issueId:string;title:string;status:IssueStatus;priority:IssuePriority;projectTitle:string;createdAt:string}

export type ProjectStatus='NEW'|'IN_PROGRESS'|'DONE';
export interface ProjectSummary{projectId:string;projectTitle:string;description:string;projectStatus:ProjectStatus;requirementCount:number;openDefectCount:number;updatedAt:string}
export type DocumentStatus = "DRAFT" | "REVIEWING" | "CONFIRMED" | "IN_PROGRESS" | "CLOSED";
export type RequirementType = "NEW" | "IMPROVEMENT" | "OTHER";
export type RequirementProgressStatus = "NEW" | "DISCUSSING" | "CONFIRMED" | "IN_PROGRESS" | "DONE";