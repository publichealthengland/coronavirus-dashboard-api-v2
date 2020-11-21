import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import despatchQuery from "./engine";

import type { QueryParamsType, GenericJson } from "./types";


const httpTrigger: AzureFunction = async (context: Context, req: HttpRequest, apiMetrics: GenericJson) => {
    
    return despatchQuery(req.query as QueryParamsType, apiMetrics);

};  // httpTrigger


export default httpTrigger;
