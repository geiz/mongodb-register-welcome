import React from "react";
import {
  Platform,
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Keyboard,
  TextInput,
  Dimensions,
  Text,
  Image
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import Confetti from "react-native-confetti";

var width = Dimensions.get("window").width;


export default class HomeScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: false,
      text: ""
    };
  }
componentDidMount(){
  this._confettiView.startConfetti();
}


  render() {

    let result = this.props.navigation.state.params.result
    return (
      <View style={styles.container}>
        <Confetti
          confettiCount={50}
          timeout={10}
          duration={2000}
          ref={node => (this._confettiView = node)}
        />
        <Text
          style={{
            color: "#FF4F79",
            fontSize: 24,
            marginTop: 22,
            marginBottom: 14,
            fontWeight: "bold"
          }}>Welcome to the cool table</Text>
        
        <Image style={{height: width/1.5, width: width/1.5}} source={{ uri : result.image}}/>
        <Text style={{
            color: "gray",
            fontSize: 20,
            marginTop: 22
          }}>{result.name}</Text>
        <Text style={{
            color: "gray",
            fontSize: 20,
            marginTop: 22
          }}>{result.email}</Text>
        
        <ScrollView
          contentContainerStyle={{ flex: 1 }}
          keyboardShouldPersistTaps="handled"
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center"
  }
});