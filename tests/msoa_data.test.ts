import { describe, it } from "mocha";

import assert from "assert";

import type { QueryParamsType, GenericJson } from "../data/types";

import { msoaQuery } from '../data/engine';

describe("msoa_data", () => {


    const metrics = "newCasesBySpecimenDateRollingSum,newCasesBySpecimenDateRollingRate";

    const releaseDate = "2020-12-05T00:00:00.000Z"
    
    const queryParams: QueryParamsType = {
        areaType: "msoa",
        areaCode: "E09000014",
        release: releaseDate,
        metric: metrics,
        format: "json"
    } 

    describe('#getJSON', () => {

     
        it('JSON integrity', async () => {

            queryParams["format"] = "json";
        
            const jsonData =  await msoaQuery(queryParams);
                      
            assert.strictEqual(typeof jsonData, "object");
            assert.strictEqual("body" in jsonData, true);
            assert.strictEqual("headers" in jsonData, true);

            const json = JSON.parse(jsonData.body);

            assert.strictEqual("length" in json, true);
            assert.strictEqual("body" in  json, true);

            assert.strictEqual(json.length > 10, true);

        });

    });

    describe('#getCSV', () => {

        it('CSV integrity', async () => {

            const resultsStructure: GenericJson = {
                "regionCode": "regionCode",
                "regionName": "regionName",
                "UtlaCode": "UtlaCode",
                "UtlaName": "UtlaName",
                "LtlaCode": "LtlaCode",
                "LtlaName": "LtlaName",
                "areaType": "areaType",
                "areaCode": "areaCode",
                "areaName": "areaName",
                "date": "date",
                "newCasesBySpecimenDateRollingSum": "newCasesBySpecimenDateRollingSum",
                "newCasesBySpecimenDateRollingRate": "newCasesBySpecimenDateRollingRate"
            }

                
            queryParams["format"] = "csv";
        
            const csvData =  await msoaQuery(queryParams);
                      
            assert.strictEqual(typeof csvData, "object");
            assert.strictEqual("body" in csvData, true);
            assert.strictEqual("headers" in csvData, true);
            assert.strictEqual(typeof csvData.body, "string");

            assert.strictEqual(
                csvData.body.split("\n").length > 10,
                true
            );

            const arr = csvData.body.split("\n").slice(1);
            const max_data_date = new Date(Math.max(...arr.map((e: string) => new Date(e.split(",")[9]))));

            assert.strictEqual (max_data_date.getTime() <= new Date(releaseDate).getTime(), true)


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

        it('JSONL integrity', async () => {
                
            queryParams["format"] = "jsonl";
        
            const jsonlData =  await msoaQuery(queryParams);
                      
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

            assert.strictEqual (max_data_date.getTime() <= new Date(releaseDate).getTime(), true)


        });

    });

});