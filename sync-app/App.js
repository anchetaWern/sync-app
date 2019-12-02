import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Router from './Router';

export default function App() {
  return (
    <View style={styles.container}>
      <Router />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
});