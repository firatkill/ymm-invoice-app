import express from "express";
import { createBullBoard } from "@bull-board/api";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter.js";
import { ExpressAdapter } from "@bull-board/express";
import { documentQueue } from "./lib/queues/documentQueue.js";
import { invoiceQueue } from "./lib/queues/invoiceQueue.js";

const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath("/admin/queues");

const { addQueue, removeQueue, setQueues } = createBullBoard({
  queues: [new BullMQAdapter(documentQueue), new BullMQAdapter(invoiceQueue)],
  serverAdapter,
});

const app = express();
app.use("/admin/queues", serverAdapter.getRouter());

app.listen(3000, () => {
  console.log("http://localhost:3001/admin/queues");
});
