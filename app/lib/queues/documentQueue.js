import { Queue } from "bullmq";

export const documentQueue = new Queue("document-processing", {
  connection: { host: "localhost", port: 6379 },
});
