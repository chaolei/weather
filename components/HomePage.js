import React, { Component } from 'react';
import {
    Platform,
    StyleSheet,
    Text,
    View,
    StatusBar,
    Alert,
    ListView,
    ScrollView,
    Image,
    ImageBackground
} from 'react-native';
//import SplashScreen from "rn-splash-screen";
import SplashScreen from 'react-native-splash-screen'

const Geolocation = require('Geolocation');
const icons = [
    "sunny.png",
    "ying.png",
    "cloud.png",
    "rain.png"
];
const AqiLevel = [
    '',
    "优",
    "良",
    "轻度污染",
    "中度污染",
    "重度污染",
    "严重污染"
];

class HomePage extends Component {
    constructor(){
        super();
        var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
        this.state = {
            dataSource: ds.cloneWithRows([]),
            now: '..',
            type: '..',
            tips: '..',
            aqi: '..',
            aqiLevel: '..'
        }
    }

    componentWillMount() {        
        this.getInfo();
    }

    componentDidMount() {
        setTimeout(SplashScreen.hide, 1000);
    }

    getInfo = () => {
        fetch("http://wthrcdn.etouch.cn/weather_mini?citykey=101270101", null)
        .then((response) =>{
            return response.text();  //返回一个带有文本对象
        })
        .then((responseText) => {
            this.handleData(responseText);
        })
        .catch((error) => {
            alert(error);
        })
    }

    handleData = (result) => {
        let data = JSON.parse(result), aqiLevel;
        let list = data.data.forecast;
        let showlist=[];
        list.map((day) => {
            let item = {
                date: day.date,
                weather: day.type,
                temperature: `${day.high.split(" ")[1]} / ${day.low.split(" ")[1]}`                
            };
            showlist.push(item);
        })
        var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
        aqiLevel = this.getLevel(data.data.aqi);
        this.setState({
            dataSource: ds.cloneWithRows(showlist), 
            now: data.data.wendu, 
            type: list[0].type, 
            tips: data.data.ganmao,
            aqi: data.data.aqi,
            aqiLevel: aqiLevel
        });
    }

    getLevel = (aqi) => {
        let level = 1;

        return level;
    }

    locationIt = () => {
        return new Promise((resolve,reject) => {
            Geolocation.getCurrentPosition(
                function(location){
                    resolve([location.coords.latitude,location.coords.longitude]);
                },
                function(error){
                    reject(error);
                },{
                    timeout: 5000, 
                    maximumAge: 1000
                }
            );
        })
    }

    goLocation = () => {
        this.locationIt().then(function(location){
            fetch(`https://api.map.baidu.com/geocoder/v2/?output=json&ak=S4qYI7kMHNUOlfYGVzVpQwOH&location=${location[0]},${location[1]}`)
            .then((response) =>{
                return response.text();  
            })
            .then((responseText) => {
                let result = JSON.parse(responseText);
                Alert.alert(`你当前所在城市：${result.result.addressComponent.city||'获取失败'}`);
            })
            .catch((error) => {
                Alert.alert(error);
            })
        }).catch(function(err){
            Alert.alert("获取位置失败：" + err)
        });
    }

    getWeatherIcon = (weather) => {
        let icon = require("../images/sunny.png");//晴
        if(weather.indexOf("阴") > -1){
            icon = require("../images/yin.png");
        }else if(weather.indexOf("云") > -1){
            icon = require("../images/cloud.png");
        }else if(weather.indexOf("雨") > -1){
            icon = require("../images/rain.png");
        }
        return icon;
    }    


    loadWeatherList = (data) => {
        let ico = this.getWeatherIcon(data.weather);
        return (
            <View style={styles.weatherItem}>
                <View style={styles.weatherDate}>
                    <Text style={styles.clblack}>{data.date}</Text></View>
                <View style={styles.weatherTxt}>
                    <View style={styles.typeCon}>
                        <Image source={ico} style={styles.type}/>
                        <Text style={styles.clblackspe2}>{data.weather}</Text>
                    </View>
                </View>
                <View style={styles.weatherTemp}>
                    <Text style={styles.clblacksp}>{data.temperature}</Text>
                </View>
            </View>
        )
    }

    componentWillUnmount () {
        //停止并销毁定位服务
        AMapLocation.cleanUp()
    }

    render() {
        return (
            <ScrollView style={styles.scrollContainer}>
                <View style={styles.container}>
                    <StatusBar backgroundColor={'#1E74D7'}/>
                    <ImageBackground source={require("../images/bg.jpg")} onClick={this.goLocation.bind(this)} style={styles.todayshow}>
                        <Text style={styles.temperature}>{this.state.now}°C</Text>
                        <Text onPress={this.goLocation.bind(this)} style={styles.address}>成都市</Text>
                        <Text style={styles.weather}>{this.state.type}</Text>
                        <View style={styles.aqiCon}>
                            <Image source={require("../images/aqiico.png")}  style={styles.aqiIcon}/>
                            <Text style={styles.aqi}>{AqiLevel[this.state.aqiLevel]}&nbsp;{this.state.aqi}</Text>
                        </View>
                    </ImageBackground>

                    <ListView
                        style={styles.weatherList}
                        dataSource={this.state.dataSource}
                        renderRow={this.loadWeatherList}
                    />
                    <View style={styles.tipscon}><Text style={styles.tips}>{this.state.tips}</Text></View>
                </View>
            </ScrollView>
        );
    }
}

const styles = StyleSheet.create({
    scrollContainer: {
        height: '100%',
        backgroundColor: '#ffffff',
    },
    container: {
        justifyContent: 'center',
        alignItems: 'center'
    },
    todayshow: {
        backgroundColor: '#92B4F3',
        width: "100%",
        height: 265,
        paddingTop: 15,
        paddingLeft: 30,
    },
    temperature: {
        fontSize: 48,
        color: "#ffffff",
    },
    address: {
        fontSize: 24,
        color: "#ffffff",
    },
    weather: {
        fontSize: 16,
        color: "#ffffff",
        marginTop: 5
    },
    aqiCon: {
        position: "relative",
        marginTop: 87,
        paddingLeft: 48,
        height: 30

    },
    aqiIcon: {
        position: "absolute",
        width: 40,
        height: 30,
        left: 0,
        top: 0
    },
    aqi: {
        fontSize: 17,
        color: "#fff",
        lineHeight: 34,
        fontWeight: "bold"
    },
    weatherList: {
        width: "100%",
        paddingLeft: 30,
        paddingRight: 30
    },
    weatherItem: {
        display: "flex",
        width: "100%",
        flexDirection: "row",
        justifyContent: "space-between",
        paddingTop: 17,
        paddingBottom: 17,
        borderBottomWidth: 1,
        borderStyle: "solid",
        borderBottomColor: "#ccc"
    },
    tipscon: {
        marginTop: 10,
        marginLeft: 30,
        marginBottom: 10,
        marginRight: 30
    },
    tips: {
        fontSize: 16,
    },
    weatherDate: {  
        flex: 1
    },
    weatherTxt: {  
        flex: 1,
        alignItems: 'center',
        justifyContent:'center',
    },
    typeCon: {
        position: "relative",
        paddingLeft: 33
    },
    type: {
        position: "absolute",
        top: 0,
        left: 0,
        height: 25,
        width: 25
    },
    weatherTemp: { 
        flex: 1,
    },
    clblack:{  
        fontSize: 16,
        color: "#686868",
        lineHeight: 25
    },
    clblacksp:{  
        fontSize: 16,
        color: "#686868",
        textAlign: "right",
        lineHeight: 25
    },
    clblackspe2:{  
        fontSize: 16,
        color: "#686868",
        lineHeight: 25
    },
});
export default HomePage;