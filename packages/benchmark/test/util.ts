export function allArrayItemsShouldBeTheSame<T>(arr: T[]) {
    for (let i = 0; i < arr.length - 1; i++) {
        expect(arr[i]).toEqual(arr[i + 1])
    }
}
