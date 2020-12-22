import { TraceFamilyIds } from "../types";


const CLOUD_ROLE_NAME = process?.env?.WEBSITE_SITE_NAME ?? "APIv2";


/**
 * Parses Trace Parent ID for Application Insight.
 * 
 * Example ID: Id 00-a4f02399f50a804e9924b8573d44b69b-e59b8f33a16ed346-01
 * 
 */
export const parseTraceParentId = ( id: string ): TraceFamilyIds => {

    const VERSION = 1;
    const OPERATION_ID = 2;
    const PARENT_ID = 3;
    const TRACE_FLAG = 4;

    const found = /([0-9a-f]{2})-(\w+)-(\w+)-([0-9a-f]{2})/.exec(id);


    return {
        operationId: found?.[OPERATION_ID] ?? "",
        parentId: found?.[PARENT_ID] ?? "",
        roleName: CLOUD_ROLE_NAME
    }

};  // parseTraceParentId
