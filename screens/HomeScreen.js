import React from "react";
import { withNavigation } from 'react-navigation';
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
  Button,
  Image
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Stitch, RemoteMongoClient, AnonymousCredential} from "mongodb-stitch-react-native-sdk";
import * as ImagePicker from 'expo-image-picker';
import Constants from 'expo-constants';
import * as Permissions from 'expo-permissions';
import Confetti from "react-native-confetti";

var height = Dimensions.get("window").height;

function ValidateEmail(mail) 
{
 if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(mail))
  {
    return (true)
  }
    return (false)
}

class HomeScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentUserId: '',
      name: '',
      email: '',
      error: '',
      result: '',
      image: '',
    };
  }

  // Registers New User, Uploads the data, then redownloads it to be passed on to the Welcome Screen as props
  handleRegister = () => {

    //Auth with Mongodb Atlas using Stitch
    Stitch.defaultAppClient.auth
        .loginWithCredential(new AnonymousCredential())
        .then(user => {
          console.log(`Successfully logged in as user ${user.id}`);
          this.setState({ currentUserId: user.id });

          const mongoClient = Stitch.defaultAppClient.getServiceClient(
            RemoteMongoClient.factory,
            "mongodb-atlas"
          );
          const db = mongoClient.db("testDatabase");
          const acc = db.collection("users");

          // Uploads data to MongoDb
          acc.insertOne({
            id : user.id,
            date: new Date(),
            name: this.state.name,
            email: this.state.email,
            image: this.state.base64Image
          }).then(() =>{

            // Once upload completes, look for user id and download their most recent dataset.
            acc.find({id : user.id}, {limit: 1, sort: { date: -1 } })
            .asArray()  
            .then(docs => {

              // Resets state
              this.setState({
                currentUserId: '',
                name: '',
                email: '',
                error: '',
                result: '',
                image: ''
              })

              // Got all the data and moving to the welcome screen!
              this.props.navigation.navigate('Welcome', { result: docs[0]});
            }).catch(err => {
              console.error(err)
            })});
        })
        .catch(err => {
          console.log(`Failed to log in anonymously: ${err}`);
        });
  }

  // Gets permission from user to access photos
  getPermissionAsync = async () => {
    if (Constants.platform.ios) {
      const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
      if (status !== 'granted') {
        alert('Sorry, we need camera roll permissions to make this work!');
      }
    }
  }

  // Allows user to pick an image and converts it to a Base64 string.
  // use base64 in <Image source={{uri : BASE_64}} />
  _pickImage = async () => {
    await this.getPermissionAsync();

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      type: 'image',
      exif: true,
      allowsEditing: true, // you can choose how to crop oddly sized images
      base64: true,
      quality: 0.0 // Potato quality image because bigger not nessicary.
    });
    if (!result.cancelled) {

      let imageType = result.uri.split('.').pop();
      let base64Header = `data:image/${imageType};base64,`;
      let base64Result = base64Header.concat(result.base64)

      this.setState({ image: result.uri, base64Image: base64Result });
    }
  };

  // No need for a navbar
  static navigationOptions = {
    header: null
  };

  render() {
    let { image } = this.state;

    return (
      <ScrollView
          contentContainerStyle={styles.container }>
        <Text
          style={{
            color: "#FF4F79",
            fontSize: 24,
            marginBottom: 14,
            fontWeight: "bold"
          }}>Register, will ya?</Text>
        <TextInput
          style={{
            color: "lightgray",
            fontSize: 20,
            marginTop: 45
          }}
          placeholder="1. Your Name..."
          onChangeText={name => this.setState({ name })}
          value={this.state.name}
        />
        <TextInput
          style={{
            color: "lightgray",
            fontSize: 20,
            marginTop: 25,
            marginBottom: 25
          }}
          placeholder="2. Your Email..."
          onChangeText={email => this.setState({ email })}
          value={this.state.email}
        />
        <Button
          title="3. Pick an image"
          onPress={this._pickImage}
        />
        { // Image Preview before upload
          image == '' ? <React.Fragment /> :
          <Image source={{ uri: image }} style={{ width: 200, height: 200 }} />}
        {
          this.state.image != '' && this.state.name != '' && ValidateEmail(this.state.email) ? 
          <TouchableOpacity onPress={() => this.handleRegister()}>
            <Ionicons
              name={Platform.OS == "ios" ? "ios-person-add" : "md-person-add"}
              size={50}
              style={{
                marginTop: 25,
                color: "#FF4F79"
              }}
            />
          </TouchableOpacity> :
          <TouchableOpacity onPress={() => this.setState({error : "Pease fill your name, have a valid email, and pick an image for 3!"})}>
            <Ionicons
              name={Platform.OS == "ios" ? "ios-person-add" : "md-person-add"}
              size={50}
              style={{
                marginTop: 25,
                color: "#FF4F79",
                opacity: 0.2
              }}
            />
          </TouchableOpacity> 
        }
        <Text
          style={{
            color: "#FF4F79",
            fontSize: 14,
            marginTop: 25,
          }}>{this.state.error}</Text>
        
      </ScrollView>
    );
  }
}

export default withNavigation(HomeScreen)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center"
  }
});

/*import React from "react";
import {
  Platform,
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Keyboard,
  TextInput,
  Dimensions
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Confetti from "react-native-confetti";

var height = Dimensions.get("window").height;


export default class HomeScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: false,
      text: ""
    };
  }



  handleSubmit = () => {
    
    Keyboard.dismiss();
    const stitchAppClient = Stitch.defaultAppClient;
    const mongoClient = stitchAppClient.getServiceClient(
      RemoteMongoClient.factory,
      "mongodb-atlas"
    );
    const db = mongoClient.db("taskmanager");
    const tasks = db.collection("tasks");
    if (this.state.text != "") {
      tasks
        .insertOne({
          status: "new",
          description: this.state.text,
          date: new Date()
        })
        .then(() => {
          if (this._confettiView) {
            this._confettiView.startConfetti();
          }
          this.setState({ value: !this.state.value });
          this.setState({ text: "" });
        })
        .catch(err => {
          console.warn(err);
        });
    }
  };

  static navigationOptions = {
    header: null
  };

  render() {
    return (
      <View style={styles.container}>
        <Confetti
          confettiCount={50}
          timeout={10}
          duration={2000}
          ref={node => (this._confettiView = node)}
        />
        <TextInput
          style={{
            color: "lightgray",
            fontSize: 20,
            marginTop: height / 2 - 60
          }}
          placeholder="Enter Task..."
          onChangeText={text => this.setState({ text })}
          value={this.state.text}
          onSubmitEditing={() => this.handleSubmit()}
        />
        <TouchableOpacity onPress={() => this.handleSubmit()}>
          <Ionicons
            name={Platform.OS == "ios" ? "ios-add-circle" : "md-add-circle"}
            size={50}
            style={{
              marginTop: 50,
              color: "#2e78b7"
            }}
          />
        </TouchableOpacity>
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
});*/