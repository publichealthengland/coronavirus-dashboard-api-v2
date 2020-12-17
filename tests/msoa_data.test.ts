import { describe, it } from "mocha";

import assert from "assert";

import type { QueryParamsType, GenericJson } from "../data/types";

import { msoaQuery } from '../data/engine';

import { msoaResultsStructure } from './vars';

import moment from 'moment';

describe("msoa_data", () => {

    const metrics = "newCasesBySpecimenDateRollingSum," +
                    "newCasesBySpecimenDateRollingRate," +
                    "newCasesBySpecimenDateChange," +
                    "newCasesBySpecimenDateChangePercentage," +
                    "newCasesBySpecimenDateDirection"

    let today = new Date ();
    const releaseDate =  moment(today.setDate(today.getDate()-1)).format( "YYYY-MM-DD");
    
    const queryParams: QueryParamsType = {
        areaType: "msoa",
        areaCode: "E09000014",
        release: releaseDate,
        metric: metrics,
        format: "json"
    } 

    describe('#msoaQuery', () => {

     
        it('JSON integrity', async () => {

            queryParams["format"] = "json";
        
            const jsonData =  await msoaQuery(queryParams, releaseDate);
                      
            assert.strictEqual(typeof jsonData, "object");
            assert.strictEqual("body" in jsonData, true);
            assert.strictEqual("headers" in jsonData, true);
            assert.strictEqual("content-disposition" in jsonData.headers, true);

            const json = JSON.parse(jsonData.body);

            assert.strictEqual("length" in json, true);
            assert.strictEqual("body" in  json, true);
            assert.strictEqual(json.length > 10, true);

            const max_response_date = Math.max(...json.body.map((e: GenericJson) => new Date(e.date).getTime()));
            assert.strictEqual (max_response_date <= new Date(releaseDate).getTime(), true);

        });

        it('CSV integrity', async () => {
    
            queryParams["format"] = "csv";
        
            const csvData =  await msoaQuery(queryParams, releaseDate);
                      
            assert.strictEqual(typeof csvData, "object");
            assert.strictEqual("body" in csvData, true);
            assert.strictEqual("headers" in csvData, true);
            assert.strictEqual("content-disposition" in csvData.headers, true);

            assert.strictEqual(typeof csvData.body, "string");

            assert.strictEqual(
                csvData.body.split("\n").length > 10,
                true
            );

            const arr = csvData.body.split("\n").slice(1);
            const max_response_date = new Date(Math.max(...arr.map((e: string) => new Date(e.split(",")[9]))));
            assert.strictEqual (max_response_date.getTime() <= new Date(releaseDate).getTime(), true)

            assert.strictEqual(
                csvData
                    .body
                    .split("\n")[0]
                    .trim(),
                Object.keys(msoaResultsStructure)
                    .join(","),
            );

        });


        it('JSONL integrity', async () => {
                
            queryParams["format"] = "jsonl";
        
            const jsonlData =  await msoaQuery(queryParams, releaseDate);
                      
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
            const max_response_date = new Date(Math.max(...arr.map((e: string) => new Date((JSON.parse(e)).date))));
            assert.strictEqual (max_response_date.getTime() <= new Date(releaseDate).getTime(), true);
        });
    });

});