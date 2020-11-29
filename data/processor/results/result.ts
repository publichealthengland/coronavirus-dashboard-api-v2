import toCsv from "../csv";

import type { GenericDBResponse } from "../../types";


const process = async ( data: GenericDBResponse, format: string, nestedMetrics: string[] ) => {

    switch ( format ) {
        case "csv":
            return {
                headers: {
                    "Content-Type": "text/csv; charset=utf-8"
                },
                body: toCsv(data, nestedMetrics)
            };

        case "jsonl":
            return {
                headers: {
                    "Content-Type": "application/vnd.PHE-COVID19.v2+jsonl; charset=utf-8"
                },
                body: data.map(item => JSON.stringify(item)).join("\n")
            };

        default:
            return {
                headers: {
                    "Content-Type": "application/vnd.PHE-COVID19.v2+json; charset=utf-8"
                },
                body: JSON.stringify({
                    length: data.length,
                    body: data
                })
            };
    }

};  // process


const processResults = ( format: string, nestedMetrics: string[] = []) => {

    return (data: GenericDBResponse) => process(data, format, nestedMetrics);

};  // processResults



export default processResults;
