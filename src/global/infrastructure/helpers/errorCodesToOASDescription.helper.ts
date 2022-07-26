export function errorCodesToOASDescription(errorsCodes: string[]): string {
  return errorsCodes.join(', ');
}
