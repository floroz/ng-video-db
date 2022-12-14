import produce, { Immutable } from 'immer';
import { BehaviorSubject } from 'rxjs';

export class StateService<TState extends Immutable<Record<string, unknown>>> {
  protected state: TState;
  protected store: BehaviorSubject<TState>;

  constructor(private initialState: TState) {
    this.state = produce(this.initialState, (draft) => draft);
    this.store = new BehaviorSubject(this.state);
  }

  protected setState(partial: Partial<TState>) {
    const newState = produce(this.state, (draft) => {
      for (let key in partial) {
        const value = partial[key];
        // @ts-expect-error invalid index signature for Draft<T> object
        // opened an issue with immer: https://github.com/immerjs/immer/issues/1002
        draft[key] = value;
      }
    });
    this.state = newState;
    this.store.next(newState);
  }
}
