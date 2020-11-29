import * as vars from "./variables";

import type { SqlParameter } from "@azure/cosmos";
import { GetMainDataOptions } from "../../types";


/**
 * Get data from the database.
 *
 * @param query { string }              Query to be sent to the DB.
 * @param parameters { SqlParameter[] } Parameters as defined in the query.
 * @param options { GetMainDataOptions } Request options.
 */
export const GetData = async ( query: string,  parameters: SqlParameter[], options: GetMainDataOptions) => {
    
    const { resources: results } = await options.container.items.query(
            { query, parameters },
            {
                maxItemCount: vars.MAX_PAGE_LIMIT,
                maxDegreeOfParallelism: 20,
                ...(options?.partitionKey ? {partitionKey: options.partitionKey} : {})
            }
        ).fetchAll();

    return options.processor(results)

}; // GetData
