import {createStore} from 'redux'
import {createMemoryHistory} from 'history'
import {object} from 'prop-types'
import Adapter from 'enzyme-adapter-react-16';
import {
  Observable,
  observeHistoryPathname,
  observeReduxStore,
  FlowWrapper,
  flow
} from '..'
import {equal} from 'assert'
import { createElement as $ } from 'react'
import enzyme, {
  mount,
  render,
  shallow
} from 'enzyme'
enzyme.configure({ adapter: new Adapter() });

const machine = {
  statea: {
    transitions: {
      computed: ({lhs, rhs}) => lhs + rhs,
      next: `stateb`,
      skip: `end`
    }
  },
  stateb: {
    transitions: {
      next: `end`,
      back: `statea`
    }
  },
  end: {}
}
describe(`flowgo`, function () {
  let wrapper
  let data
  let state
  const WrappedComponent = ({children}) => $('div', {className: 'wrapped-content'}, children)
  beforeEach(function () {
    data = new Observable()
    state = new Observable()
    state.value('statea')
    data.value({lhs: 3, rhs: 7})
  })
  describe('flow-wrapper', function () {
    beforeEach(function () {
      wrapper = render(
        $(flow(WrappedComponent), {}, `child content here`),
        {context: {flow: {
          machine,
          dataObservable: data,
          stateObservable: state
        }}}
      )
    })
    it(`should pass child elements through`, function () {
      equal(wrapper.text(), `child content here`)
    })
    it(`should pass machine, stateObservable, and dataObservable through context as properties on flow`, function () {
      const MyComponent = (props, {flow: {machine, stateObservable, dataObservable}}) => $('span', {}, `machine: ${machine}, stateObservable: ${stateObservable}, dataObservable: ${dataObservable}`)
      MyComponent.contextTypes = {flow: object}
      const wrapper = render($(FlowWrapper, {
        machine: "a",
        stateObservable: "b",
        dataObservable: "c"
      }, $(MyComponent)))
      equal(wrapper.text(), `machine: a, stateObservable: b, dataObservable: c`)
    })
  })
  describe(`flow connector`, function () {
    it(`should expose transitions for current state to wrapped component as props.flow.transitions`, function () {
      const MyComponent = flow(Object.assign(({flow: {
        transitions
      }}) => $('span', {}, Object.keys(transitions).join(':')), {contextTypes: {flow: object}}))
      state.value('stateb')
      const wrapper = render($(MyComponent), {context: {flow: {
        machine,
        dataObservable: data,
        stateObservable: state
      }}})
      equal(wrapper.text(), `next:back`)
    })
    it(`should evaluate computed transitions with arguments from dataObservable`, function () {
      const MyComponent = flow(Object.assign(({flow: {transitions: {computed}}}) => $('div', {}, computed), {contextTypes: {flow: object}}))
      const wrapper = render($(MyComponent), {context: {flow: {
        machine,
        dataObservable: data,
        stateObservable: state
      }}})
      equal(wrapper.text(), `10`)
    })
    it.skip(`should reevaluate computed transitions when dataobservables values change`, function () {
      const MyComponent = ({flow: {transitions: {computed}}}) => computed
      const WrappedComponent = flow(MyComponent)
      const wrapper = shallow($(WrappedComponent), {context: {flow: {
        machine,
        dataObservable: data,
        stateObservable: state
      }}})
      const myShallowComponent = wrapper.find(MyComponent).shallow()
      data.value({lhs: 11, rhs: 13})
      equal(myShallowComponent.update().text(), `24`)
    })
  })
})
describe(`observables`, function () {
  it(`should set the value when value is called with an argument, and return the value when value is called without any arguments`, function () {
    const o = new Observable()
    o.value(3)
    equal(o.value(), 3)
    o.value(5)
    equal(o.value(), 5)
  })
  it(`should notify subscribers when value changes`, function () {
    const o = new Observable()
    let receiver1
    let receiver2
    o.subscribe(v => receiver1 = v)
    o.subscribe(v => receiver2 = v)
    o.value(9)
    equal(receiver1, 9)
    equal(receiver2, 9)
  })
  it(`should return an unsubscriber api`, function () {
    const o = new Observable()
    let receiver1
    let receiver2
    const unsub1 = o.subscribe(v => receiver1 = v)
    const unsub2 = o.subscribe(v => receiver2 = v)
    o.value(9)
    unsub1.unsubscribe()
    o.value(10)
    equal(receiver1, 9)
    equal(receiver2, 10)
  })
  describe('observeHistoryPathname', function () {
    it(`should update value when location path changes`, function () {
      const history = createMemoryHistory()
      history.push(`/foo/bar`)
      const historyObserver = observeHistoryPathname(history)
      equal(historyObserver.value(), `/foo/bar`)
      history.push(`/bar/baz`)
      equal(historyObserver.value(), `/bar/baz`)
    })
  })
  describe(`observeReduxStore`, function () {
    it(`should update value when redux store state changes`, function () {
      const store = createStore((state, {value}) => value, 1)
      store.dispatch({value: 1, type: 'test'})
      const storeObserver = observeReduxStore(store)
      equal(storeObserver.value(), 1)
      store.dispatch({value: 3, type: 'test'})
      equal(storeObserver.value(), 3)
    })
  })
})
