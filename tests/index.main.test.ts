import { describe, it } from "mocha";

import assert from "assert";

import { 
    Context, 
    HttpRequest
} from "@azure/functions";

import {
    executionContext,
    traceContext,
    bindingDefinition,
    logger
} from './vars';

import type { GenericJson } from "../data/types";

import httpTrigger from '../data/index';


describe("index main", () => {

    const releaseDate = "2020-11-20T00:00:00.000Z";

    const metrics = "newCasesByPublishDate,femaleCases,maleCases";

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

    const request: HttpRequest = {

        method: "GET",
        url: "http://localhost:7001",
        headers: {},
        query: {
            areaType: "nation",
            areaCode: "E92000001",
            release: releaseDate,
            metric: metrics,
            format: "json"
        },
        params: {},        
        body: null,
        rawBody: null
    
    };

    const context: Context = {

        invocationId: "id",
    
        executionContext: executionContext,
    
        bindings: {},
    
        bindingData: {},
    
        traceContext: traceContext,
    
        bindingDefinitions: bindingDefinition,
    
        log: logger,
    
        
        done: () => {},
        
        req: request,
        
        res: {}
       
    };


    const apiMetrics: GenericJson = {
        "newCasesByPublishDate": "int",
        "femaleCases": "list",
        "maleCases": "list"
    };

    describe('#httpTrigger', () => {

        it('JSON integrity',  async () => {

            request["query"]["format"] = "json";

            const jsonData =  await httpTrigger(context, request, apiMetrics);

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

        it('CSV integrity',  async () => {

        
            request["query"]["format"] = "csv";

            const csvData =  await httpTrigger(context, request, apiMetrics);

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

            request["query"]["format"] = "jsonl";
            
            const jsonlData =  await httpTrigger(context, request, apiMetrics);

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
            const max_respnse_date = Math.max(...arr.map((e: string) => new Date((JSON.parse(e)).date).getTime()));
            assert.strictEqual (max_respnse_date <= new Date(releaseDate).getTime(), true);

        });

    });


});