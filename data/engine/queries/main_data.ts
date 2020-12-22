import { GetData } from "../database";
import processResults from "../../processor";
import { CosmosClient } from "@azure/cosmos";
import * as vars from "./variables";

import type { QueryParamsType, GenericJson, AreaInfo, RequestOptions } from "../../types";
import { getAreaInfo } from "./lookup";


const container = new CosmosClient(vars.DB_CONNECTION)
                .database(vars.DB_NAME)
                .container(vars.PUBLIC_DATA);


const prepareMetricName = ( metric: string ): string => {

    switch ( metric ) {

        case "alertLevel":
            return `'${metric}':      (c.alertLevel ?? null),
                    '${metric}Name':  alertLevel['value'],
                    '${metric}Url':   alertLevel['url'],
                    '${metric}Value': alertLevel['level']`;

        default:
            return `'${metric}': (c.${ metric } ?? null)`;

    }

};  // prepareMetricName


const joinMetricQuery = ( metric: string ): string => {

    switch ( metric ) {

        case "alertLevel":
            return `SELECT VALUE udf.processAlertLevel({
                'date':       c.date, 
                'alertLevel': c.alertLevel,
                'areaCode':   c.areaCode
            })`;

    }

    return "";

};  // joinMetricQuery


export const mainDataQuery = async (queryParams: QueryParamsType, releasedMetrics: GenericJson, options: RequestOptions) => {

    // Query params
    const { 
        format, 
        areaType, 
        areaCode = "", 
    }  = queryParams;
    const releaseDate   = queryParams.release.split(/T/)[0];
    const rawMetrics    = queryParams.metric.split(/,/).filter(metric => metric in releasedMetrics);
    const nestedMetrics = rawMetrics.filter(metric => releasedMetrics[metric] === "list");
    const jsonMetrics   = rawMetrics.filter(metric => releasedMetrics[metric] === "dict");

    // DB Query params
    const parameters = [
        {
            name: "@areaType", 
            value: areaType
        },
        {
            name: "@seriesDate",
            value: releaseDate
        }
    ];

    let queryFilters = "c.areaType = @areaType";

    const existenceFilters = [];
    const joinQueries = [];

    for ( const metric of rawMetrics ) {

        existenceFilters.push(`IS_DEFINED(c.${metric})`);

        // Join query for nested metric - must be handled as a ``case`` 
        // in the ``joinMetricQuery`` func. 
        if ( jsonMetrics.indexOf(metric) > -1 ) {

            joinQueries.push(`JOIN (${ joinMetricQuery(metric) }) AS ${ metric }`);

        }

    }

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
        ...rawMetrics.map(prepareMetricName)
    ].join(", ");

    // Final query
    const query = `SELECT VALUE {${ metrics }}
                   FROM c
                   ${ joinQueries.join("\n") }
                   WHERE 
                        c.seriesDate = @seriesDate
                    AND ${ queryFilters } 
                    AND (${ existenceFilters.join(" OR ") })
                   `;

    options.context.log.info(query);
    options.context.log.info(parameters);

    const area = getAreaInfo(areaType, areaCode);
    
    return GetData(query, parameters, {
        container: container,
        partitionKey: releaseDate,
        requestOptions: options,
        processor: processResults({
            format, 
            nestedMetrics, 
            releaseDate,
            area: await area as unknown as AreaInfo
        }),
    });

};  // mainDataQuery
