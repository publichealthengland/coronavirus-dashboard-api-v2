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
            release: "2020-11-20T00:00:00.000Z",
            metric: metrics,
            format: "json"
        };  

        it('JSON integrity', async () => {
        
            const jsonData =  await mainDataQuery(queryParams, releasedMetrics);
                      
            assert.strictEqual(typeof jsonData, "object");
            assert.strictEqual("body" in jsonData, true);
            assert.strictEqual("headers" in jsonData, true);

            const json = JSON.parse(jsonData.body);

            const max_data_date = new Date(Math.max(...json.body.map((e: GenericJson) => new Date(e.date))));

            assert.strictEqual (max_data_date.getTime() <= new Date(queryParams.release).getTime(), true)

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
            release: "2020-11-20T00:00:00.000Z",
            metric: metrics,
            format: "csv"
        };
        

        it('CSV integrity', async () => {
        
            const csvData =  await mainDataQuery(queryParams, releasedMetrics);

            assert.strictEqual(typeof csvData, "object");
            assert.strictEqual("body" in csvData, true);
            assert.strictEqual("headers" in csvData, true);

            const arr = csvData.body.split("\n").slice(1);
            const max_data_date = new Date(Math.max(...arr.map((e: string) => new Date(e.split(",")[0]))));

            assert.strictEqual (max_data_date.getTime() <= new Date(queryParams.release).getTime(), true)

            assert.strictEqual(typeof csvData.body, "string");

            assert.strictEqual(
                csvData.body.split("\n").length > 10,
                true
            );

        });

    });

    describe('#getJSONL', () => {

        const queryParams: QueryParamsType = {
            areaType: "nation",
            areaCode: "E92000001",
            release: "2020-11-20T00:00:00.000Z",
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
           
            const arr = jsonlData.body.split("\n").slice(1);
            const max_data_date = new Date(Math.max(...arr.map((e: string) => new Date((JSON.parse(e)).date))));

            assert.strictEqual (max_data_date.getTime() <= new Date(queryParams.release).getTime(), true)

        });

    });


});