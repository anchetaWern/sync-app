import React, { Component } from 'react';

import { YellowBox } from 'react-native';

import { createAppContainer, createSwitchNavigator } from 'react-navigation';
import { createBottomTabNavigator } from 'react-navigation-tabs';

import { FontAwesome } from '@expo/vector-icons';

import LoginScreen from './src/screens/LoginScreen';
import LoadingScreen from './src/screens/LoadingScreen';

import PushScreen from './src/screens/PushScreen';
import TextStack from './src/containers/TextStack';
import ChatScreen from './src/screens/ChatScreen';


YellowBox.ignoreWarnings(['Setting a timer']);

const iconNames = {
  Push: 'paper-plane', 
  Text: 'align-justify',
  Chat: 'comment'
};

const TabNavigator = createBottomTabNavigator(
  {
    Chat: ChatScreen,
    Text: TextStack,
    
    Push: PushScreen,
  },

  {
    defaultNavigationOptions: ({navigation}) => ({
      tabBarIcon: ({focused, horizontal, tintColor}) => {
        const {routeName} = navigation.state;
        let IconComponent = FontAwesome;
        let iconName = iconNames[routeName];

        return <IconComponent name={iconName} size={25} color={tintColor} />;
      },
    }),
   
    tabBarOptions: {
      activeTintColor: '#007bff',
      inactiveTintColor: '#ccc',
    },
  },
);

const TabContainer = createAppContainer(TabNavigator);

const RootStack = createSwitchNavigator(
  {
    LoadingScreen,
    LoginScreen,
    TabContainer
  },
  {
    initialRouteName: 'LoadingScreen',
  },
);

import { withChannelContextProvider } from './src/context/ChannelContext';

const MainAppContainer = withChannelContextProvider(createAppContainer(RootStack));

class Router extends Component {
  render() {
    return (
      <MainAppContainer />
    );
  }
}

export default Router;