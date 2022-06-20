export interface IPath {
    setPath(path: string): void;

    getPath(): string;

    /** zero-based */
    setPositionInParent(position: number): void;

    /** zero-based */
    getPositionInParent(): number;
}