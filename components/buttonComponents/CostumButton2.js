import React from "react";
import { View,Text, Component, Touchable, TouchableOpacity ,StyleSheet,ScrollView} from "react-native";
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default class CostumButton2 extends React.Component {
    render(){
         return(
            <TouchableOpacity onPress={this.props.onPress} disabled={this.props.dis == null ? false : this.props.dis } style={[styles.CostumButton2,{height:this.props.h,width:this.props.w}]}>
                <MaterialCommunityIcons name={this.props.icon == null ? 'lamp' : this.props.icon} size={this.props.size == null ? 20 : this.props.size} color="#17bebb" />
                <Text style={{fontFamily:'Jakarta',color:'#17bebb',fontSize:this.props.fs == null ? 17 : this.props.fs, marginTop:-4}}>{this.props.btnTitle == null ? "Costum Button2" : this.props.btnTitle}</Text>
            </TouchableOpacity>
        )
    }
}

const styles = StyleSheet.create({
 CostumButton2:{
    borderColor:'#17bebb',
    borderWidth:1,
    borderRadius:10,
    flexDirection:'row',
    alignItems:'center',
    justifyContent:'center',
    padding:10,
    gap:2,
    alignSelf:'flex-start'
 }
})
