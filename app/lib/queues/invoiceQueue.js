import { Queue } from "bullmq";

export const invoiceQueue = new Queue("invoice-processing", {
  connection: { host: "localhost", port: 6379 },
});
