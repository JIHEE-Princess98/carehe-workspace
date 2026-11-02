export type IssueStatus='NEW'|'REVIEWING'|'IN_PROGRESS'|'WAITING'|'RETEST'|'REOPENED'|'DONE'|'CLOSED';
export type IssuePriority='LOW'|'NORMAL'|'HIGH'|'URGENT';
export interface IssueSummary{issueId:string;title:string;status:IssueStatus;priority:IssuePriority;projectTitle:string;createdAt:string}
