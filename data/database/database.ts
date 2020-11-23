import { CosmosClient } from "@azure/cosmos"

import type { SqlParameter } from "@azure/cosmos";


const DB_ENDPOINT: string  = process?.env?.AzureCosmosHost ?? "";
const DB_KEY: string       = process?.env?.AzureCosmosKey ?? "";
const DB_NAME: string      = process?.env?.AzureCosmosDBName ?? "";
const DB_CONTAINER: string = process?.env?.AzureCosmosCollection ?? "";
const DB_CONN_STR: string  = `AccountEndpoint=${DB_ENDPOINT};AccountKey=${DB_KEY};`;

const MAX_PAGE_LIMIT = -1;


const container = new CosmosClient(DB_CONN_STR)
                .database(DB_NAME)
                .container(DB_CONTAINER);


/**
 * Get data from the database.
 * 
 * @param query { string }              Query to be sent to the DB.
 * @param parameters { SqlParameter[] } Parameters as defined in the query.
 * @param partition { string }          Partition key on which to run the query.
 * @param processor { (any) => any }    Function to process the results before returning.
 */
const getData = async ( query: string,  parameters: SqlParameter[], partition: string, processor: (result: any) => any ) => {
    
    const { resources: results } = await container.items.query(
            { query, parameters }, 
            { 
                maxItemCount: MAX_PAGE_LIMIT, 
                maxDegreeOfParallelism: 10,
                partitionKey: partition
            }
        ).fetchAll();

    return processor(results)

}; //get


export default getData;
