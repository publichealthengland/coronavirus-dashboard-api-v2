import { describe, it } from "mocha";

import assert from "assert";

import type { GenericDBResponse, GenericJson, ResultProcessor } from "../data/types";

import { mainResultsStructure } from './vars';

import processResults from "../data/processor";


describe("result", () => {

    describe('#processResults', () => {

        const releaseDate = "2020-11-20";

        const nestedMetrics: string[] = [
            "maleCases", 
            "femaleCases"
        ];

        const data = [
            {
                date: '2020-11-20',
                areaType: 'nation',
                areaCode: 'E92000001',
                areaName: 'England',
                newCasesByPublishDate: 300,
                femaleCases:  [
                    {"age":"55_to_59","rate":2517.1,"value":48502},
                    {"age":"20_to_24","rate":4088.8,"value":64919}
                ],
                maleCases:  [
                    {"age":"35_to_39","rate":3374.3,"value":64361},
                    {"age":"25_to_29","rate":4329.4,"value":73389}
                ]
            },
            {
                date: '2020-11-19',
                areaType: 'nation',
                areaCode: 'E92000001',
                areaName: 'England',
                newCasesByPublishDate: 300,
                femaleCases:  [
                    {"age":"55_to_59","rate":2517.1,"value":48502},
                    {"age":"20_to_24","rate":4088.8,"value":64919}
                ],
                maleCases:  [
                    {"age":"55_to_59","rate":2517.1,"value":48502},
                    {"age":"20_to_24","rate":4088.8,"value":64919}
                ]
            },
            {
                date: '2020-11-18',
                areaType: 'nation',
                areaCode: 'E92000001',
                areaName: 'England',
                newCasesByPublishDate: 110,
                femaleCases:  [
                    {"age":"55_to_59","rate":2517.1,"value":48502},
                    {"age":"20_to_24","rate":4088.8,"value":64919}
                ],
                maleCases:  [
                    {"age":"55_to_59","rate":2517.1,"value":48502},
                    {"age":"20_to_24","rate":4088.8,"value":64919}
                ]
            },
            {
                date: '2020-11-17',
                areaType: 'nation',
                areaCode: 'E92000001',
                areaName: 'England',
                newCasesByPublishDate: 92,
                femaleCases:  [
                    {"age":"55_to_59","rate":2517.1,"value":48502},
                    {"age":"20_to_24","rate":4088.8,"value":64919}
                ],
                maleCases:  [
                    {"age":"55_to_59","rate":2517.1,"value":48502},
                    {"age":"20_to_24","rate":4088.8,"value":64919}
                ]
            }
        ];

        const params = {
            format: "json",
            nestedMetrics: nestedMetrics,
            releaseDate: releaseDate,
            area: {
                areaType: 'nation',
                areaCode: 'E92000001',
                areaName: 'England',
            }
        } as ResultProcessor

        it('JSON integrity', async () => {
            
            const jsonData = await processResults( params )(data as GenericDBResponse);
  
            assert.notStrictEqual(jsonData, null);
            assert.strictEqual(typeof jsonData, "object");
            assert.strictEqual("body" in jsonData, true);
            assert.strictEqual("headers" in jsonData, true);
            assert.strictEqual("content-disposition" in jsonData.headers, true);
    
            const json = JSON.parse(jsonData.body !== null ? jsonData.body : "");
            assert.strictEqual("length" in json, true);
            assert.strictEqual("body" in  json, true);
            assert.strictEqual(json.length > 0, true);

            const max_data_date = Math.max(...data.map(e => new Date(e.date).getTime()), 0);
            const max_response_date = Math.max(...json.body.map((e: GenericJson) => new Date(e.date).getTime()));
            assert.strictEqual (max_response_date <= max_data_date, true)
    
        });

        it('CSV integrity', async () => {

            params["format"] = "csv";

            const csvData = await processResults( params )(data as GenericDBResponse);

            assert.notStrictEqual(csvData, null);
            assert.strictEqual(typeof csvData, "object");
            assert.strictEqual("body" in csvData, true);
            assert.strictEqual("headers" in csvData, true);
            assert.strictEqual("content-disposition" in csvData.headers, true);


           
            assert.strictEqual(
                csvData.body !== null && csvData.body.split("\n").length > data.length + 1,
                true
            );

            assert.strictEqual(
                csvData.body !== null &&  csvData.body
                    .split("\n")[0]
                    .trim(),
                Object.keys(mainResultsStructure)
                    .join(","),
            );

            const arr =  csvData.body !== null ? csvData.body.split("\n").slice(1) : [];
            const max_response_date = Math.max(...arr.map((e: string) => new Date(e.split(",")[0]).getTime()))
            const max_data_date = Math.max(...data.map(e => new Date(e.date).getTime()), 0);
            assert.strictEqual (max_response_date <= max_data_date, true);


        });

        it('JSONL integrity', async () => {

            params["format"] = "jsonl";

            const jsonlData = await processResults( params )(data as GenericDBResponse);
            assert.notStrictEqual(jsonlData, null);
            assert.strictEqual(typeof jsonlData, "object");
            assert.strictEqual("body" in jsonlData, true);
            assert.strictEqual("headers" in jsonlData, true);
            assert.strictEqual("content-disposition" in jsonlData.headers, true);

            assert.strictEqual(typeof jsonlData.body, "string");

            assert.strictEqual(
                jsonlData.body !== null && jsonlData.body.split("\n").length > 0,
                true
            );

            const arr = jsonlData.body !== null ? jsonlData.body.split("\n").slice(1) : [];
            const max_response_date = Math.max(...arr.map((e: string) => new Date((JSON.parse(e)).date).getTime()));
            const max_data_date = Math.max(...data.map(e => new Date(e.date).getTime()), 0);
            assert.strictEqual (max_response_date <= max_data_date, true)


        });

    });

});
