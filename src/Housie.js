import React from 'react';
//import ReactDOM from 'react-dom';
import Speech from 'speak-tts';
import './App.css';
//import { instanceOf } from 'prop-types';
import Cookies from 'js-cookie';

function Square(props) {
	return (
		<span className={props.className} onClick={props.onClick} key={props.value} >
			{props.value}
		</span>
	);
}
// const _addVoicesList = voices => {
// 	const list = window.document.createElement("div");
// 	let html =
// 		'<h2>Available Voices</h2><select id="languages"><option value="">autodetect language</option>';
// 	voices.forEach(voice => {
// 		html += `<option value="${voice.lang}" data-name="${voice.name}">${
// 			voice.name
// 			} (${voice.lang})</option>`;
// 	});
// 	list.innerHTML = html;
// 	window.document.body.appendChild(list);
// };
const speech = new Speech();

speech
	.init({
		volume: 1,
		lang: "hi-IN",
		rate: .8,
		pitch: 1,
		//'voice':'Google UK English Male',
		//'splitSentences': false,
		listeners: {
			// onvoiceschanged: voices => {
			// 	console.log("Voices changed", voices);
			// }
		}
	})
	.then(data => {
		//console.log("Speech is ready", data);
		//_addVoicesList(data.voices);

	})
	.catch(e => {
		console.error("An error occured while initializing : ", e);
	});
class Housie extends React.Component {
	
	constructor(props) {
		super(props);
		
		const N = 90;
		// const expires = new Date()		
		// expires.setDate(Date.now() + 1000 * 60 * 60 * 24 * 14)

		if (typeof Cookies.get('numbers') == 'undefined' || Cookies.get('numbers') === '') {
			Cookies.set('numbers', Array(N).fill().map((item, index) => 1 + index));
		}

		if (typeof Cookies.get('active_numbers') == 'undefined' || Cookies.get('active_numbers') === '') {
			Cookies.set('active_numbers', Array(N).fill().map((item, index) => 1));
		}
				
		this.state = {
			numbers: JSON.parse(Cookies.get('numbers')),
			active_numbers: JSON.parse(Cookies.get('active_numbers')),
			current_number: '',
			time: 0,
			start_button_text:'Start'			
		};
		this.handleClick = this.popValue.bind(this);
		this.startButtonClick = this.startTimer.bind(this);
		this.stopButtonClick = this.stopTimer.bind(this);
		
	}

	renderSquare(i) {
		//console.log(i);
		
		
		return (				
			<Square className={this.state.active_numbers[i] === 0 ? 'square dark' : 'square'} value={i} key={'square_'+i} />													
			);
	}

	createTable = () => {
		let table = []
		let k = 1;

		// Outer loop to create parent
		for (let i = 0; i < 9; i++) {
			let children = []
			//Inner loop to create children
			for (let j = 0; j < 10; j++) {
				children.push(this.renderSquare(k))
				k++
			}
			//Create the parent and add the children
			table.push(<div key={'row_' + (i+1)} className="board-row">{children}</div>)

		}
		
		return table
	}

	
	popValue() {		
		var arr_pop = this.state.numbers.splice(Math.floor(Math.random() * this.state.numbers.length), 1);
		var pop_value = arr_pop[0];
		
		
		this.setState( state => {
			const active_numbers = this.state.active_numbers;
			const numbers = this.state.numbers;
			const current_number = pop_value;
			active_numbers[pop_value] = 0;
			return {
				numbers,
				active_numbers,
				current_number				
			};
			
			
			
		});
									
	}
	getSnapshotBeforeUpdate(prevProps, prevState) {
		// Are we adding new items to the list?
		// Capture the scroll position so we can adjust scroll later.
		
		if (prevState.current_number !== this.state.current_number) {
			this.callSpeech();	
		}
		return null;
	}

	componentDidUpdate(prevProps) {
		// Typical usage (don't forget to compare props):
		// if (this.props.userID !== prevProps.userID) {
		// 	this.fetchData(this.props.userID);
		// }
		
	}
	callSpeech() {
		speech
		.speak({
			text: 'Number, ' + this.state.current_number + '.I repeat, Number, ' + this.state.current_number,
			queue: true,
			listeners: {
				onstart: () => {
					//console.log("Start utterance");
				},
				onend: () => {
					//console.log("End utterance");
				},
				onresume: () => {
					//console.log("Resume utterance");
				},
				onboundary: event => {
					// console.log(
					// 	event.name +
					// 	" boundary reached after " +
					// 	event.elapsedTime +
					// 	" milliseconds."
					// );
				}
			}
		})
		.then(data => {
			//console.log("Success !", data);
			
		})
		.catch(e => {
			console.error("An error occurred :", e);
		});
	}

	tickTimer(){
		this.setState({
			time: this.state.time + 1
		});
	}
	startTimer() {
		// this.timer = setInterval(() => this.setState({
		// 	time: this.state.time + 1			
		// }), 1000)
		
		//console.log("start" + this.state.time
		if (this.state.numbers.length>0) {
			
			if (this.state.start_button_text === 'Start') {
				this.setState({
					start_button_text: 'Pause'
				});
				console.log("stop")
			}
			this.timer = setInterval(() => {
				this.tickTimer();

				if (this.state.time > 9) {
					this.resetTimer();
					this.stopTimer();
					this.timer2 = setTimeout(function() {
							this.startTimer();
						}
							.bind(this),
						2000
					);
				}

			}, 1000)
		}
		else{
			Cookies.remove('numbers');
			Cookies.remove('active_numbers');
		}
				
	}
	stopTimer() {
		clearInterval(this.timer)
		clearTimeout(this.timer2)
		this.setState({ time: 0 })
		if(this.state.start_button_text==='Pause') {
			this.setState({
				start_button_text: 'Start'
			});
			console.log("stop")
		}
		
	}
	resetTimer() {
		this.setState({ time: 0 })
		console.log("reset")
		
		this.popValue();
		
	}
	restartGame() {
		Cookies.remove('numbers');
		Cookies.remove('active_numbers');
		window.location.reload();
		
	}
	
	render() {				
		Cookies.set(
			'numbers',
			this.state.numbers
		)
		Cookies.set(
			'active_numbers',
			this.state.active_numbers
		)
		if ( this.state.numbers.length === 0 ) {
			Cookies.remove('numbers');
			Cookies.remove('active_numbers');
		}
		return (
			<div className="game">
				<div className="game-board">
					{this.createTable()}									
				</div>

				<div className="game-info">
					<div className="timer_buttons">
						
						<span className="btn startButton" onClick={this.startButtonClick}>{this.state.start_button_text}</span>
						<span className="btn stopButton" onClick={this.stopButtonClick}>Stop</span>
						<span className="btn startButton" onClick={this.restartGame}>Restart</span>
						<span className="timer">Timer: {this.state.time}</span>
						<img alt='Please Wait...' className={this.state.time > 0 ? '' : 'hide'} src="https://loading.io/spinners/microsoft/lg.rotating-balls-spinner.gif" />
					</div>
					
					<div><div className="" id='pop' onClick={this.handleClick} >POP</div></div>
					<div id='game-speech-number' className="hide">{this.state.current_number !== '' ? 'Number, ' + this.state.current_number + '.I repeat, Number, ' + this.state.current_number:''}</div>
				</div>
				<div className="game-current-number">					
					<div className={this.state.current_number !== '' ? '':'hide'}>{this.state.current_number}</div>										
				</div>

			</div>
			
		)
	}

}

// class Housie extends React.Component {
// 	constructor(props) {
// 		super(props);
// 		this.state = {
// 			squares: Array(90).fill(null),
// 		};
// 	}

// 	render() {
		
// 		let status;
// 		return (
// 			<div className="game">
// 				<div className="game-board">
// 					{this.createTable()}
// 					<button id='pop' onClick={this.handleClick} >POP</button>
// 					<div>{this.state.current_number}</div>
// 				</div>

// 				<div className="game-info">
// 					<div>{MyTable.status.current_number}</div>
// 					<ol>{/* TODO */}</ol>
// 				</div>
				
// 			</div>
// 		);
// 	}
// }




export default Housie;
