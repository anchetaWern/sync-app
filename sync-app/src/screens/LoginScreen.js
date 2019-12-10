import React, { Component } from 'react';
import {
  View, 
  Text, 
  TextInput, 
  Button, 
  AsyncStorage, 
  StyleSheet
} from 'react-native';

import { ChannelContext } from '../context/ChannelContext'; 
import axios from 'axios';

import {
  NGROK_HTTPS_URL
} from 'react-native-dotenv';

class LoginScreen extends Component {
  
  static contextType = ChannelContext;

  constructor(props) {
    super(props);
  }


  state = {
    username: '',
    roomID: '',
    isLoading: false
  }


  render() {
    const { username, roomID, isLoading } = this.state;

    return (
      <View style={styles.wrapper}>
        <View style={styles.container}>

          <View style={styles.main}>
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Enter your username</Text>
              <TextInput
                style={styles.textInput}
                onChangeText={username => this.setState({ username })}
                value={username}
              />
            </View>

            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Enter your room ID</Text>
              <TextInput
                style={styles.textInput}
                onChangeText={roomID => this.setState({ roomID })}
                value={roomID}
              />
            </View>

            {!isLoading && (
              <Button title="Login" color="#0064e1" onPress={this.login} />
            )}

            {isLoading && (
              <Text style={styles.loadingText}>Loading...</Text>
            )}
          </View>
        </View>
      </View>
    );
  }


  login = async () => {
    const { username, roomID } = this.state;
    
    this.setState({
      isLoading: true
    });

    if (username) {
      try {
        this.context.setUsername(username);

        const response = await axios.post(`${NGROK_HTTPS_URL}/chatkit/login`, { 
          username, 
          roomID 
        });
        const { user } = response.data;
        
        AsyncStorage.setItem('username', username);
        AsyncStorage.setItem('roomID', roomID);
        
        this.props.navigation.navigate('TabContainer');

      } catch (err) {
        console.log('err: ', err);
        this.props.navigation.navigate('LoadingScreen');
      }
    }
  }
}


const styles = StyleSheet.create({
  wrapper: {
    flex: 1
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#FFF"
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
  loadingText: {
    alignSelf: "center"
  }
});

export default LoginScreen;