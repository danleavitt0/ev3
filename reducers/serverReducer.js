import {LOAD_FILE, IS_SAVING, FINISH_SERVER, IS_LOADING, IS_RUNNING, SAVE_LOG} from '../actions/actions'
import {URL_DID_CHANGE, SET_FILE_LIST} from '../actions/initialize'


function reducer (state={}, action) {
	switch (action.type) {
		case SET_FILE_LIST:
			return {
				...state,
				files: action.payload
			}
		case URL_DID_CHANGE:
			return {
				...state,
				url: action.payload
			}
		case LOAD_FILE:
			return {
				...state,
				file: action.payload,
				loading: false
			}
		case IS_LOADING:
			return {
				...state,
				loading: true
			}
		case IS_SAVING:
			return {
				...state,
				saving: true
			}
		case IS_RUNNING:
			return {
				...state,
				running: true
			}
		case FINISH_SERVER:
			return {
				...state,
				saving: false,
				running: false,
				saveMessage: action.payload.message
			}
		case SAVE_LOG:
			return {
				...state,
				log: action.payload
			}
	}
	return state
}

export default reducer
