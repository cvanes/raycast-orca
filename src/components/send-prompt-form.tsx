import { Form } from "@raycast/api";
import { useOrcaList } from "../hooks/use-orca-data";
import { listTerminals } from "../lib/api";
import { Terminal } from "../lib/types";
import { SendTextForm } from "./send-text-form";

export function SendPromptForm({ worktreeId }: { worktreeId: string }) {
  const { data, isLoading } = useOrcaList<Terminal>(() => listTerminals({ worktree: worktreeId }));
  if (isLoading && data.length === 0) {
    return <Form isLoading />;
  }
  const agentTerminal = data.find((terminal) => terminal.agentIdentity) ?? data[0];
  return <SendTextForm terminals={data} defaultHandle={agentTerminal?.handle} />;
}
