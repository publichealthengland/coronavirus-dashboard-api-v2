import { describe, it } from "mocha";

import assert from "assert";

import type { GenericJson,  RequestOptions, AreaInfo } from "../data/types";
import processResults from "../data/processor";

import * as vars from "../data/engine/queries/variables";

import { GetData } from '../data/engine/database';

import { getAreaInfo } from "../data/engine/queries/lookup";

import { CosmosClient } from "@azure/cosmos";

import {
    request,
    context
} from './vars';

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

describe("from_db main", () => {


    const releaseDate = "2020-11-20";

    // const metrics = "newCasesByPublishDate,femaleCases,maleCases";

    request["query"]["release"] = releaseDate;
    request["query"]["metric"] = "newCasesByPublishDate,femaleCases,maleCases";

    const resultsStructure: GenericJson = {
        "date": "date",
        "areaType": "areaType",
        "areaCode": "areaCode",
        "areaName": "areaName" ,
        "metric": "metric",
        "age": "age",
        "value": "value",
        "rate": "rate"
    };

    const areaType = "nation";
    const areaCode = "E92000001"
    
    const container = new CosmosClient(vars.DB_CONNECTION)
                        .database(vars.DB_NAME)
                        .container(vars.PUBLIC_DATA);

    const rawMetrics: string[] = [
        "newCasesByPublishDate", 
        "femaleCases",
        "maleCases"
    ];
                
    const nestedMetrics: string[] = [
        "maleCases", 
        "femaleCases"
    ];
                
    const jsonMetrics: string[] = [
    ];
                
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
                
    const area = getAreaInfo(areaType, areaCode);
                
    const options: RequestOptions = {
        context: context,
        request: request
    };

    const runTest = async (format: string)  => {
         
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
    }

    describe('#GetData', () => {

        it('JSON integrity', async () => {

            const jsonData =  await runTest("json");

            assert.strictEqual(typeof jsonData, "object");
            assert.strictEqual("body" in jsonData, true);
            assert.strictEqual("headers" in jsonData, true);
            assert.strictEqual("content-disposition" in jsonData.headers, true);
            assert.notStrictEqual(jsonData.body, null);

            const json = JSON.parse(jsonData.body);
            assert.strictEqual("length" in json, true);
            assert.strictEqual("body" in  json, true);

            const max_response_date = Math.max(...json.body.map((e: GenericJson) => new Date(e.date).getTime()));
            assert.strictEqual (max_response_date <= new Date(releaseDate).getTime(), true);
            assert.strictEqual(json.length > 10, true);

        });

    
        it('CSV integrity', async () => {

            const csvData =  await runTest("csv");
            
            assert.strictEqual(typeof csvData, "object");
            assert.strictEqual("body" in csvData, true);
            assert.strictEqual("headers" in csvData, true);
            assert.strictEqual("content-disposition" in csvData.headers, true);

            assert.strictEqual(typeof csvData.body, "string");

            const arr = csvData.body.split("\n").slice(1);
            const max_response_date = Math.max(...arr.map((e: string) => new Date(e.split(",")[0]).getTime()));
            assert.strictEqual (max_response_date <= new Date(releaseDate).getTime(), true);

            assert.strictEqual(
                csvData.body.split("\n").length > 10,
                true
            );

            assert.strictEqual(
                csvData
                    .body
                    .split("\n")[0]
                    .trim(),
                Object.keys(resultsStructure)
                    .join(","),
            );

        });


        it('JSONL integrity', async () => {

            const jsonlData =  await runTest("jsonl");
           
            assert.strictEqual(typeof jsonlData, "object");
            assert.strictEqual("body" in jsonlData, true);
            assert.strictEqual("headers" in jsonlData, true);
            assert.strictEqual("content-disposition" in jsonlData.headers, true);

            assert.strictEqual(typeof jsonlData.body, "string");


            assert.strictEqual(
                jsonlData.body.split("\n").length > 10,
                true
            );
           
            const arr = jsonlData.body.split("\n").slice(1);
            const max_response_date = Math.max(...arr.map((e: string) => new Date((JSON.parse(e)).date).getTime()));
            assert.strictEqual (max_response_date <= new Date(releaseDate).getTime(), true);
        });

    });


});