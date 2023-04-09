import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Alert } from "react-native";
import React, { Component } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { NavigationContainer } from "@react-navigation/native";
import { MaterialCommunityIcons, AntDesign } from "@expo/vector-icons";
import CostumButton1 from "../../components/buttonComponents/CostumButton1";
import CostumButton2 from "../../components/buttonComponents/CostumButton2";
import CostumButton3 from "../../components/buttonComponents/CostumButton3";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Switch, TextInput } from "react-native-paper";
import HomePage from '../HomePage';


const windowsWidth = Dimensions.get('screen').width;
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
        isInputStatusActive: false,
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
      this.props.navigation.navigate('Homepage', 'first');
    } catch {
      return
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
      <ScrollView style={styles.containers}>
        <TouchableOpacity onPress={() => this.props.navigation.navigate("Homepage")}>
          <AntDesign name="arrowleft" size={24} color="black"
            style={{
              position: 'absolute',
              left: 10,
              top: 10,
            }}
          />
        </TouchableOpacity>
        <View style={styles.titleContainers}>
          <Text style={styles.title}>Make New Template</Text>
          <Text>Create Your Own Button</Text>
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
    )
  }
}

const styles = StyleSheet.create({
  containers: {
    flex: 1,
    paddingHorizontal: 10,
    paddingTop: '3%',
  },
  title: {
    fontFamily: "InterSemi",
    fontSize: 15,
  },
  titleContainers: {
    alignItems: "center",
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
  MessageInputName: {
    width: windowsWidth / 2.27,
    marginRight: 5,
    fontFamily: "Jakarta",
    marginBottom: 10,
  },
  MessageWrapper: {
    flex: 1,
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

  }
});

export default FirstStep;


