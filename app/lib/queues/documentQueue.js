import { Queue } from "bullmq";
import { connection } from "../redis/index.js";

export const documentQueue = new Queue("document-processing", {
  connection: connection,
});
