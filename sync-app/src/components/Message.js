import React, { useContext } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import ChatContext from '../context/ChatContext';

const Message = ({ item }) => {

  const { username } = useContext(ChatContext);
  
  const messageStyle = (item.sender == username) ? styles.currentUserMessage : styles.otherUserMessage;
  const textStyle = (item.sender == username) ? styles.currentUserText : styles.otherUserText; 

  return (
    <View style={styles.container}>
      {
        item.sender != username && 
        <View style={styles.avatarContainer}>
          <Image
            style={styles.avatar}
            source={{uri: `https://ui-avatars.com/api/?background=0D8ABC&color=fff&rounded=true&name=${item.sender}`}} />
        </View>
      } 

      <View style={styles.messageContainer}>
        <View style={[styles.message, messageStyle]}>
          <Text style={textStyle}>{item.message}</Text>
        </View>
      </View> 
    </View>
  );
}
//

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    padding: 10
  },
  avatarContainer: {
    flex: 1
  },
  avatar: {
    width: 25, 
    height: 25
  },
  messageContainer: {
    flex: 9
  },
  message: {
    padding: 8,
    borderRadius: 10,
    alignSelf: 'flex-start'
  },
  currentUserMessage: {
    backgroundColor: '#1E90FF',
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  otherUserMessage: {
    backgroundColor: '#f6f8fa',
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  currentUserText: {
    color: '#FFF'
  },
  otherUserText: {
    color: '#333'
  },
});

export default Message;