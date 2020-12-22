import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { mainDataQuery, msoaQuery } from "./engine";

import type { QueryParamsType, GenericJson, RequestOptions } from "./types";


const httpTrigger: AzureFunction = async (context: Context, req: HttpRequest, apiMetrics: GenericJson, seriesDate: string) => {

    const options: RequestOptions = {
        context: context,
        request: req
    };

    return req.query.areaType.toLowerCase() === "msoa"
        ? msoaQuery(req.query as QueryParamsType, seriesDate, options)
        : mainDataQuery(req.query as QueryParamsType, apiMetrics, options);

};  // httpTrigger


export default httpTrigger;
