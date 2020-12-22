import * as vars from "./variables";

import { 
    defaultClient as aiClient, 
    setup as aiSetup 
} from "applicationinsights";

import type { SqlParameter } from "@azure/cosmos";
import { GetMainDataOptions } from "../../types";
import { parseTraceParentId } from "../../common/utils";

aiSetup();


/**
 * Get data from the database.
 *
 * @param query { string }              Query to be sent to the DB.
 * @param parameters { SqlParameter[] } Parameters as defined in the query.
 * @param options { GetMainDataOptions } Request options.
 */
export const GetData = async ( query: string,  parameters: SqlParameter[], options: GetMainDataOptions) => {    

    const { operationId, parentId, roleName } = parseTraceParentId(
        options.requestOptions.context.traceContext.traceparent as string
    );


    const operationIdOverride = {
        "ai.operation.id": operationId,
        "ai.operation.parentId": parentId,
        "ai.cloud.role": roleName
    };


    const start = new Date().getMilliseconds();
    let end;
    let success = true;

    try {

        
        const { resources: results } = await options.container.items.query(
                { query, parameters },
                {
                    maxItemCount: vars.MAX_PAGE_LIMIT,
                    maxDegreeOfParallelism: 20,
                    ...(options?.partitionKey ? {partitionKey: options.partitionKey} : {})
                }
            ).fetchAll();

        success = true;

        return options.processor(results)

    } 
    catch ( err ) {

        success = false;

        throw err;

    } 
    finally {

        end = new Date().getMilliseconds();
        
        aiClient.trackDependency({
            target: await options.container.database.client.getReadEndpoint(), 
            name: "Cosmos query", 
            data: query, 
            duration: end - start, 
            resultCode:0, 
            success: success, 
            dependencyTypeName: "Azure DocumentDB", 
            tagOverrides: operationIdOverride
        });

    }

}; // GetData
