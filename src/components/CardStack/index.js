import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import { throttle } from '../../utility.js';

class CardStack extends Component {
	constructor(props) {
		super(props);

		this.onTop = this.onTop.bind(this);
		this.onRight = this.onRight.bind(this);
		this.onBottom = this.onBottom.bind(this);
		this.onLeft = this.onLeft.bind(this);
		this.revert = this.revert.bind(this);
		this.showNext = this.showNext.bind(this);

		this.state = {
			top_bound: undefined,
			right_bound: undefined,
			bottom_bound: undefined,
			left_bound: undefined,
			onTop: this.props.onTop ? this.onTop : undefined,
			onRight: this.props.onRight ? this.onRight : undefined,
			onBottom: this.props.onBottom ? this.onBottom : undefined,
			onLeft: this.props.onLeft ? this.onLeft : undefined,
			currently_viewed: this.props.start_index || 0,
		};

		this.refs = {};
	}
	
	componentDidMount() {
		let diff = this.props.diff || 100;

		this.setState({
			top_bound: -diff,
			right_bound: diff,
			bottom_bound: diff,
			left_bound: -diff,
		});
	}

	render() {
		let className = 'og-card-stack';
		if (this.props.className) className += ' ' + this.props.className;

		let default_child_props = {
			top_bound: this.state.top_bound,
			right_bound: this.state.right_bound,
			bottom_bound: this.state.bottom_bound,
			left_bound: this.state.left_bound,
			onTop: this.state.onTop,
			onRight: this.state.onRight,
			onBottom: this.state.onBottom,
			onLeft: this.state.onLeft,
			revert: this.revert,
			showNext: this.showNext,
		};

		if (this.state.styleOnMove) default_child_props.styleOnMove = this.state.styleOnMove;

		let children;
			
		if (this.props.children && Array.isArray(this.props.children)) {
			children = this.props.children.map((child, i) => {
				let child_props = { 
					...child.props, 
					...default_child_props,
					visible: 
						this.state.currently_viewed == i 
						|| this.state.next_visible && this.state.currently_viewed + 1 == i
						? true : false,
				};

				return React.cloneElement(child, child_props, child_props.children);
			});
		} else if (this.props.children) {
			let child_props = { 
				...this.props.children.props, 
				...default_child_props,
				visible: 
					this.state.currently_viewed == 0
					? true : false,
			};

			children = React.cloneElement(
				this.props.children, 
				child_props, 
				this.props.children.props.children
			);
		}

		let style = { ...this.props.style };

		console.log(children);

		return (
			<div className={ className } style={ style }>
				{ children }
			</div>
		);
	}

	onTop(data, amount) {
		this.props.onTop(data, amount);

		this.incrementView();
	}

	onRight(data,amount) {
		this.props.onRight(data, amount);

		this.incrementView();
	}

	onBottom(data, amount) {
		this.props.onBottom(data, amount);

		this.incrementView();
	}

	onLeft(data, amount) {
		this.props.onLeft(data, amount);

		this.incrementView();
	}

	revert() {
		this.setState({ next_visible: false });
	}

	showNext() {
		this.setState({ next_visible: true });
	}

	incrementView() {
		let currently_viewed = this.state.currently_viewed + 1;

		this.setState({ currently_viewed, next_visible: false }, () => {
			if (this.props.onRunOut && currently_viewed >= this.props.children.length)
				this.props.onRunOut();
		});
	}
}

export default CardStack;
