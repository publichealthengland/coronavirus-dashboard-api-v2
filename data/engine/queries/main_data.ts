import { GetData } from "../database";
import processResults from "../../processor";
import { CosmosClient } from "@azure/cosmos";
import * as vars from "./variables";

import type { QueryParamsType, GenericJson } from "../../types";
import { release } from "os";


const container = new CosmosClient(vars.DB_CONNECTION)
                .database(vars.DB_NAME)
                .container(vars.PUBLIC_DATA);


export const mainDataQuery = async (queryParams: QueryParamsType, releasedMetrics: GenericJson) => {

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

    // Final query
    const query = `SELECT VALUE {${metrics}}
                   FROM c
                   WHERE ${queryFilters}
                   ORDER BY c.areaType ASC, c.areaCode ASC, c.date DESC`;
    
    return GetData(query, parameters, {
        container: container,
        partitionKey: releaseDate,
        processor: processResults({ format, nestedMetrics, releaseDate })
    });

};  // mainDataQuery
