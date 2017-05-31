export function parseSuccessResponse(data) {
  const { success = false } = data;
  return {
    success
  };
}

export function parseErrorResponse(data) {
  if (typeof data.error !== 'undefined') {
    const { code, message } = data.error;
    return { code, message };
  }
  return data;
}
