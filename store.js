import {createStore, applyMiddleware} from 'redux'
import reducer from './reducer'
import multi from 'redux-multi'
import effects from 'redux-effects'
import events from 'redux-effects-events'
import location from 'redux-effects-location'
import logger from 'redux-logger'
import fetch from 'redux-effects-fetch'
import getFile from './middleware/getFile'

const middlewares = [
	multi,
  effects,
  fetch,
  events(),
  location(),
  getFile,
  logger()
]

export default initialState => applyMiddleware(...middlewares)(createStore)(reducer, initialState)
