export function objToQueryStr(baseUrl: string, obj: Record<string, string | null>): string {
  const params = new URLSearchParams();
  Object.entries(obj).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      params.append(key, value);
    }
  });

  const queryString = params.toString();
  if (queryString) {
    return `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}${queryString}`;
  }
  return baseUrl;
}

export function generateBearerToken(token: string) {
  return `Bearer ${token}`;
}

export function spaceToDash(text: string) {
  return text.replace(/\s/g, '-');
}

export function dashToSpace(text: string) {
  return text.replace(/-/g, ' ');
}
