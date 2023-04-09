import React from "react"
import { View, Text, StyleSheet, Dimensions, TouchableWithoutFeedback, TouchableHighlight,TouchableOpacity} from "react-native"
import { LinearGradient } from "expo-linear-gradient";
import {
    Feather,
    AntDesign,
    Entypo,
    MaterialCommunityIcons
  } from '@expo/vector-icons';


const Height = Dimensions.get('window').height;
const Width = Dimensions.get('window').width;


export default class Grid extends React.Component {
    constructor(props){
        super(props),
        this.state={
            hold:false,
          }
     }       
     
     showRemoveBtn = () => {
        this.setState({hold:true});
        setTimeout(() => {
            this.setState({hold:false})
        }, 2000);
     }

    render() {
        return ( 
                <TouchableWithoutFeedback onLongPress={this.showRemoveBtn}>
                  <LinearGradient
                    colors={this.state.hold == true ? ['#61B7E5','#A0DEFF'] :["#F2F3F2", "#ffffff"]}
                    style={style.container}>
                    <TouchableOpacity style={{zIndex:10}} onPress={this.props.remove}>
                      <Entypo name="trash" style={[style.icon,{display:this.state.hold == true ? 'flex' : 'none'}]} size={40}></Entypo> 
                    </TouchableOpacity>
                    {this.props.children}
                </LinearGradient>
                </TouchableWithoutFeedback>
          
        )
    }
}

const style = StyleSheet.create({
    container: {
        width: Width / 2.3,
        height: Height / 5,
        borderWidth: 1,
        margin: 2.52,
        padding:5,
        borderRadius: 15,
        display: 'flex',
        justifyContent: 'center',
        borderColor: '#ddd',
        backgroundColor: 'white',
    },
    icon:{
        position:'absolute',
        top:10,
        right:10,
        color:'red'
    }
});