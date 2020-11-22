import getData from "../database";
import processResults from "../processor";

import type { QueryParamsType, GenericJson } from "../types";


const ORDER_BY = "c.areaType ASC, c.areaCode ASC, c.date DESC";


const despatchQuery = async (queryParams: QueryParamsType, releasedMetrics: GenericJson) => {

    // Query params
    const format        = queryParams.format;
    const areaCode      = queryParams?.areaCode ?? "";
    const areaType      = queryParams.areaType;
    const releaseDate   = queryParams.release.split(/T/)[0];
    const rawMetrics    = queryParams.metric.split(/,/).filter(metric => metric in releasedMetrics);
    const nestedMetrics = rawMetrics.filter(metric => releasedMetrics[metric] === "list");

    // DB Query params
    const parameters = [
        {
            name: "@areaType", 
            value: areaType
        }
    ];

    let queryFilters = "c.areaType = @areaType";

    if ( areaCode ) {
        queryFilters += " AND c.areaCode = @areaCode";

        parameters.push({
            name: "@areaCode",
            value: areaCode
        });
    }

    // Process metrics
    const metrics = [
        "'date': c.date",
        "'areaType': c.areaType",
        "'areaCode': c.areaCode",
        "'areaName': c.areaName",
        ...rawMetrics.map(metric => `'${metric}': c.${metric} ?? null`)
    ].join(", ");

    const query = `SELECT VALUE {${metrics}} FROM c WHERE ${queryFilters} ORDER BY ${ORDER_BY}`;
    
    const processor = processResults(format, nestedMetrics);

    return getData(query, parameters, releaseDate, processor);

};  // fromDatabase


export default despatchQuery;
