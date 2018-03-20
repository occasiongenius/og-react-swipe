import React, { Component } from 'react';
import Card from '../Card';
import CardButton from '../CardButton';

import { throttle } from '../../utility.js';

class CardStack extends Component {
	constructor(props) {
		super(props);

		this.onTop = this.onTop.bind(this);
		this.onRight = this.onRight.bind(this);
		this.onBottom = this.onBottom.bind(this);
		this.onLeft = this.onLeft.bind(this);
		this.onClick = this.onClick.bind(this);
		this.revert = this.revert.bind(this);
		this.showNext = this.showNext.bind(this);

		let diff = this.props.diff ? this.props.diff : 100;

		this.state = {
			top_trigger: -diff,
			right_trigger: diff,
			bottom_trigger: diff,
			left_trigger: -diff,
			click_bound: this.props.clickBound ? this.props.clickBound : 1,
			onTop: this.props.onTop ? this.onTop : undefined,
			onRight: this.props.onRight ? this.onRight : undefined,
			onBottom: this.props.onBottom ? this.onBottom : undefined,
			onLeft: this.props.onLeft ? this.onLeft : undefined,
			onClick: this.props.onClick ? this.onClick : undefined,
			currently_viewed: this.props.viewIndex || 0,
			next_overlay: this.props.nextOverlay ? this.props.nextOverlay : undefined,
		};

		let children = this.getSortedChildren(this.props.children);

		this.state.cards = children.cards;
		this.state.interact = children.interact;

		this.refs = {};
	}

	componentDidMount() {
		if (this.container 
			&& (typeof this.props.limit !=='undefined' 
			|| typeof this.props.topLimit !== 'undefined'
			|| typeof this.props.rightLimit !== 'undefined' 
			|| typeof this.props.bottomLimit !== 'undefined' 
			|| typeof this.props.leftLimit !== 'undefined')) {
			
			let rect = this.container.getBoundingClientRect();

			let new_state = {
				top_limit: typeof this.props.topLimit !== 'undefined' ?
					rect.top - this.props.topLimit :
						typeof this.props.limit !== 'undefined' ? 
							rect.top - this.props.limit : undefined,
				right_limit: typeof this.props.rightLimit !== 'undefined' ?
					rect.right + this.props.rightLimit :
						typeof this.props.limit !== 'undefined' ? 
							rect.right + this.props.limit : undefined,
				bottom_limit: typeof this.props.bottomLimit !== 'undefined' ?
					rect.bottom + this.props.bottomLimit :
						typeof this.props.limit !== 'undefined' ? 
							rect.bottom + this.props.limit : undefined,
				left_limit: typeof this.props.leftLimit !== 'undefined' ?
					rect.left - this.props.leftLimit :
						typeof this.props.limit !== 'undefined' ? 
							rect.left - this.props.limit : undefined,
			};

			this.setState(new_state);
		}
	}

	componentWillReceiveProps(nextProps) {
		if (nextProps.children !== this.props.children) {
			let children = this.getSortedChildren(nextProps.children);

			this.setState({ 
				cards: children.cards,
				interact: children.interact,
			});
		}
	}

	render() {
		let className = 'og-card-stack';
		if (this.props.className) className += ' ' + this.props.className;

		let default_child_props = {
			top_trigger: this.state.top_trigger,
			right_trigger: this.state.right_trigger,
			bottom_trigger: this.state.bottom_trigger,
			left_trigger: this.state.left_trigger,
			click_bound: this.state.click_bound,
			onTop: this.state.onTop,
			onRight: this.state.onRight,
			onBottom: this.state.onBottom,
			onLeft: this.state.onLeft,
			onClick: this.state.onClick,
			revert: this.revert,
			showNext: this.showNext,
			top_limit: this.state.top_limit,
			right_limit: this.state.right_limit,
			bottom_limit: this.state.bottom_limit,
			left_limit: this.state.left_limit,
			next_overlay: this.state.next_overlay,
		};

		if (this.state.styleOnMove) default_child_props.styleOnMove = this.state.styleOnMove;

		let children = [];

		if (this.state.cards && this.state.cards.length > 0) {
			let cards = this.state.cards.map((child, i) => {
				if (this.state.currently_viewed == i
					|| (this.state.next_visible && this.state.currently_viewed + 1 == i)) {
					let nested_child = null;

					if (child.props && child.props.children)
						nested_child = child.props.children;

					let child_props = {
						...child.props, 
						...default_child_props,
						visible: this.state.currently_viewed - 1 !== i,
					};

					return React.cloneElement(child, child_props, nested_child);
				}
			});

			children = children.concat(cards);
		}

		if (this.state.interact && this.state.interact.length > 0) {
			let interact = this.state.interact.map((child, i) => {
				if (!child.props.onClick) {
					console.error('CardButton must be provided an onClick string or function.');
					return null;
				}

				// pass currently_viewed data for functions
				let nested_child = null;
				
				if (child.props && child.props.children)
					nested_child = child.props.children;

				let child_props = {
					...child.props,
					data: this.state.cards[this.state.currently_viewed].props.data,
				};

				switch (child.props.onClick) {
					case 'top':
						child_props.onClick = data => {
							this.props.onTop(data, { x: 0, y: 0 });
							this.incrementView();
						};
						break;
					case 'right':
						child_props.onClick = data => {
							this.props.onTop(data, { x: 0, y: 0 });
							this.incrementView();
						};
						break;
					case 'bottom':
						child_props.onClick = data => {
							this.props.onTop(data, { x: 0, y: 0 });
							this.incrementView();
						};
						break;
					case 'left':
						child_props.onClick = data => {
							this.props.onTop(data, { x: 0, y: 0 });
							this.incrementView();
						};
						break;
					default:
						if (typeof child_props.onClick !== 'function') {
							console.error('onClick property for CardButton must be a function or one of strings: \'top\', \'right\', \'bottom\', or \'left\'.');
							return null;
						}

						child_props.onClick = child.props.onClick;
						break;
				}

				return React.cloneElement(child, child_props, nested_child);
			});

			children.push(
				<div className="og-buttons" key="og-buttons">
					{ interact }
				</div>
			);
		}

		if (children.length == 0) children = null;

		let style = { ...this.props.style };

		return (
			<div className={ className } style={ style } ref={ n => { this.container = n; } }>
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

	onClick(data) {
		this.props.onClick(data);

		this.setState({ next_visible: false });
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
			if (this.props.onRunOut && currently_viewed >= this.state.cards.length)
				this.props.onRunOut();
		});
	}

	getSortedChildren(children) {
		let flat_children = [];

		// flatten children
		for (let i = 0; i < children.length; i++) {
			if (Array.isArray(children[i])) {
				flat_children = flat_children.concat(children[i]);
			} else {
				flat_children.push(children[i]);
			}
		}

		let cards = [];
		let interact = [];


		cards = flat_children.filter(child => child.type == Card);

		interact = flat_children.filter(child => child.type == CardButton);

		return {
			cards,
			interact,
		};
	}
}

export default CardStack;
