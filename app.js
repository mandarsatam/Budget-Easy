//Budget Controller
var budgetController = (function () {
	//Some code
	var Income = function (id, description, value) {
		this.id = id;
		this.description = description;
		this.value = value;
	};

	var Expense = function (id, description, value) {
		this.id = id;
		this.description = description;
		this.value = value;
	};

	Expense.prototype.calcPercentage = function (totalInc) {
		if (totalInc > 0) {
			this.percentage = Math.round((this.value / totalInc) * 100);
		} else {
			this.percentage = -1;
		}
	};

	Expense.prototype.getPercentage = function () {
		return this.percentage;
	};

	var calcTotal = function (type) {
		var sum = 0;
		data.allItems[type].forEach(function (curr) {
			sum += curr.value;
		});
		data.total[type] = sum;
	};

	var data = {
		allItems: {
			inc: [],
			exp: [],
		},
		total: {
			inc: 0,
			exp: 0,
		},
		budget: 0,
		percentage: -1,
	};

	return {
		addItem: function (type, description, value) {
			var newItem, ID;
			if (data.allItems[type].length > 0) {
				ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
			} else {
				ID = 0;
			}
			if (type === "exp") {
				newItem = new Expense(ID, description, value);
			} else if (type === "inc") {
				newItem = new Income(ID, description, value);
			}
			data.allItems[type].push(newItem);
			return newItem;
		},

		deleteItem: function (type, id) {
			var ids = data.allItems[type].map(function (curr) {
				return curr.id;
			});
			var index = ids.indexOf(id);
			if (index !== -1) {
				data.allItems[type].splice(index, 1);
			}
		},

		calculateBudget: function () {
			// Calculate inc and exp
			calcTotal("exp");
			calcTotal("inc");

			//Calculate Budget
			data.budget = data.total.inc - data.total.exp;

			//Calculate percentage
			if (data.total.inc > 0) {
				data.percentage = Math.round((data.total.exp / data.total.inc) * 100);
			} else {
				data.percentage = -1;
			}
		},

		calculatePercentage: function () {
			//
			data.allItems.exp.forEach(function (curr) {
				curr.calcPercentage(data.total.inc);
			});
		},

		getPercentage: function () {
			var allPerc = data.allItems.exp.map(function (curr) {
				return curr.getPercentage();
			});
			return allPerc;
		},

		getBudget: function () {
			return {
				budget: data.budget,
				totalInc: data.total.inc,
				totalExp: data.total.exp,
				percentage: data.percentage,
			};
		},

		testing: function () {
			console.log(data);
		},
	};
})();

//UI Contorller
var uiController = (function () {
	//Some code
	var domStrings = {
		inputType: ".add__type",
		inputDescription: ".add__description",
		inputValue: ".add__value",
		inputButton: ".add__btn",
		incomeContainer: ".income__list",
		expenseContainer: ".expenses__list",
		budgetLabel: ".budget__value",
		incomeLabel: ".budget__income--value",
		expenseLabel: ".budget__expenses--value",
		percentageLabel: ".budget__expenses--percentage",
		container: ".container",
		expensesPercentageLabel: ".item__percentage",
		currentMonth: ".budget__title--month",
	};

	var format = function (num, type) {
		var numSplit, int, dec, sign;
		num = Math.abs(num);
		num = num.toFixed(2);
		numSplit = num.split(".");
		int = numSplit[0];
		if (int.length > 3) {
			int =
				int.substring(0, int.length - 3) +
				"," +
				int.substring(int.length - 3, int.length);
		}
		dec = numSplit[1];

		return (type === "exp" ? "-" : "+") + " " + int + "." + dec;
	};

	var nodeListForEach = function (list, callback) {
		for (var i = 0; i < list.length; i++) {
			callback(list[i], i);
		}
	};
	var checkIncExp = function (checkBox) {
		if (checkBox.checked == true) {
			return "exp";
		} else {
			return "inc";
		}
	};

	return {
		getInput: function () {
			return {
				inputType: checkIncExp(document.getElementById("1")),
				inputDescription: document.querySelector(domStrings.inputDescription)
					.value,
				inputValue: parseFloat(
					document.querySelector(domStrings.inputValue).value
				),
			};
		},

		addListItem: function (obj, type) {
			//Add the html string
			var html, element, newHTML;
			if (type === "inc") {
				element = domStrings.incomeContainer;
				html =
					'<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div> </div> </div>';
			} else if (type === "exp") {
				element = domStrings.expenseContainer;
				html =
					'<div class="item clearfix" id="exp-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__percentage">21%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div> </div> </div>';
			}

			newHTML = html.replace("%id%", obj.id);
			newHTML = newHTML.replace("%description%", obj.description);
			newHTML = newHTML.replace("%value%", format(obj.value, type));

			document.querySelector(element).insertAdjacentHTML("beforeend", newHTML);
		},

		deleteListItem: function (selectorId) {
			var el = document.getElementById(selectorId);
			el.parentNode.removeChild(el);
		},

		clearFields: function () {
			var fields, fieldsArr;

			fields = document.querySelectorAll(
				domStrings.inputDescription + ", " + domStrings.inputValue
			);

			fieldsArr = Array.prototype.slice.call(fields);

			fieldsArr.forEach(function (current, index, array) {
				current.value = "";
			});
			fieldsArr[0].focus();
		},

		addBudget: function (obj) {
			var type;
			obj.budget > 0 ? (type = "inc") : (type = "exp");
			document.querySelector(domStrings.budgetLabel).innerHTML = format(
				obj.budget,
				type
			);
			document.querySelector(domStrings.incomeLabel).innerHTML = format(
				obj.totalInc,
				"inc"
			);
			document.querySelector(domStrings.expenseLabel).innerHTML = format(
				obj.totalExp,
				"exp"
			);
			if (obj.percentage > 0) {
				document.querySelector(domStrings.percentageLabel).innerHTML =
					obj.percentage + "%";
			} else {
				document.querySelector(domStrings.percentageLabel).innerHTML = "---";
			}
		},

		displayPercentages: function (percentages) {
			var fields = document.querySelectorAll(
				domStrings.expensesPercentageLabel
			);

			nodeListForEach(fields, function (curr, index) {
				if (percentages[index] > 0) {
					curr.textContent = percentages[index] + "%";
				} else {
					curr.textContent = "---";
				}
			});
		},

		getMonth: function () {
			var now, year, month, year, months;
			now = new Date();
			year = now.getFullYear();
			month = now.getMonth();
			months = [
				"January",
				"February",
				"March",
				"April",
				"May",
				"June",
				"July",
				"August",
				"September",
				"October",
				"November",
				"December",
			];
			document.querySelector(domStrings.currentMonth).textContent =
				months[month] + " " + year;
		},

		changeType: function () {
			var fields = document.querySelectorAll(
				domStrings.inputType +
					"," +
					domStrings.inputDescription +
					"," +
					domStrings.inputValue
			);
			nodeListForEach(fields, function (curr) {
				curr.classList.toggle("red-focus");
			});

			document.querySelector(domStrings.inputButton).classList.toggle("red");
		},

		getDomStrings: function () {
			return domStrings;
		},
	};
})();

//Global App Controller
var appController = (function (budgetCtrl, uiCtrl) {
	var dom = uiCtrl.getDomStrings();

	var domEventListeners = function () {
		document
			.querySelector(dom.inputButton)
			.addEventListener("click", ctrlAddItem);

		document.addEventListener("keypress", function (event) {
			if (event.keyCode == 13) {
				ctrlAddItem();
			}
		});

		document
			.querySelector(dom.container)
			.addEventListener("click", ctrlDeleteItem);

		document
			.querySelector(dom.inputType)
			.addEventListener("change", uiCtrl.changeType);
	};

	var calcBudget = function () {
		//5. Calculate the budget.
		budgetCtrl.calculateBudget();
		budgetObj = budgetCtrl.getBudget();

		//6. Add the final budget to the UI.
		uiCtrl.addBudget(budgetObj);
	};

	var calcPercentage = function () {
		//Calculate Percentages
		budgetCtrl.calculatePercentage();

		//Read percentages from budget Controller
		var percentages = budgetCtrl.getPercentage();

		//Add the percentages to the UI.
		uiCtrl.displayPercentages(percentages);
	};

	var ctrlAddItem = function () {
		//1. Read the input field data
		var input = uiCtrl.getInput();

		if (
			input.inputDescription != "" &&
			!isNaN(input.inputValue) &&
			input.inputValue > 0
		) {
			//2. Add the item to the budget controller
			var newItem = budgetCtrl.addItem(
				input.inputType,
				input.inputDescription,
				input.inputValue
			);

			//3. Add the item to the UI
			uiCtrl.addListItem(newItem, input.inputType);

			//4. Clear input fields
			uiCtrl.clearFields();

			//Update Budget
			calcBudget();

			//Update Percentages
			calcPercentage();
		}
	};

	var ctrlDeleteItem = function (event) {
		var itemId;
		itemId = event.target.parentNode.parentNode.parentNode.parentNode.id;
		if (itemId) {
			splitId = itemId.split("-");
			type = splitId[0];
			id = parseInt(splitId[1]);
			// console.log(type);
			// console.log(id);

			//Delete item from datastructure
			budgetCtrl.deleteItem(type, id);

			//Delete Item from UI
			uiCtrl.deleteListItem(itemId);

			//Update Budget
			calcBudget();

			//Update Percentages
			calcPercentage();
		}
	};

	return {
		init: function () {
			console.log("App has started!");
			uiCtrl.getMonth();
			domEventListeners();
			uiCtrl.addBudget({
				budget: 0,
				totalInc: 0,
				totalExp: 0,
				percentage: -1,
			});
		},
	};
})(budgetController, uiController);

appController.init();
