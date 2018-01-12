export default class Observable {
  constructor() {
    this.observers = []
    this._value = undefined
  }
  subscribe(observer) {
    this.observers.push(observer)
    const location = this.observers.length - 1
    return {
      unsubscribe: () => this.observers[location] = undefined
    }
  }
  notify() {
    this.observers.forEach(observer => observer && observer(this._value))
  }
  value(value) {
    if (arguments.length > 0) {
      this._value = value
      this.notify()
    }
    return this._value
  }
}
export function observeHistoryPathname(history) {
  const historyObservable = new Observable()
  historyObservable.value(history.location.pathname)
  history.listen((location, action) => {
    historyObservable.value(history.location.pathname)
  })
  return historyObservable
}
export function observeReduxStore(store) {
  const storeObservable = new Observable()
  storeObservable.value(store.getState())
  store.subscribe(() => storeObservable.value(store.getState()))
  return storeObservable
}
