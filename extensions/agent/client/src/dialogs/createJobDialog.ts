/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';
import * as sqlops from 'sqlops';
import { CreateJobData } from '../data/createJobData';
import { CreateStepDialog } from './createStepDialog';
import { SchedulePickerDialog } from './schedulePickerDialog';

export class CreateJobDialog {

	// TODO: localize
	// Top level
	//
	private readonly DialogTitle: string = 'New Job';
	private readonly OkButtonText: string = 'Ok';
	private readonly CancelButtonText: string = 'Cancel';
	private readonly GeneralTabText: string = 'General';
	private readonly StepsTabText: string = 'Steps';
	private readonly SchedulesTabText: string = 'Schedules';
	private readonly AlertsTabText: string = 'Alerts';
	private readonly NotificationsTabText: string = 'Notifications';

	// General tab strings
	//
	private readonly NameTextBoxLabel: string = 'Name';
	private readonly OwnerTextBoxLabel: string = 'Owner';
	private readonly CategoryDropdownLabel: string = 'Category';
	private readonly DescriptionTextBoxLabel: string = 'Description';
	private readonly EnabledCheckboxLabel: string = 'Enabled';

	// Steps tab strings
	private readonly JobStepsTopLabelString: string = 'Job step list';
	private readonly StepsTable_StepColumnString: string = 'Step';
	private readonly StepsTable_NameColumnString: string = 'Name';
	private readonly StepsTable_TypeColumnString: string = 'Type';
	private readonly StepsTable_SuccessColumnString: string = 'On Success';
	private readonly StepsTable_FailureColumnString: string = 'On Failure';
	private readonly NewStepButtonString: string = 'New...';
	private readonly InsertStepButtonString: string = 'Insert...';
	private readonly EditStepButtonString: string = 'Edit';
	private readonly DeleteStepButtonString: string = 'Delete';
	private readonly MoveUpString: string = 'Move up';
	private readonly MoveDownString: string = 'Move down';
	private readonly MoveStepsString: string = 'Move steps:';
	private readonly StartStepString: string = 'Start step:';
	private readonly StepNumberNameSeparator: string = ' : ';

	// Notifications tab strings
	//
	private readonly NotificationsTabTopLabelString: string = 'Actions to perform when the job completes';
	private readonly EmailCheckBoxString: string = 'Email';
	private readonly PagerCheckBoxString: string = 'Page';
	private readonly EventLogCheckBoxString: string = 'Write to the Windows Application event log';
	private readonly DeleteJobCheckBoxString: string = 'Automatically delete job';

	// Schedules tab strings
	//
	private readonly SchedulesListString: string = 'Schedule list';
	private readonly SchedulesTable_IdColumnString: string = 'ID';
	private readonly SchedulesTable_NameColumnString: string = 'Name';
	private readonly SchedulesTable_EnabledColumnString: string = 'Enabled';
	private readonly SchedulesTable_DescriptionColumnString: string = 'Description';
	private readonly PickScheduleButtonString: string = 'Pick...';
	private readonly RemoveScheduleButtonString: string = 'Remove';

	// Alerts tab strings
	//
	private readonly AlertsListString: string = 'Alert list';
	private readonly AlertsTable_NameColumnString: string = 'Name';
	private readonly AlertsTable_EnabledColumnString: string = 'Enabled';
	private readonly AlertsTable_TypeColumnString: string = 'Type';
	private readonly NewAlertButtonString: string = 'New...';
	private readonly RemoveAlertButtonString: string = 'Remove';

	// UI Components
	//
	private dialog: sqlops.window.modelviewdialog.Dialog;
	private generalTab: sqlops.window.modelviewdialog.DialogTab;
	private stepsTab: sqlops.window.modelviewdialog.DialogTab;
	private alertsTab: sqlops.window.modelviewdialog.DialogTab;
	private schedulesTab: sqlops.window.modelviewdialog.DialogTab;
	private notificationsTab: sqlops.window.modelviewdialog.DialogTab;

	// General tab controls
	//
	private nameTextBox: sqlops.InputBoxComponent;
	private ownerTextBox: sqlops.InputBoxComponent;
	private categoryDropdown: sqlops.DropDownComponent;
	private descriptionTextBox: sqlops.InputBoxComponent;
	private enabledCheckBox: sqlops.CheckBoxComponent;

	// Steps tab controls
	private stepsTable: sqlops.TableComponent;
	private newStepButton: sqlops.ButtonComponent;
	private insertStepButton: sqlops.ButtonComponent;
	private editStepButton: sqlops.ButtonComponent;
	private deleteStepButton: sqlops.ButtonComponent;
	private moveStepUpButton: sqlops.ButtonComponent;
	private moveStepDownButton: sqlops.ButtonComponent;
	private moveStepLabel: sqlops.TextComponent;
	private startStepLabel: sqlops.TextComponent;
	private startStepDropdown: sqlops.DropDownComponent;

	// Notifications tab controls
	//
	private notificationsTabTopLabel: sqlops.TextComponent;
	private emailCheckBox: sqlops.CheckBoxComponent;
	private emailOperatorDropdown: sqlops.DropDownComponent;
	private emailConditionDropdown: sqlops.DropDownComponent;
	private pagerCheckBox: sqlops.CheckBoxComponent;
	private pagerOperatorDropdown: sqlops.DropDownComponent;
	private pagerConditionDropdown: sqlops.DropDownComponent;
	private eventLogCheckBox: sqlops.CheckBoxComponent;
	private eventLogConditionDropdown: sqlops.DropDownComponent;
	private deleteJobCheckBox: sqlops.CheckBoxComponent;
	private deleteJobConditionDropdown: sqlops.DropDownComponent;

	// Schedules tab controls
	//
	private schedulesTable: sqlops.TableComponent;
	private pickScheduleButton: sqlops.ButtonComponent;
	private removeScheduleButton: sqlops.ButtonComponent;

	// Alerts tab controls
	//
	private alertsTable: sqlops.TableComponent;
	private newAlertButton: sqlops.ButtonComponent;
	private removeAlertButton: sqlops.ButtonComponent;

	public model: CreateJobData;

	constructor(ownerUri: string) {
		this.model = new CreateJobData(ownerUri);
	}

	public async showDialog() {
		await this.model.initialize();
		this.dialog = sqlops.window.modelviewdialog.createDialog(this.DialogTitle);
		this.generalTab = sqlops.window.modelviewdialog.createTab(this.GeneralTabText);
		this.stepsTab = sqlops.window.modelviewdialog.createTab(this.StepsTabText);
		this.alertsTab = sqlops.window.modelviewdialog.createTab(this.AlertsTabText);
		this.schedulesTab = sqlops.window.modelviewdialog.createTab(this.SchedulesTabText);
		this.notificationsTab = sqlops.window.modelviewdialog.createTab(this.NotificationsTabText);
		this.initializeGeneralTab();
		this.initializeStepsTab();
		this.initializeAlertsTab();
		this.initializeSchedulesTab();
		this.initializeNotificationsTab();
		this.dialog.content = [this.generalTab, this.stepsTab, this.schedulesTab, this.alertsTab, this.notificationsTab];
		this.dialog.okButton.onClick(async () => await this.execute());
		this.dialog.cancelButton.onClick(async () => await this.cancel());
		this.dialog.okButton.label = this.OkButtonText;
		this.dialog.cancelButton.label = this.CancelButtonText;

		this.dialog.registerCloseValidator(() => {
			this.updateModel();
			let validationResult = this.model.validate();
			if (!validationResult.valid) {
				// TODO: Show Error Messages
				console.error(validationResult.errorMessages.join(','));
			}

			return validationResult.valid;
		});

		sqlops.window.modelviewdialog.openDialog(this.dialog);
	}

	private initializeGeneralTab() {
		this.generalTab.registerContent(async view => {
			this.nameTextBox = view.modelBuilder.inputBox().component();
			this.ownerTextBox = view.modelBuilder.inputBox().component();
			this.categoryDropdown = view.modelBuilder.dropDown().component();
			this.descriptionTextBox = view.modelBuilder.inputBox().withProperties({
				multiline: true,
				height: 200
			}).component();
			this.enabledCheckBox = view.modelBuilder.checkBox()
				.withProperties({
					label: this.EnabledCheckboxLabel
				}).component();
			let formModel = view.modelBuilder.formContainer()
				.withFormItems([{
					component: this.nameTextBox,
					title: this.NameTextBoxLabel
				}, {
					component: this.ownerTextBox,
					title: this.OwnerTextBoxLabel
				}, {
					component: this.categoryDropdown,
					title: this.CategoryDropdownLabel
				}, {
					component: this.descriptionTextBox,
					title: this.DescriptionTextBoxLabel
				}, {
					component: this.enabledCheckBox,
					title: ''
				}]).withLayout({ width: '100%' }).component();

			await view.initializeModel(formModel);

			this.ownerTextBox.value = this.model.defaultOwner;
			this.categoryDropdown.values = this.model.jobCategories;
			this.categoryDropdown.value = this.model.jobCategories[0];
			this.enabledCheckBox.checked = this.model.enabled;
			this.descriptionTextBox.value = '';
		});
	}

	private initializeStepsTab() {
		this.stepsTab.registerContent(async view => {
			this.stepsTable = view.modelBuilder.table()
				.withProperties({
					columns: [
						this.StepsTable_StepColumnString,
						this.StepsTable_NameColumnString,
						this.StepsTable_TypeColumnString,
						this.StepsTable_SuccessColumnString,
						this.StepsTable_FailureColumnString
					],
					data: [],
					height: 500
				}).component();

			this.stepsTable.onRowSelected(() => {
				let enableButtons = (this.stepsTable.selectedRows && this.stepsTable.selectedRows.length === 1);
				this.insertStepButton.enabled = enableButtons;
				this.editStepButton.enabled = enableButtons;
				this.deleteStepButton.enabled = enableButtons;
				this.moveStepDownButton.enabled = enableButtons && this.model.jobSteps.length - 1 > this.stepsTable.selectedRows[0];
				this.moveStepUpButton.enabled = enableButtons && this.stepsTable.selectedRows[0] > 0;
			});

			this.newStepButton = view.modelBuilder.button().withProperties({
				label: this.NewStepButtonString,
				width: 80
			}).component();

			this.newStepButton.onDidClick((e) => {
				let stepDialog = new CreateStepDialog(this.model.ownerUri, '', '', this);
				stepDialog.openNewStepDialog();
			});

			this.insertStepButton = view.modelBuilder.button().withProperties({
				label: this.InsertStepButtonString,
				width: 80
			}).component();

			this.insertStepButton.onDidClick(() => {
				if (this.stepsTable.selectedRows && this.stepsTable.selectedRows.length === 1) {
					let stepDialog = new CreateStepDialog(this.model.ownerUri, '', '', this, this.stepsTable.selectedRows[0]);
					stepDialog.openNewStepDialog();
				}
			});

			this.editStepButton = view.modelBuilder.button().withProperties({
				label: this.EditStepButtonString,
				width: 80
			}).component();

			this.editStepButton.onDidClick(() => {
				if (this.stepsTable.selectedRows && this.stepsTable.selectedRows.length === 1) {
					let stepDialog = new CreateStepDialog(this.model.ownerUri, '', '', this, this.stepsTable.selectedRows[0], true);
					stepDialog.openNewStepDialog();
				}
			});

			this.deleteStepButton = view.modelBuilder.button().withProperties({
				label: this.DeleteStepButtonString,
				width: 80
			}).component();

			this.deleteStepButton.onDidClick((e) => {
				if (this.stepsTable.selectedRows && this.stepsTable.selectedRows.length === 1) {
					this.model.jobSteps.splice(this.stepsTable.selectedRows[0], 1);
					this.refreshSteps();
				}
			});

			this.moveStepLabel = view.modelBuilder.text().withProperties({
				value: this.MoveStepsString
			}).component();

			this.moveStepUpButton = view.modelBuilder.button().withProperties({
				label: this.MoveUpString,
				width: 80
			}).component();

			this.moveStepDownButton = view.modelBuilder.button().withProperties({
				label: this.MoveDownString,
				width: 80,
			}).component();

			this.moveStepUpButton.onDidClick(() => {
				this.swapSteps(this.stepsTable.selectedRows[0], this.stepsTable.selectedRows[0] - 1);
			});

			this.moveStepDownButton.onDidClick(() => {
				this.swapSteps(this.stepsTable.selectedRows[0], this.stepsTable.selectedRows[0] + 1);
			});

			this.startStepLabel = view.modelBuilder.text().withProperties({
				value: this.StartStepString
			}).component();

			this.startStepDropdown = view.modelBuilder.dropDown().withProperties({ width: 150 }).component();

			let buttonGroup1 = this.createRowContainer(view, 250).withItems([this.moveStepLabel, this.moveStepUpButton, this.moveStepDownButton]).component();
			let buttonGroup2 = this.createRowContainer(view, 250).withItems([this.startStepLabel, this.startStepDropdown]).component();
			let buttonGroup3 = this.createRowContainer(view).withItems([this.newStepButton, this.insertStepButton, this.editStepButton, this.deleteStepButton]).component();
			this.insertStepButton.enabled = false;
			this.editStepButton.enabled = false;
			this.deleteStepButton.enabled = false;
			this.moveStepDownButton.enabled = false;
			this.moveStepUpButton.enabled = false;
			this.startStepDropdown.enabled = false;

			let formModel = view.modelBuilder.formContainer()
				.withFormItems([{
					component: this.stepsTable,
					title: this.JobStepsTopLabelString,
				}, {
					component: buttonGroup1,
					title: ''
				}, {
					component: buttonGroup2,
					title: ''
				}, {
					component: buttonGroup3,
					title: ''
				}]).withLayout({ width: '100%' }).component();
			await view.initializeModel(formModel);
		});
	}

	private initializeAlertsTab() {
		this.alertsTab.registerContent(async view => {
			this.alertsTable = view.modelBuilder.table().withProperties({
				columns: [
					this.AlertsTable_NameColumnString,
					this.AlertsTable_EnabledColumnString,
					this.AlertsTable_TypeColumnString
				],
				data: [],
				height: 500
			}).component();

			this.alertsTable.onRowSelected(() => {
				this.removeAlertButton.enabled = this.alertsTable.selectedRows && this.alertsTable.selectedRows.length === 1;
			});

			this.newAlertButton = view.modelBuilder.button().withProperties({
				label: this.NewAlertButtonString,
				width: 80
			}).component();

			this.newAlertButton.onDidClick(() => {
				//TODO invoke new alert dialog
			});

			this.removeAlertButton = view.modelBuilder.button().withProperties({
				label: this.RemoveAlertButtonString,
				width: 80
			}).component();

			this.removeAlertButton.enabled = false;
			this.removeAlertButton.onDidClick(() => {
				if (this.alertsTable.selectedRows && this.alertsTable.selectedRows.length === 1) {
					this.model.alerts.splice(this.alertsTable.selectedRows[0], 1);
					this.refreshAlerts();
				}
			});
			let formModel = view.modelBuilder.formContainer()
				.withFormItems([{
					component: this.alertsTable,
					title: this.AlertsListString,
					actions: [this.newAlertButton, this.removeAlertButton]
				}]).withLayout({ width: '100%' }).component();
			await view.initializeModel(formModel);
		});
	}

	private initializeSchedulesTab() {
		this.schedulesTab.registerContent(async view => {
			this.schedulesTable = view.modelBuilder.table()
				.withProperties({
					columns: [
						this.SchedulesTable_IdColumnString,
						this.SchedulesTable_NameColumnString,
						this.SchedulesTable_EnabledColumnString,
						this.SchedulesTable_DescriptionColumnString
					],
					data: [],
					height: 500
				}).component();
			this.schedulesTable.onRowSelected(() => {
				this.removeScheduleButton.enabled = this.schedulesTable.selectedRows && this.schedulesTable.selectedRows.length === 1;
			});

			this.pickScheduleButton = view.modelBuilder.button().withProperties({
				label: this.PickScheduleButtonString,
				width: 80
			}).component();

			this.pickScheduleButton.onDidClick(() => {
				let dialog = new SchedulePickerDialog(this.model);
				dialog.showDialog();
			});

			this.removeScheduleButton = view.modelBuilder.button().withProperties({
				label: this.RemoveScheduleButtonString,
				width: 80
			}).component();

			this.removeScheduleButton.onDidClick(() => {
				if (this.schedulesTable.selectedRows && this.schedulesTable.selectedRows.length === 1) {
					this.model.jobSchedules.splice(this.schedulesTable.selectedRows[0], 1);
					this.refreshSchedules();
				}
			});

			this.removeScheduleButton.enabled = false;

			let formModel = view.modelBuilder.formContainer()
				.withFormItems([{
					component: this.schedulesTable,
					title: this.SchedulesListString,
					actions: [this.pickScheduleButton, this.removeScheduleButton]
				}]).withLayout({ width: '100%' }).component();
			await view.initializeModel(formModel);
		});
	}

	private initializeNotificationsTab() {
		this.notificationsTab.registerContent(async view => {

			this.notificationsTabTopLabel = view.modelBuilder.text().withProperties({ value: this.NotificationsTabTopLabelString }).component();
			this.emailCheckBox = view.modelBuilder.checkBox().withProperties({
				label: this.EmailCheckBoxString,
				width: 80
			}).component();

			this.pagerCheckBox = view.modelBuilder.checkBox().withProperties({
				label: this.PagerCheckBoxString,
				width: 80
			}).component();
			this.eventLogCheckBox = view.modelBuilder.checkBox().withProperties({
				label: this.EventLogCheckBoxString,
				width: 250
			}).component();
			this.deleteJobCheckBox = view.modelBuilder.checkBox().withProperties({
				label: this.DeleteJobCheckBoxString,
				width: 250
			}).component();

			this.emailCheckBox.onChanged(() => {
				this.emailConditionDropdown.enabled = this.emailCheckBox.checked;
				this.emailOperatorDropdown.enabled = this.emailCheckBox.checked;
			});

			this.pagerCheckBox.onChanged(() => {
				this.pagerConditionDropdown.enabled = this.pagerCheckBox.checked;
				this.pagerOperatorDropdown.enabled = this.pagerCheckBox.checked;
			});
			this.eventLogCheckBox.onChanged(() => {
				this.eventLogConditionDropdown.enabled = this.eventLogCheckBox.checked;
			});

			this.deleteJobCheckBox.onChanged(() => {
				this.deleteJobConditionDropdown.enabled = this.deleteJobCheckBox.checked;
			});

			this.emailOperatorDropdown = view.modelBuilder.dropDown().withProperties({ width: 150 }).component();
			this.pagerOperatorDropdown = view.modelBuilder.dropDown().withProperties({ width: 150 }).component();
			this.emailConditionDropdown = view.modelBuilder.dropDown().withProperties({ width: 150 }).component();
			this.pagerConditionDropdown = view.modelBuilder.dropDown().withProperties({ width: 150 }).component();
			this.eventLogConditionDropdown = view.modelBuilder.dropDown().withProperties({ width: 150 }).component();
			this.deleteJobConditionDropdown = view.modelBuilder.dropDown().withProperties({ width: 150 }).component();

			let emailContainer = this.createRowContainer(view).withItems([this.emailCheckBox, this.emailOperatorDropdown, this.emailConditionDropdown]).component();

			let pagerContainer = this.createRowContainer(view).withItems([this.pagerCheckBox, this.pagerOperatorDropdown, this.pagerConditionDropdown]).component();

			let eventLogContainer = this.createRowContainer(view).withItems([this.eventLogCheckBox, this.eventLogConditionDropdown]).component();

			let deleteJobContainer = this.createRowContainer(view).withItems([this.deleteJobCheckBox, this.deleteJobConditionDropdown]).component();

			let formModel = view.modelBuilder.formContainer().withFormItems([
				{
					component: this.notificationsTabTopLabel,
					title: ''
				}, {
					component: emailContainer,
					title: ''
				}, {
					component: pagerContainer,
					title: ''
				}, {
					component: eventLogContainer,
					title: ''
				}, {
					component: deleteJobContainer,
					title: ''
				}]).withLayout({ width: '100%' }).component();

			await view.initializeModel(formModel);
			this.emailConditionDropdown.values = this.model.JobCompletionActionConditions;
			this.pagerConditionDropdown.values = this.model.JobCompletionActionConditions;
			this.eventLogConditionDropdown.values = this.model.JobCompletionActionConditions;
			this.deleteJobConditionDropdown.values = this.model.JobCompletionActionConditions;
			this.setConditionDropdownSelectedValue(this.emailConditionDropdown, this.model.emailLevel);
			this.setConditionDropdownSelectedValue(this.pagerConditionDropdown, this.model.pageLevel);
			this.setConditionDropdownSelectedValue(this.eventLogConditionDropdown, this.model.eventLogLevel);
			this.setConditionDropdownSelectedValue(this.deleteJobConditionDropdown, this.model.deleteLevel);
			this.emailOperatorDropdown.values = this.model.operators;
			this.pagerOperatorDropdown.values = this.model.operators;
			this.emailCheckBox.checked = false;
			this.pagerCheckBox.checked = false;
			this.eventLogCheckBox.checked = false;
			this.deleteJobCheckBox.checked = false;
			this.emailOperatorDropdown.enabled = false;
			this.pagerOperatorDropdown.enabled = false;
			this.emailConditionDropdown.enabled = false;
			this.pagerConditionDropdown.enabled = false;
			this.eventLogConditionDropdown.enabled = false;
			this.deleteJobConditionDropdown.enabled = false;
		});
	}

	private createRowContainer(view: sqlops.ModelView, width?: number): sqlops.FlexBuilder {
		return view.modelBuilder.flexContainer().withLayout({
			flexFlow: 'row',
			alignItems: 'left',
			justifyContent: 'space-between',
			width: width
		});
	}

	private async execute() {
		this.updateModel();
		await this.model.save();
	}

	private async cancel() {

	}

	private getActualConditionValue(checkbox: sqlops.CheckBoxComponent, dropdown: sqlops.DropDownComponent): sqlops.JobCompletionActionCondition {
		return checkbox.checked ? Number(this.getDropdownValue(dropdown)) : sqlops.JobCompletionActionCondition.Never;
	}

	private getDropdownValue(dropdown: sqlops.DropDownComponent): string {
		return (typeof dropdown.value === 'string') ? dropdown.value : dropdown.value.name;
	}

	private setConditionDropdownSelectedValue(dropdown: sqlops.DropDownComponent, selectedValue: number) {
		let idx: number = 0;
		for (idx = 0; idx < dropdown.values.length; idx++) {
			if (Number((<sqlops.CategoryValue>dropdown.values[idx]).name) === selectedValue) {
				dropdown.value = dropdown.values[idx];
				break;
			}
		}
	}

	private updateModel() {
		this.model.name = this.nameTextBox.value;
		this.model.owner = this.ownerTextBox.value;
		this.model.enabled = this.enabledCheckBox.checked;
		this.model.description = this.descriptionTextBox.value;
		this.model.category = this.getDropdownValue(this.categoryDropdown);
		this.model.emailLevel = this.getActualConditionValue(this.emailCheckBox, this.emailConditionDropdown);
		this.model.operatorToEmail = this.getDropdownValue(this.emailOperatorDropdown);
		this.model.operatorToPage = this.getDropdownValue(this.pagerOperatorDropdown);
		this.model.pageLevel = this.getActualConditionValue(this.pagerCheckBox, this.pagerConditionDropdown);
		this.model.eventLogLevel = this.getActualConditionValue(this.eventLogCheckBox, this.eventLogConditionDropdown);
		this.model.deleteLevel = this.getActualConditionValue(this.deleteJobCheckBox, this.deleteJobConditionDropdown);
	}

	private swapSteps(index1: number, index2: number) {
		let temp = this.model.jobSteps[index1];
		this.model.jobSteps[index1] = this.model.jobSteps[index2];
		this.model.jobSteps[index2] = temp;

		this.refreshSteps();
	}

	public refreshSteps() {
		let idx = 1;
		let stepsData = [];
		let stepList = [];
		this.model.jobSteps.forEach(step => {
			stepsData.push([idx.toString(), step.stepName, step.subSystem, step.successAction, step.failureAction]);
			stepList.push(idx.toString() + this.StepNumberNameSeparator + step.stepName);
			idx++;
		});
		this.stepsTable.data = stepsData;
		this.startStepDropdown.values = stepList;
		this.startStepDropdown.enabled = stepList.length > 0;
	}

	public refreshSchedules() {
		let schedules = [];
		this.model.jobSchedules.forEach(schedule => {
			schedules.push([]);
		});
		this.schedulesTable.data = schedules;
	}

	public refreshAlerts() {
		let alerts = [];
		this.model.alerts.forEach(alert => {
			alerts.push([]);
		});
		this.alertsTable.data = alerts;
	}
}