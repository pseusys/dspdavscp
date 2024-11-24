import { existsSync } from "fs";
import { isAbsolute, relative } from "path";

import * as vscode from "vscode";
import { clearIntervalAsync, setIntervalAsync, SetIntervalAsyncTimer } from "set-interval-async";

import { Report } from "./report";

const REMOTE_HOST_OPTION = "remoteHost";
const REPORT_TIMER_OPTION = "reportTimer";
const PROJECT_PATH_OPTION = "projectPath";

const EXTENSION_NAME = "dspdavscp";
const STATUS_PRIORITY = 100;



let settings: vscode.WorkspaceConfiguration;
let status: vscode.StatusBarItem;
let report: Report;

let reportTimeout: SetIntervalAsyncTimer<any>;
let hostAccessible: boolean, pathsExist: boolean;

export async function activate(context: vscode.ExtensionContext) {
	settings = vscode.workspace.getConfiguration(EXTENSION_NAME);

	report = new Report();
	status = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, STATUS_PRIORITY);
	context.subscriptions.push(status);
	status.show();

	vscode.workspace.onDidChangeConfiguration(async event => {
		const remoteHostChanged = event.affectsConfiguration(REMOTE_HOST_OPTION);
		const reportTimerChanged = event.affectsConfiguration(REPORT_TIMER_OPTION);
		const projectPathChanged = event.affectsConfiguration(PROJECT_PATH_OPTION);
		if (projectPathChanged) pathsExist = checkPathsExist(settings.get(PROJECT_PATH_OPTION)!);
		if (remoteHostChanged) hostAccessible = await connectToHost(settings.get(REMOTE_HOST_OPTION)!);
		if (reportTimerChanged || projectPathChanged) await setupTimer(settings.get(REPORT_TIMER_OPTION)!);
		if (remoteHostChanged || projectPathChanged) await sendReport();
	});

	vscode.workspace.onDidOpenTextDocument(event => onFileOpened(event.uri.fsPath));
	vscode.workspace.onDidOpenNotebookDocument(event => onFileOpened(event.uri.fsPath));

	vscode.workspace.onDidSaveTextDocument(event => onFileSaved(event.uri.fsPath));
	vscode.workspace.onDidSaveNotebookDocument(event => onFileSaved(event.uri.fsPath));

	vscode.workspace.onDidChangeTextDocument(event => onTextFileChanged(event.document.uri.fsPath, event.contentChanges));
	vscode.workspace.onDidChangeNotebookDocument(event => onNotebookFileChanged(event.notebook.uri.fsPath, event.cellChanges));

	vscode.workspace.onDidCloseTextDocument(event => onFileClosed(event.uri.fsPath));
	vscode.workspace.onDidCloseNotebookDocument(event => onFileClosed(event.uri.fsPath));

	pathsExist = checkPathsExist(settings.get(PROJECT_PATH_OPTION)!);
	hostAccessible = await connectToHost(settings.get(REMOTE_HOST_OPTION)!);
	await setupTimer(settings.get(REPORT_TIMER_OPTION)!);
	await sendReport();
}

export async function deactivate() {
	await sendReport();
}



async function connectToHost(host: string): Promise<boolean> {
	try {
		const hostResponse = await fetch(host);
		const responseText = await hostResponse.text();
		return responseText === "healthy";
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

function onFileOpened(file: string) {
	const subpath = getProjectSubpath(file);
	if (subpath !== undefined) report.openFile(subpath);
}

function onFileSaved(file: string) {
	const subpath = getProjectSubpath(file);
	if (subpath !== undefined) report.saveFile(subpath);
}

function onTextFileChanged(file: string, changes: readonly vscode.TextDocumentContentChangeEvent[]) {
	const subpath = getProjectSubpath(file);
	if (subpath !== undefined) report.changeLines(subpath, changes.flatMap(change => {
		const lines = new Array(change.range.end.line - change.range.start.line);
		for (let i = change.range.start.line; i <= change.range.end.line; i++) lines.push(i);
		return lines;
	}));
}

function onNotebookFileChanged(file: string, changes: readonly vscode.NotebookDocumentCellChange[]) {
	const subpath = getProjectSubpath(file);
	if (subpath !== undefined) report.changeLines(subpath, changes.map(change => change.cell.index));
}

function onFileClosed(file: string) {
	const subpath = getProjectSubpath(file);
	if (subpath !== undefined) report.closeFile(subpath);
}



function reflectResult(message: string, result: boolean) {
	status.text = message;
}

async function sendReport(): Promise<void> {
	if (!hostAccessible) return reflectResult("Could not reach DSPDAVSCP host!", false);
	else if (!pathsExist) return reflectResult("Could not access DSPDAVSCP projects!", false);
	const request = {
		headers: {
		  "Content-Type": "application/json"
		},
		method: "POST",
		body: JSON.stringify(report.purge())
	};
	const response = await fetch(settings.get(REMOTE_HOST_OPTION)!, request)
		.then(res => Math.floor(res.status / 200) === 1)
		.catch(_ => false);
	if (response) reflectResult("Report submitted successfully!", true);
	else reflectResult("Report submission failure!", false);
}
