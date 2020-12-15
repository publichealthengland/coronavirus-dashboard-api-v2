import {Container} from "@azure/cosmos";

export interface GenericJson {
    [key: string]: string
}


export interface DBObject {
    [key: string]: string | number | boolean | null
}


export interface DBResponseItem {
    [key: string]: DBObject[] | DBObject | string | number | boolean | null
}


export declare type GenericDBResponse = DBResponseItem[];


export interface QueryParamsType extends GenericJson {
    [key: string]: string,
    areaType: string,
    areaCode: string,
    release: string,
    metric: string,
    format:   "csv"
            | "json"
            | "jsonl"
            | "xml";
}


export interface GetMainDataOptions {
    container: Container
    partitionKey?: string
    processor: (data: GenericDBResponse) => any
}
