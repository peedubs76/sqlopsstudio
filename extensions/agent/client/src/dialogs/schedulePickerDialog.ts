/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';
import * as sqlops from 'sqlops';
import { SchedulePickerData } from '../data/schedulePickerData';
import { CreateJobData } from '../data/createJobData';

export class SchedulePickerDialog {
	private readonly SchedulesListString: string = 'Available schedules';
	private readonly SchedulesTable_IdColumnString: string = 'ID';
	private readonly SchedulesTable_NameColumnString: string = 'Name';
	private readonly SchedulesTable_EnabledColumnString: string = 'Enabled';
	private readonly SchedulesTable_DescriptionColumnString: string = 'Description';
	private readonly DialogTitle: string = 'Pick schedule';

	private model: SchedulePickerData;
	private dialog: sqlops.window.modelviewdialog.Dialog;
	private schedulesTable: sqlops.TableComponent;
	private jobModel: CreateJobData;

	constructor(jobModel: CreateJobData) {
		this.model = new SchedulePickerData(jobModel.ownerUri);
		this.jobModel = jobModel;
	}

	public async showDialog() {
		await this.model.initialize();
		this.dialog = sqlops.window.modelviewdialog.createDialog(this.DialogTitle);
		this.dialog.registerContent(async view => {
			this.schedulesTable = view.modelBuilder.table()
				.withProperties({
					columns: [
						this.SchedulesTable_IdColumnString,
						this.SchedulesTable_NameColumnString,
						this.SchedulesTable_EnabledColumnString,
						this.SchedulesTable_DescriptionColumnString
					],
					data: this.model.schedules.filter(schedule => {
						return this.jobModel.jobSchedules.findIndex((schedule2) => { return schedule2.id === schedule.id; }) === -1;
					}),
					height: 800,
					width: 300
				}).component();

			this.schedulesTable.onRowSelected(() => {
				this.dialog.okButton.enabled = this.schedulesTable.selectedRows && this.schedulesTable.selectedRows.length === 1;
			});
			let formModel = view.modelBuilder.formContainer()
				.withFormItems([{
					component: this.schedulesTable,
					title: this.SchedulesListString
				}]).withLayout({ width: '100%' }).component();
			await view.initializeModel(formModel);
		});
		this.dialog.okButton.onClick(async () => await this.execute());
		this.dialog.cancelButton.onClick(async () => await this.cancel());
		this.dialog.okButton.enabled = false;

		sqlops.window.modelviewdialog.openDialog(this.dialog);
	}

	private async execute() {
		if (this.schedulesTable.selectedRows && this.schedulesTable.selectedRows.length === 1) {
			this.jobModel.jobSchedules.push(this.model.schedules[this.schedulesTable.selectedRows[1]]);
		}
	}

	private async cancel() {

	}
}