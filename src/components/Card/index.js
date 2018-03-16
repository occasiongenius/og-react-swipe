import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { throttle } from '../../utility.js';

class Card extends Component {
	constructor(props) {
		super(props);

		this.grab = this.grab.bind(this);
		this.grabTouch = this.grabTouch.bind(this);
		this.move = this.move.bind(this);
		this.moveTouch = this.moveTouch.bind(this);
		this.drop = this.drop.bind(this);
		this.dropTouch = this.dropTouch.bind(this);

		this.setGrabbedPos = this.setGrabbedPos.bind(this);

		this.state = {
			// position of card (used to calculate move distance)
			start_top: undefined, 
			start_left: undefined, 
			// is the card grabbed? used for class assignment in render
			// to "create" the dragged card and hide the other card
			grabbed: false,
			// flag used when movement doesn't go past this.props.click_bound,
			// so that click event is not fired
			nullify_click: false,
			// difference in position between mouse and grabbed card,
			// used to calculate 'left' and 'top' attributes on grabbed card
			left_diff: 0,
			top_diff: 0,
			// set props in state to not change
			animate: this.props.animate instanceof Map ? this.props.animate : undefined,
			animate_throttle: this.props.animateThrottle ? this.props.animateThrottle : 50,
		};

		// validate 'animate' prop and throttle animate function
		if (this.props.animate) {
			if (!(this.props.animate instanceof Map)) {
				console.error('animate prop on Card should by of type \'Map\'');
			} else if (this.props.animate.size > 4) {
				console.error('animate prop on Card should not be larger than 4 key/values.');
			} else {
				this.state.animate = this.props.animate;
				this.animate = throttle(this.animate.bind(this), this.state.animate_throttle);
			}
		}
	}

	componentDidMount() {
		// get starting position of the card
		if (this.props.visible) this.setStateSize();
	}

	componentDidUpdate(prevProps) {
		// get starting position of the card
		if (!prevProps.visible && this.props.visible) this.setStateSize();
	}

	componentWillUnmount() {
		// remove event listeners and any other cleanup on card when it is dropped
		if (typeof document !== 'undefined') {
			if (this.container) {
				this.container.removeEventListener('touchstart', this.grabTouch);
				this.container.removeEventListener('mousedown', this.grab);
			}
		}
	}

	render() {
		let card_props = { className: 'og-card' };
		if (this.props.className) card_props.className += ' ' + this.props.className;
		if (this.state.grabbed) card_props.className += ' og-hidden';

		let grabbed_props = {
			className: 'og-card-grabbed',
			style: {
				height: this.state.height,
				width: this.state.width,
			},
		};

		if (this.props.grabbedClassName) grabbed_props.className += ' ' + this.props.grabbedClassName;
		if (!this.state.grabbed) grabbed_props.className += ' og-hidden';

		let containerClassName = 'og-card-container';
		if (!this.props.visible) containerClassName += ' og-hidden';

		return (
			<div className={ containerClassName } ref={n => { this.container = n; }}>
				<div { ...card_props } ref={n => { this.placeholder = n; }}>
					{ this.props.children }
				</div>
				<div { ...grabbed_props } ref={n => { this.grabbed = n; }}>
					{ this.props.children }
				</div>
			</div>
		);
	}

	grab(e) {
		// do not grab if the target is a link or button
		if (e.target.tagName !== 'A' && e.target.tagName !== 'BUTTON') {
			// get difference between mouse x/y and Card left/top position
			let left_diff = e.x - this.state.start_left;
			let top_diff = e.y - this.state.start_top;

			// store the difference, and set grabbed flag to show grabbed element
			this.setState({ 
				grabbed: true,
				left_diff,
				top_diff,
			}, () => {
				this.props.showNext();
				this.setGrabbedPos(e.x, e.y);
			});

			document.addEventListener('mousemove', this.move);
			document.addEventListener('mouseup', this.drop);
		}
	}

	grabTouch(e) {
		e.preventDefault();

		let coords = {
			x: e.touches[0].clientX,
			y: e.touches[0].clientY,
		};

		// get difference between mouse x/y and top/left of Card
		let left_diff = coords.x - this.state.start_left;
		let top_diff = coords.y - this.state.start_top;

		// store the difference, and set grabbed flag to show grabbed element
		this.setState({
			grabbed: true,
			left_diff,
			top_diff,
		}, () => {
			this.props.showNext();
			this.setGrabbedPos(coords.x, coords.y);
		});

		document.addEventListener('touchmove', this.moveTouch);
		document.addEventListener('touchend', this.dropTouch);
	}

	drop(e) {
		// get whole number from style.left and style.top
		if (/(-?\d+).*px/.test(this.grabbed.style.left) 
			&& /(-?\d+).*px/.test(this.grabbed.style.top)) {
			let x = /(-?\d+).*px/.exec(this.grabbed.style.left)[1];
			let y = /(-?\d+).*px/.exec(this.grabbed.style.top)[1];

			this.fireDroppedEvents(parseInt(x), parseInt(y));
		}

		// remove grabbed flag, so that grabbed Card is no longer shown
		// remove nullify_click flag so that next Card could be clicked
		this.setState({ 
			grabbed: false,
			nullify_click: false,
		});

		document.removeEventListener('mousemove', this.move);
		document.removeEventListener('mouseup', this.drop);
	}

	dropTouch(e) {
		// get whole number from style.left and style.top
		if (/(-?\d+).*px/.test(this.grabbed.style.left) 
			&& /(-?\d+).*px/.test(this.grabbed.style.top)) {
			let x = /(-?\d+).*px/.exec(this.grabbed.style.left)[1];
			let y = /(-?\d+).*px/.exec(this.grabbed.style.top)[1];

			this.fireDroppedEvents(parseInt(x), parseInt(y));
		}

		// remove grabbed flag, so that grabbed Card is no longer shown
		// remove nullify_click flag so that next Card could be clicked
		this.setState({ 
			grabbed: false,
			nullify_click: false,
		});

		document.removeEventListener('touchmove', this.moveTouch);
		document.removeEventListener('touchend', this.dropTouch);
	}

	move(e) {
		this.setGrabbedPos(e.x, e.y);
	}

	moveTouch(e) {
		let x = e.touches[0].clientX;
		let y = e.touches[0].clientY;

		this.setGrabbedPos(x, y);
	}

	setGrabbedPos(x, y) {
		// calculate top/left of Card based on difference between mouse x/y and top/left of Card
		let left_move = x - this.state.start_left - this.state.left_diff;
		let top_move = y - this.state.start_top - this.state.top_diff;

		// if there is a directional limit, do not move past that limit
		if (this.props.bottom_limit && (top_move > this.props.bottom_limit - this.state.start_bottom))
			top_move = this.props.bottom_limit - this.state.start_bottom;
		else if (this.props.top_limit && (this.state.start_top + top_move < this.props.top_limit))
			top_move = this.props.top_limit - this.state.start_top;

		if (this.props.right_limit && (left_move > this.props.right_limit - this.state.start_right))
			left_move = this.props.right_limit - this.state.start_right;
		else if (this.props.left_limit && (this.state.start_left + left_move < this.props.left_limit))
			left_move = this.props.left_limit - this.state.start_left;

		this.grabbed.style.left = left_move + 'px';
		this.grabbed.style.top = top_move + 'px';

		// is this a click? if so, set nullify click so
		// that click event is not fired on drop
		if (this.props.click_bound && !this.state.nullify_click 
			&& (left_move > this.props.click_bound || top_move > this.props.click_bound))
			this.setState({ nullify_click: true });

		this.animate(left_move, top_move);
	}

	// check which direction it was dragged the furthest, and fire the corresponding 
	// directional prop function
	fireDroppedEvents(x, y) {
		let direction = null;
		let amount = 0;

		let abs = Math.abs;

		if (this.props.onRight && x > this.props.right_trigger && x > amount) {
			direction = 'right';
			amount = x;
		} else if (this.props.onLeft && x < this.props.left_trigger && abs(x) > amount) {
			direction = 'left';
			amount = abs(x);
		}

		if (this.props.onBottom && y > this.props.bottom_trigger && y > amount) {
			direction = 'bottom';
			amount = y;
		} else if (this.props.onTop && y < this.props.top_trigger && abs(y) > amount) {
			direction = 'top';
			amount = abs(y);
		}

		if (this.props.onClick && !direction && !this.state.nullify_click)
			direction = 'click';

		// revert any outside animations to (0, 0) position
		if (this.props.animationHook) this.props.animationHook(0, 0);

		switch (direction) {
			case 'top':
				this.props.onTop(this.props.data, amount);
				break;
			case 'right':
				this.props.onRight(this.props.data, amount);
				break;
			case 'bottom':
				this.props.onBottom(this.props.data, amount);
				break;
			case 'left':
				this.props.onLeft(this.props.data, amount);
				break;
			case 'click':
				this.props.onClick(this.props.data);
				break;
			default:
				this.props.revert();
				break;
		}
	}

	// set the size/position of the Card for use in later functions
	setStateSize() {
		if (typeof document !== 'undefined') {
			let rect = this.container.getBoundingClientRect();

			let new_state = {
				start_top: rect.top,
				start_right: rect.right,
				start_bottom: rect.bottom,
				start_left: rect.left,
				width: this.placeholder.clientWidth,
				height: this.placeholder.clientHeight,
			};

			let elem = this.container;

			if (!this.props.undraggable) {
				elem.addEventListener('touchstart', this.grabTouch);
				elem.addEventListener('mousedown', this.grab);
			}

			this.setState(new_state);
		}
	}

	// if there is an animate Map, run all passed animation functions and update styles
	animate(x, y) {
		if (this.state.animate) {
			if (!this.grabbed) return;

			for (let animation of this.state.animate) {
				if (typeof this.grabbed.style[animation[0]] !== 'undefined') {
					this.grabbed.style[animation[0]] = animation[1](x, y);
				} else
					console.error(animation[0] + ' is not a css attribute. Check the animate prop of Card.');
			}
		}

		if (this.props.animationHook) 
			this.props.animationHook(x, y);
	}
}

export default Card;
