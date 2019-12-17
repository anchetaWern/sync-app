import React, { Component } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  StyleSheet
} from 'react-native';

import { FontAwesome } from '@expo/vector-icons';
import { Audio } from 'expo-av';

import { AudioContext } from '../context/AudioContext';

class AudioPlayer extends Component {
  state = {
    isPlaying: false,
    playbackObject: null,
    currentIndex: 0,
    volume: 1.0,
    isBuffering: false,
    currentProgress: 0
  };

  static contextType = AudioContext;

  constructor(props) {
    super(props);
    this.channel = null;
  }

  async componentDidMount() {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
        playsInSilentModeIOS: true,
        interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
        shouldDuckAndroid: true,
        staysActiveInBackground: true,
        playThroughEarpieceAndroid: false
      });

      this.loadAudio();
    } catch (err) {
      console.log("error: ", err);
    }

    const { context, deviceID } = this.props;

    this.channel = context.connect();
    this.channel.bind("pusher:subscription_succeeded", () => {
      // listen for the event for setting the instance to play on
      this.channel.bind(
        `client-${deviceID}-select-instance`,
        ({ callingInstance }) => {
          
          // bind to the channel of the calling instnace, this is where the play/pause, next, prev events will be triggered
          this.channel.bind(
            `client-${callingInstance.deviceID}-play-pause`,
            ({ isPlaying }) => {
              this.handlePlayPause();
            }
          );

          this.channel.bind(
            `client-${callingInstance.deviceID}-prev-track`,
            ({ currentIndex }) => {
              this.handlePreviousTrack();
            }
          );

          this.channel.bind(
            `client-${callingInstance.deviceID}-next-track`,
            ({ currentIndex }) => {
              this.handleNextTrack();
            }
          );
          
        }
      );
    });
  }


  render() {
    const { selectedEpisodes } = this.context;
    const { currentIndex, currentProgress, playbackObject } = this.state;
   
    if (selectedEpisodes.length) {
      return (
        <View style={styles.center}>
          <Image
            style={styles.thumbnail}
            source={{
              uri: selectedEpisodes[currentIndex].image
            }}
          />

          <View style={styles.progressContainer}>
            <View style={styles.progressTrack}>
              <View
                style={[styles.progress, { width: currentProgress }]}
              ></View>
            </View>
          </View>

          <View style={styles.controls}>
            <TouchableOpacity
              style={styles.control}
              onPress={this.handlePreviousTrack}
            >
              <FontAwesome name="step-backward" size={50} color="#333" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.control}
              onPress={this.handlePlayPause}
            >
              {this.state.isPlaying ? (
                <FontAwesome name="pause" size={50} color="#333" />
              ) : (
                <FontAwesome name="play" size={50} color="#333" />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.control}
              onPress={this.handleNextTrack}
            >
              <FontAwesome name="step-forward" size={50} color="#333" />
            </TouchableOpacity>
          </View>
          
          {
            playbackObject &&
            <View style={styles.trackDetails}>
              <Text style={styles.trackTitle}>
                {selectedEpisodes[currentIndex].title_original}
              </Text>
            </View>
          }

          {
            !playbackObject &&
            <ActivityIndicator size="small" color="#0000ff" />
          }
        </View>
        
      );
    }
   
    return null;
  }


  loadAudio = async () => {
    const { currentIndex, isPlaying, volume } = this.state;
    const { selectedEpisodes } = this.context;

    if (selectedEpisodes.length) {
      try {
        const playbackObject = new Audio.Sound();
        const source = {
          uri: selectedEpisodes[currentIndex].audio
        };

        let status = {
          shouldPlay: isPlaying,
          volume,
          progressUpdateIntervalMillis: 500
        };

        playbackObject.setOnPlaybackStatusUpdate(this.onPlaybackStatusUpdate);
        await playbackObject.loadAsync(source, status, false);
        this.setState({ playbackObject });
      } catch (err) {
        console.log("error: ", err);
      }
    }
  };


  onPlaybackStatusUpdate = status => {
    if (status) {
      const { positionMillis, durationMillis } = status;
      const currentProgress = (positionMillis / durationMillis) * 200 || 0;

      this.setState({
        isBuffering: status.isBuffering,
        currentProgress
      });

      if (status.didJustFinish) {
        this.handleNextTrack(); // automatically play the next track
      }
    }
  };


  handlePlayPause = async () => {
    const { isPlaying, playbackObject } = this.state;
    const { deviceID, playOn } = this.props;

    if (playOn) {
      this.channel.trigger(`client-${deviceID}-play-pause`, {
        isPlaying
      });
      playbackObject.setIsMutedAsync(true);
    }

    const playbackStatus = await playbackObject.getStatusAsync();

    if (playbackStatus.isLoaded) {
      isPlaying
        ? await playbackObject.pauseAsync()
        : await playbackObject.playAsync();

      await this.setState(state => {
        return {
          isPlaying: !state.isPlaying
        };
      });    
    }
  };


  handlePreviousTrack = async () => {
    let { playbackObject, currentIndex } = this.state;
    const { selectedEpisodes } = this.context;
    const { deviceID, playOn } = this.props;

    if (currentIndex > 0) {
      if (playbackObject) {
        currentIndex < selectedEpisodes.length - 1
          ? (currentIndex -= 1)
          : (currentIndex = 0);

        if (playOn) {
          this.channel.trigger(`client-${deviceID}-prev-track`, {
            currentIndex
          });
        }

        await playbackObject.pauseAsync(); // add this so it wont dual play
        await playbackObject.unloadAsync();

        this.setState({
          currentIndex
        });
        this.loadAudio();
      }
    }
  };


  handleNextTrack = async () => {
    let { playbackObject, currentIndex } = this.state;
    const { selectedEpisodes } = this.context;
    const { deviceID, playOn } = this.props;

    if (currentIndex < selectedEpisodes.length - 1) {
      if (playbackObject) {
        currentIndex < selectedEpisodes.length - 1
          ? (currentIndex += 1)
          : (currentIndex = 0);

        if (playOn) {
          this.channel.trigger(`client-${deviceID}-next-track`, {
            currentIndex
          });
        }

        await playbackObject.pauseAsync(); // add this so it wont dual play
        await playbackObject.unloadAsync();

        this.setState({
          currentIndex
        });

        this.loadAudio();
      }
    }
  };


  renderTrackDetails = () => {
    const { playbackObject, currentIndex } = this.state;
    const { selectedEpisodes } = this.context;

    return playbackObject ? (
      <View style={styles.trackDetails}>
        <Text style={styles.trackTitle}>
          {selectedEpisodes[currentIndex].title_original}
        </Text>
      </View>
    ) : null;
  };
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
  },
  center: {
    flex: 1,
    alignItems: "center"
  },
  thumbnail: {
    width: 200,
    height: 200
  },
  progressContainer: {
    flex: 1,
    padding: 20
  },
  progressTrack: {
    height: 10,
    width: 200,
    backgroundColor: "#ccc"
  },
  progress: {
    height: 10,
    backgroundColor: "#333"
  },
  trackDetails: {
    padding: 20,
    backgroundColor: "#fff"
  },
  trackTitle: {
    fontSize: 15,
    flexWrap: "wrap",
    textAlign: "center",
    color: "#0084ff"
  },
  control: {
    margin: 20
  },
  controls: {
    flexDirection: "row"
  }
});

export default AudioPlayer;
