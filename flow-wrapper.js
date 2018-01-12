// FlowWrapper puts machine config, getData, and getState in child context using getChildContext
import { object } from 'prop-types'
import { Component } from 'react'

export default class FlowWrapper extends Component {
  getChildContext() {
    const {
      machine,
      dataObservable,
      stateObservable
    } = this.props
    return {
      flow: {
        machine,
        dataObservable,
        stateObservable
      }
    }
  }
  render() {
    return this.props.children
  }
}
FlowWrapper.childContextTypes = { flow: object }
/*
  machine={machineConfig}
  dataObservable={observeStore(store)}
  getState={observeHistory(history)}
*/
