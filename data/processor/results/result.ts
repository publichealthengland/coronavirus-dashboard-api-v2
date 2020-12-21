import toCsv from "../csv";

import type { GenericDBResponse, ResultProcessor, AreaInfo } from "../../types";


const process = async ( data: GenericDBResponse, format: string, nestedMetrics: string[], releaseDate: string, area: AreaInfo ) => {

    let { areaName, areaType, areaCode } = area;

    if ( areaType === "msoa" && areaCode ) {
        areaName = data[0].areaName as string
    }
    
    const fileName = `${areaName ? areaName : areaType}_${releaseDate}.${format}`;

    if ( !data?.length ) {
        return {
            headers: {
                "Content-Type": "text/csv; charset=utf-8",
                "content-disposition": `attachment; filename="${fileName}"`
            },
            body: null,
            statusCode: 204
        };
    }

    switch ( format ) {
        case "csv":
            return {
                headers: {
                    "Content-Type": "text/csv; charset=utf-8",
                    "content-disposition": `attachment; filename="${fileName}"`
                },
                body: toCsv(data, nestedMetrics)
            };

        case "jsonl":
            return {
                headers: {
                    "Content-Type": "application/vnd.PHE-COVID19.v2+jsonl; charset=utf-8",
                    "content-disposition": `attachment; filename="${fileName}"`
                },
                body: data.map(item => JSON.stringify(item)).join("\n")
            };

        default:
            return {
                headers: {
                    "Content-Type": "application/vnd.PHE-COVID19.v2+json; charset=utf-8",
                    "content-disposition": `attachment; filename="${fileName}"`
                },
                body: JSON.stringify({
                    length: data.length,
                    body: data
                })
            };
    }

};  // process


const processResults = ({ format, nestedMetrics=[], releaseDate, area }: ResultProcessor) => {

    return (data: GenericDBResponse) => process(data, format, nestedMetrics, releaseDate, area);

};  // processResults



export default processResults;
