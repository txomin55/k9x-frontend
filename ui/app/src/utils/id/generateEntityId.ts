export const generateEntityId = (entity: string): string =>
  `${entity}_${Date.now()}`;
