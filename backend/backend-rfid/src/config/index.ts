import 'dotenv/config'

export const PORT:number = process.env.PORT ? parseInt(process.env.PORT) :3001;
export const NODE_ENV:string = process.env.NODE_ENV || 'development';
export const POSTFIX_NAME = NODE_ENV ==='production'?'':'-DEV';
export const MONGODB_URI: string | undefined = process.env.MONGODB_URI;