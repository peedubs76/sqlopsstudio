/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';

import * as sqlops from 'sqlops';
import { AgentUtils } from '../agentUtils';

export class SchedulePickerData {

	private _ownerUri: string;
	private _agentService: sqlops.AgentServicesProvider;
	private _schedules: sqlops.AgentJobScheduleInfo[];

	constructor(ownerUri: string) {
		this._ownerUri = ownerUri;
	}

	public get schedules(): sqlops.AgentJobScheduleInfo[] {
		return this._schedules;
	}

	public async initialize() {
		this._agentService = await AgentUtils.getAgentService();
		this._schedules = [
			{
				id: 1,
				name: '7AM',
				enabled: true,
				description: '7AM'
			},
			{
				id: 2,
				name: '8AM',
				enabled: true,
				description: '8AM'
			},
			{
				id: 3,
				name: '9AM',
				enabled: true,
				description: '9AM'
			}
		];
	}
}