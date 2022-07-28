import {ISerializable} from "./serialize/ISerializable";

export interface IPathSerialized {
}

export interface IPath extends ISerializable<IPathSerialized> {
    set path(path: string);

    get path(): string;

    /** zero-based */
    set positionInParent(position: number);

    /** zero-based */
    get positionInParent(): number;
}