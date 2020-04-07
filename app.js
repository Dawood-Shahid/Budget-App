var budgetHandler = (function () {

    // constructor functions
    var Expense = function (id, description, ammount) {
        this.id = id;
        this.description = description;
        this.ammount = ammount;
        this.percentage = -1;
    };

    // method set to its prototype property and inherit by each object automatically
    Expense.prototype.calcPercentage = function (totalIncome) {

        if (totalIncome > 0) {
            this.percentage = Math.round((this.ammount / totalIncome) * 100)
        }
    };

    Expense.prototype.getPercentage = function () {
        return this.percentage;
    };

    // constructor functions
    var Income = function (id, description, ammount) {
        this.id = id;
        this.description = description;
        this.ammount = ammount;
    };

    var calculateTotal = function (type) {
        var sum = 0, category;

        category = data.allItems[type];

        category.forEach(function (currentValue) {
            sum += currentValue.ammount;
        });

        data.total[type] = sum;
        // console.log(data.total.income);
    };

    // data Storage structure
    var data = {
        allItems: {
            income: [],
            expense: []
        },
        total: {
            income: 0,
            expense: 0
        },
        budget: 0,
        percentage: -1
    };

    return {
        addItem: function (type, description, ammount) {

            var newItem, ID, category;

            // selection of array according to type
            category = data.allItems[type]; //  (obj > obj > arr)

            if (category.length > 0) {
                // category [last index] obj property 
                ID = category[category.length - 1].id + 1; // (obj > obj > arr > objs)
            }
            else {
                ID = 0;
            }

            if (type === 'income') {
                // creating new objs
                newItem = new Income(ID, description, ammount);
            }
            else if (type === 'expense') {
                // creating new objs
                newItem = new Expense(ID, description, ammount);
            }

            category.push(newItem);

            return newItem;
        },

        deleteItems: function (type, id) {
            var category, index, ids;

            category = data.allItems[type];

            ids = category.map(function (currentValue) {
                return currentValue.id;
            });

            index = ids.indexOf(id);

            if (index !== -1) {
                category.splice(index, 1);
            }
        },

        calculateBudget: function () {
            calculateTotal('income');
            calculateTotal('expense');

            data.budget = data.total.income - data.total.expense;

            if (data.total.income > 0) {
                data.percentage = Math.round((data.total.expense / data.total.income) * 100);
            }
        },

        getBudget: function () {
            return {
                income: data.total.income,
                expense: data.total.expense,
                budget: data.budget,
                percentage: data.percentage
            }
        },

        calculatePercentages: function () {
            data.allItems.expense.forEach(function (current) {
                current.calcPercentage(data.total.income)
            });
        },

        getPercentages: function () {
            var allPercentages;

            allPercentages = data.allItems.expense.map(function (current) {
                return current.getPercentage();
            });

            return allPercentages;
        },

        test: function () {
            console.log(data);
        }
    }
})();

var UIHandler = (function () {

    // setup DOM strings
    var DOMstrings = {
        type: 'type',
        description: '#description',
        ammount: '#ammount',
        addButton: 'addButton',
        income: '.income',
        expense: '.expense',
        totalAmmountLabel: 'currentAmmount',
        incomeAmmountLabel: '.incomeAmmount',
        expenseAmmountLabel: '.expenseAmmount',
        percentageLabel: '.perc',
        itemContainer: '.tableContainer',
        expensePercentageLabel: '.expPerc',
        dateLabel: '.date'
    };

    var formatNumber = function (num, type) {
        var numSplit, int, dec;

        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');

        int = numSplit[0];
        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
        }

        dec = numSplit[1];

        return (type === 'expense' ? '-' : '+') + ' ' + int + '.' + dec;
    };

    return {
        userInput: function () {
            return {
                inputType: document.getElementById(DOMstrings.type).value,
                inputDescription: document.querySelector(DOMstrings.description).value,
                inputAmmount: parseFloat(document.querySelector(DOMstrings.ammount).value)
            }
        },

        listItem: function (obj, type) {
            var HTML, newHTML, container;

            if (type === 'income') {
                container = DOMstrings.income;

                // HTML in string format
                HTML = '<div id="income-%id%"><div class="tableContent"><p>%description%</p><p>%ammount%</p></div><div class="remove"><span><button class="btn">X</button></span></div></div>'
            }
            else if (type === 'expense') {
                container = DOMstrings.expense;

                // HTML in string format
                HTML = '<div id="expense-%id%"><div class="tableContent"><p>%description%</p><span><p>%ammount%</p><span class="expPerc"></span></div><div class="remove"><span><button class="btn">X</button></span></div></div>'
            }

            // replace hard coaded values by user input through placeholder "%_______%"
            newHTML = HTML.replace('%id%', obj.id);
            newHTML = newHTML.replace('%description%', obj.description);
            newHTML = newHTML.replace('%ammount%', formatNumber(obj.ammount, type));

            // display html on web page
            document.querySelector(container).insertAdjacentHTML('beforeend', newHTML);
        },

        deleteListItem: function (selectedItem) {
            var selectEle;

            selectEle = document.getElementById(selectedItem);

            selectEle.parentNode.removeChild(selectEle);
        },

        getDOMstrings: function () {
            return DOMstrings;
        },

        displayBudget: function (obj) {
            var type;

            obj.budget > 0 ? type = 'income' : type = 'expense';

            document.getElementById(DOMstrings.totalAmmountLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeAmmountLabel).textContent = formatNumber(obj.income, 'incone');
            document.querySelector(DOMstrings.expenseAmmountLabel).textContent = formatNumber(obj.expense, 'expense');
            if (obj.percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + ' %';
            }
            else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';
            }
        },

        displayPercentages: function (percentages) {
            var fields, nodeListForEach;

            fields = document.querySelectorAll(DOMstrings.expensePercentageLabel);

            nodeListForEach = function (list, callbackFunction) {
                for (i = 0; i < list.length; i++) {
                    callbackFunction(list[i], i);
                }
            };

            nodeListForEach(fields, function (current, index) {
                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + ' %';
                }
                else {
                    current.textContent = '---';
                }
            });
        },

        displayMonth: function() {
            var now, months, month, year;

            now = new Date();
            
            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            month = now.getMonth();
            year = now.getFullYear();

            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;
        },

        resetFields: function () {
            var fields, fieldsArr;

            // it returns list of elements
            fields = document.querySelectorAll(DOMstrings.description + ', ' + DOMstrings.ammount);

            // converting list elements into array
            fieldsArr = Array.prototype.slice.call(fields);

            fieldsArr.forEach(function (currentElement) {
                currentElement.value = "";
            });

            //for refocous the description field
            fieldsArr[0].focus();
        }
    }
})();

var controler = (function (budgetCtrl, UICtrl) {

    // bind DOM queries togather
    var evenyListners = function () {
        var DOM;

        DOM = UICtrl.getDOMstrings();

        document.getElementById(DOM.addButton).addEventListener('click', ctlrAddItmes);

        document.addEventListener('keypress', function (event) {
            if (event.keyCode === 13 || event.which === 13) {
                ctlrAddItmes();
            }
        });

        document.querySelector(DOM.itemContainer).addEventListener('click', ctrlDeleteItems)
    };

    var ctlrAddItmes = function () {
        var getUserInput, usredata;

        // get user input from UI controler
        getUserInput = UICtrl.userInput();

        if (getUserInput.inputDescription !== "" && !isNaN(getUserInput.inputAmmount) && getUserInput.inputAmmount > 0) {
            // store user inpur in budget controler
            usredata = budgetCtrl.addItem(getUserInput.inputType, getUserInput.inputDescription, getUserInput.inputAmmount);

            // display new item on UI
            UICtrl.listItem(usredata, getUserInput.inputType);

            // reset the input fields
            UICtrl.resetFields();

            // display budget on UI            
            getCalculatedBudget();
        }
    };

    var ctrlDeleteItems = function (event) {
        var itemId, splitID, ID, type;

        // get whole block id of clicked item
        itemId = event.target.parentNode.parentNode.parentNode.id;
        splitID = itemId.split('-');
        type = splitID[0];
        ID = parseInt(splitID[1]);

        // delete items from data structure
        budgetCtrl.deleteItems(type, ID);

        // delete itme from UI
        UICtrl.deleteListItem(itemId);

        // display updated budget
        getCalculatedBudget();

        //calculate & update percentages
        updateParcentages();
    };

    var getCalculatedBudget = function () {
        var calculatedBudget;

        // calculated budget
        budgetCtrl.calculateBudget();

        // get calculated budget
        calculatedBudget = budgetCtrl.getBudget();
        // console.log(calculatedBudget);

        // display budget on UI
        UICtrl.displayBudget(calculatedBudget);

        //calculate & update percentages
        updateParcentages();
    };

    var updateParcentages = function () {
        var percentages;

        // calculate percentages
        budgetCtrl.calculatePercentages();

        // get percentages
        percentages = budgetCtrl.getPercentages();

        // update UI with new percentages
        UICtrl.displayPercentages(percentages);
    };

    return {
        init: function () {
            console.log('app started');
            UICtrl.displayMonth();
            evenyListners();
        }
    }

})(budgetHandler, UIHandler);

controler.init();