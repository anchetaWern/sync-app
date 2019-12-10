import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

const ChatInput = ({ message, updateMessage, sendMessage }) => {

  return (
    <View style={styles.messageBox}>
      <TextInput
        style={styles.textField}
        multiline={true}
        onChangeText={updateMessage}
        value={message}
        placeholder="Type your message..."
      />

      <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={sendMessage}>
          <View>
            <Text style={styles.sendButtonText}>Send</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );

}

const styles = StyleSheet.create({
  messageBox: {
    flex: 0.1,
    flexDirection: 'row',
    marginBottom: 30,
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
    justifyContent: 'space-between',
  },
  textField: {
    height: 40,
    flex: 8,
  },
  buttonContainer: {
    height: 40,
    flex: 2,
    alignItems: 'flex-end',
  },
  sendButtonText: {
    color: '#0064e1',
    fontWeight: 'bold',
    fontSize: 16,
  }
});

export default ChatInput;