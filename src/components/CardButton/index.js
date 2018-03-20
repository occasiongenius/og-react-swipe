import React, { Component } from 'react';

class CardButton extends Component {
	constructor(props) {
		super(props);

		this.click = this.click.bind(this);
	}

	shouldComponentUpdate(nextProps, nextState) {
		return nextProps.data !== this.props.data;
	}
	
	render() {
		let children = null;

		if (typeof this.props.children === 'function') {
			children = this.props.children(this.props.data);
		} else {
			children = this.props.children;
		}
		/*if (this.props.createChild && typeof this.props.createChild === 'function')
			children = this.props.createChild(this.props.data);
		else
			children = this.props.children*/

		return (
			<button 
				onClick={ this.click } 
				style={ this.props.style || {} }
				className={ this.props.className ? this.props.className + ' og-button' : 'og-button' }>
				{ children }
			</button>
		);
	}

	click() {
		if (this.props.onClick && typeof this.props.onClick === 'function')
			this.props.onClick(this.props.data);
	}
}

export default CardButton;
