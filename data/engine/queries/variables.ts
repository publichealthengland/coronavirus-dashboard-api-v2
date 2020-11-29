export const DB_ENDPOINT: string  = process?.env?.AzureCosmosHost ?? "";
export const DB_KEY: string       = process?.env?.AzureCosmosKey ?? "";
export const DB_NAME: string      = process?.env?.AzureCosmosDBName ?? "";
export const PUBLIC_DATA: string  = "publicdata";
export const MSOA_DATA: string    = "weeklyData";
export const DB_CONN_STR: string  = `AccountEndpoint=${DB_ENDPOINT};AccountKey=${DB_KEY};`;
