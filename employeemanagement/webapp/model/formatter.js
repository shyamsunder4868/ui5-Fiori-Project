sap.ui.define([], function () {
    "use strict";

    return {

        formatCurrency: function (value) {
            if (!value) {
                return "";
            }

            // Convert to number
            var fValue = parseFloat(value);

            // Format to USD
            return new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD"
            }).format(fValue);
        }

    };
});