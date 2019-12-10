import React, { Component } from 'react';
import { View, FlatList } from 'react-native';
import Message from './Message';
import ChatInput from './ChatInput';

import { withChatkit } from '@pusher/chatkit-client-react';

import ChatContext from '../context/ChatContext';

class Chat extends Component {
 
  static contextType = ChatContext;

  state = {
    isDialogVisible: false,
    message: '',
    messages: []
  }


  componentDidMount() {
   
    const { username, roomID } = this.context;
    setTimeout(() => {
      if (this.props.chatkit.currentUser) {
        this.props.chatkit.currentUser.subscribeToRoomMultipart({
          roomId: roomID,
          hooks: {
            onMessage: message => {
              const msg = this.getMessage(message);

              this.setState(state => {
                const messages = [msg, ...state.messages]
                return {
                  messages
                }
              });
            }
          },
          messageLimit: 10
        });
      } 
    }, 3000);
    
  }


  getMessage = ({ id, senderId, parts }) => {
    const textParts = parts.filter(part => part.partType === 'inline');
    const msg = {
      id: id,
      sender: senderId,
      message: textParts[0].payload.content
    }

    return msg;
  }


  render() {
    const { isDialogVisible, message, messages } = this.state;
    if (messages) {
      return (
        <View style={{ flex: 1 }}>
          <FlatList 
            data={messages} 
            inverted={true}
            renderItem={({ item }) => {
              return (
                <Message item={item} />
              );
            }} 
            keyExtractor={item => item.id.toString()} />
            
          <ChatInput 
            message={message} 
            updateMessage={this.updateMessage} 
            sendMessage={this.sendMessage} />
        </View>
      );
    }

    return null;
  }


  updateMessage = (message) => {
    this.setState({
      message
    });
  }


  sendMessage = async () => {
    const { message } = this.state;
    const { roomID } = this.context;

    try {
      await this.props.chatkit.currentUser.sendSimpleMessage({
        roomId: roomID,
        text: message
      });
    } catch (err) {
      console.log('err: ', err);
    }

    this.setState({
      message: ''
    });
  }
}

export default withChatkit(Chat);