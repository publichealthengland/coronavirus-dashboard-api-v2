import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { CosmosClient } from "@azure/cosmos";


const DB_ENDPOINT: string = process?.env?.AzureCosmosHost ?? "";
const DB_KEY: string      = process?.env?.AzureCosmosKey ?? "";
const PREFERRED_LOCATIONS = process?.env?.AzureCosmosDBLocations?.split(/,/) ??  [];
const DB_NAME: string     = process?.env?.AzureCosmosDBName ?? "";
const LOOKUP_DATA: string = "lookup";


const DB_CONNECTION = {
    endpoint: DB_ENDPOINT,
    key: DB_KEY,
    connectionPolicy: {
        preferredLocations: PREFERRED_LOCATIONS
    }
};


const container = new CosmosClient(DB_CONNECTION)
                .database(DB_NAME)
                .container(LOOKUP_DATA);



const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {

    context.log('Processing healthcheck request');

    const query = `SELECT TOP 1 * FROM c WHERE c.type = 'general'`;

    const { resources: results } = await container.items.query(
        { query },
        {
            maxItemCount: -1,
            maxDegreeOfParallelism: 20,
        }
    ).fetchAll();

    if ( results.length > 0 ) {

        switch ( req.method ) {
            case "GET":
                context.res = {
                    body: "ALIVE",
                    headers: { "Content-Type": "plain/text; charset=utf-8" },
                    status: 200
                };

                break;

            case "HEAD":
                context.res = {
                    body: null,
                    status: 204
                };

                break;

            default: 
                throw new Error("Heath probe DB response was empty.");

        }
    
    }
        

};  // httpTrigger


export default httpTrigger;
