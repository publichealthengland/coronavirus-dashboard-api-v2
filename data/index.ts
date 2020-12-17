import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { mainDataQuery, msoaQuery } from "./engine";

import type { QueryParamsType, GenericJson } from "./types";


const httpTrigger: AzureFunction = async (context: Context, req: HttpRequest, apiMetrics: GenericJson, seriesDate: string) => {
    
    console.log(">>>" + seriesDate)
    return req.query.areaType.toLowerCase() === "msoa"
        ? msoaQuery(req.query as QueryParamsType, seriesDate)
        : mainDataQuery(req.query as QueryParamsType, apiMetrics);

};  // httpTrigger


export default httpTrigger;
