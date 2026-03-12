export const CLIENT_SOURCE_HEADER = "x-request-terminal-origin";

export function getClientSourceValue(): "WP" | "MP" {
  return "WP";
}

export function withClientSourceHeader(headers: Record<string, string> = {}): Record<string, string> {
  return {
    ...headers,
    [CLIENT_SOURCE_HEADER]: getClientSourceValue(),
  };
}
