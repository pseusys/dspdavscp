import { randomUUID } from "crypto";
import { distance } from "fastest-levenshtein";
import { FileReport, Report } from "openapi_client";



class MetaFileReport extends FileReport {
    private static MAX_LINES_MODIFIED = 25;

    'linesModified'?: { [key: number]: number } | undefined = undefined;

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
        const lineScore = Object.keys(this.linesModified!).length / this.lineCount;
        const codeTimeScore = this.codeTime! / codeTime;
        const saveNumberScore = this.saveNumber! / saveNumber;
        return lineScore + codeTimeScore + saveNumberScore;
    }

    public normalize(): FileReport {
        const report = new FileReport();
        report.path = this.path;
        report.codeTime = this.codeTime;
        report.saveNumber = this.saveNumber;
        report.linesModified = Object.keys(this.linesModified!)
            .map(Number)
            .sort((k1, k2) => k2 - k1)
            .slice(0, MetaFileReport.MAX_LINES_MODIFIED)
            .reduce((obj, key) => {
                obj[key] = this.linesModified![key] as number;
                return obj;
            }, Object());
        return report;
    }
}

export class MetaReport extends Report {
    private static MAX_FILES = 25;
    private static MAX_ERRORS = 25;

    'files'?: Array<MetaFileReport> = new Array();

    private fileData: Map<string, MetaFileReport> = new Map();
    private lastRunAt: number | null = null;
    private runHandle: AsyncIterable<string> | null = null;

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
            const changeCount = fileData.linesModified![line] ?? 0;
            fileData.linesModified![line] = changeCount + 1;
        });
    }

    public startTerminal(handle: AsyncIterable<string>) {
        if (this.lastRunAt === null) {
            this.lastRunAt = Date.now();
            this.runHandle = handle;
        }
    }

    public async endTerminal(code: number | undefined) {
        if (this.lastRunAt !== null) {
            this.runTime! += Date.now() - this.lastRunAt;
            this.lastRunAt = null;
            if (code !== undefined && code !== 0) {
                let output = [];
                for await (const value of this.runHandle!) output.push(value);
                this.errorOutputs!.push(output.join("\n"));
            }
        }
    }

    private nonMaxSuppressErrors(purgeThresh: number): Array<string> {
        const cumDist = Array(this.errorOutputs!.length).fill(0);
        let distances = Array(this.errorOutputs!.length).fill(Array(this.errorOutputs!.length).fill(0));
        for (let ei = 0; ei < this.errorOutputs!.length; ei++) {
            for (let ai = 0; ai < this.errorOutputs!.length; ai++) {
                const dist = (ei !== ai) ? 0 : distance(this.errorOutputs![ei], this.errorOutputs![ai]);
                distances[ei][ai] = dist;
                cumDist[ei] += dist;
            }   
        }
        const newErrOut = [];
        const expelled = new Set<number>();
        const sortCumDist = cumDist.map((v, i) => [v, i]).sort((e1, e2) => e1[0] - e2[0]);
        for (let elem of sortCumDist) {
            if (expelled.has(elem[1])) continue;
            for (let ei = 0; ei < distances[elem[1]].length; ei++)
                if (distances[elem[1]][ei] / this.errorOutputs![ei].length > purgeThresh) expelled.add(ei);
            newErrOut.push(this.errorOutputs![elem[1]]);
        }
        return newErrOut;
    }

    public normalize(purgeThresh: number = 0.7): Report {
        const report = new Report();
        report.id = this.id;
        report.email = this.email;
        report.files = this.files!.sort((fr1, fr2) => {
            const score1 = fr1.score(this.codeTime!, this.saveNumber!);
            const score2 = fr2.score(this.codeTime!, this.saveNumber!);
            return score2 - score1;
        }).slice(0, MetaReport.MAX_FILES).map(fr => fr.normalize());;
        report.codeTime = this.codeTime;
        report.runTime = this.runTime;
        report.saveNumber = this.saveNumber;
        report.errorOutputs = this.nonMaxSuppressErrors(purgeThresh).slice(0, MetaReport.MAX_ERRORS);
        return report;
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
