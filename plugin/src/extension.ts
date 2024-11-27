import { existsSync } from "fs";
import { isAbsolute, relative } from "path";

import * as vscode from "vscode";
import { clearIntervalAsync, setIntervalAsync, SetIntervalAsyncTimer } from "set-interval-async";

import { MetaReport } from "./report";
import { createConfiguration, DefaultApi, ServerConfiguration } from "./cli";

const STUDENT_EMAIL_OPTION = "studentEmail";
const REMOTE_HOST_OPTION = "remoteHost";
const REPORT_TIMER_OPTION = "reportTimer";
const PROJECT_PATH_OPTION = "projectPath";

const EXTENSION_NAME = "dspdavscp";
const STATUS_PRIORITY = 100;



let settings: vscode.WorkspaceConfiguration;
let apiInstance: DefaultApi;

let status: vscode.StatusBarItem;
let report: MetaReport;

let reportTimeout: SetIntervalAsyncTimer<any>;
let hostAccessible: boolean, pathsExist: boolean;

export async function activate(context: vscode.ExtensionContext) {
	settings = vscode.workspace.getConfiguration(EXTENSION_NAME);
	apiInstance = new DefaultApi(createConfiguration(settings.get(REMOTE_HOST_OPTION)!));

	report = new MetaReport(settings.get(STUDENT_EMAIL_OPTION)!);
	status = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, STATUS_PRIORITY);
	context.subscriptions.push(status);
	status.show();

	vscode.workspace.onDidChangeConfiguration(async event => {
		const remoteHostChanged = event.affectsConfiguration(REMOTE_HOST_OPTION);
		const reportTimerChanged = event.affectsConfiguration(REPORT_TIMER_OPTION);
		const projectPathChanged = event.affectsConfiguration(PROJECT_PATH_OPTION);
		const studentEmailChanged = event.affectsConfiguration(STUDENT_EMAIL_OPTION);
		if (studentEmailChanged) report.email = settings.get(STUDENT_EMAIL_OPTION)!;
		if (projectPathChanged) pathsExist = checkPathsExist(settings.get(PROJECT_PATH_OPTION)!);
		if (remoteHostChanged) hostAccessible = await connectToHost(settings.get(REMOTE_HOST_OPTION)!);
		if (reportTimerChanged || projectPathChanged) await setupTimer(settings.get(REPORT_TIMER_OPTION)!);
		if (remoteHostChanged || projectPathChanged || studentEmailChanged) await sendReport();
	});

	vscode.workspace.onDidOpenTextDocument(event => onFileOpened(event.uri.fsPath, event.lineCount));
	vscode.workspace.onDidOpenNotebookDocument(event => onFileOpened(event.uri.fsPath, event.cellCount));

	vscode.workspace.onDidSaveTextDocument(event => onFileSaved(event.uri.fsPath, event.lineCount));
	vscode.workspace.onDidSaveNotebookDocument(event => onFileSaved(event.uri.fsPath, event.cellCount));

	vscode.workspace.onDidChangeTextDocument(event => onTextFileChanged(event.document.uri.fsPath, event.document.lineCount, event.contentChanges));
	vscode.workspace.onDidChangeNotebookDocument(event => onNotebookFileChanged(event.notebook.uri.fsPath, event.notebook.cellCount, event.cellChanges));

	vscode.workspace.onDidCloseTextDocument(event => onFileClosed(event.uri.fsPath, event.lineCount));
	vscode.workspace.onDidCloseNotebookDocument(event => onFileClosed(event.uri.fsPath, event.cellCount));

	pathsExist = checkPathsExist(settings.get(PROJECT_PATH_OPTION)!);
	hostAccessible = await connectToHost(settings.get(REMOTE_HOST_OPTION)!);
	await setupTimer(settings.get(REPORT_TIMER_OPTION)!);
	await sendReport();
}

export async function deactivate() {
	await sendReport();
}



async function connectToHost(host: string): Promise<boolean> {
	apiInstance = new DefaultApi(createConfiguration({baseServer: new ServerConfiguration(host, {})}));
	try {
		await apiInstance.healthcheck();
		return true;
	} catch (_) {
		return false;
	}
}

async function setupTimer(nextIn: number) {
	if (reportTimeout !== undefined) await clearIntervalAsync(reportTimeout);
	if (pathsExist) reportTimeout = setIntervalAsync(sendReport, nextIn * 1000);
}

function checkPathsExist(paths: string[]): boolean {
	return paths.every(path => existsSync(path));
}



function getProjectSubpath(child: string): string | undefined {
	const paths: string[] = settings.get(PROJECT_PATH_OPTION)!;
	return paths.map(path => {
		const relativeChild = relative(path, child);
		return (!relativeChild.startsWith("..") && !isAbsolute(relativeChild)) ? relativeChild : null;
	}).find(val => val !== null);
}

function onFileOpened(file: string, lineCount: number) {
	const subpath = getProjectSubpath(file);
	if (subpath !== undefined) report.openFile(subpath, lineCount);
}

function onFileSaved(file: string, lineCount: number) {
	const subpath = getProjectSubpath(file);
	if (subpath !== undefined) report.saveFile(subpath, lineCount);
}

function onTextFileChanged(file: string, lineCount: number, changes: readonly vscode.TextDocumentContentChangeEvent[]) {
	const subpath = getProjectSubpath(file);
	if (subpath !== undefined) report.changeLines(subpath, lineCount, changes.flatMap(change => {
		const lines = new Array(change.range.end.line - change.range.start.line);
		for (let i = change.range.start.line; i <= change.range.end.line; i++) lines.push(i);
		return lines;
	}));
}

function onNotebookFileChanged(file: string, cellCount: number, changes: readonly vscode.NotebookDocumentCellChange[]) {
	const subpath = getProjectSubpath(file);
	if (subpath !== undefined) report.changeLines(subpath, cellCount, changes.map(change => change.cell.index));
}

function onFileClosed(file: string, lineCount: number) {
	const subpath = getProjectSubpath(file);
	if (subpath !== undefined) report.closeFile(subpath, lineCount);
}



function reflectResult(message: string, result: boolean) {
	status.text = message;
}

async function sendReport(): Promise<void> {
	if (!hostAccessible) return reflectResult("Could not reach DSPDAVSCP host!", false);
	else if (!pathsExist) return reflectResult("Could not access DSPDAVSCP projects!", false);
	try {
		await apiInstance.report(report.normalize());
		reflectResult("Report submitted successfully!", true);
	} catch {
		reflectResult("Report submission failure!", false);
	} finally {
		report.purge();
	}
}
