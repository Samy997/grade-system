window.addEventListener('DOMContentLoaded', () => {
	const fileInput = document.getElementById('fileInput');

	var ExcelToJSON = function (e) {
		const file = fileInput.files[0];

		const rows = [];

		this.parseExcel = function (file) {
			var reader = new FileReader();

			reader.onload = function (e) {
				var data = e.target.result;
				var workbook = XLSX.read(data, {
					type: 'binary'
				});

				workbook.SheetNames.forEach(function (sheetName) {
					// Here is your object
					const sheetArray = XLSX.utils.sheet_to_json(
						workbook.Sheets[sheetName],
						{ raw: false, defval: 'empty', header: 1, blankrows: false }
					);

					if (sheetArray.length > 0) {
						rows.push(sheetArray);

						this.printRows(sheetArray);
					}

					// var json_object = JSON.stringify(rows);
				});
			};

			reader.onerror = function (ex) {
				console.log(ex);
			};

			return reader.readAsBinaryString(file);
		};

		printRows = function (sheetArray) {
			const outputDiv = document.querySelector('.file-output');

			// ANCHOR Create Elements

			const tblResponsiveDiv = document.createElement('div');
			tblResponsiveDiv.classList.add('table-responsive');

			const tbl = document.createElement('table');
			tbl.classList.add('table');

			const tblhd = document.createElement('thead');
			const tblbdy = document.createElement('tbody');

			// ANCHOR standard and sag oblique objects
			let standard = {
				normal: { p: 0, neg: 0 },
				sprain: { p: 0, neg: 0 },
				partialTier: { p: 0, neg: 0 },
				complTier: { p: 0, neg: 0 }
			};

			let sagOblique = {
				normal: { p: 0, neg: 0 },
				sprain: { p: 0, neg: 0 },
				partialTier: { p: 0, neg: 0 },
				complTier: { p: 0, neg: 0 }
			};

			// ANCHOR Loop on the sheet and display it in the table
			sheetArray.forEach((row, index) => {
				const tblRow = document.createElement('tr');
				if (index === 1) {
					row[0] = ' ';
				}
				row.forEach((cellName, cellIndex) => {
					if (index === 0 || cellIndex === 0) {
						const th = document.createElement('th');
						th.setAttribute('scope', 'col');

						th.innerHTML = cellName;

						tblRow.appendChild(th);
					} else {
						const td = document.createElement('td');

						// ANCHOR CHeck if negative
						if (cellName.toLowerCase() === 'neg') {
							td.classList.add('text-danger');

							if (cellIndex > 4) {
								sagOblique[this.getTier(cellIndex)].neg++;
							} else if (cellIndex <= 4) {
								standard[this.getTier(cellIndex)].neg++;
							}
						} else if ((cellName.toLowerCase() === 'p') | 'positive') {
							td.classList.add('text-success');

							if (cellIndex > 4) {
								sagOblique[this.getTier(cellIndex)].p++;
							} else if (cellIndex <= 4) {
								standard[this.getTier(cellIndex)].p++;
							}
						}

						td.innerHTML = cellName;

						tblRow.appendChild(td);
					}
				});

				if (index === 0) {
					tblhd.appendChild(tblRow);
				} else {
					tblbdy.appendChild(tblRow);
				}
			});

			tbl.appendChild(tblhd);
			tbl.appendChild(tblbdy);

			tblResponsiveDiv.appendChild(tbl);

			outputDiv.appendChild(tblResponsiveDiv);

			this.createCanvas(standard, sagOblique);
		};

		getTier = function (index) {
			if (index === 1 || index === 6) {
				return 'normal';
			} else if (index === 2 || index === 7) {
				return 'sprain';
			} else if (index === 3 || index === 8) {
				return 'partialTier';
			} else if (index === 4 || index === 9) {
				return 'complTier';
			}
		};

		this.parseExcel(file);
	};

	createCanvas = function (standard, sagOblique) {
		const chartRow = document.getElementById('chartRow');

		Object.keys(standard).forEach((key) => {
			const chartHolder = document.createElement('div');
			chartHolder.classList.add('chart-holder', 'col-md-6', 'col-sm-12');

			const header = document.createElement('h3');
			header.innerHTML = key.toUpperCase();

			const chart = document.createElement('canvas');
			chart.id = key;

			const ctx = chart.getContext('2d');

			const chartConfig = new Chart(ctx, {
				type: 'bar',
				data: {
					labels: ['Standard', 'Sag Oblique'],
					datasets: [
						{
							label: 'Negative',
							data: [standard[key].neg, sagOblique[key].neg],
							backgroundColor: [
								'rgba(255, 99, 132, 0.2)',
								'rgba(255, 99, 132, 0.2)'
							],
							borderColor: ['rgba(255, 99, 132, 1)', 'rgba(255, 99, 132, 1)'],
							borderWidth: 1,
							barPercentage: 0.8
						},
						{
							label: 'Positive',
							data: [standard[key].p, sagOblique[key].p],
							backgroundColor: [
								'rgba(40, 167, 69, 0.2)',
								'rgba(40, 167, 69, 0.2)'
							],
							borderColor: ['rgba(40, 167, 69, 1)', 'rgba(40, 167, 69, 1)'],
							borderWidth: 1,
							barPercentage: 0.8
						}
					],
					backgroundColor: ['rgba(0, 0, 0, 1)', 'rgba(40, 167, 69, 0.2)']
				},
				options: {
					scales: {
						yAxes: [
							{
								ticks: {
									beginAtZero: true
								}
							}
						]
					}
				}
			});

			// ANCHOR Append chart and header
			chartHolder.appendChild(header);
			chartHolder.appendChild(chart);

			chartRow.appendChild(chartHolder);
		});

		document
			.querySelectorAll('.chart-holder')
			.forEach((item) => (item.style.display = 'block'));

		// ANCHOR Print comparison table
		this.printCompareTbl(standard, sagOblique);
	};

	printCompareTbl = function (standard, sag) {
		// // ANCHOR Create Table responsive DIV
		// const tblResponsive = document.createElement('div');
		// tblResponsive.classList.add('table-responsive');
		// // ANCHOR Create Table Element
		// const tbl = document.createElement('table');
		// tbl.classList.add('table');
		// // ANCHOR Create Header Element
		// const theadEl = document.createElement('thead');
		// // ANCHOR Create Table Body Element
		// const tbodyEl = document.createElement('tbody');
		// // ANCHOR Create Table Rows
		// const trHeaderEl = document.createElement('tr');
		// const trCmpltEl = document.createElement('tr');
		// const trPrtEl = document.createElement('tr');
		// // ANCHOR Table head array
		// thArray = [
		// 	'Type',
		// 	'Standard MRI protocol',
		// 	'Saggital dolique protocol',
		// 	'Test value',
		// 	'P-value',
		// 	'Sig.'
		// ];
		// thArray.forEach((value) => {
		// 	// ANCHOR Create th element
		// 	const thEl = document.createElement('th');
		//   thEl.innerHTML = value;
		//   trHeaderEl.appendChild(thEl);
		// });
		// trCmpltEl.innerHTML = `
		//   <td>Complete</td>
		//   <td><p>Negative</p><p>Positive</p></td>
		//   <td>
		//   <p>${standard.complTier.neg}(${(standard.complTier.neg / 20) * 100}%)</p>
		//   <p>${standard.complTier.p}(${(standard.complTier.p / 20) * 100}%)</p>
		//   </td>
		//   <td>
		//   <p>${standard.partialTier.neg}(${(standard.partialTier.neg / 20) * 100}%)</p>
		//   <p>${standard.partialTier.p}(${(standard.partialTier.p / 20) * 100}%)</p>
		//   </td>
		// `
	};

	fileInput.addEventListener('change', ExcelToJSON, this);
});
