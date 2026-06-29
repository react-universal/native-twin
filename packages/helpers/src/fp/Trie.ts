class TrieNode<Value> {
  children = new Map<string, TrieNode<Value>>();
  isEndWord: boolean;
  value: Value | null;
  constructor(value: Value | null = null) {
    this.isEndWord = false;
    this.value = value;
  }
}

export class Trie<Value> {
  root: TrieNode<Value>;
  constructor() {
    this.root = new TrieNode<Value>();
  }

  insert(word: string, data: Value) {
    let currentNode = this.root;
    for (const char of word) {
      if (!currentNode.children.has(char)) {
        currentNode.children.set(char, new TrieNode<Value>(data));
      }
      currentNode = currentNode.children.get(char)!;
    }
    currentNode.isEndWord = true;
  }

  get(word: string) {
    let currentNode = this.root;
    for (const char of word) {
      if (!currentNode.children.has(char)) return null;
      currentNode = currentNode.children.get(char)!;
    }
    return currentNode.value;
  }

  search(word: string, isPrefix = false): boolean {
    let currentNode = this.root;
    for (const char of word) {
      if (!currentNode.children.has(char)) return false;
      currentNode = currentNode.children.get(char)!;
    }
    return isPrefix || currentNode.isEndWord;
  }

  startsWith(prefix: string) {
    return this.search(prefix, true);
  }
}

// const trie = new Trie<string>();

// trie.insert('a1', '1a');
// trie.insert('a2', '2a');

// trie.search('a1');

// trie.get('a');

// trie.get('a');
