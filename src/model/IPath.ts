import {ISerializable} from "./serialize/ISerializable";

export interface IPath extends ISerializable{
    setPath(path: string): void;

    getPath(): string;

    /** zero-based */
    setPositionInParent(position: number): void;

    /** zero-based */
    getPositionInParent(): number;
}