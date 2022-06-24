export interface ICard {
    getName(): String;

    /** create new item next to the current one */
    createNewNext(): void;
}