import React, { Component } from 'react';
import ReactDOM from 'react-dom';

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
			start_top: undefined,
			start_left: undefined,
			grabbed: false,
			left_diff: 0,
			top_diff: 0,
		};
	}

	componentDidMount() {
		if (this.props.visible) this.setStateSize();
	}

	componentDidUpdate(prevProps) {
		if (!prevProps.visible && this.props.visible) this.setStateSize();
	}

	componentWillUnmount() {
		if (typeof document !== 'undefined') {
			this.state.elem.removeEventListener('touchstart', this.grabTouch);
			this.state.elem.removeEventListener('mousedown', this.grab);
		}
	}

	render() {
		let card_props = {
			className: 'og-card',
		};

		if (this.state.grabbed) {
			card_props.className = 'hidden';
		}

		let grabbed_props = {
			className: 'og-card-grabbed',
			style: {
				height: this.state.height,
				width: this.state.width,
			},
		};

		if (!this.state.grabbed) grabbed_props.className += ' hidden';

		let container_className = 'og-card-container';

		if (!this.props.visible) container_className += ' hidden';

		return (
			<div className={ container_className }>
				<div { ...card_props } ref={(n) => { this.placeholder = n; }}>
					{ this.props.children }
				</div>
				<div { ...grabbed_props } ref={(n) => { this.grabbed = n; }}>
					{ this.props.children }
				</div>
			</div>
		);
	}

	grab(e) {
		let left_diff = e.x - this.state.start_left;
		let top_diff = e.y - this.state.start_top;

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

	grabTouch(e) {
		e.preventDefault();

		let coords = {
			x: e.touches[0].clientX,
			y: e.touches[0].clientY,
		};

		let left_diff = coords.x - this.state.start_left;
		let top_diff = coords.y - this.state.start_top;

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
		if (/(-?\d+).*px/.test(this.grabbed.style.left) 
			&& /(-?\d+).*px/.test(this.grabbed.style.top)) {
			let x = /(-?\d+).*px/.exec(this.grabbed.style.left)[1];
			let y = /(-?\d+).*px/.exec(this.grabbed.style.top)[1];

			this.fireDroppedEvents(parseInt(x), parseInt(y));
		}

		this.setState({ grabbed: false });

		document.removeEventListener('mousemove', this.move);
		document.removeEventListener('mouseup', this.drop);
	}

	dropTouch(e) {
		if (/(-?\d+).*px/.test(this.grabbed.style.left) 
			&& /(-?\d+).*px/.test(this.grabbed.style.top)) {
			let x = /(-?\d+).*px/.exec(this.grabbed.style.left)[1];
			let y = /(-?\d+).*px/.exec(this.grabbed.style.top)[1];

			this.fireDroppedEvents(parseInt(x), parseInt(y));
		}

		this.setState({ grabbed: false });

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
		this.grabbed.style.left = 
			(x - this.state.start_left - this.state.left_diff) + 'px';
		this.grabbed.style.top = 
			(y - this.state.start_top - this.state.top_diff) + 'px';
	}

	fireDroppedEvents(x, y) {
		let direction = null;
		let amount = 0;

		let abs = Math.abs;

		if (this.props.onRight && x > this.props.right_bound && x > amount) {
			direction = 'right';
			amount = x;
		} else if (this.props.onLeft && x < this.props.left_bound && abs(x) > amount) {
			direction = 'left';
			amount = abs(x);
		}

		if (this.props.onBottom && y > this.props.bottom_bound && y > amount) {
			direction = 'bottom'
			amount = y;
		} else if (this.props.onTop && y < this.props.top_bound && abs(y) > amount) {
			direction = 'top';
			amount = abs(y);
		}

		switch (direction) {
			case 'top':
				this.props.onTop(amount);
				break;
			case 'right':
				this.props.onRight(amount);
				break;
			case 'bottom':
				this.props.onBottom(amount);
				break;
			case 'left':
				this.props.onLeft(amount);
				break;
			default:
				this.props.revert();
				break;
		}
	}

	setStateSize() {
		let rect = ReactDOM.findDOMNode(this)
			.getBoundingClientRect();

		let start_top = rect.top;
		let start_left = rect.left;

		if (typeof document !== 'undefined') {
			let elem = ReactDOM.findDOMNode(this);

			elem.addEventListener('touchstart', this.grabTouch);
			elem.addEventListener('mousedown', this.grab);

			this.setState({ 
				element: elem,
				width: this.placeholder.clientWidth,
				height: this.placeholder.clientHeight,
				start_top,
				start_left,
			});
		}
	}
}

export default Card;
