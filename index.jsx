import React from 'react';
import ReactDOM from 'react-dom';

import moment from 'moment';

import d3 from 'd3';
import c3 from 'c3';

import data from './data.json';

import { map, forEach, values, keys, toArray, last } from 'lodash';

import './node_modules/c3/c3.css';
import './style.css';

c3.chart.internal.fn.getAreaBaseValue = function () {
	return -100;
};

const compileTooltip = (date, account, globalIndex) => {
	const formatDate = moment(date).format('MM/DD/YYYY');
	return `<div class="tooltip-custom">
		<div class="tooltip-custom-header">
			<div class="date-value">
				${formatDate}
			</div>
			<div class="returns-percent-text">
				<span>% Returns</span>
			</div>
		</div>
		<div class="tooltip-custom-body">
			<div class="account-value">Your account: ${account}%</div>
			<div class="global-index-value">Global Index: ${globalIndex}%</div>
		</div>
	</div>`;
};

export class App extends React.Component {
	componentDidMount() {
		const accountData = map(values(data), row => {
			return row[0];
		});
		const globalIndexData = map(values(data), row => {
			return row[1];
		});
		const xAxis = keys(data);

		const chart = c3.generate({
			bindto: '#chart',
			data: {
				x: 'x',
				columns: [
					['x', ...xAxis],
					['account', ...accountData],
					['globalIndex', ...globalIndexData]
				],
				types: {
					account: 'area',
					globalIndex: 'line'
				}
			},
			axis: {
				y: {
					show: false,
					max: 3,
				},
				x: {
					type: 'timeseries',
					tick: {
						format: function (x) {
							const day = parseInt(moment(x).date(), 10);
							/*if (day === 29 || day === 30 || day === 31) {
								const lastDayOfMonth = moment(x).endOf('month').date();

								if (day === lastDayOfMonth) {
									return `F`;
								}
							}*/
							return day % 5 === 0 ? day : '';
						},
						fit: true,
						count: keys(data).length,
						culling: false
					}
				}
			},
			point: {
				show: false
			},
			grid: {
				y: {
					show: true,
					lines: [
						{value: -3, text: '-3%', position: 'start'},
						{value: -2, text: '-2%', position: 'start'},
						{value: -1, text: '-1%', position: 'start'},
						{value: 0, text: '0%', position: 'start'},
						{value: 1, text: '1%', position: 'start'},
						{value: 2, text: '2%', position: 'start'},
						{value: 3, text: '3%', position: 'start'}
					]
				}
			},
			legend: {
				show: true
			},
			area: { zerobased: true },
			color: {
				pattern: ['#fadB85', '#5793e1']
			},
			tooltip: {
				position: function (data, width, height, element) {
					const left = parseInt(element.getAttribute('x'), 10);
					const elementWidth = parseInt(element.getAttribute('width'), 10) / 2;
					return { top: 0, left: left + elementWidth }
				},
				contents: function (data, defaultTitleFormat, defaultValueFormat, color) {
					const [ account, globalIndex ] = data;
					return compileTooltip(account.x, account.value, globalIndex.value);
				}
			}
		});

		const months = ['January', 'February', 'March'];
		const svgWidth = d3.select('svg').attr('width');
		const monthPosition = (svgWidth / months.length) - 50;

		const axisX = d3.select('.' + c3.chart.internal.fn.CLASS.axisX);
		const ticks = axisX.selectAll('.tick line')[0];

		const dates = keys(data);

		forEach(ticks, (tick, index) => {
			const date = dates[index];
			const day = parseInt(moment(date).date(), 10);
			const isLastDay = day === moment(date).endOf('month').date();

			if (isLastDay) {
				tick.setAttribute('y2', 50);
			} else if (day % 5 === 0 && !isLastDay) {
				tick.setAttribute('y2', 0);
			} else if (day % 5 !== 0 && !isLastDay) {
				tick.setAttribute('y2', 20);
				tick.setAttribute('y1', 8);
			}
		});

		forEach(months, (month, index) => {
			axisX
				.append('text')
				.text(month)
				.attr('class', 'month')
				.attr('x', (monthPosition / 2) + index * monthPosition)
				.attr('y', 45)
				.attr('font-size', 16)
		});
	}
	render() {
		return (
      <div>
				<div id="chart"></div>
			</div>
		);
	}
}

ReactDOM.render(<App/>, document.querySelector('.root'));
