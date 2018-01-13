## What's this thing?
flowgo lets you send transitions, as defined by a state machine, to your React components.

## example configuration

## `machine.js` define your state machine
```js
export default {
  // key is the route name
  first: {
    progress: 1,
    transitions: {
      continue: ({loggedin}) => loggedin ? 'second' : 'third'
    }
  },
  'second': {
    progress: 2,
    transitions: {
      continue: 'twopointfive',
      skip: 'fifth'
    }
  },
  'twopointfive': {
    transitions: {
      continue: 'third'
    }
  },
  third: {
    transitions: {
      continue: 'fourth',
      skip: 'fifth'
    }
  },
  fourth: {
    transitions: {
      continue: 'fifth'
    }
  },
  fifth: { }
}
```

## `main.js` set up your app
```js
import {FlowWrapper} from 'flowgo'

...

// FlowWrapper puts machine config, dataObservable, and stateObservable in child context using getChildContext

import {
  FlowWrapper,
  observeHistoryPathname,
  observeReduxStore
} from 'flowgo'


...

<FlowWrapper
  machine={machineConfig}
  dataObservable={observeReduxStore(store)} // dataObservable's value is passed to computed transitions
  stateObservable={observeHistoryPathname(history)}
>
  <MyApp>
    <ButtonBar />
  </MyApp>
</FlowWrapper>
```

## `button-bar.js` some component that needs to know what's next
```js
import {flow} from 'flowgo'
@flow
class ButtonBar extends React.Component {
  const {
    /* totalSteps,*/
    /* currentStepIndex, */
    percentDone
  } = this.props.flow.estimateProgress({start: first, end: fifth})
  render() {
    <div>
      <div className='percentComplete'>{`{Math.floor(100 * percentDone)}% complete`}</div>
      <div className='buttonBar'>
        {this.props.flow.transitions.map((destination, key) => <Link key={key} to={destination}>{key}</Link>)
      </div>
    </div>
  }
}
```
