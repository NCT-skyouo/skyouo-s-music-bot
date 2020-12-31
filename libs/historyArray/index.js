class historyArray {
  constructor(maxlen) {
    this.maxlen = maxlen
    this.array = []
  }

  push(any) {
    if (this.array.length >= this.maxlen) {
      this.array = this.array.slice(this.array.length - this.maxlen)
    }
    return this.array.push(any)
  }

  slice(...args) {
    return this.array.slice.apply(this.array, args)
  }

  toArray() {
    return this.array;
  }

  toString() {
    return "[object HistoryArray]"
  }
}

module.exports = historyArray