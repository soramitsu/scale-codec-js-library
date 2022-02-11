export function factory(): Map<string, boolean> {
    return new Map(
        Array.from({ length: 20 }, (_, i) => [
            `Another key number ${i} ∀x∈ℝ: ⌈x⌉ = −⌊−x⌋, α ∧ ¬β = ¬(¬α ∨ β)`,
            i % 2 === 0,
        ]),
    )
}
