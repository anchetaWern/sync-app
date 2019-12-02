import React, { Component } from 'react';
import { View, ActivityIndicator, AsyncStorage } from 'react-native';

class LoadingScreen extends Component {

  async componentDidMount() {
    try { 
      const value = await AsyncStorage.getItem('username');
      if (value !== null) {
        this.props.navigation.navigate('TabContainer');
      } else {
        this.props.navigation.navigate('LoginScreen');
      }
    } catch (error) {
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