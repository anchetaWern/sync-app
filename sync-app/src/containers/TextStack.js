import React, { Component } from 'react';
import { createAppContainer } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';

import TextListScreen from '../screens/TextListScreen';
import CreateTextScreen from '../screens/CreateTextScreen';

import { withListContextProvider } from '../context/ListContext';

const Stack = createStackNavigator({
  TextListScreen,
  CreateTextScreen
});

const StackContainer = withListContextProvider(createAppContainer(Stack));

class TextStack extends Component {

  render() {
    return (
      <StackContainer />
    );
  }
}

export default TextStack;