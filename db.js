
(function() {

    const db = {
        _currentDbName: null,
        _version: null,


        _RATES_KEY: "currency_rates",


        openCostsDB: function(databaseName, databaseVersion) {
            this._currentDbName = databaseName;
            this._version = databaseVersion;


            if (!localStorage.getItem(databaseName)) {
                localStorage.setItem(databaseName, JSON.stringify([]));
            }


            return this;
        },


        addCost: function(cost) {
            const dbName = this._currentDbName || "costsdb";
            const currentData = JSON.parse(localStorage.getItem(dbName)) || [];

            const today = new Date();


            const newCostItem = {
                sum: Number(cost.sum),
                currency: cost.currency,
                category: cost.category,
                description: cost.description,
                date: { day: today.getDate() },

                _year: today.getFullYear(),
                _month: today.getMonth() + 1
            };

            currentData.push(newCostItem);
            localStorage.setItem(dbName, JSON.stringify(currentData));


            return {
                sum: newCostItem.sum,
                currency: newCostItem.currency,
                category: newCostItem.category,
                description: newCostItem.description
            };
        },


        getReport: function(currency, year, month) {
            const dbName = this._currentDbName || "costsdb";
            const currentData = JSON.parse(localStorage.getItem(dbName)) || [];

            const today = new Date();
            const targetYear = year !== undefined ? year : today.getFullYear();
            const targetMonth = month !== undefined ? month : (today.getMonth() + 1);


            const filteredCosts = currentData.filter(function(item) {
                return item._year === targetYear && item._month === targetMonth;
            });


            const formattedCosts = filteredCosts.map(function(item) {
                return {
                    sum: item.sum,
                    currency: item.currency,
                    category: item.category,
                    description: item.description,
                    date: { day: item.date.day }
                };
            });

            const defaultRates = { "USD": 1, "GBP": 0.6, "EURO": 0.7, "ILS": 3.4 };
            const savedRatesJson = localStorage.getItem(this._RATES_KEY);
            const rates = savedRatesJson ? JSON.parse(savedRatesJson) : defaultRates;

            let totalSum = 0;


            formattedCosts.forEach(function(item) {
                if (item.currency === currency) {

                    totalSum += item.sum;
                } else {

                    const sumInUSD = item.sum / (rates[item.currency] || 1);

                    const sumInTargetCurrency = sumInUSD * (rates[currency] || 1);

                    totalSum += sumInTargetCurrency;
                }
            });


            totalSum = Math.round(totalSum * 100) / 100;


            return {
                year: targetYear,
                month: targetMonth,
                costs: formattedCosts,
                total: {
                    currency: currency,
                    sum: totalSum
                }
            };
        }
    };


    window.db = db;
})();