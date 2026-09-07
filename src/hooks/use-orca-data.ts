import { Toast, showToast } from "@raycast/api";
import { useCachedPromise } from "@raycast/utils";
import { openOrcaWithToast } from "../components/feedback";
import { errorMessage, isRuntimeUnavailable } from "../lib/orca";

async function reportFailure(error: Error): Promise<void> {
  const runtimeDown = isRuntimeUnavailable(error);
  await showToast({
    style: Toast.Style.Failure,
    title: runtimeDown ? "Orca is not running" : "Orca request failed",
    message: errorMessage(error),
    primaryAction: runtimeDown
      ? {
          title: "Open Orca",
          onAction: async (toast) => {
            await toast.hide();
            await openOrcaWithToast();
          },
        }
      : undefined,
  });
}

export function useOrcaList<T>(fetcher: () => Promise<T[]>) {
  return useCachedPromise(fetcher, [], {
    initialData: [] as T[],
    keepPreviousData: true,
    onError: reportFailure,
  });
}

export function useOrcaValue<T>(fetcher: () => Promise<T>) {
  return useCachedPromise(fetcher, [], { keepPreviousData: true, onError: reportFailure });
}
