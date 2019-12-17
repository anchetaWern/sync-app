import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet
} from 'react-native';

const TextForm = ({ text, updateText, buttonText, buttonAction }) => {
  return (
    <View style={styles.messageBox}>
      <TextInput
        style={styles.textField}
        multiline={true}
        onChangeText={updateText}
        value={text}
        placeholder="Type something..."
      />

      <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={buttonAction}>
          <View>
            <Text style={styles.actionButtonText}>{buttonText}</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  messageBox: {
    flex: 0.1,
    flexDirection: "row",
    marginBottom: 30,
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: "#e5e5e5",
    justifyContent: "space-between"
  },
  textField: {
    height: 40,
    flex: 8
  },
  buttonContainer: {
    height: 40,
    flex: 2,
    alignItems: "flex-end"
  },
  actionButtonText: {
    color: "#0064e1",
    fontWeight: "bold",
    fontSize: 16
  }
});

export default TextForm;
