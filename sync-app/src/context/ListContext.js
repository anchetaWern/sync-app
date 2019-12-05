import React, { Component } from 'react';
import { AsyncStorage } from 'react-native';

export const ListContext = React.createContext({});
const randomString = require('random-string');

export class ListContextProvider extends Component {
  
  state = {
    id: '', 
    title: '',
    text: '',
    items: [],
    isModalVisible: false
  }

  constructor(props) {
    super(props);
  }


  async componentDidMount() {
    try {
      const items = await AsyncStorage.getItem('items');
      if (items !== null) {
        await this.setState({
          items: JSON.parse(items)
        });
      } 
    } catch (err) {
      console.log('err: ', err);
    }
  }


  render() {
    return (
      <ListContext.Provider
        value={{
          ...this.state,
          updateItems: this.updateItems,
          updateInput: this.updateInput,
          setModalVisibility: this.setModalVisibility,
          setCurrentItem: this.setCurrentItem
        }}>
        {this.props.children}
      </ListContext.Provider>
    );
  }


  setModalVisibility = (visibility) => {
    this.setState({
      isModalVisible: visibility
    });
  }


  updateItems = async (afterAction, newItem) => {
    let { id, title, text } = (newItem) ? newItem : this.state;
    let { items } = this.state;
    
    if (!id) {
      id = randomString();
    }
    
    try {
      const index = items.findIndex(itm => itm.id == id);
      if (index === -1) {
        await this.setState(state => {
          const items = [...state.items, { id, title, text }]
          return {
            items,
            isModalVisible: false,
            id: '',
            title: '',
            text: ''
          }
        });
      } else {
        await this.setState(state => {
          const list = state.items.map((item) => {
            if (item.id === id) {
              return {
                id,
                title,
                text
              }
            } else {
              return item;
            }
          });

          return {
            items: list,
            isModalVisible: false,
            id: '',
            title: '',
            text: ''
          };
        });
      }

      AsyncStorage.setItem('items', JSON.stringify(this.state.items));
     
      if (afterAction) {
        afterAction();
      }

    } catch (err) {
      console.log('err: ', err);
    }

    return id;
  }


  updateInput = (key, value) => {
    this.setState({
      [key]: value
    });
  }


  setCurrentItem = ({ id, title, text }) => {
    this.setState({
      id, 
      title,
      text
    });
  }

}


export const withListContextProvider = ChildComponent => props => (
  <ListContextProvider>
    <ChildComponent {...props} />
  </ListContextProvider>
);