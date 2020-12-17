import { describe, it } from "mocha";

import assert from "assert";

import type { GenericDBResponse, GenericJson } from "../data/types";

import { mainResultsStructure, msoaResultsStructure } from './vars';

import toCSV from '../data/processor/csv';
import { generateKeyPair } from "crypto";

describe("csv", () => {

    describe('#toCSV main', () => {

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
        ]

        const nestedMetrics: string[] = [
            "maleCases", 
            "femaleCases"
        ];

        it('CSV integrity',  () => {
    
            const csv =  toCSV(data as GenericDBResponse, nestedMetrics)

            assert.strictEqual(typeof csv, "string");
           
            assert.strictEqual(
                csv.split("\n").length > data.length + 1,
                true
            );

            assert.strictEqual(
                csv
                    .split("\n")[0]
                    .trim(),
                Object.keys(mainResultsStructure)
                    .join(","),
            );

            const arr = csv.split("\n").slice(1);
            const max_response_date = Math.max(...arr.map((e: string) => new Date(e.split(",")[0]).getTime()))
            const max_data_date = Math.max(...data.map(e => new Date(e.date).getTime()), 0);
            assert.strictEqual (max_response_date <= max_data_date, true);

        });

    });

    describe('#toCSV msoa', () => {

        const data = [
            {
                regionCode: "E12000007",
                regionName: "London",
                UtlaCode: "E09000014",
                UtlaName: "Haringey",
                LtlaCode: "E09000014",
                LtlaName: "Haringey",
                areaType: "msoa",
                areaCode: "E02000402",
                areaName: "Tottenham Bruce Castle Park",
                date: "2020-12-05",
                newCasesBySpecimenDateRollingSum: 12,
                newCasesBySpecimenDateRollingRate: 181.5,
                newCasesBySpecimenDateChange: -1,
                newCasesBySpecimenDateChangePercentage: -7.7,
                newCasesBySpecimenDateDirection: "DOWN"
                
            },

            {
                regionCode: "E12000007",
                regionName: "London",
                UtlaCode: "E09000014",
                UtlaName: "Haringey",
                LtlaCode: "E09000014",
                LtlaName: "Haringey",
                areaType: "msoa",
                areaCode: "E02000402",
                areaName: "Tottenham Bruce Castle Park",
                date: "2020-12-05",
                newCasesBySpecimenDateRollingSum: 12,
                newCasesBySpecimenDateRollingRate: 181.5,
                newCasesBySpecimenDateChange: -1,
                newCasesBySpecimenDateChangePercentage: -7.7,
                newCasesBySpecimenDateDirection: "DOWN"
            },     
            {
                regionCode: "E12000007",
                regionName: "London",
                UtlaCode: "E09000014",
                UtlaName: "Haringey",
                LtlaCode: "E09000014",
                LtlaName: "Haringey",
                areaType: "msoa",
                areaCode: "E02000402",
                areaName: "Tottenham Bruce Castle Park",
                date: "2020-11-28",
                newCasesBySpecimenDateRollingSum: 13,
                newCasesBySpecimenDateRollingRate: 196.6,
                newCasesBySpecimenDateChange: 2,
                newCasesBySpecimenDateChangePercentage: 18.2,
                newCasesBySpecimenDateDirection: "UP"
                
            },
            {
                regionCode: "E12000007",
                regionName: "London",
                UtlaCode: "E09000014",
                UtlaName: "Haringey",
                LtlaCode: "E09000014",
                LtlaName: "Haringey",
                areaType: "msoa",
                areaCode: "E02000402",
                areaName: "Tottenham Bruce Castle Park",
                date: "2020-11-21",
                newCasesBySpecimenDateRollingSum: 11,
                newCasesBySpecimenDateRollingRate: 166.4,
                newCasesBySpecimenDateChange: -4,
                newCasesBySpecimenDateChangePercentage: -26.7,
                newCasesBySpecimenDateDirection: "DOWN"
                
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
                Object.keys(msoaResultsStructure)
                    .join(","),
            );

            const arr = csv.split("\n").slice(1);
            const max_response_date = Math.max(...arr.map((e: string) => new Date(e.split(",")[9]).getTime()))
            const max_data_date = Math.max(...data.map(e => new Date(e.date).getTime()), 0);
            assert.strictEqual (max_response_date <= max_data_date, true);

        });

    });

});
