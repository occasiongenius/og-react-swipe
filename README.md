# og-react-swipe
A simple, light weight, tinder-like swiping framework for react apps.

og-react-swipe provides 2 ReactJS components that need to be used in conjunction to provide swiping funcitonality.

#### CardStack - A wrapper for all of your card to be swiped through. Accepted props:
 * className (str): optional, provide a custom className for the CardStack
 * style (obj): optional, provide custom in-line styling for the CardStack
 * diff (int): the number of pixels from the middle that Cards should be dragged before callbacks are fired (default 100px)
 * clickBound (int): the number of pixels from the middle that Cards should be dragged before a click event is NOT fired on release of the card (default 1px)
 * onRunOut (func): optional, function executed when there are no more cards in the stack
 * onTop (func): optional, function executed when a card is dragged above the stack 
 * onRight (func): optional, function executed when a card is dragged to the right of the stack
 * onBottom (func): optional, function executed when a card is dragged below the stack
 * onLeft (func): optional, function executed when a card is dragged to the left of the stack
 * onClick (func): optional, function execeuted when a card is grabbed, but not moved beyond clickBound
 * topLimit (int): optional, number of pixels a card is limited in movement to ont the top
 * rightLimit (int): optional, number of pixels a card is limited in movement to on the right
 * bottomLimit (int): optional, number of pixels a card is limited in movement to on the bottom
 * leftLimit (int): optional, number of pixels a card is limited in movement to on the left

#### Card - A single slide of information in your stack of cards
 * className (str): optional, provide a custom className for the Card (not held)
 * grabbedClassName (str): optional, provide a custom className for the Card (when held)
 * children (obj, arr): the children to be rendered inside the Card
 * data (obj): optional, data to be sent to on[Direction] callback functions on the CardStack
 * undraggable (bool): optional, make a card undraggable (great for end of stack)
 * animate (Map): optional, map of 'css attribute' => fn(x, y) where x and y are the position of the card relative to its starting position, and the return of fn is the value of the css attribute
 * animateThrottle (int): number of ms to throttle animation calls by (default 50ms)
 * animationHook (func): optional, function to be called on each animation frame (limited to animateThrottle) it will receieve 2 parameters x and y position of the card relative to its starting position

The on[Direction] callback functions on the CardStack will receive a parameter of the data object on each Card, and a second parameter that is the number of pixels the card was dragged from its middle

By default the card will not drag if a button or anchor is clicked and held.

#### CardButton - An unstyled button to take actions on the card, or to hook into the currently viewed card
 * className (str): optional, provide a custom className for the CardButton
 * style (obj): optional, provide custom in-line styling for the CardButton
 * onClick (str/func): required, provide a hook for the click event. If strings: 'top', 'right', 'bottom', or 'left' are provided instead of a function, the corresponding callback on the CardStack will be called

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
		this.abs = Math.abs;
	}

	render() {
		let cards = [];

		for (let i = 0; i < 10; i++) {
			let color = 'rgb(' +
				this.round(this.random() * 255) + ','	+
				this.round(this.random() * 255) + ','	+
				this.round(this.random() * 255) + ')';

			let animate = new Map([
				[
					'opacity',
					(x, y) => {
						x = this.abs(x);
						
						if (x > 100) x = 100;

						return (120 - x) / 120;
					}
				]
			]);

			cards.push(
				<Card key={ i } data={{ card_num: i }} undraggable={ i == 9 }
					animate={ animate } animateThrottle={ 20 }>
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
					onRight={ this.rightDrag }
					onClick={ this.click }
					clickBount={ 3 }
					limit={ 120 }
					bottomLimit={ 40 }>
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

	click(data, amount) {
		console.log('Click!');
		console.log(data);
	}

	onRunOut() {
		console.log('No more cards left!');
	}
}

ReactDOM.render(<App />, document.getElementById('app'));
```

## Planned Features
 * non-draggable elements: selectors for elements that should not drag, right now defaults to buttons and anchor tags
 * dropHook: function that hooks into the drop action, and will receieve a callback to delete the card
