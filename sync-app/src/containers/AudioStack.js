import React, { Component } from 'react';
import { createAppContainer } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';

import AudioSelectionScreen from '../screens/AudioSelectionScreen';
import AudioPlayerScreen from '../screens/AudioPlayerScreen';

import { withAudioContextProvider } from '../context/AudioContext';

const Stack = createStackNavigator(
  {
    AudioSelectionScreen,
    AudioPlayerScreen
  },
  {
    cardStyle: {flex: 1} 
  }
);

const StackContainer = withAudioContextProvider(createAppContainer(Stack));

class AudioStack extends Component {
  render() {
    return <StackContainer />;
  }
}

export default AudioStack;
