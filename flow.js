import {object} from 'prop-types'
import mapValues from 'lodash.mapvalues'
import assign from 'lodash.assign'
import {
  Component,
  createElement as $
} from 'react'

export default WrappedComponent => {
  class FlowConnector extends Component {
    estimateProgress({start, finish}) {
      // simple implementation: return progress estimation value that is in state if present
      const state = this.context.flow.stateObservable.value()
      return this.context.flow.machine[state].progress
      // TODO: find route between start and finish states that includes current state and report {progress}
    }
    componentDidMount() {
      const {flow: {
        dataObservable,
        stateObservable
      }} = this.context
      this.subscriptions = [
        dataObservable,
        stateObservable
      ].map(observable => observable.subscribe(() => this.forceUpdate()))
      // TODO: only force update on data subscribable change if there is a computed transition for the current state
    }
    componentWillUnmount() {
      this.subscriptions.forEach(subscription => subscription.unsubscribe())
      this.subscriptions = undefined
    }
    render() {
      const data = this.context.flow.dataObservable.value()
      return $(WrappedComponent, assign({}, this.props, {flow: {
        estimateProgress: this.estimateProgress.bind(this),
        transitions: mapValues(
          this.context.flow.machine[this.context.flow.stateObservable.value()].transitions,
          (transition, key) => {
            if ('function' === typeof(transition)) {
              transition = transition(data)
            }
            return transition
          }
        )
      }}), this.props.children)
    }
  }
  return assign(FlowConnector, {
    contextTypes: {
      flow: object
    }
  })
}
