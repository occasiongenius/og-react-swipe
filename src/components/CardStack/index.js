import React, { Component } from 'react';
import ReactDOM from 'react-dom';

class CardStack extends Component {
	constructor(props) {
		super(props);

		this.state = {
			top_bound: undefined,
			right_bound: undefined,
			bottom_bound: undefined,
			left_bound: undefined,
			onTop: this.props.onTop || undefined,
			onRight: this.props.onRight || undefined,
			onBottom: this.props.onBottom || undefined,
			onLeft: this.props.onLeft || undefined,
		};
	}
	
	componentDidMount() {
		let rect = ReactDOM.findDOMNode(this)
			.getBoundingClientRect();

		if (rect) {
			let diff = this.props.diff || 20;

			this.setState({
				top_bound: rect.top - diff,
				right_bound: rect.right + diff,
				bottom_bound: rect.bottom + diff,
				left_bound: rect.left - diff,
			});
		}
	}

	render() {
		let className = 'og-card-stack';

		if (this.props.className) className += ' ' + this.props.className;

		let children = this.props.children.map(child => {
			return React.cloneElement(child, this.state, null);
		});

		return (
			<div className={ className }>
				{ children }
			</div>
		);
	}
}

export default CardStack;
