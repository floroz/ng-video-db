import produce, { Immutable } from 'immer';
import { BehaviorSubject, Observable } from 'rxjs';

export class StateService<TState extends Immutable<Record<string, unknown>>> {
  private store: BehaviorSubject<TState>;

  protected store$: Observable<TState>;

  protected get state(): TState {
    return this.store.getValue();
  }

  constructor(private initialState: TState) {
    this.store = new BehaviorSubject(
      produce(this.initialState, (draft) => draft)
    );

    this.store$ = this.store.asObservable();
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
    this.store.next(newState);
  }
}
