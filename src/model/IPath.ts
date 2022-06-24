export interface IPath {
    setPath(path: String): void;

    getPath(): String;

    setPositionInParent(position: number): void;

    getPositionInParent(): number;
}