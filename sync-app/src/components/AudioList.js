import React, { Component } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { AudioContext } from '../context/AudioContext';
import { FlatList } from 'react-navigation';

class AudioList extends Component {
  static contextType = AudioContext;

  constructor(props) {
    super(props);
    this.channel = true;
  }

  componentDidMount() {
    this.channel = this.props.context.connect();
    this.channel.bind("client-add-item-to-playlist", item => {
      this.context.addItem(item);
    });
  }

  render() {
    const { items } = this.props;
    return (
      <FlatList
        nestedScrollEnabled={true}
        data={items}
        renderItem={this.renderItem}
        keyExtractor={item => item.id.toString()}
      />
    );
  }


  renderItem = ({ item }) => {
    return (
      <View style={styles.listItem}>
        <View style={styles.listItemText}>
          <Text>{item.title_original}</Text>
        </View>
        <View style={styles.listItemButton}>
          <Button
            title="Add"
            color="#0064e1"
            onPress={() => {
              this.context.addItem(item);
              this.channel.trigger("client-add-item-to-playlist", item);
            }}
          />
        </View>
      </View>
    );
  };
  
}

const styles = StyleSheet.create({
  listItem: {
    flex: 1,
    flexDirection: "row",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f3f3"
  },
  listItemText: {
    flex: 8,
    justifyContent: "center"
  },
  listItemButton: {
    flex: 2
  }
});

export default AudioList;
