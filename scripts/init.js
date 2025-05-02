Hooks.once("ready", () => {
  if (!game.user.isGM) return;

  game.socketlib.register("passwortJournalFreigabe", async ({ playerId, journalName, playerName }) => {
    const journal = game.journal.getName(journalName);
    if (!journal) {
      ui.notifications.warn(`Journal '${journalName}' nicht gefunden.`);
      return;
    }

    const permissions = foundry.utils.duplicate(journal.permission);
    permissions[playerId] = CONST.DOCUMENT_PERMISSION_LEVELS.OBSERVER;
    await journal.update({ permission: permissions });

    const user = game.users.get(playerId);
    if (user?.isActive) {
      journal.sheet.render(true, { user: user });
    }
  });
});