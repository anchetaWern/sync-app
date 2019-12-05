import React, { Component } from 'react';
import { View, ActivityIndicator, AsyncStorage } from 'react-native';
import { ChannelContext } from '../context/ChannelContext';

class LoadingScreen extends Component {

  static contextType = ChannelContext;

  async componentDidMount() {
    try { 
      const username = await AsyncStorage.getItem('username');
      if (username !== null) {
        this.context.setUsername(username); 
        this.props.navigation.navigate('TabContainer');
      } else {
        this.props.navigation.navigate('LoginScreen');
      }
    } catch (err) {
      console.log('err: ', err);
      this.props.navigation.navigate('LoginScreen');
    }
  }


  render() {
    return (
      <View style={{flex: 1}}>
        <ActivityIndicator size="small" color="#0064e1" />
      </View>
    );
  }
}

export default LoadingScreen;