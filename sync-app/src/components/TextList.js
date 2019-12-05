import React, { Component, useContext } from 'react';
import { View, Text, FlatList } from 'react-native';
import { ListContext } from '../context/ListContext';
import ListItem from './ListItem';

class TextList extends Component {
  
  static contextType = ListContext;

  componentDidMount() {
    const channel = this.props.context.connect();
    channel.bind('client-update-items', async (item) => {
      this.context.updateItems(null, item);
    });
  }


  render() {
    const { items, setModalVisibility, setCurrentItem } = this.context;
    const { doSecondaryAction, secondaryAction } = this.props;

    return (
      <FlatList 
        data={items} 
        renderItem={({ item }) => {
          return (
            <ListItem item={item} onPress={() => {
              setCurrentItem(item);
              if (doSecondaryAction) {
                secondaryAction();
              } else {
                setModalVisibility(true);
              }
            }} />
          );
        }} 
        keyExtractor={item => item.id.toString()} />
    );
  }
  
}

export default TextList;