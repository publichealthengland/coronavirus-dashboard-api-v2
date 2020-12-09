import { describe, it } from "mocha";

import assert from "assert";

import type { QueryParamsType, GenericJson } from "../data/types";

import { mainDataQuery } from '../data/engine';

describe("main_data", () => {

    const releasedMetrics: GenericJson = {
        "newCasesByPublish": "newCasesByPublish",
        "femaleCases": "femaleCases",
        "maleCases": "maleCases"
    };

    const metrics = "newCasesByPublish,femaleCases,maleCases";

    describe('#getJSON', () => {

        const queryParams: QueryParamsType = {
            areaType: "nation",
            areaCode: "E92000001",
            release: "2020-11-20T16:53:34.0092775Z",
            metric: metrics,
            format: "json"
        };  

        it('JSON integrity', async () => {
        
            const jsonData =  await mainDataQuery(queryParams, releasedMetrics);
                      
            assert.strictEqual(typeof jsonData, "object");
            assert.strictEqual("body" in jsonData, true);
            assert.strictEqual("headers" in jsonData, true);

            const json = JSON.parse(jsonData.body);

            assert.strictEqual("length" in json, true);
            assert.strictEqual("body" in  json, true);

            assert.strictEqual(json.length > 10, true);

            for (const key in releasedMetrics) {
                if (!releasedMetrics.hasOwnProperty(key)) continue;
            
                assert.strictEqual(
                    key in json.body[0],
                    true,
                    `${key} not found.`
                );
            }

        });

    });

    describe('#getCSV', () => {

        const resultsStructure: GenericJson = {
            "date": "date",
            "areaType": "areaType",
            "areaCode": "areaCode",
            "areaName": "areaName" ,
            "newCasesByPublish": "newCasesByPublish",
            "femaleCases": "femaleCases",
            "maleCases": "maleCases"
        };

        const queryParams: QueryParamsType = {
            areaType: "nation",
            areaCode: "E92000001",
            release: "2020-11-20T16:53:34.0092775Z",
            metric: metrics,
            format: "csv"
        };
        

        it('CSV integrity', async () => {
        
            const csvData =  await mainDataQuery(queryParams, releasedMetrics);

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
                Object.keys(resultsStructure)
                    .join(","),
            );

        });

    });

    describe('#getJSONL', () => {

        const queryParams: QueryParamsType = {
            areaType: "nation",
            areaCode: "E92000001",
            release: "2020-11-20T16:53:34.0092775Z",
            metric: metrics,
            format: "jsonl"
        };
        
        it('JSONL integrity', async () => {
        
            const jsonlData =  await mainDataQuery(queryParams, releasedMetrics);

            assert.strictEqual(typeof jsonlData, "object");
            assert.strictEqual("body" in jsonlData, true);
            assert.strictEqual("headers" in jsonlData, true);

            assert.strictEqual(typeof jsonlData.body, "string");


            assert.strictEqual(
                jsonlData.body.split("\n").length > 10,
                true
            );
           
            const arr = jsonlData.body.split("\n");
            const metrics_arr = metrics.split(",");

             for(let i = 0; i < arr.length; i++) {

                const json = JSON.parse(arr[i])
                for(let j = 0; j <  metrics_arr.length; j++) {
    
                    assert.strictEqual(
                        metrics_arr[j] in json,
                        true,
                        `${arr[i]} not found.`
                    );
                }
            }

        });

    });


});