import { GetData } from "../database";
import { CosmosClient } from "@azure/cosmos";
import processResults from "../../processor";
import * as vars from "./variables";

import type { QueryParamsType, GenericJson } from "../../types";


const container = new CosmosClient(vars.DB_CONN_STR)
                .database(vars.DB_NAME)
                .container(vars.MSOA_DATA);


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
                              c.regionCode = @areaCode
                           OR c.UtlaCode   = @areaCode
                           OR c.LtlaCode   = @areaCode
                           OR c.areaCode   = @areaCode
                         )`;

        parameters.push({
            name: "@areaCode",
            value: areaCode
        });
    }

    // Process metrics
    const metrics = [
        "'date': cases.date",
        "'areaType': c.areaType",
        "'areaCode': c.areaCode",
        "'areaName': c.areaName",
        ...rawMetrics.map(metric => `'${metric}': cases.${msoaMetrics[metric]} ?? null`)
    ].join(", ");

    const query = `SELECT VALUE {${metrics}}
                   FROM c
                   JOIN cases IN c.newCasesBySpecimenDate
                   WHERE ${queryFilters}`;
    
    return GetData(query, parameters, {
        container: container,
        processor: processResults(format)
    });

};  // msoaQuery
