import React, { Component } from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import mqtt from 'react-native-mqtt';
import init from 'react_native_mqtt';
import {
  Platform,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
	AsyncStorage,
} from 'react-native';

init({
	size: 10000,
	storageBackend: AsyncStorage,
	defaultExpires: 1000 * 3600 * 24,
	enableCache: true,
	sync : {}
});

options={
	//host: 'test.mosquitto.org',
	host: '192.168.1.1',
	port: 1883,
	path: "/lampupdate",
	id: "android",
	topic: "/lampupdate"
}

pahoClient = new Paho.MQTT.Client(options.host, options.port, options.path, options.id);

export default class App extends Component<{}> {
	constructor(props) {
		super(props);

		this.onLampPress = this.onLampPress.bind(this);
		this.onFailureToConnect = this.onFailureToConnect.bind(this);
		this.client = null;
		this.state = {
			text: ['...'],
			lampstate: [0, 0, 0, 0],
			client: pahoClient,
		}
		pahoClient.onConnectionLost = () => { this.pushText('{diskonek}'); };
		pahoClient.connect({
										onSuccess: () => { this.pushText('{koneksi ok}'); },
										timeout: 3,
										userName: "mqtt",
										password: "dupadupa",
										onFailure: this.onFailureToConnect,
									});
	}

	pushText(entry) {
		const { text } = this.state;
		this.setState({ text: [...text, entry] });
	}

	onLampPress = (key, i) => {	
		const { lampstate } = this.state;
		lampstate[key] = !lampstate[key];

		this.turnLamp().catch(e => console.warn("Error detected : " + e));

		this.setState({ lampstate });
	}	

	onFailureToConnect(ctx) {
		this.pushText("{ga bisa konek}");
	}

	async turnLamp() {
		const { client, lampstate } = this.state;
		var val = 0;

		for(let i = 0; i < lampstate.length; i++) {
				val |= (lampstate[i] << i);
		}
		val += 1;

		//console.warn("Sending " + val + " on topic: " + options.topic);

		if (client) {
			await client.publish(options.topic, String(val), 0);
		}
	}

  render() {
		var lamps = [];
		const { text, lampstate } = this.state;

		for(let i = 0; i < lampstate.length; i++) {
			lamps.push(
				<TouchableOpacity key={i} 
					style={[styles.lampiconbutton, lampstate[i] && {backgroundColor: '#fcea8f'}]} 
					onPress={this.onLampPress.bind(this, i)}>
					<Icon name={"ios-bulb"} 
						style={[styles.lampicon, lampstate[i] == 1 && {color: 'orange'}]} />
				</TouchableOpacity>
			);	
		}
    return (
      <View style={styles.container}>
				{ lamps }
				{ text.map((entry, index) => <Text key={index} 
								style={{fontSize: 10}}>{entry}</Text>) }
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
	lampiconbutton: {
		borderWidth: 0,
		borderColor: 'rgba(0, 0, 0, 0.2)',
		alignItems: 'center',
		justifyContent: 'center',
		width: 50,
		height: 50,
		backgroundColor: '#eee',
		borderRadius: 100,
		marginTop: 5,
	},
	lampicon: {
		color: 'gray',
		fontSize: 30,
	}
});
