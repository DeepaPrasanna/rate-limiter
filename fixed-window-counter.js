export default class FixedWindowCounter {
  constructor(windowSize, threshold) {
    this.windowSize = windowSize * 1000; /* in milliseconds*/
    this.threshold = threshold;
    this.counter = 0;
    this.currentWindow = Date.now();
  }

  handleRequest() {
    const currentTime = Date.now();
    if (currentTime < this.currentWindow + this.windowSize) {
      this.counter++;
      if (this.counter > this.threshold) {
        return false;
      }
      return true;
    } else {
      this.currentWindow = Date.now();
      this.counter = 1;
      return true;
    }
  }
}
