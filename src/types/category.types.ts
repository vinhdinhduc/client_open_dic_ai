

import { BaseEntity } from "./common.types";
import { MultiLangText } from "./term.types";
import { UserRef } from "./user.types";

// Category interface
export interface Category extends BaseEntity {
    name: MultiLangText;
    slug: string;
    description?: MultiLangText;
    icon?: string;
    parentCategory?: string | Category;
    order: number;
    isActive: boolean;
    termCount: number;
    moderators?: UserRef[];
}

// Simplified Category for dropdowns/references
export interface CategoryRef {
    id: string;
    name: string | MultiLangText;
    slug?: string;
    icon?: string;
}

// Category form data for create/update
export interface CategoryFormData {
    name: {
        vi: string;
        en?: string;
        lo?: string;
    };
    description?: {
        vi?: string;
        en?: string;
        lo?: string;
    };
    category?: {
        id: string;
        name: string;
    }
    icon?: string;
    slug?: string;
    parentCategory?: string;
    order?: number;
    isActive?: boolean;

}

// API Parameters
export interface GetCategoriesParams {
    includeInactive?: boolean;
    language?: string;
    parentOnly?: boolean;
}
