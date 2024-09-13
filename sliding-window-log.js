export default class SlidingWindowLog {
  constructor(windowSize, maxRequests) {
    this.windowSize = windowSize * 1000; // in milliseconds
    this.maxRequests = maxRequests;
    this.requestLogs = [];
  }

  handleRequest() {
    const currentTime = Date.now();

    this.requestLogs = this.requestLogs.filter(
      (timestamp) => currentTime - timestamp <= this.windowSize
    );

    if (this.requestLogs.length >= this.maxRequests) return false;

    this.requestLogs.push(Date.now());
    return true;
  }
}
