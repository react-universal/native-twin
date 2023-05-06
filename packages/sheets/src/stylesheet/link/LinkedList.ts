class Node<T> {
  value: T;
  next: Node<T> | null;
  constructor(value: T) {
    this.value = value;
    this.next = null;
  }
}

class LinkedList<T> {
  tail: Node<T> | null;
  head: Node<T> | null;
  size: number;

  constructor() {
    this.tail = null;
    this.head = null;
    this.size = 0;
  }

  isEmpty() {
    return this.size === 0 && !this.head && !this.tail;
  }

  append(value: T) {
    const newNode: Node<T> = { value, next: this.head };
    if (!this.tail && !this.head) {
      this.tail = newNode;
      this.head = newNode;
    } else if (!this.tail) {
      return;
    }
    this.tail.next = newNode;
    this.tail = newNode;
    this.size += 1;
  }

  prepend(value: T) {
    const newNode: Node<T> = { value, next: null };
    if (this.isEmpty() && !this.head && !this.tail) {
      this.head = newNode;
      this.tail = newNode;
    } else {
      newNode.next = this.head;
      this.head = newNode;
    }
    this.size += 1;
  }

  deleteFromFront() {
    if (this.isEmpty()) {
      return null;
    }
    const value = this.head?.value;
    if (this.head && value) {
      this.head = this.head.next;
      return value;
    }
    return null;
  }

  deleteFromEnd() {
    if (this.isEmpty()) {
      return null;
    }
    if (this.tail) {
      const value = this.tail.value;
      if (this.size === 1) {
        this.head = null;
        this.tail = null;
      } else {
        let prevNode = this.head;
        while (prevNode && prevNode.next !== this.tail) {
          prevNode = prevNode.next;
        }
        if (prevNode?.next && value) {
          prevNode.next = null;
          this.tail = prevNode;
          this.size -= 1;
          return value;
        }
      }
    }
    return null;
  }

  deleteByValue(value: any) {
    if (!this.head) {
      return;
    }
    while (this.head && this.head.value === value) {
      this.head = this.head.next;
    }

    let currentNode = this.head;
    while (currentNode && currentNode.next) {
      if (currentNode.next.value === value) {
        currentNode.next = currentNode.next.next;
      } else {
        currentNode = currentNode.next;
      }
    }

    if (this.tail && this.tail.value === value) {
      this.tail = currentNode;
    }
  }

  find(value: T) {
    if (!this.head) return null;
    let currentNode = this.head;
    while (currentNode) {
      if (currentNode.value === value) return currentNode;
      if (currentNode.next) currentNode = currentNode.next;
    }
    return null;
  }

  toArray() {
    const nodes = [];
    let currentNode = this.head;
    while (currentNode) {
      nodes.push(currentNode);
      currentNode = currentNode.next;
    }
    return nodes;
  }
}
const globalSheetInstance = new LinkedList();
globalSheetInstance.append(1);
globalSheetInstance.append(2);
globalSheetInstance.append(3);
// console.log('GLOBAL: ', globalSheetInstance.toArray());
globalSheetInstance.append('DELETE_ME');
globalSheetInstance.append(4);
globalSheetInstance.prepend('FIRST VALUE');
globalSheetInstance.deleteByValue('DELETE_ME');
// console.log('PERF: ', end - start);
// console.log('GLOBAL: ', globalSheetInstance.toArray());
// console.log('FIND_GLOBAL: ', globalSheetInstance.find(3));
