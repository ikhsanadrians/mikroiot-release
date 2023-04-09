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
    SafeAreaView
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
        mqttPath: '',
        profilPicPath : null,
        mqttId: 'id_' + parseInt(Math.random() * 100000),
        isLoadingVisible: false,
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
  
    }
  
  
    componentDidUpdate(prevProps, prevState) {
      if (prevState.latitude === null || this.state.latitude !== prevState.latitude) {
        this.getLocation();
      }
  
      if (this.props.route.params == "first") {
        this.loadData()
        try {
          this.props.navigation.setParams('reloaded');
        } catch {
          return
        }
      }

      if(this.props.route.params == "delete"){
        try {
          this.clientDisconnect()
          this.props.navigation.setParams('reloaded')
        } catch {
          return 
        }
         
      }

      if(this.state.status == "failed"){
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
          setTimeout(()=>{
            try{
              this.client = new Paho.Client(
                this.state.mqttUrl, this.state.mqttPort, this.state.mqttId
              )
              this.client.onMessageArrived = this.onMessageArrived;
              this.client.onConnectionLost = this.onConnectionLost;
              this.connect();
            } catch(error) {
              console.log(error)
            }
          },5000)
      }
    }

    clientDisconnect = async()=>{
      try{
        this.client = null
        this.setState({mqttUrl:''});
        this.setState({username_mqtt:''});
        this.setState({password_mqtt:''});
        this.setState({mqttPort:null});
        this.setState({mqttPath:''});
      } catch {
        return 
      }
      
    }
  
  
    getLocation = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        // setErrorMsg('Permission to Access Location denied');
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
        // this.client.subscribe('Cikunir/lt2/suhu2/sharp')
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
  
    onMessageArrived = (message) => {
      console.log(message.payloadString);
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
      }
      catch {
        return
      }
    };
  
  
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
        await this.state.data.map((data,index) => {
          if (data.key != "mqttConfig" && data.key != "username" && data.key != "profilPic") {
            let parsedSubsData = JSON.parse(data.value)
            SubsVal[data.key] = parsedSubsData.topicName
          }
          this.setState({subscribeTopic:SubsVal})
        })
      } catch {
        return 
      }
    }

    loadSwitchData = async () => {
      let switchVal = {};
      try {
        await this.state.data.map((data, index) => {
          if (data.key != "mqttConfig" && data.key != "username" && data.key != "profilPic") {
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
            this.setState({errorbutton:btnKey});
          } catch {
            Alert.alert(
              'Destination Message Error',
              'Periksa Kembali Destination Message!',
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
              'Destination Message Error',
              'Periksa Kembali Destination Message!',
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
      if(this.client == null || this.state.status == 'failed'){
        this.props.navigation.navigate('Settings','test')
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
      let profilePic
  
      // console.log(this.state.mqttUrl)
      // console.log(this.props.route.params)
      // console.log(this.state.status)
      // console.log(this.state.data)
      console.log(this.state.subscribeTopic)

      if (this.state.data != null) {
        this.state.data.map((data, index) => {
          let ParsedValue = JSON.parse(data.value)
          if (data.key == "mqttConfig") {
            mqttConfigs.push(ParsedValue.mqttUrl, ParsedValue.mqttPort, ParsedValue.mqttTopicPath, ParsedValue.mqttUsername, ParsedValue.mqttPassword)
          } else if (data.key == "username") {
            configData.push(ParsedValue.name)
          } else if (data.key == "profilPic"){
             profilePic = ParsedValue.uri
          }
           else {
            let key = data.key
            arrayDataValue.push([key, ParsedValue.selectedBtn, ParsedValue.topicName, ParsedValue.templateName, ParsedValue.buttonTitle, ParsedValue.message1, ParsedValue.message2, ParsedValue.currentActive, ParsedValue.selectedIcon]);
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
              <View style={{ flex: 1 }}>
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
                      <Image source={{uri:profilePic}} style={styles.profilePicture}>
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
                                <Text style={styles.switchInnerTitle}>
                                  {data[4]}
                                </Text>
                                <Text numberOfLines={2} style={styles.switchInnerCondition}>
                                  {data[2]}
                                </Text>
                                <Text>
                                </Text>
                                <View style={styles.switch}>
                                  <CostumButton1 loading={this.state.status == 'IsFetching' ? true : false} btnTitle={this.state.status == 'IsFetching' ? '' : data[4]} key={index} onPress={() => this.sendToTopic(data[2], data[5], data[6], data[0])}>
                                  </CostumButton1>
                                </View>
  
                              </View>
                            </View>
  
                          </Grid>
                        }
                        {data[1] == 2 &&
                          <Grid remove={() => this.removeAsyncData(data[0])} key={index}>
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
                                <Text style={styles.switchInnerTitle}>
                                  {data[4]}
                                </Text>
                                <Text numberOfLines={2} style={styles.switchInnerCondition}>
                                  {data[2]}
                                </Text>
                                <Text>
                                </Text>
                                <View style={styles.switch}>
                                  <CostumButton2 w={90} h={45} btnTitle={data[4]} key={index} onPress={() => this.sendToTopic(data[2], data[5], data[6], data[0])}>
                                  </CostumButton2>
                                </View>
  
                              </View>
                            </View>
                          </Grid>
  
                        }
                        {data[1] == 3 &&
                          <Grid remove={() => this.removeAsyncData(data[0])} key={index}>
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
                                <Text style={styles.switchInnerTitle}>
                                  {data[4]}
                                </Text>
                                <Text numberOfLines={2} style={styles.switchInnerCondition}>
                                  {data[2]}
                                </Text>
                                <Text>
                                </Text>
                                <View style={styles.switch}>
                                  <CostumButton3 icon={this.handleIconGrid(data[8])} key={index} onPress={() => this.sendToTopic(data[2], data[5], data[6], data[0])} >
                                  </CostumButton3>
                                </View>
  
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
                                <Text style={styles.switchInnerTitle}>
                                  {data[4]}
                                </Text>
                                <Text numberOfLines={2} style={styles.switchInnerCondition}>
                                  {data[2]}
                                </Text>
                                <Text>
                                </Text>
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
          </TouchableOpacity>  :
           <LinearGradient colors={["#2380bf", "#239ffb", "#55cfdb"]} style={styles.loadConnection}>
           <ActivityIndicator size="small" color="white" style={styles.addNewBtnGradient}/>
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
      marginBottom:10,
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
    loadConnection:{
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
      flex: 3,
    },
    switchInnerTop: {
      flex: 4,
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
    }
  });
  
  
  export default HomePage;