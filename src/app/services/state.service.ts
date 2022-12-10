import produce from 'immer';
import { BehaviorSubject } from 'rxjs';

export class StateService<TState extends {}> {
  protected state: TState;
  protected store: BehaviorSubject<TState>;

  constructor(private initialState: TState) {
    this.state = produce(this.initialState, (draft) => draft);
    this.store = new BehaviorSubject(this.state);
  }

  protected setState<T extends Partial<TState>>(partial: T) {
    const newState = produce(this.state, (draft) => {
      for (let key in partial) {
        // @ts-expect-error Immer.js not playing nicely with the typings here
        draft[key] = partial[key];
      }
    });
    this.state = newState;
    this.store.next(newState);
  }
}
