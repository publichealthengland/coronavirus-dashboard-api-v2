import { Container } from "@azure/cosmos";
import { Context, HttpRequest } from "@azure/functions";

export interface GenericJson {
    [key: string]: string
}


export interface DBObject {
    [key: string]: string
                 | number
                 | boolean
                 | null
}


export interface DBResponseItem {
    [key: string]: DBObject[]
                 | DBObject
                 | string
                 | number
                 | boolean
                 | null
}


export declare type GenericDBResponse = DBResponseItem[];


export interface QueryParamsType extends GenericJson {
    [key: string]: string,
    areaType:      string,
    areaCode:      string,
    release:       string,
    metric:        string,
    format:        "csv"
                 | "json"
                 | "jsonl"
                 | "xml"
}


export interface AreaInfo {
    areaName:  string | null
    areaType:  string
    areaCode?: string
}


export interface RequestOptions {
    context: Context
    request: HttpRequest 
}

export interface GetMainDataOptions {
    container:      Container
    partitionKey?:  string
    processor:      (data: GenericDBResponse) => any
    requestOptions: RequestOptions
}


export interface ResultProcessor {
    format:          string
    releaseDate:     string
    area:            AreaInfo
    nestedMetrics?:  string[]
    requestOptions?: RequestOptions
}

export interface TraceFamilyIds {
    version:     string
    operationId: string
    parentId:    string
    roleName:    string
    traceFlag:   string
}
