
import type { GenericJson } from "../data/types";

import { 
    Context, 
    HttpRequest
} from "@azure/functions";

import { 
    ExecutionContext, 
    TraceContext,
    BindingDefinition,
    Logger
} from "@azure/functions";


export const mainResultsStructure: GenericJson = {
    "date": "date",
    "areaType": "areaType",
    "areaCode": "areaCode",
    "areaName": "areaName" ,
    "metric": "metric",
    "age": "age",
    "rate": "rate",
    "value": "value"
};


export const msoaResultsStructure: GenericJson = {
        "regionCode": "regionCode",
        "regionName": "regionName",
        "UtlaCode": "UtlaCode",
        "UtlaName": "UtlaName",
        "LtlaCode": "LtlaCode",
        "LtlaName": "LtlaName",
        "areaType": "areaType",
        "areaCode": "areaCode",
        "areaName": "areaName",
        "date": "date",
        "newCasesBySpecimenDateRollingSum": "newCasesBySpecimenDateRollingSum",
        "newCasesBySpecimenDateRollingRate": "newCasesBySpecimenDateRollingRate",
        "newCasesBySpecimenDateChange": "newCasesBySpecimenDateChange",
        "newCasesBySpecimenDateChangePercentage" : "newCasesBySpecimenDateChangePercentage",
        "newCasesBySpecimenDateDirection": "newCasesBySpecimenDateDirection"
};

export const executionContext: ExecutionContext  = {

    invocationId: "id",
   
    functionName: "function",
    
    functionDirectory: "directory"
};

export const traceContext: TraceContext = {
   
    traceparent: null,
  
    tracestate: null,
   
    attributes: {}
};

export const bindingDefinition: BindingDefinition[] = [
    {
 
        name: "binding",
    
        type: "binding-type",
    
        direction: undefined
    }
];

export const logger = {} as Logger;

export const request: HttpRequest = {

    method: "GET",
    url: "http://localhost:7001",
    headers: {},
    query: {
        areaType: "nation",
        areaCode: "E92000001",
        release: "",
        metric: "",
        format: "json"
    },
    params: {},        
    body: null,
    rawBody: null

};

export const context: Context = {

    invocationId: "id",

    executionContext: executionContext,

    bindings: {},

    bindingData: {},

    traceContext: traceContext,

    bindingDefinitions: bindingDefinition,

    log: logger,

    
    done: () => {},
    
    req: request,
    
    res: {}
   
};


