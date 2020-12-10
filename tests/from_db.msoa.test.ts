import { describe, it } from "mocha";

import assert from "assert";

import type { GenericJson } from "../data/types";
import processResults from "../data/processor";

import * as vars from "../data/engine/queries/variables";

import { GetData } from '../data/engine/database';

import { CosmosClient } from "@azure/cosmos";

describe("from_db msoa", () => {


    const releaseDate = "2020-12-04";

    
    const container = new CosmosClient(vars.DB_CONNECTION)
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

    const rawMetrics: string[] = [
        "newCasesBySpecimenDateRollingSum",
        "newCasesBySpecimenDateRollingRate"
    ];

    const runTest = async (format: string)  => {
        
      
        // DB Query params
        const parameters = [
            {name: "@areaType", value: 'msoa'},
            {name: "@areaCode", value: 'E09000014'},
            
        ];

        let queryFilters = "c.areaType = 'msoa'";

        queryFilters += `AND ( 
                        c.areaCode   = 'E09000014'
                        OR c.LtlaCode   = 'E09000014'
                        OR c.UtlaCode   = 'E09000014'
                        OR c.regionCode = 'E09000014'
                    )`;


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

        const data =  await GetData(query, parameters, {
                                    container: container,
                                    processor: processResults(format)
        });

        return data
    }

    describe('#getData', () => {

        const container = new CosmosClient(vars.DB_CONNECTION)
                            .database(vars.DB_NAME)
                            .container(vars.PUBLIC_DATA);

        it('JSON integrity', async () => {

            const jsonData =  await runTest("json")
            assert.strictEqual(typeof jsonData, "object");
            assert.strictEqual("body" in jsonData, true);
            assert.strictEqual("headers" in jsonData, true);

            const json = JSON.parse(jsonData.body);


            assert.strictEqual("length" in json, true);
            assert.strictEqual("body" in  json, true);

            assert.strictEqual(json.length > 10, true);


        });

    });

    describe('#getData', () => {

        it('CSV integrity', async () => {

            const csvData =  await runTest("csv")
            
            assert.strictEqual(typeof csvData, "object");
            assert.strictEqual("body" in csvData, true);
            assert.strictEqual("headers" in csvData, true);
            assert.strictEqual(typeof csvData.body, "string");

            assert.strictEqual(
                csvData.body.split("\n").length > 10,
                true
            );

            assert.strictEqual(
                csvData
                    .body
                    .split("\n")[0]
                    .trim(),
                Object.keys(defaultMetrics)
                    .join(",") + "," + rawMetrics.join(","),
        
            );

        });

    });

    describe('#getData', () => {

        it('JSONL integrity', async () => {

            const jsonlData =  await runTest("jsonl")
           
            assert.strictEqual(typeof jsonlData, "object");
            assert.strictEqual("body" in jsonlData, true);
            assert.strictEqual("headers" in jsonlData, true);

            assert.strictEqual(typeof jsonlData.body, "string");


            assert.strictEqual(
                jsonlData.body.split("\n").length > 10,
                true
            );
           
        });

    });


});