import { randomUUID } from "crypto";
import { FileReport, Report } from "./cli/src";



class MetaFileReport extends FileReport {
    private static MAX_LINES_MODIFIED = 25;

    public lineCount: number;
    public lastOpenedAt: number | null = null;

    constructor(path: string, lineCount: number) {
        super();
        this.path = path;
        this.lineCount = lineCount;
        this.codeTime = 0;
        this.saveNumber = 0;
        this.linesModified = Object();
    }

    public score(codeTime: number, saveNumber: number): number {
        const lineScore = this.linesModified / this.lineCount;
        const codeTimeScore = this.codeTime! / codeTime;
        const saveNumberScore = this.saveNumber! / saveNumber;
        return lineScore + codeTimeScore + saveNumberScore;
    }

    public normalize(): FileReport {
        const linesModified = this.linesModified!;
        this.linesModified = Object.keys(linesModified)
            .map(Number)
            .sort((k1, k2) => k2 - k1)
            .slice(0, MetaFileReport.MAX_LINES_MODIFIED)
            .reduce((obj, key) => {
                obj[key] = this.linesModified![key] as number;
                return obj;
            }, Object());
        return this;
    }
}

export class MetaReport extends Report {
    private static MAX_FILES = 25;

    private fileData: Map<string, MetaFileReport> = new Map();

    constructor(email: string, id: string | null = null) {
        super();
        this.purge(id);
        this.email = email;
    }

    private getFileOrDefault(name: string, lineCount: number): MetaFileReport {
        if (this.fileData.has(name)) return this.fileData.get(name)!;
        else {
            const newFile = new MetaFileReport(name, lineCount);
            this.fileData.set(name, newFile);
            this.files!.push(newFile);
            return newFile;
        }
    }

    public openFile(name: string, lineCount: number) {
        this.getFileOrDefault(name, lineCount).lastOpenedAt = Date.now();
    }

    public closeFile(name: string, lineCount: number) {
        const fileData = this.getFileOrDefault(name, lineCount);
        if (fileData.lastOpenedAt !== null) {
            const openTime = Date.now() - fileData.lastOpenedAt;
            fileData.codeTime! += openTime;
            this.codeTime! += openTime;
        }
    }

    public saveFile(name: string, lineCount: number) {
        this.getFileOrDefault(name, lineCount).saveNumber! += 1;
        this.saveNumber! += 1;
    }

    public changeLines(name: string, lineCount: number, lines: number[]) {
        const fileData = this.getFileOrDefault(name, lineCount);
        lines.forEach(line => {
            const changeCount = fileData.linesModified[line] ?? 0;
            fileData.linesModified[line] = changeCount + 1;
        });
    }

    public normalize(): Report {
        this.files = this.files!.sort((fr1: MetaFileReport, fr2: MetaFileReport) => {
            const score1 = fr1.score(this.codeTime!, this.saveNumber!);
            const score2 = fr2.score(this.codeTime!, this.saveNumber!);
            return score2 - score1;
        }).slice(0, MetaReport.MAX_FILES).map((fr: MetaFileReport) => fr.normalize());
        return this;
    }

    public purge(newId: string | null = null) {
        this.id = newId ?? randomUUID();
        this.files = [];
        this.codeTime = 0;
        this.runTime = 0;
        this.saveNumber = 0;
        this.errorOutputs = [];
    }
}
