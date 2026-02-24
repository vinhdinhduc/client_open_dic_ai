

import { BaseEntity } from "./common.types";
import { MultiLangText, Example } from "./term.types";
import { UserRef } from "./user.types";

// Contribution type
export type ContributionType = "new_term" | "edit_term" | "suggest_edit";

// Contribution status
export type ContributionStatus = "pending" | "approved" | "rejected";

// Contribution interface
export interface Contribution extends BaseEntity {
    type: ContributionType;
    targetTerm?: string;
    contributor: UserRef;
    term: MultiLangText;
    definition: MultiLangText;
    detailedExplanation?: MultiLangText;
    examples?: Example[];
    category: string;
    contributorNote?: string;
    status: ContributionStatus;
    reviewedBy?: UserRef;
    reviewNote?: string;
    reviewedAt?: string;
}

// Create contribution data (suggest edit)
export interface SuggestEditData {
    type: "edit_term";
    targetTerm: string;
    term: MultiLangText;
    definition: MultiLangText;
    detailedExplanation?: MultiLangText;
    examples?: Example[];
    partOfSpeech?: string;
    tags?: string[];
    category: string;
    contributorNote?: string;
}

// Create contribution data (new term)
export interface NewTermContributionData {
    type: "new_term";
    term: MultiLangText;
    definition: MultiLangText;
    detailedExplanation?: MultiLangText;
    examples?: Example[];
    partOfSpeech?: string;
    tags?: string[];
    category: string;
    contributorNote?: string;
}

// Review contribution data
export interface ReviewContributionData {
    status: "approved" | "rejected";
    reviewNote?: string;
}

// API Parameters
export interface GetContributionsParams {
    type?: ContributionType;
    status?: ContributionStatus;
    contributor?: string;
    page?: number;
    limit?: number;
}
