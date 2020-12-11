import { describe, it } from "mocha";

import assert from "assert";

import type { GenericJson } from "../data/types";
import processResults from "../data/processor";

import { mainResultsStructure } from './vars';

import * as vars from "../data/engine/queries/variables";

import { GetData } from '../data/engine/database';

import { CosmosClient } from "@azure/cosmos";

describe("from_db main", () => {


    const releaseDate = "2020-11-20";

    
    const container = new CosmosClient(vars.DB_CONNECTION)
                        .database(vars.DB_NAME)
                        .container(vars.PUBLIC_DATA);

    const runTest = async (format: string)  => {
        
       
        const rawMetrics: string[] = [
            "newCasesByPublish", 
            "femaleCases",
            "maleCases"
        ];

        const nestedMetrics: string[] = [
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
                                    processor: processResults(format, nestedMetrics)
        });

        return data
    }

    describe('#getData', () => {

        it('JSON integrity', async () => {

            const jsonData =  await runTest("json");

            assert.strictEqual(typeof jsonData, "object");
            assert.strictEqual("body" in jsonData, true);
            assert.strictEqual("headers" in jsonData, true);

            const json = JSON.parse(jsonData.body);
            assert.strictEqual("length" in json, true);
            assert.strictEqual("body" in  json, true);

            const max_data_date = new Date(Math.max(...json.body.map((e: GenericJson) => new Date(e.date))));
            assert.strictEqual (max_data_date.getTime() <= new Date(releaseDate).getTime(), true);

            assert.strictEqual(json.length > 10, true);

        });

    });

    describe('#getData', () => {

        it('CSV integrity', async () => {

            const csvData =  await runTest("csv");
            
            assert.strictEqual(typeof csvData, "object");
            assert.strictEqual("body" in csvData, true);
            assert.strictEqual("headers" in csvData, true);
            assert.strictEqual(typeof csvData.body, "string");

            const arr = csvData.body.split("\n").slice(1);
            const max_data_date = new Date(Math.max(...arr.map((e: string) => new Date(e.split(",")[0]))));
            assert.strictEqual (max_data_date.getTime() <= new Date(releaseDate).getTime(), true);

            assert.strictEqual(
                csvData.body.split("\n").length > 10,
                true
            );

            assert.strictEqual(
                csvData
                    .body
                    .split("\n")[0]
                    .trim(),
                Object.keys(mainResultsStructure)
                    .join(","),
            );

        });

    });

    describe('#getData', () => {

        it('JSONL integrity', async () => {

            const jsonlData =  await runTest("jsonl");
           
            assert.strictEqual(typeof jsonlData, "object");
            assert.strictEqual("body" in jsonlData, true);
            assert.strictEqual("headers" in jsonlData, true);

            assert.strictEqual(typeof jsonlData.body, "string");


            assert.strictEqual(
                jsonlData.body.split("\n").length > 10,
                true
            );
           
            const arr = jsonlData.body.split("\n").slice(1);
            const max_data_date = new Date(Math.max(...arr.map((e: string) => new Date((JSON.parse(e)).date))));
            assert.strictEqual (max_data_date.getTime() <= new Date(releaseDate).getTime(), true);
        });

    });


});