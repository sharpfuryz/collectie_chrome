import React, { Component, Fragment } from 'react';
import { Header, Icon, List, Button } from 'semantic-ui-react';
import './semantic.min.css';
import './App.css';

const setMoodboards = (payload, context) => {
  try {
    const moodboards = JSON.parse(payload);
    context.setState({ boards: moodboards });
  } catch (e) {
    context.setState({ boards: [] });
  };
};

const parseAction = (messageEvent, context) => {
  try {
    const action = JSON.parse(messageEvent.data);
    switch (action.intent) {
      case 'MOODBOARDS':
        setMoodboards(action.payload, context);
        break;
      default:
        break;
    }
  } catch (e) {
    console.log('Invalid JSON');
  }
}
const actionConnected = '{"intent":"CLIENT_CONNECTED"}';
const actionAddBookmark = (url, id) => {
  const action = { intent: 'ADD_BOOKMARK', payload: { moodboard_id: id, url }};
  return JSON.stringify(action);
};

const PlaceholderNotConnected = (props) => (
  <Header as='h2' icon style={{'marginTop': '40px'}} onClick={props.refresh}>
    <Icon name='refresh' />
    Can't connect Collectie
    <Header.Subheader>
      Please open Collectie app and click the button
    </Header.Subheader>
    <Button style={{'marginTop': '20px'}} primary>Refresh</Button>
  </Header>
);
const PlaceholderConnected = (props) => (
  <Header as='h3'>
    Select moodboard to add a bookmark
  </Header>
);
class App extends Component {
  constructor() {
    super();
    this.state = { connected: false, boards: [] };
  }
  setConnected(ws) {
    ws.send(actionConnected);
    this.setState({ connected: true });
  }
  setNotReady() {
    this.setState({ connected: false });
  }
  componentDidMount() {
    const ws = new WebSocket('ws://localhost:48777/');
    ws.onopen = () => this.setConnected(ws);
    ws.onerror = () => this.setNotReady();
    ws.onmessage = (messageEvent) => parseAction(messageEvent, this);
    this.ws = ws;
  }
  addBookmark(board) {
    const { id }= board;
    board.items_count += 1;
    if(!window.chrome) {
      window.chrome = { tabs: null };
    }
    window.chrome.tabs.getSelected(null, (tab) => {
      this.ws.send(actionAddBookmark(tab.url, id));
      window.close();
    });
  }
  refresh() {
    window.location.reload();
  }
  render() {
    const notConnected = !this.state.connected;
    const boards = this.state.boards;
    return (
      <div>
        { notConnected && <PlaceholderNotConnected refresh={this.refresh} /> }
        { boards.length > 0 && <Fragment><PlaceholderConnected /><List divided relaxed>{boards.map((board) => {
          return <List.Item key={board.id} onClick={() => { this.addBookmark(board) }}>
            <List.Content>
              <List.Header as='a'>{board.title}</List.Header>
              <List.Description as='a'>{board.items_count} items</List.Description>
            </List.Content>
          </List.Item>
        })}</List></Fragment>}
      </div>
    );
  }
}

export default App;
