export default class TokenBucket {
  constructor(capacity, refillAmount, refillTimeInSeconds) {
    (this.capacity = capacity),
      (this.refillAmount =
        refillAmount) /* Amount of tokens refilled in the bucket */,
      (this.refillTimeInSeconds =
        refillTimeInSeconds); /* In what time period, the bucket is refilled*/

    this.db = {};
  }

  createBucket(key) {
    if (!this.db[key]) {
      this.db[key] = {
        tokens: this.capacity,
        timestamp: Date.now(),
      };
    }

    return this.db[key];
  }

  refillBucket(key) {
    if (!this.db[key]) return null;

    const { tokens, timestamp } = this.db[key];

    const currentTime = Date.now();

    const elapsedTime = Math.floor(
      (currentTime - timestamp) / (this.refillTimeInSeconds * 1000)
    );

    const newTokens = elapsedTime * this.refillAmount;

    this.db[key] = {
      tokens: Math.min(this.capacity, tokens + newTokens),
      timestamp: Date.now(),
    };

    return this.db[key];
  }

  handleRequest(key) {
    let bucket = this.createBucket(key);

    const { timestamp } = bucket;

    const currentTime = Date.now();

    const elapsedTimeInSeconds = Math.floor((currentTime - timestamp) / 1000);

    if (elapsedTimeInSeconds > this.refillTimeInSeconds) {
      bucket = this.refillBucket(key);
    } else {
      if (bucket.tokens <= 0) {
        console.log(
          `Request REJECTED for ${key} -- tokens: ${
            bucket.tokens
          } --${new Date().toLocaleString()}`
        );

        return false;
      }
    }

    console.log(
      `Request ACCEPTED for ${key} -- tokens: ${
        bucket.tokens
      } --${new Date().toLocaleString()}`
    );

    bucket.tokens -= 1;

    return true;
  }
}
