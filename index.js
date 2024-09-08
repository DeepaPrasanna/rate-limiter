import express from "express";

import TokenBucket from "./token-bucket.js";
import FixedWindowCounter from "./fixed-window-counter.js";
import SlidingWindowLog from "./sliding-window-log.js";

const app = express();
const port = 3000;

// token bucket with capacity 4 and adding 4 tokens every 2 sec
// const bucket = new TokenBucket(10, 1, 1);
// const fixedWindowCounter = new FixedWindowCounter(60, 160);
const slidingWindowLog = new SlidingWindowLog(60, 5);

app.get("/", (req, res) => {
  res.send("Health check OKK!");
});

app.get("/limited", (req, res) => {
  const ipAddress = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  console.log({ ipAddress });
  // const result = bucket.handleRequest(ipAddress);
  const result = slidingWindowLog.handleRequest();
  // const result = fixedWindowCounter.handleRequest();

  if (!result) {
    res.status(429);
    res.send("Limited, don't over use me!");
  } else {
    res.send("Success");
  }
});

app.get("/unlimited", (req, res) => {
  res.send("Unlimited! Let's Go!");
});

app.listen(port, () => {
  console.log(`Rate limiter listening on port ${port}`);
});

// capacity, refillAmount, refillTime (sec)
// token bucket with 2 token every 1 min
// const bucket = new TokenBucket(4, 2, 60);

// token bucket with capacity 4 and ading 4 tokens every 5 sec
// const bucket = new TokenBucket(4, 4, 5);

// token bucket with capacity 4 and ading 4 tokens every 2 sec
// const bucket = new TokenBucket(4, 4, 2);

// bucket.handleRequest('user1');
// bucket.handleRequest('user1');
// bucket.handleRequest('user1');
// bucket.handleRequest('user1');
// bucket.handleRequest('user1');

// setTimeout(() => {
//   bucket.handleRequest('user1');
//   bucket.handleRequest('user1');
//   bucket.handleRequest('user1');
//   bucket.handleRequest('user1');
//   bucket.handleRequest('user1');
//   bucket.handleRequest('user1');

//   setTimeout(() => {
//     bucket.handleRequest('user1');
//   }, 3000);
// }, 3000);
