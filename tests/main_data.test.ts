import { describe, it } from "mocha";

import assert from "assert";

import type { QueryParamsType, GenericJson } from "../data/types";

import { mainDataQuery } from '../data/engine';

describe("main_data", () => {

    describe('#getJSON', () => {

        const queryParams: QueryParamsType = {
            areaType: "nation",
            areaCode: "E92000001",
            release: "2020-11-20T16:53:34.0092775Z",
            metric: "newCasesByPublish,femaleCases,maleCases",
            format: "json"
        } 
        
        const releasedMetrics: GenericJson = {
                "newCasesByPublish": "newCasesByPublish",
                "femaleCases": "femaleCases",
                "maleCases": "maleCases"
        }

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

});