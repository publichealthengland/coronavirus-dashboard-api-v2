import { describe, it } from "mocha";

import assert from "assert";

import type { GenericJson } from "../data/types";
import processResults from "../data/processor";

import * as vars from "../data/engine/queries/variables";

import { GetData } from '../data/engine/database';

import { CosmosClient } from "@azure/cosmos";

describe("from_db main", () => {


    const releaseDate = "2020-11-20";

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
    
    
    const container = new CosmosClient(vars.DB_CONNECTION)
                        .database(vars.DB_NAME)
                        .container(vars.PUBLIC_DATA);

    const runTest = async (format: string)  => {
        
       
        const rawMetrics: string[] = [
            "newCasesByPublishDate", 
            "femaleCases",
            "maleCases"
        ];

        const nestedMetrics: string[] = [
            "maleCases", 
            "femaleCases"
        ];

        // DB Query params
        const parameters = [
            {
                name: '@areaType', 
                value: 'nation'
            },
            {
                name: '@areaCode',
                value: 'E92000001'
            }
        ];

        const queryFilters = "c.areaType = 'nation' AND c.areaCode = 'E92000001'";

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

        const data =  await GetData(query, parameters, {
                                    container: container,
                                    partitionKey: releaseDate,
                                    processor: processResults({ format, nestedMetrics, releaseDate })
        });

        return data
    }

    describe('#GetData', () => {

        it('JSON integrity', async () => {

            const jsonData =  await runTest("json");

            assert.strictEqual(typeof jsonData, "object");
            assert.strictEqual("body" in jsonData, true);
            assert.strictEqual("headers" in jsonData, true);
            assert.strictEqual("content-disposition" in jsonData.headers, true);

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