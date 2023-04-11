import { View, Text, StyleSheet, TouchableHighlight, ScrollView, Dimensions, Alert, Modal } from "react-native";
import React, { Component } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { NavigationContainer } from "@react-navigation/native";
import { MaterialCommunityIcons, AntDesign, Ionicons } from "@expo/vector-icons";
import CostumButton1 from "../../components/buttonComponents/CostumButton1";
import CostumButton2 from "../../components/buttonComponents/CostumButton2";
import CostumButton3 from "../../components/buttonComponents/CostumButton3";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Switch, TextInput } from "react-native-paper";
import HomePage from '../HomePage';
import Grid from "../../components/Grid";
import { TouchableOpacity } from "react-native";
import { LineChart, BarChart } from "react-native-chart-kit";


const windowsWidth = Dimensions.get('screen').width;
const Height = Dimensions.get('screen').height;
class FirstStep extends Component {
  constructor(props) {
    super(props),
      this.state = {
        selectedBtn: null,
        selectedIcon: null,
        templateName: null,
        topicName: null,
        topicNameStatus: null,
        currentNumber: 0,
        titleBtn: null,
        isInputNull: false,
        message1: null,
        message2: null,
        currentActive: false,
        modalMonitoring: false,
        modalCommand: false,
        isInputStatusActive: false,
        monitoringTitle:null,
        monitoringTopic:null,
        monitoringChartType:null,
      }
  }



  generateRandomKey = () => {
    let rnd = Math.floor(Math.random() * 100) + 1;
    return rnd;
  }


  componentDidMount() {
    // this.checkIfInputNull()
  }

  selectButtonType = (params) => {
    switch (params) {
      case 1:
        this.setState({ selectedBtn: 1 })
        break;
      case 2:
        this.setState({ selectedBtn: 2 })
        break;
      case 3:
        this.setState({ selectedBtn: 3 })
        break;
      case 4:
        this.setState({ selectedBtn: 4 })
        break;
    }
  }

  selectChartType = (params) => {
    switch(params){
      case 1:
        this.setState({ monitoringChartType : 1})
      break;
      case 2:
        this.setState({ monitoringChartType : 2});
      break;
    } 
  }

  selectIconType = (params) => {
    switch (params) {
      case 1:
        this.setState({ selectedIcon: 1 })
        break;
      case 2:
        this.setState({ selectedIcon: 2 })
        break;
      case 3:
        this.setState({ selectedIcon: 3 })
        break;
      case 4:
        this.setState({ selectedIcon: 4 })
        break;
      case 5:
        this.setState({ selectedIcon: 5 })
        break;
      case 6:
        this.setState({ selectedIcon: 6 })
        break;
    }
  }


  sendToAsync = async (key, objVal) => {
    try {
      let objectedVal = await JSON.stringify(objVal)
      await AsyncStorage.setItem(key, objectedVal)
      this.setState({ modalCommand: false })
      this.props.navigation.navigate('Homepage', 'first');
    } catch {
      return
    }
  }

  sentToMonitoringAsync = async (key,objVal) => {
    try {
      let objectedVal = await JSON.stringify(objVal)
      await AsyncStorage.setItem(key, objectedVal)
      this.setState({ modalMonitoring: false })
      this.props.navigation.navigate('Homepage', 'first');
    } catch {
      return
    }
  }
  
  setMonitoringObj = () => {
   if(this.state.monitoringTitle == null || this.state.monitoringTopic == null || this.state.monitoringChartType == null){
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
     let monitorVal = {
        selectedBtn: 5,
        monitoringTitle: this.state.monitoringTitle,
        monitoringTopic: this.state.monitoringTopic,
        monitoringChartType: this.state.monitoringChartType
     }                                     
     let monitorRndKey = this.generateRandomKey()
     this.sentToMonitoringAsync(monitorRndKey.toString(), monitorVal)
   }
  }


  setToObj = () => {
    if (this.state.selectedBtn == null || this.state.selectedIcon == null || this.state.topicName == null || this.state.templateName == null || this.state.titleBtn == null || this.state.message1 == null || this.state.message2 == null) {
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
      let val = {
        selectedBtn: this.state.selectedBtn,
        selectedIcon: this.state.selectedIcon,
        topicName: this.state.topicName,
        topicNameStatus: this.state.topicNameStatus,
        templateName: this.state.templateName,
        buttonTitle: this.state.titleBtn,
        message1: this.state.message1,
        message2: this.state.message2,
        currentActive: this.state.currentActive,
      }
      let rndKey = this.generateRandomKey()
      // const stringKey = this.state.currentNumber.toString();
      this.sendToAsync(rndKey.toString(), val);
    }
  }

  render() {
 

    return (
      <View style={styles.mainContainer}>
        <TouchableOpacity onPress={() => this.props.navigation.navigate("Homepage")}>
          <View style={{ flexDirection: 'row', padding: 20, alignItems: 'center', gap: 5, }}>
            <AntDesign name="arrowleft" size={30} color="black" />
          </View>
        </TouchableOpacity>

        <View style={styles.containerWrapper}>
          <Text style={styles.titleChoose}>Choose Component</Text>
          <View style={styles.choseWrapper}>
            <TouchableOpacity onPress={() => this.setState({ modalMonitoring: true })}>
              <View style={styles.chosegrid}>
                <View style={styles.monitorgrid}>
                  <Ionicons name="ios-stats-chart" size={40} color="#239ffb" />
                  <Text style={styles.monitortitle}>Monitoring</Text>
                </View>
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => this.setState({ modalCommand: true })}>
              <View style={styles.chosegrid}>
                <View style={styles.cmdgrid}>
                  <MaterialCommunityIcons name="cube-send" size={40} color="#239fab" />
                  <Text style={styles.commandtitle}>Command</Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </View>
        <Modal visible={this.state.modalMonitoring}>
          <ScrollView style={styles.containers}>
            <View style={styles.titleContainers}>
              <View style={styles.btnBack}>
                <TouchableOpacity onPress={() => this.setState({ modalMonitoring: false })}>
                  <MaterialCommunityIcons name="arrow-left" size={30}></MaterialCommunityIcons>
                </TouchableOpacity>
              </View>
              <View style={styles.titleWrappers}>
                <Text style={styles.title}>Make New Monitoring</Text>
                <Text>Create Your Own Monitoring</Text>
              </View>
            </View>
            <View style={styles.chartWrappers}>
              <TextInput
                mode="outlined"
                outlineColor="#ddd"
                activeOutlineColor="#239ffb"
                onChangeText={(val) => this.setState({ monitoringTitle: val })}
                style={{ marginTop: 25, marginBottom: 10 }}
                label="Masukan Title"
              ></TextInput>
              <TextInput
                mode="outlined"
                outlineColor="#ddd"
                activeOutlineColor="#239ffb"
                onChangeText={(val) => this.setState({ monitoringTopic: val })}
                style={{ marginBottom: 10 }}
                label="Masukan MQTT Topic"
              ></TextInput>
              <Text style={styles.hintTypeBtn}>Pilih Jenis Chart</Text>
              <View style={styles.chartgridwrapper}>
                <TouchableOpacity onPress={() => this.selectChartType(1)} style={[styles.chartgrid, {
                  borderColor: this.state.monitoringChartType == 1 ? "#239ffb" : "#ddd",
                  borderWidth: this.state.monitoringChartType == 1 ? 2 : 1,
                }]}>
                  <LineChart
                    data={{
                      labels: ["January", "February", "March", "April", "May", "June"],
                      datasets: [
                        {
                          data: [
                            10,
                            15,
                            26,
                            20,
                            30,
                            14
                          ]
                        }
                      ]
                    }}
                    width={160} // from react-native
                    height={110}
                    yAxisLabel=""
                    yAxisSuffix=""
                    yAxisInterval={1} // optional, defaults to 1
                    chartConfig={{
                      backgroundColor: "#e26a00",
                      backgroundGradientFrom: "#fb8c00",
                      backgroundGradientTo: "#ffa726",
                      decimalPlaces: 2, // optional, defaults to 2dp
                      color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                      labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                      style: {
                        borderRadius: 16
                      },
                      propsForDots: {
                        r: "6",
                        strokeWidth: "2",
                        stroke: "#ffa726"
                      }
                    }}
                    bezier
                    style={{
                      marginVertical: 8,
                      borderRadius: 16
                    }}
                  />

                </TouchableOpacity>
                <TouchableOpacity onPress={() => this.selectChartType(2)} style={[styles.chartgrid, {
                  borderColor: this.state.monitoringChartType == 2 ? "#239ffb" : "#ddd",
                  borderWidth: this.state.monitoringChartType == 2 ? 2 : 1,
                }]}>
                  <BarChart
                    data={{
                      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                      datasets: [
                        {
                          data: [20, 45, 28, 80, 99, 43, 50],
                        },
                      ],
                    }}
                    width={160}
                    height={110}
                    yAxisSuffix="%"
                    yAxisInterval={1}
                    chartConfig={{
                      backgroundColor: '#e26a00',
                      backgroundGradientFrom: '#fb8c00',
                      backgroundGradientTo: '#ffa726',
                      decimalPlaces: 0,
                      color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                      labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                      style: {
                        borderRadius: 16,
                      },
                      propsForVerticalLabels: {
                        fontSize: 10,
                      },
                    }}
                    style={{
                      marginVertical: 8,
                      borderRadius: 16,
                    }}
                  />
                </TouchableOpacity>
              </View>
              <TouchableOpacity onPress={this.setMonitoringObj}>
                <LinearGradient
                  colors={["#2380bf", "#239ffb", "#55cfdb"]}
                  style={styles.btnlinearGradient}
                >
                  <Text style={styles.buttonText}>Next </Text>
                  <AntDesign name="arrowright" size={24} color="white" />
                </LinearGradient>
              </TouchableOpacity>
            </View>


          </ScrollView>
        </Modal>
        <Modal visible={this.state.modalCommand}>
          <ScrollView style={styles.containers}>
            <View style={styles.titleContainers}>
              <View style={styles.btnBack}>
                <TouchableOpacity onPress={() => this.setState({ modalCommand: false })}>
                  <MaterialCommunityIcons name="arrow-left" size={30}></MaterialCommunityIcons>
                </TouchableOpacity>
              </View>
              <View style={styles.titleWrappers}>
                <Text style={styles.title}>Make New Command Template</Text>
                <Text>Create Your Own Button</Text>
              </View>
            </View>
            <View style={styles.templateWrappers}>
              <TextInput
                mode="outlined"
                outlineColor="#ddd"
                activeOutlineColor="#239ffb"
                onChangeText={(val) => this.setState({ templateName: val })}
                style={{ marginBottom: 10 }}
                label="Masukan Nama Template"
              ></TextInput>
              <View style={styles.topicSendOption}>
                <TextInput
                  mode="outlined"
                  outlineColor="#ddd"
                  activeOutlineColor="#239ffb"
                  onChangeText={(val) => this.setState({ topicName: val })}
                  label="Masukan MQTT Topic Send"
                  style={styles.inputTopicStatus}
                >
                </TextInput>
                <TouchableOpacity onPress={() => this.setState({ isInputStatusActive: true })} style={[styles.btnTopicStatus, { display: this.state.isInputStatusActive == false ? "flex" : "none" }]}>
                  <MaterialCommunityIcons name="arrow-down" size={25}></MaterialCommunityIcons>
                </TouchableOpacity>
              </View>
              <TextInput
                mode="outlined"
                outlineColor="#ddd"
                activeOutlineColor="#239ffb"
                style={{ display: this.state.isInputStatusActive == false ? "none" : "flex", marginBottom: 10, }}
                onChangeText={(val) => this.setState({ topicNameStatus: val })}
                label="Masukan MQTT Topic Status">
              </TextInput>
              <TextInput
                mode="outlined"
                outlineColor="#ddd"
                activeOutlineColor="#239ffb"
                onChangeText={(val) => this.setState({ titleBtn: val })}
                label="Masukan Title Button"></TextInput>
              <View style={styles.MessageWrapper}>
                <TextInput
                  mode="outlined"
                  outlineColor="#ddd"
                  activeOutlineColor="#239ffb"
                  onChangeText={(val) => this.setState({ message1: val })}
                  style={[styles.MessageInputName, { marginTop: 10 }]} label="Active Message"></TextInput>
                <TextInput
                  mode="outlined"
                  outlineColor="#ddd"
                  activeOutlineColor="#239ffb"
                  onChangeText={(val) => this.setState({ message2: val })}
                  style={[styles.MessageInputName, { marginTop: 10 }]} label="InActive Message"></TextInput>
              </View>

              <Text style={styles.hintTypeBtn}>Pilih Jenis Button</Text>
              <ScrollView horizontal={true} style={styles.btnOption}>
                <TouchableOpacity onPress={() => this.selectButtonType(1)} style={[styles.grid, {
                  borderColor: this.state.selectedBtn == 1 ? "#239ffb" : "#ddd",
                  borderWidth: this.state.selectedBtn == 1 ? 2 : 1,
                }]}>
                  <CostumButton1 h={40} w={70} fs={10} dis={true} btnTitle={"ON"}></CostumButton1>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => this.selectButtonType(2)} style={[styles.grid, {
                  borderColor: this.state.selectedBtn == 2 ? "#239ffb" : "#ddd",
                  borderWidth: this.state.selectedBtn == 2 ? 2 : 1,
                }]}>
                  <CostumButton2 h={40} w={70} fs={9} size={15} dis={true} btnTitle={"ON"}></CostumButton2>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => this.selectButtonType(3)} style={[styles.grid, {
                  borderColor: this.state.selectedBtn == 3 ? "#239ffb" : "#ddd",
                  borderWidth: this.state.selectedBtn == 3 ? 2 : 1,
                }]}>
                  <CostumButton3 dis={true}></CostumButton3>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => this.selectButtonType(4)} style={[styles.grid, {
                  borderColor: this.state.selectedBtn == 4 ? "#239ffb" : "#ddd",
                  borderWidth: this.state.selectedBtn == 4 ? 2 : 1,
                }]}>
                  <Switch disabled={true} />
                </TouchableOpacity>
              </ScrollView>
              <Text style={styles.hintTypeBtn}>Pilih Icon Grid</Text>
              <ScrollView horizontal={true} style={styles.btnOption}>
                <TouchableOpacity onPress={() => this.selectIconType(1)} style={[styles.grid, {
                  borderColor: this.state.selectedIcon == 1 ? "#239ffb" : "#ddd",
                  borderWidth: this.state.selectedIcon == 1 ? 2 : 1,
                }]}>
                  <MaterialCommunityIcons name="air-conditioner" color={'#239ffb'} style={styles.materialIcon}></MaterialCommunityIcons>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => this.selectIconType(2)} style={[styles.grid, {
                  borderColor: this.state.selectedIcon == 2 ? "#239ffb" : "#ddd",
                  borderWidth: this.state.selectedIcon == 2 ? 2 : 1,
                }]}>
                  <MaterialCommunityIcons name="bed" color={'#239ffb'} style={styles.materialIcon}></MaterialCommunityIcons>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => this.selectIconType(3)} style={[styles.grid, {
                  borderColor: this.state.selectedIcon == 3 ? "#239ffb" : "#ddd",
                  borderWidth: this.state.selectedIcon == 3 ? 2 : 1,
                }]}>
                  <MaterialCommunityIcons name="desk-lamp" color={'#239ffb'} style={styles.materialIcon}></MaterialCommunityIcons>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => this.selectIconType(4)} style={[styles.grid, {
                  borderColor: this.state.selectedIcon == 4 ? "#239ffb" : "#ddd",
                  borderWidth: this.state.selectedIcon == 4 ? 2 : 1,
                }]}>
                  <MaterialCommunityIcons name="outdoor-lamp" color={'#239ffb'} style={styles.materialIcon}></MaterialCommunityIcons>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => this.selectIconType(5)} style={[styles.grid, {
                  borderColor: this.state.selectedIcon == 5 ? "#239ffb" : "#ddd",
                  borderWidth: this.state.selectedIcon == 5 ? 2 : 1,
                }]}>
                  <MaterialCommunityIcons name="electron-framework" color={'#239ffb'} style={styles.materialIcon}></MaterialCommunityIcons>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => this.selectIconType(6)} style={[styles.grid, {
                  borderColor: this.state.selectedIcon == 6 ? "#239ffb" : "#ddd",
                  borderWidth: this.state.selectedIcon == 6 ? 2 : 1,
                }]}>
                  <MaterialCommunityIcons name="television" color={'#239ffb'} style={styles.materialIcon}></MaterialCommunityIcons>
                </TouchableOpacity>
              </ScrollView>



              <TouchableOpacity disabled={this.state.isInputNull == false ? false : true} onPress={this.setToObj}>
                <LinearGradient
                  colors={["#2380bf", "#239ffb", "#55cfdb"]}
                  style={styles.btnlinearGradient}
                >
                  <Text style={styles.buttonText}>Next </Text>
                  <AntDesign name="arrowright" size={24} color="white" />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </Modal>
      </View>

    )
  }
}

const styles = StyleSheet.create({
  containers: {
    flex: 1,
    paddingHorizontal: 10,
    paddingTop: '3%',
    backgroundColor: '#eee'
  },
  title: {
    fontFamily: "InterSemi",
    fontSize: 15,
  },
  titleContainers: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    justifyContent: 'center'

  },
  templateWrappers: {
    width: "100%",
    marginTop: 40,
    paddingHorizontal: 10,
  },
  btnlinearGradient: {
    padding: 10,
    borderRadius: 5,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  materialIcon: {
    fontSize: 30,
  },
  buttonText: {
    color: "white",
    fontSize: 15,
    fontWeight: "600",
  },
  hintTypeBtn: {
    fontFamily: 'InterSemi',
    // marginTop: 10,
  },
  btnOption: {
    marginVertical: 20,
  },
  grid: {
    borderColor: '#ddd',
    flexDirection: 'row',
    marginLeft: 10,
    overflow: "hidden",
    flexWrap: 'wrap',
    borderWidth: 1,
    width: 80,
    backgroundColor: 'white',
    height: 80,
    alignItems: 'center',
    justifyContent: "center",
    alignContent: 'center',
    borderRadius: 5,
  },
  chartgrid: {
    flexDirection: 'row',
    marginLeft: 10,
    overflow: "hidden",
    flexWrap: 'wrap',
    borderWidth: 1,
    width: windowsWidth / 2.5,
    marginBottom: 10,
    backgroundColor: 'white',
    height: 150,
    alignItems: 'center',
    justifyContent: "center",
    alignContent: 'center',
    borderRadius: 5,
  },
  chosegrid: {
    width: windowsWidth / 2.3,
    height: Height / 5,
    borderWidth: 1,
    margin: 2.52,
    padding: 5,
    borderRadius: 15,
    display: 'flex',
    justifyContent: 'center',
    borderColor: '#ddd',
    backgroundColor: 'white',
  },
  MessageInputName: {
    width: windowsWidth / 2.26,
    marginRight: 5,
    fontFamily: "Jakarta",
    marginBottom: 10,
  },
  MessageWrapper: {
    flex: 1,
    width: '100%',
    paddingRight: 40,
    flexDirection: 'row',
  },
  topicSendOption: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  btnTopicStatus: {
    flex: 1,
    alignItems: 'center',
    marginLeft: 5,
  },
  inputTopicStatus: {
    flex: 10,
    marginBottom: 10,
  },
  choseWrapper: {
    justifyContent: "center",
    flexDirection: "row"
  },
  monitorgrid: {
    alignItems: 'center',
    justifyContent: 'center',
    width: "100%",
    height: "100%",
  },
  cmdgrid: {
    alignItems: 'center',
    justifyContent: 'center',
    width: "100%",
    height: "100%",
  },
  monitortitle: {
    fontFamily: 'InterSemi'
  },
  commandtitle: {
    fontFamily: 'InterSemi'
  },
  containerWrapper: {
    paddingTop: 50,
    alignItems: 'center',
    gap: 15,
    paddingBottom: 20,
  },
  mainContainer: {
    flex: 1,
    justifyContent: 'flex-start'
  },
  titleChoose: {
    fontFamily: "InterSemi",
    fontSize: 18
  },
  btnBack: {
    flex: 1,
    paddingLeft: 10,
  },
  titleWrappers: {
    flex: 10,
  },
  chartgridwrapper: {
    flexWrap: 'wrap',
    flexDirection: 'row',
    paddingVertical:15,
  },
  chartWrappers: {
    paddingHorizontal: 15,
    flex: 1,
    width: '100%'
  }


});

export default FirstStep;


