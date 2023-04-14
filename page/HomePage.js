import {
  Component,
  createRef
} from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  RefreshControl,
  Button,
  Alert,
  Image,
  SafeAreaView,
  ToastAndroid
} from 'react-native';
import {
  Feather,
  AntDesign,
  Entypo,
  MaterialCommunityIcons
} from '@expo/vector-icons';
import Paho from 'paho-mqtt';
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from '@react-native-async-storage/async-storage';
import CostumButton1 from '../components/buttonComponents/CostumButton1';
import { ScrollView } from 'react-native';
import CostumButton2 from '../components/buttonComponents/CostumButton2';
import CostumButton3 from '../components/buttonComponents/CostumButton3';
import * as Location from 'expo-location';
import { useRoute } from '@react-navigation/native';
import Weather from '../components/weather';
import { Switch } from 'react-native-paper';
import Grid from '../components/Grid';
import ProfilePic from '../assets/misc/samplepic.jpg';
import { ActivityIndicator } from 'react-native-paper';
import Loading from '../components/Loading';
import * as Notifications from 'expo-notifications';

class HomePage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      status: '',
      data: [],
      username_mqtt: '',
      password_mqtt: '',
      parsedData: [],
      refreshing: false,
      username: "",
      temp: '',
      errorbutton: {},
      isClicked: false,
      mqttUrl: "",
      longitude: null,
      weatherType: '',
      cityName: '',
      latitude: null,
      mqttPort: 9001,
      isSwitchOn: {},
      subscribeTopic: {},
      latestTopicMessage: {},
      mqttPath: '',
      profilPicPath: null,
      mqttId: 'id_' + parseInt(Math.random() * 100000),
      isLoadingVisible: false,
      notificationEnable:null,
      notifiedMonitorings:{},
    }

    this.client = null;
    this.removeAsyncData = this.removeAsyncData.bind(this);

  }



  onRefresh = () => {
    this.setState({ refreshing: true })
    this.loadData();
    setTimeout(() => {
      this.setState({ refreshing: false })
    }, 1000);
  }

  onRefreshOrigin = () => {
    this.setState({ refreshing: true }, () => {
      setTimeout(() => {
        this.setState({ refreshing: false });
      }, 1000);
    });
  }



  async componentDidMount() {
    await this.loadData();
    await this.runConnect();
    await this.checkNotificationPermissions();
  }


  async componentDidUpdate(prevProps, prevState) {
    if (prevState.latitude === null || this.state.latitude !== prevState.latitude) {
      this.getLocation();
    }
    

    if (this.props.route.params == "first") {
      this.loadData()
      this.runConnect()
      try {
        this.props.navigation.setParams('reloaded');
      } catch {
        return
      }
    }

    if (this.props.route.params == "delete") {
      try {
        this.clientDisconnect()
        this.props.navigation.setParams('reloaded')
      } catch {
        return
      }

    }

    if (this.state.status == "failed") {
      this.clientDisconnect()
    }

    if (this.props.route.params == "settings") {
      this.setState({ isLoadingVisible: true })
      try {
        this.loadData();
        this.runConnect();
        this.props.navigation.setParams('reloaded')
      } catch {
        return
      }
    }
  }


  refreshFromFirstPage = () => {
    if (this.props.route.params == 'first') {
      this.onRefresh();
    }
  }

  clientConnect = async () => {
    console.log('mencoba hubungkan')
    if (await this.state.mqttUrl != null || await this.state.mqttUrl != "" || await this.state.mqttUrl != "undefined") {
      setTimeout(() => {
        try {
          this.client = new Paho.Client(
            this.state.mqttUrl, this.state.mqttPort, this.state.mqttId
          )
          this.client.onMessageArrived = this.onMessageArrived;
          this.client.onConnectionLost = this.onConnectionLost;
          this.connect();
        } catch (error) {
          console.log(error)
        }
      }, 5000)
    }
  }

  clientDisconnect = async () => {
    try {
      this.client = null
      this.setState({ mqttUrl: '' });
      this.setState({ username_mqtt: '' });
      this.setState({ password_mqtt: '' });
      this.setState({ mqttPort: null });
      this.setState({ mqttPath: '' });
    } catch {
      return
    }

  }


  getLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.log('Permision Dennied')
      return;
    }  

    let location = await Location.getCurrentPositionAsync({});
    this.setState({ latitude: location.coords.latitude });
    this.setState({ longitude: location.coords.longitude });

    const apiKey = "74891133a9af1c283f0c9f3a9a6a18c7";
    fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${this.state.latitude}&lon=${this.state.longitude}&appid=${apiKey}&units=metric`
    ).then(response => response.json())
      .then(data => {
        try {
          this.setState({ temp: data.main.temp });
          this.setState({ weatherType: data.weather[0].main })
          this.setState({ cityName: data.name });
        } catch {
          return
        }
      })
      .catch(error => console.log(error))
  }


  onConnect = async () => {
    try {
      console.log('onConnect')
      let topicToSubs = await this.state.subscribeTopic
      for (let key in topicToSubs) {
        if (topicToSubs.hasOwnProperty(key)) {
          this.client.subscribe(topicToSubs[key])
        }
      }
      this.setState({ status: 'Connected' });
      setTimeout(() => {
        this.setState({ status: '' });
      }, 5000);
    } catch {
      return
    }
  }

  onFailure = (err) => {
    this.setState({ status: 'failed' })
    setTimeout(() => {
      this.setState({ status: '' });
    }, 3000)
  }

  onMessageArrived = async (message) => {
    try {
      let ltsmsg = { ...this.state.latestTopicMessage }
      if (message.payloadString) {
        ltsmsg[message.destinationName] = message.payloadString
        this.setState({ latestTopicMessage: ltsmsg })
        if(this.state.notifiedMonitorings[message.destinationName] == true){
          await Notifications.scheduleNotificationAsync({
            content: {
              title: `Message From : ${message.destinationName}`,
              body: message.payloadString,
              data: {data:message.payloadString},
              sound: 'default',
            },
            trigger: {
              seconds: 5,
              repeats:false,
            },
          });
        }
      }
    } catch {
      return
    }
  }

  onConnectionLost = (responseObject) => {
    if (responseObject.errorCode !== 0) {
      console.log('onConnectionLost:' + responseObject.errorMessage);
    }
  }

  connect = async () => {
    try {
      this.setState({ isLoadingVisible: true })
      this.setState({ status: 'IsFetching' },
        async () => {
          this.client.connect({
            onSuccess: this.onConnect,
            useSSL: false,
            userName: (await this.state.username_mqtt == '' ? 'exampleUsername' : await this.state.username_mqtt),
            password: (await this.state.password_mqtt == '' ? 'examplePassword' : await this.state.password_mqtt),
            timeout: 3,
            onFailure: this.onFailure,
          });
        }
      )

    } catch {
      // console.log('failed to connect, mqtt')
      this.setState({ status: 'Connection Failed!' })
    }
  }



  loadData = async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const promises = keys.map(key => AsyncStorage.getItem(key));
      const values = await Promise.all(promises);
      const data = keys.map((key, i) => ({ key, value: values[i] }));
      this.setState({ data });
      await this.loadConfigData();
      await this.loadSwitchData();
      await this.loadSubscribedTopic();
      await this.loadNotificationEnabled();
      await this.loadNotifiedMonitoring();
    }
    catch {
      return
    }
  };


  checkNotificationPermissions = async() => {
    if(await this.state.notificationEnable == "enabled"){
    let { status } =  await Notifications.requestPermissionsAsync()
    console.log(status)
    if(status != "granted") return
  }
}
 
  loadNotificationEnabled = async () => {
    let notifVal = []
    try {
      await this.state.data.map((data, index) => {
        if (data.key == "notification") {
          let parsedData = JSON.parse(data.value)
          notifVal.push(parsedData["notif"]);
        }
       
      })

      this.setState({notificationEnable:notifVal})
    } catch {
      return 
    }
  }

  
  loadNotifiedMonitoring = async () => { 
    let notifiedMonitoring = {}
    try {
      await this.state.data.map((data,index) => {
         if(data.key != "mqttConfig" && data.key != "username" && data.key != "profilPic" && data.key != "notification"){
           let ParsedValue = JSON.parse(data.value)
           if(ParsedValue.selectedBtn == 5){
             notifiedMonitoring[ParsedValue.topicName] = ParsedValue.notif
           }
           this.setState({notifiedMonitorings:notifiedMonitoring})
         }
      })
    } catch {
      return 
    }
  }

  loadConfigData = async () => {
    let value = [];
    try {
      await this.state.data.map((data, index) => {
        if (data.key == "mqttConfig") {
          let ParsedValue = JSON.parse(data.value);
          value.push(ParsedValue.mqttUrl, ParsedValue.mqttPort, ParsedValue.mqttTopicPath, ParsedValue.mqttUsername, ParsedValue.mqttPassword, ParsedValue.currentActive);
        }
      })
    } catch {
      return
    }

    this.setState({ mqttUrl: value[0] });
    this.setState({ mqttPort: parseInt(value[1]) });
    this.setState({ mqttPath: value[2] });
    this.setState({ username_mqtt: value[3] });
    this.setState({ password_mqtt: value[4] });
  }

  loadSubscribedTopic = async () => {
    let SubsVal = {};
    try {
      await this.state.data.map((data, index) => {
        if (data.key != "mqttConfig" && data.key != "username" && data.key != "profilPic" && data.key != "notification") {
          let parsedSubsData = JSON.parse(data.value)
          if(parsedSubsData.topicNameStatus != null){
            SubsVal[data.key] = parsedSubsData.topicNameStatus
          } else {
            SubsVal[data.key] = parsedSubsData.topicName
          }
        }
        this.setState({ subscribeTopic: SubsVal })
      })
    } catch {
      return
    }
  }

  loadSwitchData = async () => {
    let switchVal = {};
    try {
      await this.state.data.map((data, index) => {
        if (data.key != "mqttConfig" && data.key != "username" && data.key != "profilPic" && data.key != "notification") {
          let parsedData = JSON.parse(data.value);
          if (parsedData.selectedBtn == 4) {
            switchVal[data.key] = parsedData.currentActive
          }
        }
      })
      this.setState({ isSwitchOn: switchVal });
    } catch {
      return
    }
  }

  runConnect = () => {
    this.clientConnect();
    this.setState({ refreshing: true });
    setTimeout(() => {
      this.setState({ refreshing: false })
    }, 1000)
  }

  setData = async (key, value) => {
    try {
      await AsyncStorage.setItem(key, value, () => {
        this.loadData();
      });
    } catch {
      return
    }

  };


  clearAllData = async () => {
    await AsyncStorage.getAllKeys()
      .then(keys => AsyncStorage.multiRemove(keys))
      .then(() => alert('success'))
      .catch((error) => {
        console.log("wait")
      })
  }

  handleStatusConnect = () => {
    switch (this.state.status) {
      case "IsFetching":
        return "Connecting ...";
        break;
      case "Connected":
        return "Connected";
        break;
      case "failed":
        return "Failed Connect To Server";
    }
  }


  sendToTopic = async (topic, message1, message2, btnKey) => {
    const dataFromAsync = await AsyncStorage.getItem(btnKey)
    if (dataFromAsync !== null) {
      const parsedData = JSON.parse(dataFromAsync);
      parsedData.currentActive = !parsedData.currentActive;
      await AsyncStorage.setItem(btnKey, JSON.stringify(parsedData));
      if (await parsedData.currentActive == false) {
        let msg2 = new Paho.Message(await message2);
        msg2.destinationName = await topic;
        try {
          await this.client.send(msg2);
          this.setState({ errorbutton: btnKey });
        } catch {
          Alert.alert(
            'Destination Topic Destination Button Error',
            'Periksa Kembali Topic Destination!',
            [
              {
                text: 'OK',
                style: 'cancel',
              },
            ],
            { cancelable: false }
          );
        }
      } else {
        let msg1 = new Paho.Message(await message1);
        msg1.destinationName = await topic;
        try {
          await this.client.send(msg1);
        } catch {
          Alert.alert(
            'Destination Topic Destination Button Error',
            'Periksa Kembali Topic Destination!',
            [
              {
                text: 'OK',
                style: 'cancel',
              },
            ],
            { cancelable: false }
          );
        }
      }
      return parsedData.currentActive
    }
  }




  handleStatusBackgroundColor = () => {
    switch (this.state.status) {
      case "IsFetching":
        return "#239ffb";
        break;
      case "Connected":
        return "#4EB755";
        break;
      case "failed":
        return "#9E0F0F";
    }
  }



  handleSwitchToggle = async (index, value, message1, message2, topic) => {
    this.client.subscribe(topic)
    let dataFromAsync = await AsyncStorage.getItem(index);
    if (dataFromAsync !== null) {
      let parsedData = JSON.parse(dataFromAsync)
      parsedData.currentActive = value
      await AsyncStorage.setItem(index, JSON.stringify(parsedData))
    }

    if (await value == false) {
      let msg2 = new Paho.Message(await message2);
      msg2.destinationName = await topic;
      try {
        await this.client.send(msg2);
      } catch {
        await this.clientConnect();
      }
    } else {
      let msg1 = new Paho.Message(await message1);
      msg1.destinationName = await topic;
      try {
        await this.client.send(msg1);
      } catch {
        await this.clientConnect();
      }
    }

    let cloneObject = this.state.isSwitchOn
    cloneObject[index] = value
    this.setState({ isSwitchOn: cloneObject })
  }


  handleMiddlewareToFirstPage = () => {
    if (this.client == null || this.state.status == 'failed') {
      this.props.navigation.navigate('Settings', 'test')
    } else {
      this.props.navigation.navigate('FirstSetUp')
    }
  }

  handleIconGrid = (val) => {
    switch (val) {
      case 1:
        return "air-conditioner"
        break;
      case 2:
        return "bed"
        break;
      case 3:
        return "desk-lamp"
        break;
      case 4:
        return "outdoor-lamp"
        break;
      case 5:
        return "electron-framework"
        break;
      case 6:
        return "television"
        break;
      case 7:
        return "application-braces"
        break;
      case 8:
        return "battery-20"
        break;
      case 9:
        return "bell-alert"
        break;
      case 10:
        return "cable-data"
        break;
      case 11:
        return "camera-wireless"
        break;
      case 12:
        return "cast-connected"
        break;
      case 13:
        return "ceiling-fan"
        break;
      case 14:
        return "door"
        break;
      case 15:
        return "engine"
        break;
    }
  }


  removeAsyncData = async (val) => {
    try {
      await AsyncStorage.removeItem(val)
      this.onRefresh();
      Alert.alert(
        'Terhapus',
        'Berhasil Menghapus Button!',
        [
          {
            text: 'OK',
            style: 'cancel',
          },
        ],
        { cancelable: false }
      );
    } catch {
      return
    }
  }




  render() {
    //mapping value dari async
    let arrayDataValue = []
    let configData = []
    let mqttConfigs = []
    let notification
    let profilePic

    console.log(this.state.notifiedMonitorings)
    // console.log(this.state.data)


    if (this.state.data != null) {
      this.state.data.map((data, index) => {
        let ParsedValue = JSON.parse(data.value)
        if (data.key == "mqttConfig") {
          mqttConfigs.push(ParsedValue.mqttUrl, ParsedValue.mqttPort, ParsedValue.mqttTopicPath, ParsedValue.mqttUsername, ParsedValue.mqttPassword)
        } else if (data.key == "username") {
          configData.push(ParsedValue.name)
        } else if (data.key == "profilPic") {
          profilePic = ParsedValue.uri
        } else if (data.key == "notification"){
          notification = ParsedValue.notif
        }
        else {
          let key = data.key
          if (ParsedValue.selectedBtn == 5) {
            arrayDataValue.unshift([key, ParsedValue.selectedBtn, ParsedValue.monitoringTitle, ParsedValue.topicName]);
          } else {
            if(ParsedValue.topicNameStatus != null){
              arrayDataValue.unshift([key, ParsedValue.selectedBtn, ParsedValue.topicNameStatus, ParsedValue.templateName, ParsedValue.buttonTitle, ParsedValue.message1, ParsedValue.message2, ParsedValue.currentActive, ParsedValue.selectedIcon]);
            } else {
              arrayDataValue.unshift([key, ParsedValue.selectedBtn, ParsedValue.topicName, ParsedValue.templateName, ParsedValue.buttonTitle, ParsedValue.message1, ParsedValue.message2, ParsedValue.currentActive, ParsedValue.selectedIcon]);
            }
          }
        }
      })
    }


    return (
      <View style={{ flex: 1 }}>
        <ScrollView
          style={styles.container}
          refreshControl={
            <RefreshControl
              refreshing={this.state.refreshing}
              onRefresh={this.onRefresh}
            />
          }
          onScrollBeginDrag={() => this.setState({ refreshing: false })}
          onMomentumScrollBegin={() => this.setState({ refreshing: false })}
          onMomentumScrollEnd={() => this.setState({ refreshing: false })}
        >
          {arrayDataValue.length >= 1 ?
            <View style={{ flex: 1, paddingBottom: 40 }}>
              <View style={styles.greet}>
                <View style={styles.greetUserContainer}>
                  <Text style={styles.greetTitle}>
                    Welcome Back,
                  </Text>
                  <Text style={styles.greetUserName}>
                    {configData}
                  </Text>
                </View>
                <View style={styles.greetProfilePic}>
                  <View style={styles.profilePicInner}>
                    <Image source={{ uri: profilePic }} style={styles.profilePicture}>
                    </Image>
                  </View>
                </View>
              </View>
              <Weather temp={this.state.temp} weatherType={this.state.weatherType} cityName={this.state.cityName}>
              </Weather>
              <View style={styles.buttonGrid}>
                {arrayDataValue.map((data, index) => {
                  return (
                    <View key={index}>
                      {data[1] == 1 &&
                        <Grid remove={() => this.removeAsyncData(data[0])} key={index}>
                           <View style={styles.btn3Container}>
                            <View style={styles.switchInnerBottom}>
                              {this.state.latestTopicMessage[data[2]] &&
                                <View style={styles.latestTopicContainer}>
                                  <MaterialCommunityIcons name="message-badge" size={18} color="#656d77" />
                                  <Text style={styles.latestTopicMsg}>
                                    {this.state.latestTopicMessage[data[2]]}
                                  </Text>
                                </View>
                              }
                              <Text style={styles.switchInnerTitle}>
                                {data[4]}
                              </Text>
                              <Text numberOfLines={2} style={styles.switchInnerCondition}>
                                {data[2]}
                              </Text>
                              <Text>
                              </Text>
                            </View>
                            <View style={styles.btn3button}>
                              <CostumButton1 btnTitle={data[4]} icon={this.handleIconGrid(data[8])} key={index} onPress={() => this.sendToTopic(data[2], data[5], data[6], data[0])} >
                              </CostumButton1>
                            </View>
                          </View>


                        </Grid>
                      }
                      {data[1] == 2 &&
                        <Grid remove={() => this.removeAsyncData(data[0])} key={index}>
                         <View style={styles.btn3Container}>
                            <View style={styles.switchInnerBottom}>
                              {this.state.latestTopicMessage[data[2]] &&
                                <View style={styles.latestTopicContainer}>
                                  <MaterialCommunityIcons name="message-badge" size={18} color="#656d77" />
                                  <Text style={styles.latestTopicMsg}>
                                    {this.state.latestTopicMessage[data[2]]}
                                  </Text>
                                </View>
                              }
                              <Text style={styles.switchInnerTitle}>
                                {data[4]}
                              </Text>
                              <Text numberOfLines={2} style={styles.switchInnerCondition}>
                                {data[2]}
                              </Text>
                              <Text>
                              </Text>
                            </View>
                            <View style={styles.btn3button}>
                              <CostumButton2 btnTitle={data[4]} icon={this.handleIconGrid(data[8])} key={index} onPress={() => this.sendToTopic(data[2], data[5], data[6], data[0])} >
                              </CostumButton2>
                            </View>
                          </View>

                        </Grid>

                      }
                      {data[1] == 3 &&
                        <Grid remove={() => this.removeAsyncData(data[0])} key={index}>
                          <View style={styles.btn3Container}>
                            {/* <View style={styles.switchInnerTop}>
                                <View style={styles.switchIcon}>
                                  <MaterialCommunityIcons name={this.handleIconGrid(data[8])} size={30} color="#239ffb"></MaterialCommunityIcons>
                                </View>
                                <View style={styles.switchCurrentCondition}>
                                  <Text style={styles.textCondition}>{this.state.isSwitchOn[data[0]] == false ? "Off" : "On"}</Text>
                                </View>
                              </View> */}
                            <View style={styles.switchInnerBottom}>
                              {this.state.latestTopicMessage[data[2]] &&
                                <View style={styles.latestTopicContainer}>
                                  <MaterialCommunityIcons name="message-badge" size={18} color="#656d77" />
                                  <Text style={styles.latestTopicMsg}>
                                    {this.state.latestTopicMessage[data[2]]}
                                  </Text>
                                </View>
                              }
                              <Text style={styles.switchInnerTitle}>
                                {data[4]}
                              </Text>
                              <Text numberOfLines={2} style={styles.switchInnerCondition}>
                                {data[2]}
                              </Text>
                              <Text>
                              </Text>
                            </View>
                            <View style={styles.btn3button}>
                              <CostumButton3 icon={this.handleIconGrid(data[8])} key={index} onPress={() => this.sendToTopic(data[2], data[5], data[6], data[0])} >
                              </CostumButton3>
                            </View>
                          </View>

                        </Grid>
                      }
                      {
                        data[1] == 4 &&
                        <Grid remove={() => this.removeAsyncData(data[0])}>
                          <View style={styles.switchContainer}>
                            <View style={styles.switchInnerTop}>
                              <View style={styles.switchIcon}>
                                <MaterialCommunityIcons name={this.handleIconGrid(data[8])} size={30} color="#239ffb"></MaterialCommunityIcons>
                              </View>
                              <View style={styles.switchCurrentCondition}>
                                <Text style={styles.textCondition}>{this.state.isSwitchOn[data[0]] == false ? "Off" : "On"}</Text>
                              </View>
                            </View>
                            <View style={styles.switchInnerBottom}>
                              {this.state.latestTopicMessage[data[2]] &&
                                <View style={styles.latestTopicContainer}>
                                  {/* <MaterialCommunityIcons name="message-badge" size={18} color="#656d77" /> */}
                                  <Text style={styles.latestTopicMsg}>
                                    {this.state.latestTopicMessage[data[2]]}
                                  </Text>
                                </View>
                              }
                              <Text style={styles.switchInnerTitle}>
                                {data[4]}
                              </Text>
                              <TouchableOpacity onPress={() => ToastAndroid.show(data[2], ToastAndroid.SHORT)}>
                                <Text numberOfLines={2} style={styles.switchInnerCondition}>
                                  {data[2]}
                                </Text>
                              </TouchableOpacity>
                              <Switch
                                key={index}
                                color="#239ffb"
                                style={styles.switch}
                                value={this.state.isSwitchOn[data[0]]}
                                onValueChange={(value) => this.handleSwitchToggle(data[0], value, data[5], data[6], data[2])}
                              />
                            </View>
                          </View>
                        </Grid>

                      }
                      {
                        data[1] == 5 &&
                        <Grid remove={() => this.removeAsyncData(data[0])}>
                          <View style={[styles.switchInnerBottom,{flex:1}]}>
                            <Text style={styles.switchInnerTitle}>
                              {data[2]}
                            </Text>
                            <TouchableOpacity onPress={() => ToastAndroid.show(data[3], ToastAndroid.SHORT)}>
                              <Text numberOfLines={2} style={styles.switchInnerCondition}>
                                {data[3]}
                              </Text>
                            </TouchableOpacity>
                          </View>
                          {this.state.latestTopicMessage[data[3]] &&
                              <View style={[styles.latestTopicContainer,{marginTop:2,flex:1,borderTopWidth:1,borderColor:'#ddd'}]}>
                                <MaterialCommunityIcons name="message-badge" size={18} color="#656d77" />
                                <Text style={styles.latestTopicMsg}>
                                  {this.state.latestTopicMessage[data[3]]}
                                </Text>
                              </View>
                            }
                        </Grid>

                      }
                    </View>
                  )
                })}
              </View>
            </View>
            :
            <View style={styles.welcomes}>
              <Loading loading={this.state.status === 'IsFetching' ? true : false} icon={this.state.status} titleLoad={this.handleStatusConnect()} bg={this.handleStatusBackgroundColor()} visible={this.state.isLoadingVisible}></Loading>
              <Text style={styles.title}></Text>
              <View style={styles.boxNull}>
                <AntDesign name="inbox" size={100} color="#8C8C8E" />
                <Text style={styles.boxNullDesc}>No Device Yet</Text>
                <Text style={styles.deviceNull}>Tidak Ada Device Yang Terhubung</Text>
                <TouchableOpacity onPress={this.handleMiddlewareToFirstPage}>
                  <LinearGradient
                    colors={["#2380bf", "#239ffb", "#55cfdb"]}
                    style={styles.btnDevice}
                  >
                    <AntDesign name="plus" size={20} color="white" />
                    <Text style={styles.buttonText}>Add New Devices</Text>
                  </LinearGradient>
                </TouchableOpacity>
                <TouchableOpacity style={styles.btnDevelop}>
                  <AntDesign name='setting' size={20} color="white"></AntDesign>
                  <Text style={styles.btnDeviceTitle}>Developer Mode</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={this.runConnect} style={styles.btnDevelop}>
                  <AntDesign name='setting' size={20} color="white"></AntDesign>
                  <Text style={styles.btnDeviceTitle}>Run</Text>
                </TouchableOpacity>
              </View>
            </View>
          }

        </ScrollView>
        {
          this.client != null ?
            <TouchableOpacity onPress={() => this.props.navigation.navigate('FirstSetUp')} style={[styles.addNewBtn, { display: this.client == null ? 'none' : 'flex' }]}>
              <LinearGradient colors={["#2380bf", "#239ffb", "#55cfdb"]} style={styles.addNewBtnGradient}>
                <Entypo name="plus" size={24} color="white" />
              </LinearGradient>
            </TouchableOpacity> :
            <LinearGradient colors={["#2380bf", "#239ffb", "#55cfdb"]} style={styles.loadConnection}>
              <ActivityIndicator size="small" color="white" style={styles.addNewBtnGradient} />
            </LinearGradient>

        }

      </View>


    )


  }
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eee',
    paddingTop: 20,
    paddingBottom: 100,
    height: '100%',
    paddingHorizontal: 20,
  },
  title: {
    fontFamily: 'Jakarta',
  }
  ,
  boxNull: {
    flex: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxNullDesc: {
    fontFamily: 'Jakarta',
    fontSize: 22,
    fontWeight: '700',
    color: '#1C1C30',
  },
  btnDevice: {
    backgroundColor: '#2380bf',
    padding: 10,
    margin: 10,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  btnDeviceTitle: {
    color: 'white',
    marginLeft: 4,
  },
  deviceNull: {
    color: '#8c8c8e',
    fontFamily: 'Jakarta',
  },
  btnDevelop: {
    backgroundColor: '#133247',
    padding: 10,
    marginTop: 5,
    marginBottom: 10,
    borderRadius: 10,
    flexDirection: 'row'
  },
  buttonText: {
    color: 'white',
    fontFamily: 'Jakarta',
    marginLeft: 5,
  },
  addNewBtn: {
    position: 'absolute',
    bottom: 20,
    right: 20,
  },
  loadConnection: {
    position: 'absolute',
    bottom: 20,
    borderRadius: 15,
    right: 20,
  },
  addNewBtnTitle: {
    fontFamily: 'Jakarta'
  },
  greet: {
    marginVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  greetTitle: {
    fontFamily: 'Inter',
    fontWeight: '400',
    fontSize: 18,
    color: "#283142",
  },
  greetUserName: {
    fontFamily: 'InterSemi',
    color: "#283142",
    fontSize: 24
  },
  addNewBtnGradient: {
    borderRadius: 15,
    padding: 10,
  },
  buttonGrid: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 15,
    paddingBottom: 50,
  },
  switch: {
    position: 'absolute',
    bottom: 5,
    right: 5,
  },
  switchContainer: {
    flex: 1,
  },
  switchInnerBottom: {
    padding: 5,
  },
  switchInnerTop: {
    flex: 2.5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 5,
  },
  switchInnerTitle: {
    fontFamily: 'InterSemi',
  },
  switchCurrentCondition: {
    padding: 8,
  },
  switchInnerCondition: {
    fontFamily: 'Inter',
    color: '#239ffb',
    width: 100,
    fontSize: 12,
  },
  profilePicInner: {
    width: 45,
    height: 45,
    overflow: 'hidden',
    borderRadius: 15,
  },
  profilePicture: {
    width: 45,
    height: 45,
  },
  textCondition: {
    fontFamily: 'InterSemi',
    color: '#27323A',
    zIndex: 1,
  },
  latestTopicMsg: {
    fontFamily: 'Inter',
  },
  latestTopicContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  btn3Container: {
    flex: 1,
  },
  btn3button: {
    position: 'absolute',
    bottom: 10,
    right: 10
  }
});


export default HomePage;