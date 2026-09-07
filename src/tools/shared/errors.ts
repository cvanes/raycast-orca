import { errorMessage, isRuntimeUnavailable, OrcaError } from "../../lib/orca";

const RUNTIME_HINT = "Call the open-orca tool to start Orca and wait for its runtime, then retry.";

export async function withOrca<T>(action: () => Promise<T>): Promise<T> {
  try {
    return await action();
  } catch (error) {
    if (isRuntimeUnavailable(error)) {
      throw new OrcaError({
        code: "runtime_unavailable",
        message: `Orca is not reachable: ${errorMessage(error)}. ${RUNTIME_HINT}`,
      });
    }
    throw error;
  }
}

export function notFound(message: string): OrcaError {
  return new OrcaError({ code: "not_found", message });
}

export function invalidInput(message: string): OrcaError {
  return new OrcaError({ code: "invalid_argument", message });
}
