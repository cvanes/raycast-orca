import { Action, ActionPanel, Color, Detail, Icon, Keyboard } from "@raycast/api";
import { useOrcaValue } from "../hooks/use-orca-data";
import { readTerminal } from "../lib/api";
import { Terminal, TerminalRead } from "../lib/types";
import { SendTextForm } from "./send-text-form";
import { SwitchToTerminalAction } from "./switch-to-terminal-action";

const FENCE = "````";

export function TerminalOutputDetail({ terminal }: { terminal: Terminal }) {
  const { data, isLoading, revalidate } = useOrcaValue<TerminalRead>(() =>
    readTerminal(terminal.handle, { screen: true }),
  );
  const output = data?.tail.join("\n").trimEnd() ?? "";

  return (
    <Detail
      isLoading={isLoading}
      navigationTitle={terminal.title || terminal.handle}
      markdown={[FENCE, output || "No output yet.", FENCE].join("\n")}
      metadata={
        <Detail.Metadata>
          <Detail.Metadata.TagList title="Status">
            <Detail.Metadata.TagList.Item
              text={data?.status ?? "unknown"}
              color={data?.status === "running" ? Color.Green : Color.SecondaryText}
            />
          </Detail.Metadata.TagList>
          <Detail.Metadata.Label title="Source" text={data?.source ?? "-"} />
          <Detail.Metadata.Label title="Lines" text={String(data?.returnedLineCount ?? 0)} />
          <Detail.Metadata.Label title="Handle" text={terminal.handle} />
        </Detail.Metadata>
      }
      actions={
        <ActionPanel>
          <Action
            title="Refresh"
            icon={Icon.ArrowClockwise}
            shortcut={Keyboard.Shortcut.Common.Refresh}
            onAction={revalidate}
          />
          <SwitchToTerminalAction handle={terminal.handle} />
          <Action.Push
            title="Send Text"
            icon={Icon.Text}
            target={<SendTextForm terminals={[terminal]} defaultHandle={terminal.handle} />}
          />
          <Action.CopyToClipboard title="Copy Output" content={output} shortcut={Keyboard.Shortcut.Common.Copy} />
        </ActionPanel>
      }
    />
  );
}
