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
		return (
			<button 
				onClick={ this.click } 
				style={ this.props.style || {} }
				className={ this.props.className ? this.props.className + ' og-button' : 'og-button' }>
				{ this.props.children }
			</button>
		);
	}

	click() {
		if (this.props.onClick)
			this.props.onClick(this.props.data);
	}
}

export default CardButton;
