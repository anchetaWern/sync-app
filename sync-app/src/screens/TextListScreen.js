import React, { Component } from 'react';
import { 
  View, 
  Button, 
  Platform,
  StyleSheet,
  Modal
} from 'react-native';

import ListItem from '../components/ListItem';
import CreateText from '../components/CreateText';
import isElectron from '../helpers/isElectron';

import Constants from 'expo-constants';
import WebModal from 'modal-enhanced-react-native-web';

import { ChannelContext } from '../context/ChannelContext';
import { ListContext } from '../context/ListContext';
import TextList from '../components/TextList';

class TextListScreen extends Component {
 
  static contextType = ChannelContext;

  static navigationOptions = {
    title: 'Text List',
  };


  constructor(props) {
    super(props);
    this.channel = null;
  }


  componentDidMount() {
    this.channel = this.context.connect();
  }

 
  render() {
    return (
      <ListContext.Consumer>
        {
          ({ isModalVisible, setModalVisibility, updateItems }) => (
            <View style={styles.container}>
              <View style={styles.statusBar} />
              <Button title="Add new item" color="#0064e1" onPress={() => {
                if (isElectron) {
                  this.props.navigation.navigate('CreateTextScreen', {
                    publishItem: this.publishItem
                  });
                } else {
                  setModalVisibility(true)
                }
              }} />
              <TextList context={this.context} channel={this.channel} doSecondaryAction={isElectron} secondaryAction={() => {
                this.props.navigation.navigate('CreateTextScreen', {
                  publishItem: this.publishItem
                });
              }} />

              {
                !isElectron && Platform.OS != 'web' &&
                <Modal
                  animationType="slide"
                  transparent={false}
                  visible={isModalVisible}
                  onRequestClose={() => {
                    setModalVisibility(false);
                  }}
                >
                  <CreateText 
                    publishItem={this.publishItem}
                    exitForm={() => {
                      setModalVisibility(false)
                    }}
                  />
                </Modal>
              }

              {
                !isElectron && Platform.OS == 'web' &&
                <WebModal
                  animationType="slide"
                  transparent={false}
                  visible={isModalVisible}
                  onRequestClose={() => {
                    setModalVisibility(false);
                  }}
                >
                  <CreateText 
                    publishItem={this.publishItem}
                    exitForm={() => {
                      setModalVisibility(false)
                    }}
                  />
                </WebModal>
              }
            </View>
          )
        } 
      </ListContext.Consumer>
    );
  }
  

  publishItem = (id, title, text) => {
    this.channel.trigger('client-update-items', {
      id,
      title,
      text
    });
  }

}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  statusBar: {
    height: Constants.statusBarHeight,
  }
});

export default TextListScreen;