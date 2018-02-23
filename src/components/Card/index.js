import React, { Component } from 'react';

class Card extends Component {
	constructor(props) {
		super(props);

		this.drag = this.drag.bind(this);
		this.drop = this.drop.bind(this);
	}

	render() {
		let props = {};

		if (this.props.top_bound) {
			props = {
				draggable: true,
				onDragStart: this.drag,
				//onDrag: this.move,
				onDragEnd: this.drop,
				onTouchStart: this.drag,
				//onTouchMove: this.move,
				onTouchEnd: this.drop,
			};
		}

		if (this.props.className) props.className = this.props.className;

		return (
			<div { ...props }>
				{ this.props.children }
			</div>
		);
	}

	drag({ target }) {
		console.log('drag');
		console.log(target);
	}

	move(e) {
		console.log('move');
		//console.log(e.clientX);
	}

	drop(e) {
		console.log('drop');
		console.log(e.clientX);
	}
}

export default Card;
