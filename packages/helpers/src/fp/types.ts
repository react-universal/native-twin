import type { Either } from './Either';
import type { IO } from './IO';
import type { List } from './List';
import type { Option } from './Option';
import type { Task } from './Task';

declare module './HKT' {
  interface URItoKind<A> {
    List: List<A>;
    Option: Option<A>;
    IO: IO<A>;
    Task: Task<A>;
    OptionList: Option<List<A>>;
  }

  interface URItoKind2<E, A> {
    Either: Either<E, A>;
  }
}
