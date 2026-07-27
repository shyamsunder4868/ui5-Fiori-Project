sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/Sorter",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/com/task/employeemanagement/model/formatter"
], function(Controller, JSONModel, Filter, FilterOperator, Sorter, MessageToast, MessageBox, formatter) {
    "use strict";

    return Controller.extend("sap.com.task.employeemanagement.controller.View1", {
        formatter: formatter,

        //  i18n helper
        getText: function (sKey) {
            return this.getView().getModel("i18n").getResourceBundle().getText(sKey);
        },

        onInit: function () {
            var oModel = new JSONModel();
            oModel.loadData("model/data.json"); 
            this.getView().setModel(oModel);
            this._openRoleDialog();
        },

        onLiveNameSearch: function(oEvent) {
            var sName = oEvent.getParameter("newValue");
            var oTable = this.byId("employeeTable");
            var oBinding = oTable.getBinding("items");
            var aFilters = [];

            if (sName) {
                aFilters.push(new Filter("name", FilterOperator.Contains, sName));
            }

            oBinding.filter(aFilters);
        },

        onStatusChange: function(oEvent) {
            var sStatus = oEvent.getParameter("selectedKey");
            var sName = this.byId("idNameFilter").getValue();
            this._applyFilters(sName, sStatus);
        },

        onFilterGo: function () {
            var sName = this.byId("idNameFilter").getValue();
            var sStatus = this.byId("idStatusFilter").getSelectedKey();
            this._applyFilters(sName, sStatus);
        },

        _applyFilters: function(sName, sStatus) {
            var oTable = this.byId("employeeTable");
            var oBinding = oTable.getBinding("items");
            var aFilters = [];

            if (sName) {
                aFilters.push(new Filter("name", FilterOperator.Contains, sName));
            }

            if (sStatus && sStatus !== "") {
                aFilters.push(new Filter("status", FilterOperator.EQ, sStatus));
            }

            oBinding.filter(aFilters);
        },

        onSortSalary: function () {
            this.byId("employeeTable").getBinding("items")
                .sort(new Sorter("salary", true));
        },

        onAdd: function () {
            this._editIndex = undefined;
            this._openEmployeeDialog({
                id: "",
                name: "",
                city: "",
                salary: "",
                status: "Active",
                role: ""
            });
        },

        onEdit: function () {
            var oItem = this.byId("employeeTable").getSelectedItem();
            if (!oItem) { 
                MessageToast.show(this.getText("selectRow")); 
                return; 
            }

            var iIndex = this.byId("employeeTable").indexOfItem(oItem);
            this._editIndex = iIndex;
            var oData = this.getView().getModel().getProperty("/employees/" + iIndex);
            this._openEmployeeDialog(oData);
        },

        onDelete: function () {
            var oItem = this.byId("employeeTable").getSelectedItem();
            if (!oItem) { 
                MessageToast.show(this.getText("selectRow")); 
                return; 
            }

            var that = this;

            MessageBox.confirm(this.getText("deleteConfirm"), {
                onClose: function (oAction) {
                    if (oAction === "OK") {

                        var iIndex = that.byId("employeeTable").indexOfItem(oItem);
                        var oModel = that.getView().getModel();
                        var aEmp = oModel.getProperty("/employees");

                        aEmp.splice(iIndex, 1);
                        oModel.setProperty("/employees", aEmp);
                        oModel.refresh(true); 

                        MessageToast.show(that.getText("deleted"));
                    }
                }
            });
        },

        _openEmployeeDialog: function(oData) {
            if (!this._oDialog) {
                this._oDialog = sap.ui.xmlfragment("sap.com.task.employeemanagement.fragment.EmployeeDialog", this);
                this.getView().addDependent(this._oDialog);
            }
            this._oDialog.setModel(new JSONModel(oData), "dialog");
            this._oDialog.open();
        },

        onSave: function () {
            var oData = this._oDialog.getModel("dialog").getData();

            var oId = sap.ui.getCore().byId("idInput");
            var oName = sap.ui.getCore().byId("idNameInput");
            var oCity = sap.ui.getCore().byId("idCityInput");
            var oSalary = sap.ui.getCore().byId("idSalaryInput");
            var oStatus = sap.ui.getCore().byId("idStatusInput");
            var oRole = sap.ui.getCore().byId("idRoleInput");

            [oId, oName, oCity, oSalary, oStatus, oRole].forEach(function (oField) {
                if (oField) {
                    oField.setValueState("None");
                }
            });
             
            var bValid = true;

            if (!oData.id) {
                oId.setValueState("Error");
                oId.setValueStateText(this.getText("idRequired"));
                bValid = false;
            }

            if (!oData.name || oData.name.trim() === "") {
                oName.setValueState("Error");
                oName.setValueStateText(this.getText("nameRequired"));
                bValid = false;
            }

            if (!oData.city) {
                oCity.setValueState("Error");
                oCity.setValueStateText(this.getText("cityRequired"));
                bValid = false;
            }

            if (!oData.salary || isNaN(oData.salary)) {
                oSalary.setValueState("Error");
                oSalary.setValueStateText(this.getText("salaryInvalid"));
                bValid = false;
            }

            if (!oData.status) {
                oStatus.setValueState("Error");
                oStatus.setValueStateText(this.getText("statusRequired"));
                bValid = false;
            }

            if (!oData.role) {
                oRole.setValueState("Error");
                oRole.setValueStateText(this.getText("roleRequired"));
                bValid = false;
            }

            if (!bValid) {
                MessageToast.show(this.getText("fillAll"));
                return;
            }

            var oModel = this.getView().getModel();
            var aEmp = oModel.getProperty("/employees");

            if (this._editIndex !== undefined) {
                aEmp[this._editIndex] = oData;
            } else {
                aEmp.push(oData);
            }

            oModel.setProperty("/employees", aEmp);
            oModel.refresh(true);

            this._editIndex = undefined;
            this._oDialog.close();
        },

        onFieldLiveChange: function (oEvent) {
            var oInput = oEvent.getSource();
            if (oInput.getValue().trim()) {
                oInput.setValueState("None");
            }
        },

        onRoleCancel: function() {
            this._oRoleDialog.close();
        },

        onCancel: function() {
            this._resetDialogState();
            this._oDialog.close();
        },

        _resetDialogState: function() {
            var oNameInput = sap.ui.getCore().byId("idNameInput");
            if (oNameInput) {
                oNameInput.setValueState("None");
                oNameInput.setValueStateText("");
            }
        },

        _openRoleDialog: function() {
            if (!this._oRoleDialog) {
                this._oRoleDialog = sap.ui.xmlfragment("sap.com.task.employeemanagement.fragment.RoleDialog", this);
                this.getView().addDependent(this._oRoleDialog);
            }
            this._oRoleDialog.open();
        },

        onClearFilters: function () {
            this.byId("idNameFilter").setValue("");
            this.byId("idStatusFilter").setSelectedKey("");
            this._applyFilters("", "");
        },

        onNameLiveChange: function(oEvent) {
            var oInput = oEvent.getSource();
            if (oInput.getValue().trim()) {
                oInput.setValueState("None");
            }
        },

        onRoleConfirm: function() {
            var sId = sap.ui.getCore().byId("idEmployeeInput").getValue();

            if (!sId) {
                MessageToast.show(this.getText("enterId"));
                return;
            }

            var aEmployees = this.getView().getModel().getProperty("/employees");
            var oEmp = aEmployees.find(emp => emp.id == sId);

            if (!oEmp) {
                MessageToast.show(this.getText("notFound"));
                return;
            }

            var bAdmin = oEmp.role.toLowerCase() === "admin";
            this.byId("idAddButton").setVisible(bAdmin);
            this.byId("idEditButton").setVisible(bAdmin);
            this.byId("idDeleteButton").setVisible(bAdmin);

            this._oRoleDialog.close();
        }

    });
});