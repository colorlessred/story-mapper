/**
 * encapsulate common data needed by all the visible cards
 */
export class CommonCardData {
    /**
     * card title. Short enough to be displayed on the card
     */
    private _title: string = "";
    /**
     * the card content. The longer text that can be shown on the card itself
     */
    private _content: string = "";

    get content(): string {
        return this._content;
    }

    set content(value: string) {
        this._content = value;
    }

    get title(): string {
        return this._title;
    }

    set title(value: string) {
        this._title = value;
    }
}