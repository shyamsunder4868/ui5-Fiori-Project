/* global QUnit */
QUnit.config.autostart = false;

sap.ui.require(["sap/com/task/employeemanagement/test/integration/AllJourneys"
], function () {
	QUnit.start();
});
