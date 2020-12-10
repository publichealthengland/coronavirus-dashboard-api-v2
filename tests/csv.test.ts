import { describe, it } from "mocha";

import assert from "assert";


import type { GenericDBResponse, GenericJson } from "../data/types";


import toCSV from '../data/processor/csv';

describe("csv", () => {

    const resultsStructure: GenericJson = {
        "date": "date",
        "areaType": "areaType",
        "areaCode": "areaCode",
        "areaName": "areaName" ,
        "newCasesByPublish": "newCasesByPublish",
        "femaleCases": "femaleCases",
        "maleCases": "maleCases"
    };

    describe('#toCSV main', () => {

        const data = [
            {
                date: '2020-11-20',
                areaType: 'nation',
                areaCode: 'E92000001',
                areaName: 'England',
                newCasesByPublish: 300,
                femaleCases: 200,
                maleCases: 100
            },
            {
                date: '2020-11-19',
                areaType: 'nation',
                areaCode: 'E92000001',
                areaName: 'England',
                newCasesByPublish: 300,
                femaleCases: 100,
                maleCases: 200
            },
            {
                date: '2020-11-18',
                areaType: 'nation',
                areaCode: 'E92000001',
                areaName: 'England',
                newCasesByPublish: 110,
                femaleCases: 60,
                maleCases: 50
            },
            {
                date: '2020-11-17',
                areaType: 'nation',
                areaCode: 'E92000001',
                areaName: 'England',
                newCasesByPublish: 92,
                femaleCases: 25,
                maleCases: 67
            }
        ]

        const nestedMetrics: string[] = [
        ];

        it('CSV integrity',  () => {
    
            const csv =  toCSV(data as GenericDBResponse, nestedMetrics)

            assert.strictEqual(typeof csv, "string");
           

            assert.strictEqual(
                csv.split("\n").length === data.length + 1,
                true
            );

            assert.strictEqual(
                csv
                    .split("\n")[0]
                    .trim(),
                Object.keys(resultsStructure)
                    .join(","),
            );


        });

    });

});

