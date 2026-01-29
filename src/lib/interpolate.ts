/**
 * Interpolate variables in a message template
 * Example: "Hello {{name}}, your code is {{code}}"
 *          with { name: "João", code: "123" }
 *          becomes "Hello João, your code is 123"
 */
export function interpolateMessage(
  template: string,
  variables: Record<string, unknown>
): string {
  let result = template

  Object.entries(variables).forEach(([key, value]) => {
    const placeholder = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g')
    result = result.replace(placeholder, String(value || ''))
  })

  return result
}

/**
 * Extract variable names from a message template
 * Example: "Hello {{name}}, your code is {{code}}"
 *          returns ["name", "code"]
 */
export function extractVariables(template: string): string[] {
  const regex = /\{\{\s*([^}]+?)\s*\}\}/g
  const variables: string[] = []
  let match

  while ((match = regex.exec(template)) !== null) {
    variables.push(match[1].trim())
  }

  return [...new Set(variables)] // Remove duplicates
}
