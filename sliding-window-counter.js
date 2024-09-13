export default class SlidingWindowCounter {
  constructor(windowSize, maxRequests, redisClient) {
    this.windowSize = windowSize * 1000; // in milliseconds
    this.maxRequests = maxRequests;
    this.redisClient = redisClient;
    this.redisKey = "rate_limit:global";
    this.previousWindowCount = this.redisClient.set(
      `${this.redisKey}:previousWindowCount`,
      0
    );
    this.currentWindowCount = this.redisClient.set(
      `${this.redisKey}:currentWindowCount`,
      0
    );
    this.windowStartTime = this.redisClient.set(
      `${this.redisKey}:windowStartTime`,
      Date.now()
    );
  }

  async handleRequest() {
    const currentTime = Date.now();
    let windowStartTime = Number(
      await this.redisClient.get(`${this.redisKey}:windowStartTime`)
    );
    const elapsedTime = currentTime - windowStartTime;

    let previousWindowCount = Number(
      await this.redisClient.get(`${this.redisKey}:previousWindowCount`)
    );
    let currentWindowCount = Number(
      await this.redisClient.get(`${this.redisKey}:currentWindowCount`)
    );

    if (elapsedTime > this.windowSize) {
      const windowsElapsed = Math.floor(elapsedTime / this.windowSize);

      if (windowsElapsed > 1) {
        previousWindowCount = 0;
      } else {
        previousWindowCount = currentWindowCount;
      }
      currentWindowCount = 0;
      windowStartTime += windowsElapsed * this.windowSize;

      await this.redisClient.set(
        `${this.redisKey}:previousWindowCount`,
        previousWindowCount
      );
      await this.redisClient.set(
        `${this.redisKey}:currentWindowCount`,
        currentWindowCount
      );
      await this.redisClient.set(
        `${this.redisKey}:windowStartTime`,
        windowStartTime
      );
    }

    const currentWindowPercentage =
      ((currentTime - windowStartTime) / this.windowSize) * 100;

    const previousWindowPercentage = 100 - currentWindowPercentage;

    const totalRequestsInWindow =
      currentWindowCount +
      (previousWindowPercentage * previousWindowCount) / 100;

    if (totalRequestsInWindow >= this.maxRequests) {
      return false;
    }

    currentWindowCount++;
    await this.redisClient.set(
      `${this.redisKey}:currentWindowCount`,
      currentWindowCount
    );

    return true;
  }
}
