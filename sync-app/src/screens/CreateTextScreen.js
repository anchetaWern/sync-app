import React, { Component } from 'react';
import { StyleSheet } from 'react-native';
import CreateText from '../components/CreateText';
import ChannelContext from '../context/ChannelContext';

class CreateTextScreen extends Component {
  
  static navigationOptions = {
    title: 'Text',
  };

  static contextType = ChannelContext;

  render() {
    const { navigation } = this.props;

    return (
      <CreateText 
        publishItem={navigation.getParam('publishItem')}
        exitForm={() => {
          this.props.navigation.goBack();
        }}
        afterAction={() => {
          this.props.navigation.goBack();
        }}
      />
    );
  } 
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
});

export default CreateTextScreen;