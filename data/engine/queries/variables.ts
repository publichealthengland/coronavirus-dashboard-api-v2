const DB_ENDPOINT: string  = process?.env?.AzureCosmosHost ?? "";
const DB_KEY: string       = process?.env?.AzureCosmosKey ?? "";
const PREFERRED_LOCATIONS = process?.env?.AzureCosmosDBLocations?.split(/,/) ??  [];

export const DB_NAME: string     = process?.env?.AzureCosmosDBName ?? "";
export const PUBLIC_DATA: string = "publicdata";
export const MSOA_DATA: string   = "weeklyData";
export const LOOKUP_DATA: string = "lookup";


export const DB_CONNECTION = {
    endpoint: DB_ENDPOINT,
    key: DB_KEY,
    connectionPolicy: {
        preferredLocations: PREFERRED_LOCATIONS
    }
};
