import {Rule} from "./Rule";

export interface Quiz {
    id: number;
    title: string;
    rules: Rule[];
    authorId: number; 
}