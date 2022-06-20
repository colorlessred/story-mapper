export class Utils {
    static getFromArray<T>(array: T[], index: number): T {
        if (index < 0 || index >= array.length) {
            throw new Error(`index (${index}) must be between 0 and ${array.length}`);
        }
        return array[index];
    }
}