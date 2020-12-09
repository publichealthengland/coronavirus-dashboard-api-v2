import { describe, it } from "mocha";

import assert from "assert";

import type { QueryParamsType } from "../data/types";

import { msoaQuery } from '../data/engine';

describe("msoa_data", () => {

    describe('#getJSON', () => {

        const metrics = "newCasesBySpecimenDateRollingSum,newCasesBySpecimenDateRollingRate";

        const queryParams: QueryParamsType = {
            areaType: "msoa",
            areaCode: "E09000014",
            release: "2020-11-20T16:53:34.0092775Z",
            metric: metrics,
            format: "json"
        } 

        it('JSON integrity', async () => {
        
            const jsonData =  await msoaQuery(queryParams);
                      
            assert.strictEqual(typeof jsonData, "object");
            assert.strictEqual("body" in jsonData, true);
            assert.strictEqual("headers" in jsonData, true);

            const json = JSON.parse(jsonData.body);

            assert.strictEqual("length" in json, true);
            assert.strictEqual("body" in  json, true);

            assert.strictEqual(json.length > 10, true);

            const arr = metrics.split(',');

            for(let i = 0; i < arr.length; i++) {
                assert.strictEqual(
                    arr[i] in json.body[0],
                    true,
                    `${arr[i]} not found.`
                );
            }

        });

    });

});