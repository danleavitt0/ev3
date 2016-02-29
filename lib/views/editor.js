import React, {Component} from 'react'
import AceEditor from 'react-ace'
import brace from 'brace'
import Split from '../layouts/split'
import SensorReadOut from '../components/sensorReadOut'
import {RaisedButton, Snackbar, FlatButton, IconButton, FontIcon} from 'material-ui/lib'
import Button from '../components/button'
import {startSave, startRun, stop} from '../../actions/actions'
import Nav from '../components/nav'
import 'babel-polyfill'

require('brace/mode/javascript')
require('brace/theme/tomorrow_night')

const styles = {
	buttonContainer: {
		marginTop: -3,
		zIndex: 1
	},
	button: {
		zIndex:1,
		margin: 10
	},
	font: {
		fontFamily: 'Roboto, sans-serif'
	}
}

class Editor extends Component {
	constructor (props) {
		super(props)
		this.state = {
			text: props.file,
			saving: false,
			dirty: false,
			running: false,
			message: props.message || ''
		}
	}
	componentWillReceiveProps (nextProps) {
		if (nextProps.message && nextProps.message !== this.props.message) {
			this.refs.message.show()
		}
		return this.setState({
			saving: nextProps.state.saving,
			running: nextProps.state.running,
			message: nextProps.message
		})
	}
	save (e) {
		this.setState({
			dirty: false
		})
		return this.props.dispatch(startSave(this.props.title, this.state.text))
	}
	run (e) {
		this.setState({
			dirty: false
		})
		return this.props.dispatch(startRun(this.props.title, this.state.text))
	}
	stop () {
		return this.props.dispatch(stop())
	}
	onChange (code) {
		this.setState({
			text: code,
			dirty: true
		})
	}
	render () {
		console.log(this.state.running)
		var buttonContainer = <div style={styles.buttonContainer}>
					<RaisedButton
						onClick={this.save.bind(this)}
						style={styles.button}
						primary={true}
						label='Save'
						disabled={this.state.saving || !this.state.dirty || this.state.running} />
					<RaisedButton
						onClick={this.run.bind(this)}
						style={styles.button}
						label='Run'
						disabled={this.state.running} />
					<RaisedButton
						onClick={this.stop.bind(this)}
						style={styles.button}
						label='Stop'
						disable={this.state.saving} />
				</div>
		return (
			<div>
				<Split
					nav={
						<Nav
							title={this.props.title}
							iconLeft={<Button/>}
							iconStyleRight={styles.buttonContainer}
							iconRight={buttonContainer} />
						}
					left={
						<AceEditor
							style={{position: 'fixed'}}
		          mode='javascript'
		          theme='tomorrow_night'
		          name='brace-editor'
		          onChange={this.onChange.bind(this)}
		          value={this.state.text}
		          height={'100%'}
		          width={'100%'}
		          ref='editor'
		          tabSize={2}
		          editorProps={{$blockScrolling: true}}
		          showPrintMargin={false} />
		        }
	        right={
	        	<SensorReadOut
	        		log={this.props.log}
	        		sensors={this.props.sensors}
	        		dispatch={this.props.dispatch}
	        		running={this.state.running} />
	        }
	      />
				<Snackbar
					style={styles.font}
					ref='message'
					message={this.state.message || ''} />
			</div>
		)
	}
}

export default Editor
