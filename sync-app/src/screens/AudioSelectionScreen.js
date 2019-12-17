import React, { Component } from 'react';
import { View, Button, ActivityIndicator, StyleSheet } from 'react-native';
import { ScrollView } from 'react-navigation';
import { ChannelContext } from '../context/ChannelContext';

import TextForm from '../components/TextForm';
import AudioList from '../components/AudioList';

import axios from 'axios';

import { NGROK_HTTPS_URL } from 'react-native-dotenv';

class AudioSelectionScreen extends Component {
  static navigationOptions = ({ navigation }) => {
    return {
      headerTitle: "Select Audio",
      headerRight: () => (
        <View style={{ marginRight: 10 }}>
          <Button
            onPress={() => {
              navigation.navigate("AudioPlayerScreen");
            }}
            title="Play Audio"
            color="#0064e1"
          />
        </View>
      )
    };
  };

  static contextType = ChannelContext;

  state = {
    query: "",
    isLoadingResults: false,
    searchResults: []
  };


  render() {
    const { query, isLoadingResults, searchResults } = this.state;

    return (
      <ScrollView>
        <View style={styles.container}>
          <TextForm
            text={query}
            updateText={this.updateQuery}
            buttonText={"Search"}
            buttonAction={this.search}
          />

          {isLoadingResults && (
            <View style={styles.center}>
              <ActivityIndicator size="large" color="#0000ff" />
            </View>
          )}

          {searchResults && (
            <AudioList items={searchResults} context={this.context} />
          )}
        </View>
      </ScrollView>
    );
  }
 

  updateQuery = query => {
    this.setState({
      query
    });
  };


  search = async () => {
    const { query } = this.state;
    try {
      this.setState({
        isLoadingResults: true
      });

      const response = await axios.get(`${NGROK_HTTPS_URL}/search`, {
        params: {
          query
        }
      });

      this.setState({
        searchResults: response.data,
        isLoadingResults: false
      });
    } catch (err) {
      console.log("error: ", err);
    }
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10
  },
  center: {
    alignItems: "center",
    justifyContent: "center"
  }
});

export default AudioSelectionScreen;
