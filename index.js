import express from "express";

import TokenBucket from "./token-bucket.js";
import FixedWindowCounter from "./fixed-window-counter.js";
import SlidingWindowLog from "./sliding-window-log.js";
import SlidingWindowCounter from "./sliding-window-counter.js";
import { client } from "./redis.js";

const app = express();
const port = process.env.PORT || 3000;

const bucket = new TokenBucket(10, 1, 1);
const fixedWindowCounter = new FixedWindowCounter(60, 60);
const slidingWindowLog = new SlidingWindowLog(60, 60);
const slidingWindowCounter = new SlidingWindowCounter(60, 60, client);

app.listen(port, () => {
  console.log(`Rate limiter listening on port ${port}`);
});

app.get("/", (req, res) => {
  res.send("Health check OKK!");
});

app.get("/token-bucket", (req, res) => {
  const ipAddress = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  const result = bucket.handleRequest(ipAddress);

  if (!result) {
    res.status(429);
    res.send("Limited, don't over use me!");
  } else {
    res.send("Success");
  }
});

app.get("/fixed-window-counter", (req, res) => {
  const result = fixedWindowCounter.handleRequest();

  if (!result) {
    res.status(429);
    res.send("Limited, don't over use me!");
  } else {
    res.send("Success");
  }
});

app.get("/sliding-window-log", (req, res) => {
  const result = slidingWindowLog.handleRequest();

  if (!result) {
    res.status(429);
    res.send("Limited, don't over use me!");
  } else {
    res.send("Success");
  }
});

app.get("/sliding-window-counter", async (req, res) => {
  const result = await slidingWindowCounter.handleRequest();

  if (!result) {
    res.status(429);
    res.send("Limited, don't over use me!");
  } else {
    res.send("Success");
  }
});
