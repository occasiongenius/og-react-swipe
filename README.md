# og-react-swipe
A simple, light weight, tinder-like swiping framework for react apps.

og-react-swipe provides 2 ReactJS components that need to be used in conjunction to provide swiping funcitonality.

#### CardStack - A wrapper for all of your card to be swiped through. Accepted props:
 * className (str): optional, provide a custom className for the CardStack
 * style (obj): optional, provide custom in-line styling for the CardStack
 * diff (int): the number of pixels from the middle that Cards should be dragged before callbacks are fired (default 100px)
 * onRunOut (func): optional, function executed when there are no more cards in the stack
 * onTop (func): optional, function executed when a card is dragged above the stack 
 * onRight (func): optional, function executed when a card is dragged to the right of the stack
 * onBottom (func): optional, function executed when a card is dragged below the stack
 * onLeft (func): optional, function executed when a card is dragged to the left of the stack

#### Card
 * className (str): optional, provide a custom className for the Card (not held)
 * grabbedClassName (str): optional, provide a custom className for the Card (when held)
 * children (obj, arr): the children to be rendered inside the Card
 * data (obj): optional, data to be sent to on[Direction] callback functions on the CardStack
 * undraggable (bool): optional, make a card undraggable (great for end of stack)

The on[Direction] callback functions on the CardStack will receive a parameter of the data object on each Card, and a second parameter that is the number of pixels the card was dragged from its middle

# Example Usage
```
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Card, CardStack } from 'og-react-swipe';

class App extends Component {
	constructor(props) {
		super(props);

		this.leftDrag = this.leftDrag.bind(this);
		this.rightDrag = this.rightDrag.bind(this);
		this.onRunOut = this.onRunOut.bind(this);

		// utility functions
		this.round = Math.round;
		this.random = Math.random;
	}

	render() {
		let cards = [];

		for (let i = 0; i < 10; i++) {
			let color = 'rgb(' +
				this.round(this.random() * 255) + ','	+
				this.round(this.random() * 255) + ','	+
				this.round(this.random() * 255) + ')';

			cards.push(
				<Card key={ i } data={{ card_num: i }} undraggable={ i == 9 }>
					<div style={{
						backgroundColor: color,
						width: '100%',
						height: '200px',
					}} />
				</Card>
			);
		}

		return (
			<div className="app" style={{ overflow: 'hidden' }}>
				<CardStack style={{ width: '200px', margin: '100px auto' }}
					diff={ 100 }
					onRunOut={ this.onRunOut }
					onLeft={ this.leftDrag }
					onRight={ this.rightDrag }>
					{ cards }
				</CardStack>
			</div>
		);
	}

	leftDrag(data, amount) {
		console.log('Dragged left: ', amount);
		console.log(data);
	}

	rightDrag(data, amount) {
		console.log('Dragged right: ', amount);
		console.log(data);
	}

	onRunOut() {
		console.log('No more cards left!');
	}
}

ReactDOM.render(<App />, document.getElementById('app'));
```
