import consola from 'consola';
import execa from 'execa';

export function runAsyncMain(fn: () => Promise<void>): void {
    fn().catch((err) => {
        consola.fatal(err);
        process.exit(1);
    });
}

export async function $(file: string, args?: string[]) {
    return execa(file, args, { stdio: 'inherit' });
}
