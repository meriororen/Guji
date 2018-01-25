import React, { Component } from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
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
	reconnect: true,
	sync: {}
});

export default class App extends Component<{}> {
	constructor(props) {
		super(props);

		this.onLampPress = this.onLampPress.bind(this);

		var lampstate = [0, 0, 0, 0];

		const client = new Paho.MQTT.Client('iot.eclipse.org', 443, 'uname');
		client.onConnectionLost = this.onConnectionLost;
		client.onMessageArrived = this.onMessageArrived;
		client.connect({ onSuccess: this.onConnect, useSSL: false });

		this.state = {
			text: ['...'],
			lampstate: lampstate,
			client: client,
		}
	}

	pushText(entry) {
		const { text } = this.state;
		this.setState({ text: [...text, entry] });
	}

	onConnect() {
		const { client } = this.state;
		client.subscribe('WORLD');
		this.pushText('connected');
	}

	onConnectionLost(responseObject) {
		if (responseObject.errorCode != 0) {
			this.pushText("disconnected: " + 
					responseObject.errorMessage);
		}
	}

	onMessageArrived(message) {
		this.pushText("new message:" + 
				message.payloadString);
	}

	onLampPress = (key, i) => {	
		const { lampstate } = this.state;
		lampstate[key] = !lampstate[key];
		this.setState({lampstate: lampstate});
	}	

  render() {
		var lamps = [];
		const { text } = this.state;

		for(let i = 0; i < this.state.lampstate.length; i++) {
			lamps.push(
				<TouchableOpacity key={i} 
					style={[styles.lampiconbutton, this.state.lampstate[i] && {backgroundColor: '#fcea8f'}]} 
					onPress={this.onLampPress.bind(this, i)}>
					<Icon name={"ios-bulb"} 
						style={[styles.lampicon, this.state.lampstate[i] == 1 && {color: 'orange'}]} />
				</TouchableOpacity>
			);	
		}
    return (
      <View style={styles.container}>
				{ lamps }
				{ text.map((entry, index) => <Text key={index}>{entry}</Text>) }
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
