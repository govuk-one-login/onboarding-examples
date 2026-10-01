# Local JWKS Server

This tool serves a JSON Web Key Set (JWKS) over HTTP on localhost for local testing and onboarding scenarios. It reads the JWKS from a JSON file.

## Endpoints

- `GET http://localhost:8085/.well-known/jwks.json` returns the JWKS.
- `GET http://localhost:8085/health` returns `{ "status": "ok" }`.

The default port is `8085`; change it with the configuration options below.

## Configuration

The `dev` npm script loads variables from `.env` using Node's `--env-file` option. Supported settings are:

| Setting | Command-line option | Default | Purpose |
| --- | --- | --- | --- |
| `JWKS_PORT` | `--port` | `8085` | Port to listen on (must be between 1 and 65535). |
| `JWKS_FILE` | `--file` | `jwks.json` in this tool's directory | Path to the JWKS JSON file. |

Command-line options take precedence over their matching environment variables. For example:

```bash
npm run dev -- --port 9000 --file ./custom-jwks.json
```

Alternatively, set the values in `.env`:

```dotenv
JWKS_PORT=9000
JWKS_FILE=./custom-jwks.json
```

The file path supplied with `--file` or `JWKS_FILE` is resolved relative to the process's working directory. If neither is supplied, the tool uses its bundled `jwks.json` file.

## Files

- `jwks.json` is the sample JWKS used by default.
- `.env` contains local runtime configuration.
- `src/server.ts` contains the HTTP server and JWKS loading logic.

## Local setup

From this folder:

```bash
npm install
npm run dev
```

## JWKS format

The file must contain valid JSON with a top-level `keys` array, for example:

```json
{
	"keys": []
}
```

The server reports an error if the JSON is invalid or the `keys` array is missing. JWKS is read when the server starts; restart it after changing the file.
