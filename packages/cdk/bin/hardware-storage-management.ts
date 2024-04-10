#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { HardwareStorageManagementStack } from '../resources/hardware-storage-management-stack';

const app = new cdk.App();
new HardwareStorageManagementStack(app, 'HardwareStorageManagementStack');
