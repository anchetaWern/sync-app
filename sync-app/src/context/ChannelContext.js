import React, { Component } from 'react';
import { Platform } from 'react-native';

import {
  CHANNELS_APP_KEY,
  CHANNELS_APP_CLUSTER,
  NGROK_HTTPS_URL
} from 'react-native-dotenv';

let Pusher = null;
if (Platform.OS != 'web') {
  Pusher = require('pusher-js/react-native');
} else {
  Pusher = require('pusher-js');
}

export const ChannelContext = React.createContext({});

export class ChannelContextProvider extends Component {

  state = {
    username: ''
  }


  constructor(props) {
    super(props); 
  }


  setUsername = (username) => {
    this.setState({
      username
    });
  }


  connect = () => {
    const { username } = this.state;
    const pusher = new Pusher(CHANNELS_APP_KEY, {
      authEndpoint: `${NGROK_HTTPS_URL}/pusher/auth`,
      cluster: CHANNELS_APP_CLUSTER,
      encrypted: true,
    });

    const channel = pusher.subscribe(`private-${username}-channel`); 
    return channel;
  }


  render() {
    const { channel, username } = this.state;
    return (
      <ChannelContext.Provider
        value={{
          channel, 
          username,
          setUsername: this.setUsername,
          connect: this.connect 
        }}>
        {this.props.children}
      </ChannelContext.Provider>
    );
  }

}

export const withChannelContextProvider = ChildComponent => props => (
  <ChannelContextProvider>
    <ChildComponent {...props} />
  </ChannelContextProvider>
);