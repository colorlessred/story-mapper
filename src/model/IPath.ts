export interface IPath {
    setPath(path: String): void;

    getPath(): String;

    /** zero-based */
    setPositionInParent(position: number): void;

    /** zero-based */
    getPositionInParent(): number;
}