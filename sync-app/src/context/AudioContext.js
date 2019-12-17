import React, { Component } from 'react';

export const AudioContext = React.createContext({});

export class AudioContextProvider extends Component {
  state = {
    selectedEpisodes: []
  };

  render() {
    return (
      <AudioContext.Provider
        value={{
          ...this.state,
          addItem: this.addItem
        }}
      >
        {this.props.children}
      </AudioContext.Provider>
    );
  }

  addItem = async item => {
    const { selectedEpisodes } = this.state;
    const index = selectedEpisodes.findIndex(row => row.id == item.id);
    if (index === -1) {
      await this.setState(state => {
        const selectedEpisodes = [...state.selectedEpisodes, item];
        return {
          selectedEpisodes
        };
      });
    }
  };
}

export const withAudioContextProvider = ChildComponent => props => (
  <AudioContextProvider>
    <ChildComponent {...props} />
  </AudioContextProvider>
);
