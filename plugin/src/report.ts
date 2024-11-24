import { SortedTopQueue } from "./topqueue";

type LinePointer = { f: string, l: number };
type InstanceWithNumber<I> = { i: I, n: number };



class ProjectFile {
    public openTime: number = 0;
    public saveCount: number = 0;
    public lastOpenedAt: number | null = null;
    public linesChanged: Map<number, number> = new Map();
}



export class Report {
    private fileData: Map<string, ProjectFile> = new Map();

    private getFileOrDefault(name: string): ProjectFile {
        if (this.fileData.has(name)) return this.fileData.get(name)!;
        else {
            const newFile = new ProjectFile();
            this.fileData.set(name, newFile);
            return newFile;
        }
    }

    public openFile(name: string) {
        this.getFileOrDefault(name).lastOpenedAt = Date.now();
    }

    public closeFile(name: string) {
        const fileData = this.getFileOrDefault(name);
        if (fileData.lastOpenedAt !== null) fileData.openTime += (Date.now() - fileData.lastOpenedAt);
    }

    public saveFile(name: string) {
        this.getFileOrDefault(name).saveCount += 1;
    }

    public changeLines(name: string, lines: number[]) {
        const fileData = this.getFileOrDefault(name);
        lines.forEach(line => {
            const changeCount = fileData.linesChanged.get(line) ?? 0;
            fileData.linesChanged.set(line, changeCount + 1);
        });
    }

    public purge(): Object {
        const openTimes: SortedTopQueue<InstanceWithNumber<string>> = new SortedTopQueue(10, (a, b) => a.n - b.n);
        const savedCounts: SortedTopQueue<InstanceWithNumber<string>> = new SortedTopQueue(10, (a, b) => a.n - b.n);
        const linesChanged: SortedTopQueue<InstanceWithNumber<LinePointer>> = new SortedTopQueue(100, (a, b) => a.n - b.n);
        this.fileData.forEach((file, name) => {
            openTimes.push({ i: name, n: file.openTime });
            savedCounts.push({ i: name, n: file.saveCount });
            file.linesChanged.forEach((line, chgd) => linesChanged.push({ i: { f: name, l: line }, n: chgd }));
        });
        return {
            openTimes: openTimes.toArray(),
            savedCounts: savedCounts.toArray(),
            linesChanged: linesChanged.toArray()
        };
    }
}
