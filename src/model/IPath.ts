import {ISerializable} from "./serialize/ISerializable";

export interface IPathSerialized {
}

export interface IPath extends ISerializable<IPathSerialized> {
    setPath(path: string): void;

    getPath(): string;

    /** zero-based */
    setPositionInParent(position: number): void;

    /** zero-based */
    getPositionInParent(): number;
}