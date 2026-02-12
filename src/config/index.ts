import * as dotenv from 'dotenv';
dotenv.config();

export type ConfigType = {
  PORT: number;
  DB_URL: string;
  NODE_ENV: string;
  ACCESS_TOKEN_KEY: string;
  ACCESS_TOKEN_TIME: string;
  REFRESH_TOKEN_KEY: string;
  REFRESH_TOKEN_TIME: string;
  SUPER_ADMIN_PASS: string;
  SUPER_ADMIN_PHONE: string;
  SUPER_ADMIN_LOGIN: string;
  BASE_API: string;
};

export const config: ConfigType = {
  PORT: Number(process.env.PORT) as number,
  NODE_ENV: process.env.NODE_ENV as string,
  SUPER_ADMIN_PASS: process.env.SUPER_ADMIN_PASS as string,
  SUPER_ADMIN_LOGIN: process.env.SUPER_ADMIN_LOGIN as string,
  SUPER_ADMIN_PHONE: process.env.SUPER_ADMIN_PHONE as string,
  BASE_API:
    process.env.BASE_API ||
    ('http://134.209.2.232:7075/api/v1/uploads' as string),
  DB_URL:
    process.env.NODE_ENV === 'dev'
      ? (process.env.DEV_DB_URL as string)
      : (process.env.PROD_DB_URL as string),
  ACCESS_TOKEN_KEY: process.env.ACCESS_TOKEN_KEY as string,
  ACCESS_TOKEN_TIME: process.env.ACCESS_TOKEN_TIME as string,
  REFRESH_TOKEN_KEY: process.env.REFRESH_TOKEN_KEY as string,
  REFRESH_TOKEN_TIME: process.env.REFRESH_TOKEN_TIME as string,
};
