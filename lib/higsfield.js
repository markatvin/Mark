/**
 * Higsfield AI integration stub.
 *
 * Higsfield doesn't have a publicly documented REST API that I could
 * verify, so this file intentionally does not guess at endpoints or
 * request/response shapes - doing so would silently call a made-up URL
 * and fail (or worse, hit an unrelated real endpoint).
 *
 * To wire this up for real:
 *   1. Get the API base URL and an API key from your Higsfield account/docs.
 *   2. Set HIGSFIELD_API_URL and HIGSFIELD_API_KEY as environment variables.
 *   3. Fill in the request below to match Higsfield's actual API contract.
 */
async function higsfieldEnhance(_inputPath, _outputPath) {
  const apiUrl = process.env.HIGSFIELD_API_URL;
  const apiKey = process.env.HIGSFIELD_API_KEY;

  if (!apiUrl || !apiKey) {
    throw new Error(
      'Higsfield is not configured. Set HIGSFIELD_API_URL and HIGSFIELD_API_KEY ' +
      '(from your Higsfield account) and fill in lib/higsfield.js with the ' +
      'actual request shape from Higsfield\'s API docs - it is not implemented yet.'
    );
  }

  throw new Error(
    'lib/higsfield.js has credentials but the request logic is still a stub. ' +
    'Fill in the fetch call to match Higsfield\'s documented API contract.'
  );
}

module.exports = { higsfieldEnhance };
