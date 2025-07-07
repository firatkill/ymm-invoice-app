import Redis from "ioredis";
export const connection = {
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
};
const redis = new Redis(connection);
export default redis;
