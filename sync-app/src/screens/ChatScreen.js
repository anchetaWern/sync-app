import React, { Component } from 'react';
import { View, Text, AsyncStorage, KeyboardAvoidingView, StyleSheet } from 'react-native';
import Chat from '../components/Chat';

import ChatContext from '../context/ChatContext';

import { ChatkitProvider, TokenProvider } from '@pusher/chatkit-client-react';

import {
  CHATKIT_INSTANCE_LOCATOR_ID,
  CHATKIT_TEST_TOKEN_PROVIDER_URL
} from 'react-native-dotenv';

const tokenProvider = new TokenProvider({
  url: CHATKIT_TEST_TOKEN_PROVIDER_URL,
});

class ChatScreen extends Component {

  state = {
    username: '',
    roomID: ''
  }

  async componentDidMount() {
   
    setTimeout(async () => {
      try {
        const username = await AsyncStorage.getItem('username');
        const roomID = await AsyncStorage.getItem('roomID');

        this.setState({
          username,
          roomID
        });
      } catch (err) {
        console.log('error: ', err);
      }
    }, 3000);
  }


  render() {
    const { username, roomID } = this.state;

    if (username && roomID) {
      return (
        <KeyboardAvoidingView style={styles.container} behavior="padding" keyboardVerticalOffset={20} enabled>
          <ChatContext.Provider value={{ username, roomID }}>
            <ChatkitProvider
              instanceLocator={CHATKIT_INSTANCE_LOCATOR_ID}
              tokenProvider={tokenProvider}
              userId={username}
            >
              <Chat />
            </ChatkitProvider>

          </ChatContext.Provider>
        </KeyboardAvoidingView>
      );  
    }

    return null; 
  }

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10
  }
});

export default ChatScreen;