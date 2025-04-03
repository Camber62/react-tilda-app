export interface Question {
    id: string;
    title: string;
    percentage: number;
}

export interface Indicator {
    id: string;
    title: string;
    percentage: number;
    questions: Question[];
}

export interface Competence {
    id: string;
    title: string;
    percentage: number;
    indicators: Indicator[];
}
