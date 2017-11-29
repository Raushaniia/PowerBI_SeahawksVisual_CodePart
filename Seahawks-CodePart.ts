        public update(options: VisualUpdateOptions) {
            this.clear();
            if (!this.optionsIsCorrect(options)) {
                return;
            }

            this.updateViewport(options.viewport);

            this.settings = this.parseSettings(options.dataViews[0]);
			
			//parsing data only in case of data changing update event 
            if (options.type === ChangeDataType || options.type === ChangeAllType) {
                if (!this.currentOptions || this.dataChanged(this.currentOptions.dataViews[0].categorical, options.dataViews[0].categorical)) {
                    this.getMultichartData(options);
					this.getLineChartData(options);
                    this.currentOptions = options;
                }
            }

            this.updateFormatting(options);
            this.render(options);
            this.addTooltips(options);
        }

        private render(options: VisualUpdateOptions) {
            let linesDataExists = this.lines.length > 0;

            if (linesDataExists) {
                this.renderLegend();
                this.updateChartMargin();
            }

            let multichartDataExists = this.multiChartElements.length > 0;
            if (multichartDataExists) {
                this.renderMultiChart(options);
            }
			
            if (linesDataExists) {
                this.renderLinesChart(options);
            }

            if (linesDataExists || multichartDataExists) {
                this.addComb();
                this.setLegendEvent();
            }
        }
		
        private renderLegend() {
            let legend: nv.Legend = this.nvd3.models.legend()
                .rightAlign(false)
                .height(this.viewport.height)
                .width(this.viewport.width);

            this.svg.datum(this.lines).call(legend);
        }
		
        private renderMultiChart(options: VisualUpdateOptions) {
            let self = this;
			
            this.dateFormat = this.dateFormat ? this.dateFormat : 'MM/DD/YYYY';
			
            let multiChart: nv.MultiChart = this.createMultiChart(this.settings.axesSettings);

            if (this.isLineValuesFilled()){
                multiChart.xAxis
					.tickFormat(function (d) {
						let date = new Date(d);
						let formatter = valueFormatter.create({format:self.dateFormat});
						return formatter.format(date);
					})
					.rotateLabels(Visual.axisLabelRotateAngle)
					.showMaxMin(false)
					.ticks(Visual.axisTicksCount);
            }
            else{
                multiChart.xAxis
					.tickValues(null)
					.showMaxMin(false)
					.ticks(0);
            }
            multiChart.yAxis2
                .showMaxMin(false)
                .ticks(Visual.axisTicksCount)
                .duration(Visual.defaultDuration);

            this.svg
                .datum(this.multiChartElements)
                .call(multiChart);
        }