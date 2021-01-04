import { TraceFamilyIds } from "../types";


const CLOUD_ROLE_NAME = process?.env?.WEBSITE_SITE_NAME ?? "APIv2";

const TRACE_PARENT = {
    pattern: new RegExp(
        "^[ \t]*([0-9a-f]{2})-([0-9a-f]{32})-([0-9a-f]{16})-([0-9a-f]{2})(-.*)?[ \t]*$"
    ),
    version: 1,
    operationId: 2,
    parentId: 3,
    traceFlag: 4
};


/**
 * Parses Trace Parent ID for Application Insight.
 * 
 * Example ID: Id 00-a4f02399f50a804e9924b8573d44b69b-e59b8f33a16ed346-01
 *
 */
export const parseTraceParentId = ( id: string ): TraceFamilyIds => {

    const found = TRACE_PARENT.pattern.exec(id);
    
    return {
        version: found?.[TRACE_PARENT.version] ?? "",
        operationId: found?.[TRACE_PARENT.operationId] ?? "",
        parentId: found?.[TRACE_PARENT.parentId] ?? "",
        traceFlag: found?.[TRACE_PARENT.traceFlag] ?? "",
        roleName: CLOUD_ROLE_NAME
    }

};  // parseTraceParentId
