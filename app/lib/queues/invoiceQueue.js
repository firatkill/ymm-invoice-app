import { Queue } from "bullmq";
import { connection } from "../redis/index.js";

export const invoiceQueue = new Queue("invoice-processing", {
  connection: connection,
});
