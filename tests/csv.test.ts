import { describe, it } from "mocha";

import assert from "assert";

import nations_sample from './assets/nations_sample.json';
import msoa_sample from './assets/msoa_sample.json';

import type { DBObject } from "../data/types";

import { mainResultsStructure, msoaResultsStructure } from './vars';

import toCSV from '../data/processor/csv';

describe("csv", () => {

    const csvToArray = (text: string) => {
        let p = '', row = [''], ret = [row], i = 0, r = 0, s = !0, l;
        for (l of text) {
            if ('"' === l) {
                if (s && l === p) row[i] += l;
                s = !s;
            } else if (',' === l && s) l = row[++i] = '';
            else if ('\n' === l && s) {
                if ('\r' === p) row[i] = row[i].slice(0, -1);
                row = ret[++r] = [l = '']; i = 0;
            } else row[i] += l;
            p = l;
        }
        return ret;
    };

    const checkMsoaDuplicates = (csv: string) => {
        
        const arr = csvToArray(csv).slice(1);

        msoa_sample.forEach(element => {
            
            const dte = element.date;

            let metric = element.newCasesBySpecimenDateRollingSum;
            let line = arr.filter(item => item[9] === dte && parseFloat(item[10]) === metric);
            assert.strictEqual(line.length, 1);

            metric = element.newCasesBySpecimenDateRollingRate;
            line = arr.filter(item => item[9] === dte && parseFloat(item[11]) === metric);
            assert.strictEqual(line.length, 1);

            metric = element.newCasesBySpecimenDateChange;
            line = arr.filter(item => item[9] === dte && parseFloat(item[12]) === metric);
            assert.strictEqual(line.length, 1);

            metric = element.newCasesBySpecimenDateChangePercentage;
            line = arr.filter(item => item[9] === dte && parseFloat(item[13]) === metric);
            assert.strictEqual(line.length, 1);

            const newCasesBySpecimenDateDirection = element.newCasesBySpecimenDateDirection;
            line = arr.filter(item => item[9] === dte && item[14] === newCasesBySpecimenDateDirection);
            assert.strictEqual(line.length, 1);
        });
    };

    const checkMainDuplicates = (csv: string) => {

        const arr = csvToArray(csv).slice(1);
        
        nations_sample.forEach(element => {

            const dte = element.date;
            const metric = element.newCasesByPublishDate;
            
            let line = arr.filter(item => item[0] === dte && 
                                    item[4] === 'newCasesByPublishDate' && 
                                    parseInt(item[7]) === metric);
            
            assert.strictEqual(line.length, 1);

            let ages = (element.femaleCases as DBObject[]).map(item => item.age);
            
            ages.forEach(age => {

                line = arr.filter(item => item[0] === dte && item[4] === 'femaleCases' && item[5] === age);

                assert.strictEqual(line.length, 1);

            });

            ages = (element.maleCases as DBObject[]).map(item => item.age);
            
            ages.forEach(age => {

                line = arr.filter(item => item[0] === dte && item[4] === 'maleCases' && item[5] === age);

                assert.strictEqual(line.length, 1);

            });
    
            
        });
    }

    describe('#toCSV main', () => {

        const nestedMetrics: string[] = [
            "maleCases", 
            "femaleCases"
        ];

        it('CSV integrity',  () => {

            console.log("Hello................")
            console.log(nations_sample)
    
            const csv =  toCSV(nations_sample, nestedMetrics);

            assert.notStrictEqual(csv, null);

            assert.strictEqual(typeof csv, "string");
           
            assert.strictEqual(
                csv !== null && csv.split("\n").length > nations_sample.length + 1,
                true
            );

            assert.strictEqual(
                csv !== null && csv
                    .split("\n")[0]
                    .trim(),
                Object.keys(mainResultsStructure)
                    .join(","),
            );

            const arr = csv !== null ? csv.split("\n").slice(1) : [];
            const max_response_date = Math.max(...arr.map((e: string) => new Date(e.split(",")[0]).getTime()))
            const max_data_date = Math.max(...nations_sample.map(e => new Date(e.date).getTime()), 0);
            assert.strictEqual (max_response_date <= max_data_date, true);

            checkMainDuplicates(csv !== null ? csv : "");

        });

    });

    describe('#toCSV msoa', () => {

        const nestedMetrics: string[] = [
        ];

        it('CSV integrity',  () => {
    
            const csv =  toCSV(msoa_sample, nestedMetrics)

            assert.notStrictEqual(csv, null);

            assert.strictEqual(typeof csv, "string");
           
            assert.strictEqual(
                csv !== null && csv.split("\n").length === msoa_sample.length + 1,
                true
            );

            assert.strictEqual(
                csv !== null && csv
                    .split("\n")[0]
                    .trim(),
                Object.keys(msoaResultsStructure)
                    .join(","),
            );

            const arr = csv !== null ? csv.split("\n").slice(1) : [];
            const max_response_date = Math.max(...arr.map((e: string) => new Date(e.split(",")[9]).getTime()))
            const max_data_date = Math.max(...msoa_sample.map(e => new Date(e.date).getTime()), 0);
            assert.strictEqual (max_response_date <= max_data_date, true);

            checkMsoaDuplicates(csv !== null ? csv : "");

        });

    });

});
