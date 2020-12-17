import toCsv from "../csv";

import type { GenericDBResponse, ResultProcessor } from "../../types";


const process = async ( data: GenericDBResponse, format: string, nestedMetrics: string[], releaseDate: string ) => {

    const areaName = data?.[0]?.areaName;

    switch ( format ) {
        case "csv":
            return {
                headers: {
                    "Content-Type": "text/csv; charset=utf-8",
                    "content-disposition": `attachment; filename="${areaName}_${releaseDate}.csv"`
                },
                body: toCsv(data, nestedMetrics)
            };

        case "jsonl":
            return {
                headers: {
                    "Content-Type": "application/vnd.PHE-COVID19.v2+jsonl; charset=utf-8",
                    "content-disposition": `attachment; filename="${areaName}_${releaseDate}.jsonl"`
                },
                body: data.map(item => JSON.stringify(item)).join("\n")
            };

        default:
            return {
                headers: {
                    "Content-Type": "application/vnd.PHE-COVID19.v2+json; charset=utf-8",
                    "content-disposition": `attachment; filename="${areaName}_${releaseDate}.${format}"`
                },
                body: JSON.stringify({
                    length: data.length,
                    body: data
                })
            };
    }

};  // process


const processResults = ({ format, nestedMetrics=[], releaseDate }: ResultProcessor) => {

    return (data: GenericDBResponse) => process(data, format, nestedMetrics, releaseDate);

};  // processResults



export default processResults;
