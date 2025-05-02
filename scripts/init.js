Hooks.once("ready", () => {
  if (!game.modules.get("socketlib")?.active) {
    ui.notifications.error("Modul 'socketlib' wird benötigt, ist aber nicht aktiv.");
    return;
  }

  const socket = socketlib.registerModule("journal-passwort");

  socket.register("passwortJournalFreigabe", async ({ playerId, journalName, playerName }) => {
    const journal = game.journal.getName(journalName);
    if (!journal) return ui.notifications.warn(`Journal ${journalName} nicht gefunden.`);

    const permissions = foundry.utils.duplicate(journal.ownership);
    permissions[playerId] = CONST.DOCUMENT_OWNERSHIP_LEVELS.OBSERVER;

    await journal.update({ ownership: permissions });

    const user = game.users.get(playerId);
    if (user?.isActive) {
      journal.sheet.render(true);
    }
  });

  game.modules.get("journal-passwort").api = {
    öffnePasswortDialog: () => {
      new Dialog({
        title: "Passwort erforderlich",
        content: \`
          <form autocomplete="off" onsubmit="event.preventDefault();">
            <input type="text" name="dummy-user" style="display:none" autocomplete="username" />
            <p>Bitte Passwort eingeben:</p>
            <input type="password" id="pw-eingabe" name="pw-eingabe" style="width:100%" autocomplete="new-password" />
          </form>
        \`,
        buttons: {
          ok: {
            label: "Bestätigen",
            callback: async (html) => {
              const eingabe = html.find("#pw-eingabe")[0]?.value.trim();
              if (eingabe !== "isariel") return ui.notifications.warn("Falsches Passwort.");

              await socket.executeAsGM("passwortJournalFreigabe", {
                playerId: game.user.id,
                journalName: "G-V",
                playerName: game.user.name
              });
            }
          },
          cancel: { label: "Abbrechen" }
        },
        default: "ok"
      }).render(true);
    }
  };
});