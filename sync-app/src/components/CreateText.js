import React, { useContext } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { ListContext } from '../context/ListContext';
import isElectron from '../helpers/isElectron';

const CreateText = ({ publishItem, exitForm, afterAction }) => {
  const { id, title, text, updateInput, updateItems } = useContext(ListContext);

  return (
    <View style={styles.container}>
      {
        !isElectron && 
        <View>
          <Text style={styles.headingText}>Text</Text>
        </View>
      }
      
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Title</Text>
        <TextInput
          style={styles.textInput}
          onChangeText={title => updateInput('title', title)}
          value={title}
        />
      </View>

      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Text</Text>
        <TextInput
          style={[styles.textInput, { height: 200 }]}
          multiline={true}
          numberOfLines={20}
          onChangeText={text => updateInput('text', text)}
          value={text}
        />
      </View>

      <View style={styles.buttonContainer}>
        <Button title="Save" color="#0064e1" onPress={async() => {
          const item_id = await updateItems(afterAction);
          publishItem(item_id, title, text);
        }} />
      </View>

      <View style={styles.buttonContainer}>
        <Button title="Cancel" color="#333" onPress={exitForm} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 22,
    padding: 12
  },
  headingText: {
    fontSize: 20,
    fontWeight: 'bold'
  },
  fieldContainer: {
    marginTop: 20
  },
  label: {
    fontSize: 16
  },
  textInput: {
    height: 40,
    marginTop: 5,
    marginBottom: 10,
    borderColor: "#ccc",
    borderWidth: 1,
    backgroundColor: "#eaeaea",
    padding: 5
  },
  buttonContainer: {
    marginTop: 5
  }
});

export default CreateText;