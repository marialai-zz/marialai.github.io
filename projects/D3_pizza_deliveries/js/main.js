

// DATASETS

// Global variable with 1198 pizza deliveries
// console.log(deliveryData);

// Global variable with 200 customer feedbacks
// console.log(feedbackData.length);


// FILTER DATA, THEN DISPLAY SUMMARY OF DATA & BAR CHART

createVisualization(deliveryData, feedbackData);
function createVisualization(dData, fData) {
	
	// Filter data
	
	var summaryData = {
		sum_deliveries: 0,
		sum_count: 0,
		avg_time: 0,
		sum_sales: 0,
		sum_feedback: 0,
		feedback_by_category: {},
	};
	
	filterData();
	function filterData (){
		summaryData.sum_deliveries = dData.length - 1;
		var sum_time = 0;
		
		// looping through dData
		for (var i = 0; i < dData.length; i++) {
			summaryData.sum_count += dData[i].count;
			sum_time += dData[i].delivery_time;
			summaryData.sum_sales += dData[i].price;
		} 
		
		summaryData.avg_time = parseInt(sum_time / summaryData.sum_deliveries);
		
		summaryData.sum_feedback = fData.length - 1;
		
		// filter by category
		
		var category_low = fData.filter( function(value) {
			return value.punctuality === "low";
		});
		var category_medium = fData.filter( function(value) {
			return value.punctuality === "medium";
		});
		var category_high = fData.filter( function(value) {
			return value.punctuality === "high";
		});
		
		// save length of categories in an object
		summaryData.feedback_by_category = {low:(category_low.length - 1),medium:(category_medium.length - 1),high:(category_high.length - 1)};
	}
	
	// Display Dataset Summary
	
	modifyDOM();
	function modifyDOM() {
		var displayHTML = '';
		displayHTML += '<p class="data-summary">Number of pizza deliveries: ' + summaryData.sum_deliveries + ' deliveries</p>';
		displayHTML += '<p class="data-summary">Number of all delivered pizzas: ' + summaryData.sum_count + ' pizzas</p>';
		displayHTML += '<p class="data-summary">Average delivery time: ' + summaryData.avg_time + ' minutes</p>';
		displayHTML += '<p class="data-summary">Total sales in USD: $' + summaryData.sum_sales.toFixed(2) + '</p>';
		displayHTML += '<p class="data-summary">Number of all feedback entries: ' + summaryData.sum_feedback + ' entries</p>';
		displayHTML += '<p class="data-summary">Number of feedback entries per quality category:</br><ul><li>Low: ' + summaryData.feedback_by_category.low + '</li><li>Medium: ' + summaryData.feedback_by_category.medium + '</li><li>High: ' + summaryData.feedback_by_category.high + '</li></ul></p>';
		document.getElementById("content").innerHTML = displayHTML;
	}
	
	renderBarChart(dData);
}

function dataManipulation() {
	var selectAreaBox = document.getElementById("area");
	var selectTypeBox = document.getElementById("order-type");
	var selectedAreaValue = selectAreaBox.options[selectAreaBox.selectedIndex].value;
	var selectedTypeValue = selectTypeBox.options[selectTypeBox.selectedIndex].value;
	
	if (selectedAreaValue != "all" && selectedTypeValue != "all") {
		// filter by selected values
		var filteredData = deliveryData.filter( function(value) {
			return (value.area === selectedAreaValue) && (value.order_type === selectedTypeValue);
		});
		createVisualization(filteredData, sortFeedbackData(filteredData));
	} else if (selectedAreaValue === "all" && selectedTypeValue === "all") {
		createVisualization(deliveryData, feedbackData);
	} else if (selectedAreaValue === "all") {
		var filteredData = deliveryData.filter( function(value) {
			return value.order_type === selectedTypeValue;
		});
		createVisualization(filteredData, sortFeedbackData(filteredData));
	} else if (selectedTypeValue === "all") {
		var filteredData = deliveryData.filter( function(value) {
			return value.area === selectedAreaValue;
		});
		createVisualization(filteredData, sortFeedbackData(filteredData));
	}
}

// function to sort feedbackData after deliveryData is filtered
function sortFeedbackData(dData) {
	var sortedFData = []; //array to store sorted feedback data
	
	// loop through filtered deliveries data and match against feedbackData to sort feedbackData
	for (var i = 0; i < dData.length; i++) {
		for (var n = 0; n < feedbackData.length; n++) {
			if (dData[i].delivery_id === feedbackData[n].delivery_id) {
				sortedFData.push(feedbackData[n]);
			}
		}
	}
	
	//return sorted feedback data
	return sortedFData;
}