import React from "react";
import { View,Text, Component, Touchable, TouchableOpacity ,StyleSheet} from "react-native";
import { ActivityIndicator } from 'react-native-paper';

export default class CostumButton1 extends React.Component {
    render(){
        return(
            <TouchableOpacity onPress={this.props.onPress} disabled={this.props.dis == null ? false : this.props.dis } style={[styles.CostumButton1,{height:this.props.h,width:this.props.w}]}>
                  <ActivityIndicator color="white" size={"small"} style={{display:this.props.loading == true ? 'flex' : 'none'}}></ActivityIndicator>
                  <Text style={{fontFamily:'Jakarta',color:'white',fontSize:this.props.fs}}>
                    {this.props.btnTitle == null ? 'Costum Button 1' : this.props.btnTitle}</Text>
            </TouchableOpacity>
        )
    }
}

const styles = StyleSheet.create({
 CostumButton1:{
    backgroundColor:'#00C9FF',
    borderRadius:10,
    marginVertical:5,
    padding:10,
    alignSelf:'flex-start',
    alignItems:'center',
    flexDirection:'row',
  }
})
