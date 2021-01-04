import { CosmosClient } from "@azure/cosmos";
import * as vars from "./variables";


const container = new CosmosClient(vars.DB_CONNECTION)
                .database(vars.DB_NAME)
                .container(vars.LOOKUP_DATA);


export const getAreaInfo = async ( areaType: string, areaCode: string | null ): Promise<any> => {

    if ( !areaCode ) {
        return {
            areaName: null,
            areaType: areaType
        }
    }

    const partitionKey = "general";

    // DB Query params
    const parameters = [
        {
            name: "@areaCode", 
            value: areaCode
        },
        {
            name: "@areaType", 
            value: areaType
        },
        {
            name: "@type", 
            value: partitionKey
        }
    ];

    // Final query
    const query = `SELECT
                        TOP 1 
                        VALUE {
                            'areaName': c.areaName, 
                            'areaType': c.areaType
                        }
                    FROM c 
                    WHERE 
                            c.type     = @type
                        AND c.areaType = @areaType
                        AND c.areaCode = @areaCode`;
    
    const { resources: results } = await container.items.query(
            { query, parameters },
            {
                maxItemCount: -1,
                maxDegreeOfParallelism: 20,
                partitionKey
            }
        ).fetchAll();

    return results.pop();

};  // mainDataQuery
