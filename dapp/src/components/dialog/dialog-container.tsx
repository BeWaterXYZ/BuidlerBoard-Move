import { Dialog } from "./dialog";
import { useDialogStore } from "./store";
import BuilderboardImport from "./dialogs/builderboard-import";

const dialogMaps = {
  builderboard_import: BuilderboardImport,
} as const;

export function DialogContainer() {
  const { dialogs, close } = useDialogStore();
  const keys = Object.keys(dialogs).filter((k) => !!dialogs[k as keyof typeof dialogMaps]);

  return (
    <>
      {keys.map((_key) => {
        const key = _key as keyof typeof dialogMaps;
        const DialogComp = dialogMaps[key];
        return (
          <Dialog
            key={key}
            typeName={key}
            open
            defaultOpen
            onOpenChange={(open) => {
              if (!open) {
                close(key);
              }
            }}
          >
            <DialogComp data={dialogs[key]} close={() => close(key)} />
          </Dialog>
        );
      })}
    </>
  );
} 