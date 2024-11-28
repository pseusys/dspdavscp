import { existsSync } from "fs";
import { isAbsolute, relative } from "path";

import * as vscode from "vscode";
import { clearIntervalAsync, setIntervalAsync, SetIntervalAsyncTimer } from "set-interval-async";

import { DefaultApi } from "openapi_client";
import { MetaReport } from "./report";

const USER_EMAIL_OPTION = "userEmail";
const REMOTE_HOST_OPTION = "remoteHost";
const REPORT_TIMER_OPTION = "reportTimer";
const PROJECT_PATH_OPTION = "projectPath";

const EXTENSION_NAME = "dspdavscp";
const STATUS_PRIORITY = 100;



let apiInstance: DefaultApi;

let status: vscode.StatusBarItem;
let report: MetaReport;

let reportTimeout: SetIntervalAsyncTimer<any>;
let hostAccessible: boolean, pathsExist: boolean;

export async function activate(context: vscode.ExtensionContext) {
	console.log(`${EXTENSION_NAME} extension initialized!`);
	const settings = vscode.workspace.getConfiguration(EXTENSION_NAME, null);
	apiInstance = new DefaultApi(settings.get(REMOTE_HOST_OPTION)!);

	report = new MetaReport(settings.get(USER_EMAIL_OPTION)!);
	status = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, STATUS_PRIORITY);
	console.log("Status bar item initialized and should be visible by now!");
	context.subscriptions.push(status);
	status.show();

	vscode.commands.registerCommand(`${EXTENSION_NAME}.goToSettings`, () => vscode.commands.executeCommand("workbench.action.openSettings", EXTENSION_NAME));
	context.subscriptions.push(vscode.commands.registerCommand(`${EXTENSION_NAME}.resetHost`, async () => await connectToHost(getSettingValue(REMOTE_HOST_OPTION)!)));
	context.subscriptions.push(vscode.commands.registerCommand(`${EXTENSION_NAME}.resetPaths`, () => checkPathsExist(getSettingValue(PROJECT_PATH_OPTION)!)));
	context.subscriptions.push(vscode.commands.registerCommand(`${EXTENSION_NAME}.resetTimer`, async () => await setupTimer(getSettingValue(REPORT_TIMER_OPTION)!)));
	context.subscriptions.push(vscode.commands.registerCommand(`${EXTENSION_NAME}.resendReport`, async () => await sendReport()));

	vscode.workspace.onDidChangeConfiguration(async event => {
		const settings = vscode.workspace.getConfiguration(EXTENSION_NAME, null);
		const remoteHostChanged = event.affectsConfiguration(`${EXTENSION_NAME}.${REMOTE_HOST_OPTION}`);
		const reportTimerChanged = event.affectsConfiguration(`${EXTENSION_NAME}.${REPORT_TIMER_OPTION}`);
		const projectPathChanged = event.affectsConfiguration(`${EXTENSION_NAME}.${PROJECT_PATH_OPTION}`);
		const userEmailChanged = event.affectsConfiguration(`${EXTENSION_NAME}.${USER_EMAIL_OPTION}`);
		console.log(`Settings have been changed - host: ${remoteHostChanged}, timer: ${reportTimerChanged}, paths: ${projectPathChanged}, email: ${userEmailChanged}!`);
		if (userEmailChanged) setEmail(settings.get(USER_EMAIL_OPTION)!);
		if (projectPathChanged) pathsExist = checkPathsExist(settings.get(PROJECT_PATH_OPTION)!);
		if (remoteHostChanged) hostAccessible = await connectToHost(settings.get(REMOTE_HOST_OPTION)!);
		if (reportTimerChanged || projectPathChanged) await setupTimer(settings.get(REPORT_TIMER_OPTION)!);
		if (remoteHostChanged || projectPathChanged || userEmailChanged) await sendReport();
	});

	vscode.workspace.onDidOpenTextDocument(event => onFileOpened(event.uri.fsPath, event.lineCount));
	vscode.workspace.onDidOpenNotebookDocument(event => onFileOpened(event.uri.fsPath, event.cellCount));

	vscode.workspace.onDidSaveTextDocument(event => onFileSaved(event.uri.fsPath, event.lineCount));
	vscode.workspace.onDidSaveNotebookDocument(event => onFileSaved(event.uri.fsPath, event.cellCount));

	vscode.workspace.onDidChangeTextDocument(event => onTextFileChanged(event.document.uri.fsPath, event.document.lineCount, event.contentChanges));
	vscode.workspace.onDidChangeNotebookDocument(event => onNotebookFileChanged(event.notebook.uri.fsPath, event.notebook.cellCount, event.cellChanges));

	vscode.workspace.onDidCloseTextDocument(event => onFileClosed(event.uri.fsPath, event.lineCount));
	vscode.workspace.onDidCloseNotebookDocument(event => onFileClosed(event.uri.fsPath, event.cellCount));

	vscode.window.onDidStartTerminalShellExecution(async event => await onTerminalStarted(event.execution.commandLine.value, event.execution.read()));
	vscode.window.onDidEndTerminalShellExecution(async event => await onTerminalEnded(event.execution.commandLine.value, event.exitCode));

	pathsExist = checkPathsExist(settings.get(PROJECT_PATH_OPTION)!);
	hostAccessible = await connectToHost(settings.get(REMOTE_HOST_OPTION)!);
	await setupTimer(settings.get(REPORT_TIMER_OPTION)!);
	await sendReport();
}

export async function deactivate() {
	await sendReport();
	console.log(`${EXTENSION_NAME} extension deactivated!`);
}



function setEmail(email: string) {
	console.log(`User email changed to: ${email}`);
	report.email = email;
}

async function connectToHost(host: string): Promise<boolean> {
	console.log(`Host address changed to: ${host}, performing healthcheck...`);
	apiInstance.basePath = host;
	try {
		await apiInstance.healthcheck();
		console.log("Healthcheck successful!");
		return true;
	} catch (_) {
		console.log("Healthcheck failed!");
		return false;
	}
}

async function setupTimer(nextIn: number) {
	if (reportTimeout !== undefined) {
		console.log("Clearing report timer...");
		await clearIntervalAsync(reportTimeout);
	} else console.log("No report timer running!");
	if (pathsExist) {
		console.log(`New report timer is every ${nextIn} seconds!`);
		reportTimeout = setIntervalAsync(sendReport, nextIn * 1000);
	} else console.log("Project path not found, timer will not be set!");
}

function checkPathsExist(paths: string[]): boolean {
	console.log(`New project paths are: ${paths.join(" ")}, checking...`);
	const exist = paths.length > 0 && paths.every(path => existsSync(path));
	console.log(exist ? "All the paths found!" : "Some of the paths do not exist!");
	return exist;
}



function getProjectSubpath(child: string): string | undefined {
	const paths: string[] = getSettingValue(PROJECT_PATH_OPTION)!;
	return paths.map(path => {
		const relativeChild = relative(path, child);
		return (!relativeChild.startsWith("..") && !isAbsolute(relativeChild)) ? relativeChild : null;
	}).find(val => val !== null);
}

function onFileOpened(file: string, lineCount: number) {
	const subpath = getProjectSubpath(file);
	console.log(`File "${subpath}" opened!`);
	if (subpath !== undefined) report.openFile(subpath, lineCount);
}

function onFileSaved(file: string, lineCount: number) {
	const subpath = getProjectSubpath(file);
	console.log(`File "${subpath}" saved!`);
	if (subpath !== undefined) report.saveFile(subpath, lineCount);
}

function onTextFileChanged(file: string, lineCount: number, changes: readonly vscode.TextDocumentContentChangeEvent[]) {
	const subpath = getProjectSubpath(file);
	console.log(`File "${subpath}" changed, changes: ${changes.map(ch => { return `{from: ${ch.range.start.line}, to: ${ch.range.end.line}}`; }).join(" ")}!`);
	if (subpath !== undefined) report.changeLines(subpath, lineCount, changes.flatMap(change => {
		const lines = new Array(change.range.end.line - change.range.start.line);
		for (let i = change.range.start.line; i <= change.range.end.line; i++) lines.push(i);
		return lines;
	}));
}

function onNotebookFileChanged(file: string, cellCount: number, changes: readonly vscode.NotebookDocumentCellChange[]) {
	const subpath = getProjectSubpath(file);
	console.log(`File "${subpath}" changed, changes: ${changes.map(change => change.cell.index)}`);
	if (subpath !== undefined) report.changeLines(subpath, cellCount, changes.map(change => change.cell.index));
}

function onFileClosed(file: string, lineCount: number) {
	const subpath = getProjectSubpath(file);
	console.log(`File "${subpath}" closed!`);
	if (subpath !== undefined) report.closeFile(subpath, lineCount);
}

async function onTerminalStarted(cmd: string, handle: AsyncIterable<string>) {
	console.log(`Command "${cmd}" started!`);
	report.startTerminal(handle);
}

async function onTerminalEnded(cmd: string, code: number | undefined) {
	console.log(`Command "${cmd}" ended, code: ${code}!`);
	await report.endTerminal(code);
}



function reflectResult(message: string, result: boolean) {
	console.log(message);
	status.text = message;
	if (result === true) {
		status.backgroundColor = undefined;
		status.tooltip = new vscode.MarkdownString("Submit another report **right now**!");
		status.command = `${EXTENSION_NAME}.resendReport`;
	} else {
		status.backgroundColor = new vscode.ThemeColor("statusBarItem.errorBackground");
		status.tooltip = "Go to the settings to fix the configuration issue!";
		status.command = `${EXTENSION_NAME}.goToSettings`;
	}
}

async function sendReport(): Promise<void> {
	if (!hostAccessible) return reflectResult(`Could not reach DSPDAVSCP host ${getSettingValue(REMOTE_HOST_OPTION)!}!`, false);
	else if (!pathsExist) return reflectResult("Could not access DSPDAVSCP projects!", false);
	const normReport = report.normalize();
	console.log(`Report to be sent: ${JSON.stringify(normReport)}`);
	try {
		await apiInstance.report(report);
		reflectResult("Report submitted successfully!", true);
	} catch {
		reflectResult("Report submission failure!", false);
	} finally {
		report.purge();
	}
}


function getSettingValue<T>(setting: string): T {
	const settings = vscode.workspace.getConfiguration(EXTENSION_NAME, null);
	return settings.get(setting)!;
}
