import { PopToRootType, Toast, closeMainWindow, showHUD, showToast } from "@raycast/api";
import { showFailureToast } from "@raycast/utils";
import { focusOrca, openOrca } from "../lib/app";

interface ToastLabels {
  pending: string;
  success: string;
  failure: string;
}

export async function runWithToast<T>(labels: ToastLabels, action: () => Promise<T>): Promise<T | undefined> {
  const toast = await showToast({ style: Toast.Style.Animated, title: labels.pending });
  try {
    const result = await action();
    toast.style = Toast.Style.Success;
    toast.title = labels.success;
    return result;
  } catch (error) {
    await toast.hide();
    await showFailureToast(error, { title: labels.failure });
    return undefined;
  }
}

export async function handOffToOrca(failure: string, action: () => Promise<unknown>): Promise<boolean> {
  try {
    await action();
  } catch (error) {
    await showFailureToast(error, { title: failure });
    return false;
  }
  await closeMainWindow({ clearRootSearch: true, popToRootType: PopToRootType.Immediate });
  await focusOrca();
  return true;
}

export async function finishInOrca(message: string, reveal: () => Promise<unknown>): Promise<void> {
  await showHUD(message, { clearRootSearch: true, popToRootType: PopToRootType.Immediate });
  await reveal().catch(() => undefined);
}

export function openOrcaWithToast(): Promise<boolean> {
  return handOffToOrca("Could not open Orca", openOrca);
}
