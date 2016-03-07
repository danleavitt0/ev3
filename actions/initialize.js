import {bindUrl} from 'redux-effects-location'
import {fetch} from 'redux-effects-fetch'
import {bind} from 'redux-effects'

const URL_DID_CHANGE = 'URL_DID_CHANGE'
const SET_FILE_LIST = 'SET_FILE_LIST'

function initializeApp () {
  return [
    bindUrl(urlDidChange),
    getFileList()
  ]
}

function getFileList () {
	return bind(fetch('/file.getAll', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  }), setList, (err) => console.warn(err))
}

function setList (files) {
	return {
		type: SET_FILE_LIST,
		payload: JSON.parse(files)
	}
}

function urlDidChange (url) {
  return {
    type: URL_DID_CHANGE,
    payload: url
  }
}

export {
  URL_DID_CHANGE,
  SET_FILE_LIST,
  initializeApp,
  getFileList
}
