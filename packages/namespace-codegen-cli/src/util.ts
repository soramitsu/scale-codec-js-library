import yesno from 'yesno';
import pathExists from 'path-exists';
import { normalize, join } from 'path';

export async function askForOverwriteIfExists(path: string): Promise<boolean> {
    if (await pathExists(path)) {
        return yesno({
            question: 'Output path already exists. Are you sure to overwrite this?',
        });
    } else {
        return true;
    }
}

export function normalizeRelativePath(path: string): string {
    return normalize(join(process.cwd(), path));
}
