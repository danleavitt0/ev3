import React, {Component} from 'react'
import {List, ListItem, FlatButton, Dialog, TextField} from 'material-ui/lib'
import Project from '../components/project'
import MainLayout from '../layouts/main'
import Nav from '../components/nav'
import {setNewUrl, startPull} from '../../actions/actions'
import {getFileList} from '../../actions/initialize'

const styles = {
  cardList: {
    width: '80%',
    margin: '0 auto'
  },
  button: {
    position: 'absolute',
    top: 20,
    zIndex: 999,
    right: 40
  },
  label: {
    marginRight: 15
  },
  content: {
    display: 'flex',
    alignItems: 'center'
  }
}

class Home extends Component {
  constructor (props) {
    super(props)
    this.state = {
      showDialog: false,
      errorText: ''
    }
  }
  createFile () {
    this.setState({
      showDialog: true
    })
    setTimeout(() => this.refs.name.focus())
  }
  componentDidMount () {
    this.props.dispatch(getFileList())
  }
  pullButtonClick () {
    this.props.dispatch(startPull())
  }
  _onDialogCancel () {
    this.setState({
      showDialog: false,
      errorText: ''
    })
  }
  _onDialogSubmit () {
    this.props.dispatch(setNewUrl('/edit/' + this.refs.name.getValue()))
    this.setState({
      errorText: ''
    })
  }
  _handleTextChange (e) {
    let errorText = e.target.value.match(/\s/g) ? 'No spaces allowed' : ''
    this.setState({
      errorText
    })
  }
  render () {
    const files = this.props.files && this.props.files.length > 0
      ? this.props.files.map((project, i) => <Project name={project} key={'project-' + i}/>)
      : <ListItem>No files found</ListItem>
    const standardActions = [
      <FlatButton key={0} secondary={true} label='Cancel' onTouchTap={this._onDialogCancel.bind(this)} />,
      <FlatButton key={1} primary={true} label='Submit' onTouchTap={this._onDialogSubmit.bind(this)} ref='submit' disabled={this.state.errorText.length > 0}/>
    ]
    return (
      <MainLayout nav={<Nav title={'EV3.js'} iconRight={<FlatButton onClick={this.createFile.bind(this)} label='Create' />}/>}>
        <div style={styles.cardList}>
          <List>
            {files}
          </List>
        </div>
        <Dialog
          open={this.state.showDialog}
          ref='create'
          actions={standardActions}
          bodyStyle={styles.content} >
          <label style={styles.label}>Name Program:</label>
          <TextField
            onChange={this._handleTextChange.bind(this)}
            errorText={this.state.errorText}
            ref='name'/>
        </Dialog>
      </MainLayout>
    )
  }
}

export default Home
