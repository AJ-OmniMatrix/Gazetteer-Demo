export class SegmentTree {
  private tree: number[]
  private n: number

  constructor(size: number) {
    this.n = Math.max(1, size)
    this.tree = new Array(4 * this.n).fill(0)
  }

  static fromArray(arr: number[]): SegmentTree {
    const st = new SegmentTree(arr.length)
    if (arr.length > 0) {
      st.build(arr, 1, 0, arr.length - 1)
    }
    return st
  }

  private build(arr: number[], node: number, start: number, end: number): void {
    if (start === end) {
      this.tree[node] = arr[start]
      return
    }
    const mid = Math.floor((start + end) / 2)
    const leftChild = 2 * node
    const rightChild = 2 * node + 1
    this.build(arr, leftChild, start, mid)
    this.build(arr, rightChild, mid + 1, end)
    this.tree[node] = this.tree[leftChild] + this.tree[rightChild]
  }

  query(l: number, r: number): number {
    if (l > r || l < 0 || r >= this.n) {
      return 0
    }
    return this.queryInternal(1, 0, this.n - 1, l, r)
  }

  private queryInternal(
    node: number,
    start: number,
    end: number,
    l: number,
    r: number
  ): number {
    if (r < start || end < l) {
      return 0
    }
    if (l <= start && end <= r) {
      return this.tree[node]
    }
    const mid = Math.floor((start + end) / 2)
    const leftSum = this.queryInternal(2 * node, start, mid, l, r)
    const rightSum = this.queryInternal(2 * node + 1, mid + 1, end, l, r)
    return leftSum + rightSum
  }

  update(index: number, delta: number): void {
    if (index < 0 || index >= this.n) {
      return
    }
    this.updateInternal(1, 0, this.n - 1, index, delta)
  }

  private updateInternal(
    node: number,
    start: number,
    end: number,
    index: number,
    delta: number
  ): void {
    if (start === end) {
      this.tree[node] += delta
      return
    }
    const mid = Math.floor((start + end) / 2)
    if (index <= mid) {
      this.updateInternal(2 * node, start, mid, index, delta)
    } else {
      this.updateInternal(2 * node + 1, mid + 1, end, index, delta)
    }
    this.tree[node] = this.tree[2 * node] + this.tree[2 * node + 1]
  }
}
