import React, {Component} from 'react'
import Sensor from './sensor'
import Log from './Log'
import {Tabs, Tab} from 'material-ui/lib/tabs'
import {Toolbar, ToolbarGroup} from 'material-ui/lib/toolbar'
import {Toggle, RaisedButton, Dialog, FlatButton} from 'material-ui/lib'
import {findSensors} from '../../actions/sensors'
import {clearLog} from '../../actions/actions'

const styles = {
	container: {
		width: '100%',
		fontFamily: 'Roboto, sans-serif'
	},
	tabs: {
		backgroundColor: '#fff'
	},
	tab: {
		color: '#333'
	},
	toolbarGroup: {
		display: 'flex',
		alignItems: 'center',
		height: '100%'
	},
	toolbarItem: {
		margin: 0
	}
}

class SensorReadOut extends Component {
	constructor (props) {
		super(props)
		this.state = {
			toggled: false,
			showDialog: false
		}
	}
	render () {
		const {sensors} = this.props.sensors
		const {dispatch} = this.props
		let widgets = []

		const actions = [
      <FlatButton
      	key='cancel'
        label='Cancel'
        secondary={true}
        onTouchTap={this._handleCancel.bind(this)} />,
      <FlatButton
      	key='accept'
        label='OK'
        primary={true}
        onTouchTap={this._handleAccept.bind(this)} />
    ]
		for (var key in sensors) {
			widgets.push(
				<Sensor
					key={key}
					port={key}
					dispatch={dispatch}
					path={sensors[key].path}
					type={sensors[key].type}
					value={sensors[key].value}
					mode={sensors[key].mode}
					running={this.props.running} />
			)
		}
		return (
			<div style={styles.container}>
				<Tabs tabItemContainerStyle={styles.tabs}>
					<Tab style={styles.tab} label='console'>
						<Toolbar style={{backgroundColor: '#d5d5d5', color:'#fff'}}>
							<ToolbarGroup
								style={styles.toolbarGroup}
								lastChild={true}
								float='right' >
								<RaisedButton
									style={styles.toolbarItem}
									primary={true}
									onClick={() => this.props.dispatch(clearLog())}
									label='clear log' />
							</ToolbarGroup>
						</Toolbar>
						<Log log={this.props.log} dispatch={dispatch} />
					</Tab>
					<Tab style={styles.tab} label='sensors'>
						<Toolbar style={{backgroundColor: '#d5d5d5', color:'#fff', marginBottom: 2}}>
							<ToolbarGroup
								style={styles.toolbarGroup}
								float='right' >
								<Toggle
									name='sensorToggle'
									value='sensorToggleValue'
									label='sensors'
									ref='toggle'
									onToggle={this._toggleSensor.bind(this)} />
							</ToolbarGroup>
						</Toolbar>
						{this.state.toggled && widgets}
					</Tab>
				</Tabs>
				<Dialog
					title='Warning'
					actions={actions}
					open={this.state.showDialog}
					ref='warningDialog' >
					Turning this on can greatly reduce performance of the robot and possibly crash the server.
				</Dialog>
			</div>
		)
	}
	_handleCancel () {
		this.setState({
			showDialog: false
		})
		this.refs.toggle.setToggled(false)
	}
	_handleAccept () {
		this.setState({
			showDialog: false,
			toggled: true
		})
		this.interval = setInterval(() => this.props.dispatch(findSensors()), 2000)
	}
	_toggleSensor (e, toggled) {
		if (toggled) {
			this.setState({showDialog: true})
		} else {
			this.setState({toggled: false})
			clearInterval(this.interval)
		}
	}
}

export default SensorReadOut
