interface TrieNode<T> {
  children: Map<string, TrieNode<T>>
  items: T[]
}

function createNode<T>(): TrieNode<T> {
  return { children: new Map(), items: [] }
}

export class PrefixTrie<T> {
  private root = createNode<T>()
  private getKey: (item: T) => string

  constructor(items: T[], getKey: (item: T) => string) {
    this.getKey = getKey
    for (const item of items) {
      this.insert(item)
    }
  }

  insert(item: T): void {
    const raw = this.getKey(item).toLowerCase()
    const tokens = raw.split(/\s+/).filter(Boolean)
    const keys = [raw, ...tokens]
    for (const key of keys) {
      let node = this.root
      for (const char of key) {
        let next = node.children.get(char)
        if (!next) {
          next = createNode<T>()
          node.children.set(char, next)
        }
        node = next
        if (!node.items.includes(item)) {
          node.items.push(item)
        }
      }
    }
  }

  search(prefix: string, limit = 10): T[] {
    const clean = prefix.trim().toLowerCase()
    if (!clean) {
      return []
    }
    let node: TrieNode<T> | undefined = this.root
    for (const char of clean) {
      node = node.children.get(char)
      if (!node) {
        return []
      }
    }
    return node.items.slice(0, limit)
  }
}
