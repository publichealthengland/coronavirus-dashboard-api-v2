import { GetData } from "../database";
import { CosmosClient } from "@azure/cosmos";
import processResults from "../../processor";
import * as vars from "./variables";

import type { QueryParamsType, GenericJson } from "../../types";


const container = new CosmosClient(vars.DB_CONN_STR)
                .database(vars.DB_NAME)
                .container(vars.MSOA_DATA);


const defaultMetrics: GenericJson = {
    "regionCode": "c.regionCode",
    "regionName": "c.regionName",
    "UtlaCode":   "c.UtlaCode ?? null",
    "UtlaName":   "c.UtlaName ?? null",
    "LtlaCode":   "c.LtlaCode ?? null",
    "LtlaName":   "c.LtlaName ?? null",
    "areaType":   "c.areaType",
    "areaCode":   "c.areaCode",
    "areaName":   "c.areaName",
    "date":       "cases.date"
};


const msoaMetrics: GenericJson = {
    'newCasesBySpecimenDateRollingSum':       'rollingSum',
    'newCasesBySpecimenDateRollingRate':      'rollingRate',
    'newCasesBySpecimenDateChange':           'change',
    'newCasesBySpecimenDateDirection':        'direction',
    'newCasesBySpecimenDateChangePercentage': 'changePercentage'
};


export const msoaQuery = async (queryParams: QueryParamsType) => {

    // Query params
    const format        = queryParams.format;
    const areaCode      = queryParams?.areaCode ?? "";
    const areaType      = "msoa";
    const rawMetrics    = queryParams.metric
        .split(/,/)
        .filter(metric => metric in msoaMetrics);

    // DB Query params
    const parameters = [
        {name: "@areaType", value: areaType}
    ];

    let queryFilters = "c.areaType = @areaType ";

    if ( areaCode ) {

        queryFilters += `AND ( 
                              c.areaCode   = @areaCode
                           OR c.LtlaCode   = @areaCode
                           OR c.UtlaCode   = @areaCode
                           OR c.regionCode = @areaCode
                         )`;

        parameters.push({
            name: "@areaCode",
            value: areaCode
        });

    } // if

    // Process metrics
    const metrics = [

        ...Object
            .keys(defaultMetrics)
            .map(key => `'${key}': ${defaultMetrics[key]}`),

        ...rawMetrics
            .map(metric => `'${metric}': cases.${msoaMetrics[metric]} ?? null`)

    ];

    // Final query
    const query = `SELECT VALUE {${metrics.join(", ")}}
                   FROM c
                   JOIN cases IN c.newCasesBySpecimenDate
                   WHERE ${queryFilters}`;
    
    return GetData(query, parameters, {
        container: container,
        processor: processResults(format)
    });

};  // msoaQuery
