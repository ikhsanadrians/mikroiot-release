import { Component } from "react";
import { StyleSheet, Text, View, Button, TouchableOpacity, Modal, Image, Alert } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCommunityIcons, FontAwesome, AntDesign, Ionicons, Entypo, Feather } from '@expo/vector-icons';
import { LinearGradient } from "expo-linear-gradient";
import HomePage from "./HomePage";
import { TextInput, Dialog, Switch} from "react-native-paper";
import ProfilePic from '../assets/misc/samplepic.jpg';
import * as ImagePicker from 'expo-image-picker';
import * as Notifications from 'expo-notifications';
class SettingPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      inputan: "",
      hasilAsync: "",
      isDialogVisible: false,
      isDialogProfileVisible: false,
      modalMqtt: false,
      modalProfileEdit: false,
      mqttUrl: null,
      mqttPort: null,
      mqttTopicPath: null,
      mqttUsername: null,
      mqttPassword: null,
      changedConfig: true,
      data: [],
      deleteConfirm: false,
      currentData: {},
      profileImage: null,
      username: null,
      modalMqttCurrent: false,
      modalSetUpNotif: false,
      switchNotif:false,
    };
  }

  componentDidMount = () => {
    this.getLatestDataProfilePic()
    this.getLatestProfileUsername()
    this.getLatestMqttConfig()
  }


  getLatestMqttConfig = async () => {
    try {
      let data = await AsyncStorage.getItem('mqttConfig');
      if (data) {
        let ParsedData = JSON.parse(data)
        this.setState({ mqttUrl: ParsedData.mqttUrl })
        this.setState({ mqttPort: parseInt(ParsedData.mqttPort) })
        this.setState({ mqttTopicPath: ParsedData.mqttTopicPath })
        this.setState({ mqttUsername: ParsedData.mqttUsername })
        this.setState({ mqttPassword: ParsedData.mqttPassword })
      }
    } catch {
      return
    }
  }


  clearAllData = () => {
    AsyncStorage.getAllKeys()
      .then(keys => AsyncStorage.multiRemove(keys))
      .then(this.props.navigation.navigate('Homepage', 'delete'))
    this.setState({ profileImage: null })
    this.setState({mqttUrl:null})
    this.setState({mqttPort:null})
    this.setState({mqttTopicPath:null})
    this.setState({mqttUsername:null})
    this.setState({mqttPassword:null})
    this.setState({ deleteConfirm: false });
  }

  confirmDelete = () => {
    this.setState({ deleteConfirm: true })
  }

  pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Permission to access media library is required!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync();

    if (!result.canceled) {
      this.setState({ profileImage: result.assets[0].uri });
      let uriImage = {
        uri: result.assets[0].uri
      }
      await AsyncStorage.setItem('profilPic', JSON.stringify(uriImage));
    }
  };


  getLatestProfileUsername = async () => {
    try {
      let data = await AsyncStorage.getItem('username')
      let parsedData = JSON.parse(data)
      if (data) this.setState({ username: parsedData.name })
    } catch {
      return
    }
  }



  getLatestDataProfilePic = async () => {
    try {
      let data = await AsyncStorage.getItem('profilPic')
      let parsedData = JSON.parse(data)
      if (data) this.setState({ profileImage: parsedData.uri })
    } catch {
      return
    }

  }


  getDataFromUsernameInput = async (inputUsername) => {
    let strInpt = inputUsername.toString()
    let inputToUsername = {
      name: strInpt
    }

    try {
      await AsyncStorage.setItem('username', JSON.stringify(inputToUsername))
      await this.setState({ modalProfileEdit: false })
      this.props.navigation.navigate('Homepage','settings');
    } catch {
      return
    }


  }



  getDataFromMqttInput = async () => {
    if (this.state.mqttUrl == null || this.state.mqttPort == null || this.state.mqttTopicPath == null || this.state.mqttTopicPath == null || this.state.mqttUsername == null || this.state.mqttPassword == null) {
      Alert.alert(
        'Input Tidak Boleh Kosong',
        'Mohon Isi Input Yang Kosong',
        [
          {
            text: 'OK',
            style: 'cancel',
          },
        ],
        { cancelable: false }
      );
    } else {
      const strUrl = await this.state.mqttUrl.toString();
      const strPort = await this.state.mqttPort.toString();
      const strTopicPath = await this.state.mqttTopicPath.toString();
      const strUsername = await this.state.mqttUsername.toString();
      const strPassword = await this.state.mqttPassword.toString();

      let inputToUrlMqtt = {
        mqttUrl: strUrl,
        mqttPort: strPort,
        mqttTopicPath: strTopicPath,
        mqttUsername: strUsername,
        mqttPassword: strPassword
      }

      let parsed = JSON.stringify(inputToUrlMqtt);

      try {
        await AsyncStorage.setItem('mqttConfig', parsed)
      } catch {
        console.log('error')
      }

      await this.setState({ modalMqtt: false })
      this.props.navigation.navigate('Homepage', 'settings');
    }
  } 

  handleEnableNotification = async(val) => {
     this.setState({switchNotif:val})
     if(val){
      try {
        let parsed = JSON.stringify({
          notif:"enabled",
        })
        await AsyncStorage.setItem('notification',parsed)
       } catch {
         return 
       }
     } else {
      try {
        let parsed = JSON.stringify({
          notif:"disabled",
        })
        await AsyncStorage.setItem('notification',parsed)
       } catch {
         return 
       }
     }
   
     this.props.navigation.navigate('Homepage','settings');
     this.setState({modalSetUpNotif:false})
  }



  render() {
    // console.log(`params setting : ${this.props.route.params}`);
    console.log(this.state.profileImage)
    console.log(this.state.username)

    return (
      <View style={styles.container}>
        <Dialog style={styles.dialogConfirmDelete} visible={this.state.deleteConfirm} onDismiss={() => this.setState({ deleteConfirm: false })}>
          <Text style={styles.dialogConfirmMsg}>Apakah Anda Ingin Menghapus semua data?</Text>
          <Dialog.Actions style={styles.dialogAction}>
            <TouchableOpacity onPress={() => this.setState({ deleteConfirm: false })}><Text style={styles.backText}>Back</Text></TouchableOpacity>
            <TouchableOpacity><Text style={styles.confirmText} onPress={this.clearAllData}>Confirm</Text></TouchableOpacity>
          </Dialog.Actions>
        </Dialog>

        <Modal visible={this.state.modalMqtt}>
          <View style={styles.modalMqtt}>
            <Dialog style={{ zIndex: 10 }} visible={this.state.modalMqttCurrent} onDismiss={() => this.setState({ modalMqttCurrent: false })}>
              <View style={styles.innerCurrentMQTT}>
                {
                  this.state.mqttUrl == null ? 
                  <View style={{ alignContent:'center' }}>
                    <Text>Not Connect To Any Broker</Text>
                  </View>
                  :
                  <View>
                    <Text style={{ fontFamily:"InterSemi" }}>Current Mqtt Connection</Text>
                    <Text style={{ fontFamily:"Inter" }}>URL : {this.state.mqttUrl}</Text>
                    <Text style={{ fontFamily:"Inter" }}>Port : {this.state.mqttPort}</Text>
                    <Text style={{ fontFamily:"Inter" }}>Username : {this.state.mqttUsername}</Text>
                    <Text style={{ fontFamily:"Inter" }}>Password : {this.state.mqttPassword}</Text>
                  </View>
                }
                
              </View>
             
              <Dialog.Actions>
                <TouchableOpacity onPress={() => this.setState({ modalMqttCurrent: false })}>
                  <Text style={{ color:"#239ffb" }}>OK</Text>
                </TouchableOpacity>
              </Dialog.Actions>
            </Dialog>
            <View style={styles.modalMqttHeader}>
              <View style={styles.leftMqttHeader}>
                <TouchableOpacity onPress={() => this.setState({ modalMqtt: false })}>
                  <MaterialCommunityIcons name="arrow-left" size={25}></MaterialCommunityIcons>
                </TouchableOpacity>
                <Text style={styles.modalMqttTitle}>Set Up MQTT</Text>
              </View>
              <View style={styles.rightMqttHeader}>
                <TouchableOpacity onPress={() => this.setState({ modalMqttCurrent: true })}>
                  <MaterialCommunityIcons name="lan-connect" size={20} color={this.state.mqttUrl == null ? "red" : "green"}></MaterialCommunityIcons>
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.modalMqttContainer}>
              <Text style={styles.modalConfigTitle}>
                MQTT CONFIGURATION
              </Text>
              <TextInput
                style={{ marginVertical: 5 }}
                mode="outlined"
                outlineColor="#ddd"
                activeOutlineColor="#239ffb"
                onChangeText={(paramUrl) => this.setState({ mqttUrl: paramUrl })} label="Your Mqtt Url">
              </TextInput>
              <TextInput
                style={{ marginVertical: 5 }}
                mode="outlined"
                outlineColor="#ddd"
                activeOutlineColor="#239ffb"
                onChangeText={(paramPort) => this.setState({ mqttPort: paramPort })} label="Your Mqtt Port">
              </TextInput>
              <TextInput
                style={{ marginVertical: 5 }}
                mode="outlined"
                outlineColor="#ddd"
                activeOutlineColor="#239ffb"
                onChangeText={(paramPath) => this.setState({ mqttTopicPath: paramPath })} label="Your Topic Path">
              </TextInput>
              <TextInput
                style={{ marginVertical: 5 }}
                mode="outlined"
                outlineColor="#ddd"
                activeOutlineColor="#239ffb"
                onChangeText={(paramUsername) => this.setState({ mqttUsername: paramUsername })} label="Your Mqtt Username">
              </TextInput>
              <TextInput
                style={{ marginVertical: 5 }}
                mode="outlined"
                outlineColor="#ddd"
                activeOutlineColor="#239ffb"
                secureTextEntry={true} onChangeText={(paramPassword) => this.setState({ mqttPassword: paramPassword })} label="Your Mqtt Password">
              </TextInput>
              <TouchableOpacity onPress={this.getDataFromMqttInput}>
                <LinearGradient colors={["#2380bf", "#239ffb", "#55cfdb"]} style={styles.modalMqttUpload}>
                  <Entypo name="network" size={24} color="white" />
                  <Text style={styles.buttonSetUp}>Set Up</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
        <Modal visible={this.state.modalProfileEdit}>
          <View style={styles.modalMqtt}>
            <View style={styles.modalMqttHeader}>
              <TouchableOpacity onPress={() => this.setState({ modalProfileEdit: false })}>
                <MaterialCommunityIcons name="arrow-left" size={25}></MaterialCommunityIcons>
              </TouchableOpacity>
              <Text style={styles.modalMqttTitle}>Set Up Your Profile</Text>

            </View>
            <View style={styles.modalMqttContainer}>
              <Text style={styles.modalProfileTitle}>
                USER CONFIGURATION
              </Text>
              <View style={styles.userPictureEdit}>
                <View style={styles.userPictureInner}>
                  <Image source={{ uri: this.state.profileImage }} style={styles.profilepic}></Image>
                </View>
                <TouchableOpacity style={styles.edit} onPress={this.pickImage}>
                  <Entypo name="pencil" size={17} color={'white'}></Entypo>
                </TouchableOpacity>
              </View>
              <View style={styles.userInputName}>
                <Text style={styles.currentUsername}>{this.state.username}</Text>
                <TextInput
                  mode="outlined"
                  outlineColor="#ddd"
                  activeOutlineColor="#239ffb"
                  onChangeText={(paramUsername) => this.setState({ mqttUsername: paramUsername })} label={"Your Username"} style={styles.modalMqttInputUrl}>
                </TextInput>
                <TouchableOpacity onPress={() => this.getDataFromUsernameInput(this.state.mqttUsername)}>
                  <LinearGradient colors={["#2380bf", "#239ffb", "#55cfdb"]} style={styles.modalMqttUpload}>
                    <Entypo name="save" size={24} color="white" />
                    <Text style={styles.buttonSetUp}>Save</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>

            </View>
          </View>

        </Modal>
        <Modal visible={this.state.modalSetUpNotif}>
          <View style={styles.modalMqtt}>
            <View style={styles.modalMqttHeader}>
              <TouchableOpacity onPress={() => this.setState({ modalSetUpNotif: false })}>
                <MaterialCommunityIcons name="arrow-left" size={25}></MaterialCommunityIcons>
              </TouchableOpacity>
              <Text style={styles.modalMqttTitle}>Set Up Notification</Text>

            </View>
            <View style={styles.modalMqttContainer}>
                <View style={styles.notifOption}>
                  <Switch value={this.state.switchNotif} onValueChange={(val)=>this.handleEnableNotification(val)}></Switch>
                  <Text style={styles.notifDesc}>
                   Enable notifications when a message from mqtt arrives
                  </Text>
                </View>
                
            </View>
          </View>

        </Modal>
        <View style={styles.title}>
          <Feather name="settings" size={20} color="black" />
          <Text style={styles.setingTitle}>
            Settings
          </Text>
        </View>
        <View style={styles.menuList}>
          <TouchableOpacity onPress={() => this.setState({ modalProfileEdit: true })} style={styles.mqttConnect}>
            <View style={styles.mqttConnectInner}>
              <Entypo name="user" size={24} color="#787E87" />
              <Text style={styles.mqttTitle}>Change Profile User</Text>
            </View>
            <AntDesign name="right" size={24} color="#787E87" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => this.setState({ modalMqtt: true })} style={styles.mqttConnect}>
            <View style={styles.mqttConnectInner}>
              <MaterialCommunityIcons name="connection" size={24} color="#787E87" />
              <Text style={styles.mqttTitle}>Set Up Your MQTT URL</Text>
            </View>
            <AntDesign name="right" size={24} color="#787E87" />
          </TouchableOpacity>
          <TouchableOpacity onPress={()=>this.setState({ modalSetUpNotif: true})} style={styles.mqttConnect}>
            <View style={styles.mqttConnectInner}>
              <Ionicons name="ios-notifications" size={24} color="#787E87" />
              <Text style={styles.mqttTitle}>Set Up Notifications</Text>
            </View>
            <AntDesign name="right" size={24} color="#787E87" />
          </TouchableOpacity>
          <View style={styles.mqttConnect}>
            <View style={styles.mqttConnectInner}>
              <Entypo name="help-with-circle" size={24} color="#787E87" />
              <Text style={styles.mqttTitle}>Help</Text>
            </View>
            <AntDesign name="right" size={24} color="#787E87" />
          </View>
          <TouchableOpacity onPress={this.confirmDelete} style={styles.mqttConnect}>
            <View style={styles.mqttConnectInner}>
              <Entypo name="trash" size={24} color="#787E87" />
              <Text style={styles.mqttTitle}>Clear All Data</Text>
            </View>
            <AntDesign name="right" size={24} color="#787E87" />
          </TouchableOpacity>

        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#eee",
  },
  title: {
    width: '100%',
    paddingTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 15,

  },
  setingTitle: {
    fontFamily: 'InterSemi',
    fontSize: 22,
    marginLeft: 4,
    fontWeight: '600',
  },
  menuList: {
    paddingHorizontal: 10,
    marginTop: 20,
    zIndex: -2,
  },
  mqttConnect: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    marginVertical: 2,
    borderRadius: 7,
    backgroundColor: 'white',
    paddingHorizontal: 10,
    justifyContent: 'space-between',
    width: '100%',

  },
  mqttTitle: {
    fontFamily: 'Jakarta',
    marginLeft: 5,
    color: '#787E87',
  },
  mqttConnectInner: {
    flexDirection: 'row',
  },
  modalMqtt: {
    backgroundColor: '#eee',
    flex: 1,
    padding: 20,
  },
  modalMqttTitle: {
    fontFamily: 'InterSemi',
    marginLeft: 10,
  },
  modalMqttHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 9,
  },
  modalMqttContainer: {
    flex: 1,
    paddingTop: 20,
    zIndex: -1,
  },
  modalMqttInputUrl: {
    width: "100%",
    fontFamily: "Jakarta",
    borderRadius: 10,
    marginBottom: 10,
  },
  mqttUrl: {
    fontFamily: 'Inter',
  },
  modalMqttUpload: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    justifyContent: 'center',
    borderRadius: 10,
    marginTop: 10,
  },
  buttonSetUp: {
    color: 'white',
    marginLeft: 5,
    fontWeight: '700'
  },
  modalConfigTitle: {
    marginVertical: 10,
    color: '#787E87',
    fontFamily: 'Inter'
  },
  userPictureEdit: {
    flex: 1,
    height: 150,
  },
  userPictureInner: {
    alignSelf: "center",
    overflow: "hidden",
    height: 90,
    borderWidth: 1.5,
    borderColor: '#ccc',
    borderRadius: 20,
    width: 90,
  },
  userInputName: {
    flex: 4,
    height: 3,
  },
  modalProfileTitle: {
    flex: .4,
  },
  profilepic: {
    height: 90,
    width: 90,
  },
  edit: {
    position: 'absolute',
    alignSelf: 'center',
    bottom: 35,
    padding: 5,
    backgroundColor: '#239ffb',
    borderRadius: 10,
    right: 120,
  },
  dialogConfirmDelete: {
    zIndex: 10,
    padding: 10,
    backgroundColor: 'white'
  },
  dialogConfirmMsg: {
    fontFamily: 'Inter'
  },
  dialogAction: {
    padding: 15,
    flexDirection: 'row',
    gap: 10,
  },
  backText: {
    fontFamily: 'InterSemi'
  },
  confirmText: {
    fontFamily: 'InterSemi',
    color: '#239ffb'
  },
  currentUsername: {
    fontFamily: 'InterSemi',
    fontSize: 20,
    margin: 10,
    textAlign: 'center'
  },
  leftMqttHeader: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  innerCurrentMQTT: {
    padding:10,
  },
  notifDesc: {
    fontFamily: 'Inter',
    width: '90%'
  },
  notifOption:{
    flex:1,
    gap:2,
    paddingTop:40,
    paddingRight:20,
    flexDirection:'row',
    alignItems:'flex-start'
  },
  // notifSwitch:{
  //  alignSelf:'flex-start'
  // }
});

export default SettingPage;
