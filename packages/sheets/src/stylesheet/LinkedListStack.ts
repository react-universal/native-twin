import { LinkedList } from './link/GlobalSheets';

export class LinkedListStack<T> {
  list: LinkedList<T>;
  constructor() {
    this.list = new LinkedList<T>();
  }

  push(value: T) {
    this.list.prepend(value);
  }

  pop() {
    return this.list.deleteFromFront();
  }

  peek() {
    if (this.list.head?.value) {
      return this.list.head.value;
    }
    return null;
  }

  isEmpty() {
    return this.list.isEmpty();
  }

  getSize() {
    return this.list.size;
  }

  print() {
    return this.list.toArray();
  }
}

const stack = new LinkedListStack<number>();
stack.push(1);
stack.push(2);
stack.push(3);
stack.push(4);
