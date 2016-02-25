import React, {Component} from 'react'
import {DropDownMenu} from 'material-ui/lib'
import {setSensorMode, getSensorData} from '../../actions/sensors'
import {merge} from '../utils'

const styles = {
	container: {
		display: 'flex',
		alignItems: 'center',
		padding: 20
	},
	dropDown: {
		marginTop: '-15px',
		flex: 1,
		left: -20
	},
	textValue: {
		marginRight: 14
	},
	color: {
		height: 30,
		width: 30,
		border: '1px solid rgba(51, 51, 51, 0.3)',
		borderRadius: '50%'
	}
}

const colors = {
	'0': 'black',
	'1': 'black',
	'2': 'blue',
	'3': 'green',
	'4': 'yellow',
	'5': 'red',
	'6': 'white',
	'7': 'brown'
}

const items = [
	{ payload: 'COL-REFLECT', text: 'Reflected Light Intensity' },
	{ payload: 'COL-COLOR', text: 'Color' }
]

class ColorSensor extends Component {
	constructor (props) {
		super(props)
	}
	swapMode (e, i, item) {
		this.props.dispatch(setSensorMode(this.props.path, item.payload, this.props.port))
	}
	colorValue () {
		if (this.props.mode === 'COL-COLOR') {
			return colors[this.props.value]
		} else {
			return `rgba(0, 0, 0, ${(100 - this.props.value) / 100})`
		}
	}
	componentDidMount () {
		this.interval = setInterval(() => this.props.dispatch(getSensorData(this.props.path, this.props.port)), this.props.interval)
	}
	componentWillUnmount () {
		clearInterval(this.interval)
	}
	render () {
		const color = this.colorValue()
		return (
			<div style={styles.container}>
				<DropDownMenu
					style={styles.dropDown}
					menuItems={items}
					onChange={this.swapMode.bind(this)} />
				<div style={styles.textValue}> {this.props.value} </div>
				<div style={merge(styles.color, {backgroundColor: color})} />
			</div>
		)
	}
}

export default ColorSensor
