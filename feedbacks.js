const { combineRgb } = require('@companion-module/base')

module.exports = async function (self) {
	self.setFeedbackDefinitions({
		leqThreshold: {
			name: 'Leq Threshold',
			type: 'boolean',
			label: 'Leq Above Threshold',
			defaultStyle: {
				bgcolor: combineRgb(255, 0, 0),
				color: combineRgb(255, 255, 255),
			},
			options: [
				{
					id: 'threshold',
					type: 'number',
					label: 'Threshold (dBA)',
					default: 85,
					min: 0,
					max: 140,
				},
			],
			callback: (feedback) => {
				const currentLeq = parseFloat(self.getVariableValue('current_leq'))
				return currentLeq > feedback.options.threshold
			},
		},
	})
}
