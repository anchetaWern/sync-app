import React, { Component } from 'react';
import {
  View,
  Text,
  Button,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { ScrollView, FlatList } from 'react-navigation';

import * as Device from 'expo-device';

import { ChannelContext } from '../context/ChannelContext';

import AudioPlayer from '../components/AudioPlayer';

import isElectron from '../helpers/isElectron';

const randomString = require('random-string');

class AudioPlayerScreen extends Component {
  static contextType = ChannelContext;

  static navigationOptions = {
    title: "Play Audio"
  };

  state = {
    deviceID: '',
    deviceName: '',
    searchingOtherInstances: false,
    otherInstances: [],
    selectedInstance: null
  };

  constructor(props) {
    super(props);
    this.channel = null;
  }

  async componentDidMount() {
    this.channel = this.context.connect();

    const deviceType = await Device.getDeviceTypeAsync();
    const { DESKTOP, TABLET, PHONE } = Device.DeviceType;
    let deviceName = "";

    if (deviceType === TABLET || deviceType === PHONE) {
      deviceName = `${Device.brand} - ${Device.deviceName}`;
    } else if (deviceType === DESKTOP) {
      deviceName = `${Device.osName} ${Device.osVersion}`;
      if (isElectron) {
        deviceName += " (desktop app)";
      } else {
        deviceName += " (web app)";
      }
    }

    const deviceID = randomString();

    this.setState({
      deviceID,
      deviceName
    });

    this.channel.bind("pusher:subscription_succeeded", () => {
      this.channel.bind("client-check-other-instance", dev => {
        this.channel.trigger(`client-${dev.deviceID}-add-other-instance`, {
          deviceID: deviceID,
          deviceName: deviceName
        });
      });

      this.channel.bind(`client-${deviceID}-add-other-instance`, dev => {
        const { otherInstances } = this.state;
        const index = otherInstances.findIndex(
          itm => itm.deviceID == dev.deviceID
        );

        if (index === -1) {
          this.setState(state => {
            const items = [
              ...state.otherInstances,
              { deviceID: dev.deviceID, deviceName: dev.deviceName }
            ];
            return {
              otherInstances: items
            };
          });
        }
      });
    }); 
  }


  render() {
    const { deviceID, searchingOtherInstances, selectedInstance } = this.state;
    if (deviceID) {
      return (
        <ScrollView>
          <View style={styles.container}>
            <AudioPlayer
              context={this.context}
              deviceID={deviceID}
              playOn={selectedInstance}
            />
            {searchingOtherInstances && (
              <ActivityIndicator size="large" color="#0000ff" />
            )}

            {!searchingOtherInstances && (
              <View>
                <Button
                  title="Find other instances"
                  color="#0064e1"
                  onPress={this.findOtherInstances}
                />
                {this.renderInstanceList()}
              </View>
            )}
          </View>
        </ScrollView>
      );
    }
 
    return null;
  }


  findOtherInstances = () => {
    const { deviceID, deviceName } = this.state;

    this.setState({
      searchingOtherInstances: true
    });

    this.channel.trigger("client-check-other-instance", {
      deviceID,
      deviceName
    });

    setTimeout(() => {
      this.setState({
        searchingOtherInstances: false
      });
    }, 5000);
  };
  

  renderInstanceList = () => {
    const { otherInstances, selectedInstance } = this.state;

    if (otherInstances.length) {
      return (
        <View style={styles.instanceListContainer}>
          <FlatList
            data={otherInstances}
            extraData={selectedInstance}
            renderItem={({ item }) => {
              const textColor =
                this.state.selectedInstance &&
                this.state.selectedInstance.deviceID === item.deviceID
                  ? "#0084ff"
                  : "#484848";
              return (
                <TouchableOpacity onPress={() => this.setInstance(item)}>
                  <View style={styles.instanceListItem}>
                    <FontAwesome name="music" size={12} color={textColor} />
                    <Text style={[styles.smallText, { color: textColor }]}>
                      {item.deviceName}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            }}
            keyExtractor={item => item.deviceID.toString()}
          />
        </View>
      );
    }
    return null;
  };
 

  setInstance = item => {
    this.setState({
      selectedInstance: item
    });

    const { deviceID, deviceName } = this.state;

    this.channel.trigger(`client-${item.deviceID}-select-instance`, {
      callingInstance: {
        deviceID,
        deviceName
      }
    });
  };
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 20 
  },
  smallText: {
    fontSize: 12,
    marginLeft: 5
  },
  instanceListContainer: {
    alignItems: "center",
    marginTop: 20
  },
  instanceListItem: {
    flexDirection: "row",
    marginBottom: 5
  }
});

export default AudioPlayerScreen;
