export const rand = function (max: number): number {
    return Math.floor(Math.random() * (max + 1));
}

export const roll = function (max: number): boolean {
    return (Math.floor(Math.random() * (max)) + 1) === max;
}

export const randomString = function (length: number): string {
    return window.btoa(String.fromCharCode(...window.crypto.getRandomValues(new Uint8Array(length * 2)))).replace(/[+/]/g, "").substring(0, length);
}

export const areEqual = function (...objects: any[]) {
    return objects.length >= 2 && objects.slice(1).every(obj =>
        Object.keys(objects[0]).length === Object.keys(obj).length &&
        Object.keys(objects[0]).every(key => objects[0][key] === obj[key])
    );
}

export const emit = function (name: string, properties: object = {}) {
    window.dispatchEvent(new CustomEvent(name, {detail: properties}));
}
