import React, { Component } from 'react';
import {
  Platform,
  View,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Button,
  AsyncStorage,
  StyleSheet
} from 'react-native';

import { GiftedChat, Message, Send } from 'react-native-gifted-chat';
import { FontAwesome } from '@expo/vector-icons';

import ChatBubble from '../components/ChatBubble';

const randomString = require('random-string');

import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import * as Permissions from 'expo-permissions';

import { 
  IMGUR_APP_ID, 
} from 'react-native-dotenv';

import isElectron from '../helpers/isElectron';

import { ChannelContext } from '../context/ChannelContext';

class PushScreen extends Component {
  state = {
    username: '',
    isPickingFile: false,
    isSending: false,
    messages: [],
  };


  constructor(props) {
    super(props);
    this.attachment = null;
    this.channel = null;
  }

  static contextType = ChannelContext;

  async componentDidMount() { 
    try {
      const username = await AsyncStorage.getItem('username');
      await this.setState({
        username
      });
    } catch (err) {
      this.props.navigation.navigate('LoadingScreen');
    } 

    this.channel = this.context.connect();
    this.channel.bind('client-push-message', async message => {
      const msg = this.getMessage(message); 
      await this.setState(previousState => ({
        messages: GiftedChat.append(previousState.messages, msg),
      }));
    });

  }


  render() {
    const { username, messages } = this.state;

    if (username) {
      return (
        <View style={styles.container}>
          <GiftedChat
            messages={messages}
            onSend={messages => this.onSend(messages)}
            user={{
              _id: username, 
            }}
            renderActions={this.renderCustomActions}
            renderSend={this.renderSend}
            renderMessage={this.renderMessage}
          />
          <KeyboardAvoidingView behavior={ Platform.OS === 'android' ? 'padding' :  null} keyboardVerticalOffset={40}/>
        </View>
      );
    }

    return null;
  }
  

  renderMessage = (msg) => {
    const renderBubble = (msg.currentMessage.image) ? this.renderPreview.bind(this, msg.currentMessage.image) : null;
    let modifiedMsg = {
      ...msg,
      renderBubble
    };

    return <Message {...modifiedMsg} />
  }


  renderPreview = (imageURI, bubbleProps) => {
    const textColor = (bubbleProps.position == 'right') ? '#FFF' : '#000';
    const modifiedBubbleProps = {
      ...bubbleProps
    };
  
    return (
      <ChatBubble {...modifiedBubbleProps}>
        <Button
          onPress={() => {
            this.downloadFile(imageURI)
          }}
          title="Download"
        />
      </ChatBubble>
    );
  }


  downloadFile = (imageURI) => {   
    if (isElectron) {
      window.ipcRenderer.send("download-file", imageURI);
    } else if (Platform.OS == 'web') {
      window.open(imageURI); 
    } else {
      const fileUri = FileSystem.documentDirectory + randomString() + '.jpeg';
      FileSystem.downloadAsync(imageURI, fileUri)
        .then(({ uri }) => {
            this.saveFile(uri);
          })
          .catch(error => {
            console.error('error: ', error);
          });
    }
  }


  saveFile = async (fileUri) => {
    const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
    if (status === "granted") {
      const asset = await MediaLibrary.createAssetAsync(fileUri)
      await MediaLibrary.createAlbumAsync("Download", asset, false)
    }
  }


  renderCustomActions = () => {
    if (!this.state.isPickingFile) {
      const iconColor = this.attachment ? '#0064e1' : '#808080';

      return (
        <View style={styles.customActionsContainer}>
          <TouchableOpacity onPress={this.openFilePicker}>
            <View style={styles.buttonContainer}>
              <FontAwesome name="paperclip" size={23} color={iconColor} />
            </View>
          </TouchableOpacity>
        </View>
      );
    }
    return (
      <ActivityIndicator size="small" color="#0064e1" style={styles.loader} />
    );
  };
 

  openFilePicker = async () => {
    await this.setState({
      isPickingFile: true,
    });
   
    try {
      const fileType = 'image/jpeg';
      const pickerRes = await DocumentPicker.getDocumentAsync({
        type: fileType
      });

      let base64 = '';
      if (Platform.OS === 'web') {
        base64 = pickerRes.uri
          .replace(`data:${fileType};base64,`, '');
      } else {
        base64 = await FileSystem.readAsStringAsync(pickerRes.uri, {
          encoding: FileSystem.EncodingType.Base64
        });
      }

      const formData = new FormData();
      formData.append("image", base64);
      formData.append("type", "base64");

      const imgurRes = await fetch("https://api.imgur.com/3/image", {
        method: "POST",
        headers: {
          Authorization: `Client-ID ${IMGUR_APP_ID}`
        },
        body: formData
      });
      const imgurResData = await imgurRes.json();

      this.attachment = {
        type: imgurResData.data.type,
        link: imgurResData.data.link
      };

      this.setState({
        isPickingFile: false
      });

    } catch (err) {
      console.log('err: ', err);
    }
  };


  renderSend = props => {
    if (this.state.isSending) {
      return (
        <ActivityIndicator
          size="small"
          color="#0064e1"
          style={[styles.loader, styles.sendLoader]}
        />
      );
    }
    return <Send {...props} />;
  };
  

  getMessage = ({ id, text, sender, attachment }) => {
    let msg = {
      _id: id,
      text: text,
      createdAt: new Date(),
      user: {
        _id: sender.id.toString(),
        name: sender.name,
        avatar: `https://ui-avatars.com/api/?background=d88413&color=FFF&name=${sender.name}`
      }
    };

    if (attachment && attachment.type.includes('image')) {
      msg = Object.assign(msg, {
        image: attachment.link
      });
    }

    return msg;
  }


  onSend = async ([message]) => {
    
    const { username } = this.state;

    let messageData = {
      id: randomString(),
      text: message.text,
      sender: {
        id: username,
        name: username
      }
    };

    if (this.attachment) {
      messageData = Object.assign(messageData, { attachment: this.attachment });
    }

    this.channel.trigger('client-push-message', messageData);
    const msg = this.getMessage(messageData);
   
    await this.setState(previousState => ({
      messages: GiftedChat.append(previousState.messages, msg),
    }));

    this.attachment = null;
  };

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loader: {
    paddingTop: 20,
  },
  sendLoader: {
    marginRight: 10,
    marginBottom: 10,
  },
  customActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  buttonContainer: {
    padding: 10,
  },
});

export default PushScreen;