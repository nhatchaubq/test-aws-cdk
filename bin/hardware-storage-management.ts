#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { HardwareStorageManagementStack } from '../lib/hardware-storage-management-stack';

const app = new cdk.App();
new HardwareStorageManagementStack(app, 'HardwareStorageManagementStack');
