export function createTrackingAccessGuard() {
  const denied = new Set<string>()
  return {
    canAttempt(identity: string) { return !denied.has(identity) },
    recordFailure(identity: string, error: unknown) {
      const code = typeof error === "object" && error !== null && "code" in error ? String(error.code) : ""
      if (code.split("/").pop() !== "permission-denied") return false
      denied.add(identity)
      return true
    },
  }
}
