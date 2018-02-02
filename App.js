import React, { Component } from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import {
  Platform,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
	AsyncStorage,
} from 'react-native';

options = {
	server: 'blynk-cloud.com',
	port: 80,
	prefix: "lampupdate_",
	token: "22858ccb904949fab288b5a0bb90e170",
	virtualpin: "V1",
}

export default class App extends Component<{}> {
	constructor(props) {
		super(props);

		this.onLampPress = this.onLampPress.bind(this);
		this.state = {
			text: ['...'],
			lampstate: [0, 0, 0, 0],
		}
	}

	pushText(entry) {
		const { text } = this.state;
		this.setState({ text: [...text, entry] });
	}

	onLampPress = (key, i) => {	
		const { lampstate } = this.state;
		lampstate[key] = !lampstate[key];

		this.turnLamp();

		this.setState({ lampstate });
	}	

	turnLamp() {
		const { lampstate } = this.state;
		var val = 0;
		val |= (lampstate[0] << 0);
		val |= (lampstate[1] << 2);
		val |= (lampstate[2] << 1);
		val |= (lampstate[3] << 3);
		val += 1;

		var request = "http://"+ options.server + "/" + options.token + "/update/" +
				options.virtualpin + "?value=" + options.prefix + val;

		fetch(request).catch(e => console.error(e));
		
	//	console.warn("Sending: " + request);
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
		width: 70,
		height: 70,
		backgroundColor: '#eee',
		borderRadius: 100,
		marginTop: 5,
	},
	lampicon: {
		color: 'gray',
		fontSize: 40,
	}
});
