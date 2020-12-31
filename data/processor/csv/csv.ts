import type { GenericDBResponse, DBObject, DBResponseItem } from "../../types";


/**
 * Flattens nested JSON. 
 * 
 * NOTE: This function only converts items nested using array,
 * for instance: 
 *      
 *      {key1: "value", key2: [{a: 1}, {b: 2}]}
 * 
 * @param doc { DBResponseItem }
 */
const flatten = ( doc: DBResponseItem ): any[] => {

    const result = [];
    const initialKeys = Object.keys(doc);


    let nestedColumns: Set<string> = new Set(initialKeys.reduce((acc: string[], item: string, ind: number) => {
            return Array.isArray(doc[initialKeys[ind]]) 
                ? [...acc, item]
                : acc
        }, []));

    const baseColumns = [
        "date",
        "areaType",
        "areaCode",
        "areaName",
    ];

    const baseData = baseColumns
        .reduce((acc, key) => ({...acc, [key]: doc[key]}), {});

    const scalarColumns = initialKeys
        .filter(key => [...nestedColumns, ...baseColumns].indexOf(key) < 0);

    for ( const column of scalarColumns ) {
        result.push({
            ...baseData,
            metric: column,
            value: doc?.[column] ?? null
        })
    }

    for ( const column of nestedColumns ) {

        const columnData = doc[column] as DBObject[];

        for ( let ind = 0; ind < columnData.length; ind ++ ) {
            result.push({
                ...baseData,
                metric: column,
                ...columnData[ind],
            })
        }

    }

    return result

};  // flatten



const toCsv = (docs: GenericDBResponse, nestedMetrics: string[]) => {

    if ( !docs?.length ) return null;

    const flattenedDocs = 
        nestedMetrics.length > 0
            ? docs.map(flatten).reduce((acc, item) => [...acc, ...item], [])
            : docs;

    const result      = new Array(flattenedDocs.length).fill("");

    const sampleIndex = flattenedDocs
        .map((item, ind) => [Object.keys(item).length, ind])
        .sort((a, b) => b[0] - a[0])[0][1];

    const sampleValue = flattenedDocs[sampleIndex];
    const header      = Object.keys(sampleValue);


    for ( let ind = 0; ind < flattenedDocs.length; ind ++ ) {

        let row = [];

        for ( const key of header ) {

            const value = flattenedDocs[ind]?.[key] ?? "";

            switch ( typeof value ) {
                case "number":
                    row.push(value);
                    break;

                case "string":
                    row.push(
                        value 
                            ? /([:"';`|\-+_&.,])/.test(value)
                            ? `"${value}"`
                            : value
                            : ""
                    );
                    break;

                default:
                    row.push(value === null ? "": value)
                    break;
            }

        }

        result[ind] = row.join(",");

    }

    return `${header.join(",")}\n${result.join("\n")}`

};  // toCsv


export default toCsv
