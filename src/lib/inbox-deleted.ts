const deletedInboxIds = new Set<string>();

export async function getDeletedInboxIds(): Promise<Set<string>> {
  return new Set(deletedInboxIds);
}

export async function markInboxEmailDeleted(id: string): Promise<void> {
  deletedInboxIds.add(id);
}
