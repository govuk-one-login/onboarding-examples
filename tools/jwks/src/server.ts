import { readFile } from "node:fs/promises";
import { createServer, ServerResponse } from "node:http";
import { fileURLToPath } from "node:url";

interface JsonWebKeySet {
	keys: JsonWebKey[];
}

const defaultPort = 8085;
const defaultJwksFile = fileURLToPath(new URL("../jwks.json", import.meta.url));

const getOption = (name: string): string | undefined => {
	const argument = process.argv.find((value) => value === `--${name}` || value.startsWith(`--${name}=`));

	if (!argument) {
		return undefined;
	}

	return argument.includes("=")
		? argument.slice(argument.indexOf("=") + 1)
		: process.argv[process.argv.indexOf(argument) + 1];
};

const getPort = (): number => {
	const value = getOption("port") ?? process.env.JWKS_PORT ?? String(defaultPort);
	const port = Number(value);

	if (!Number.isInteger(port) || port < 1 || port > 65535) {
		throw new Error(`Invalid port: ${value}`);
	}

	return port;
};

const parseJwks = (value: string, source: string): JsonWebKeySet => {
	let jwks: unknown;

	try {
		jwks = JSON.parse(value);
	} catch {
		throw new Error(`Invalid JSON in ${source}`);
	}

	if (!jwks || typeof jwks !== "object" || !Array.isArray((jwks as JsonWebKeySet).keys)) {
		throw new Error(`${source} must contain a JSON object with a keys array`);
	}

	return jwks as JsonWebKeySet;
};

const loadJwks = async (): Promise<JsonWebKeySet> => {
	const file = getOption("file") ?? process.env.JWKS_FILE ?? defaultJwksFile;
	return parseJwks(await readFile(file, "utf8"), file);
};

const sendJson = (response: ServerResponse, statusCode: number, body: unknown): void => {
	const content = JSON.stringify(body);
	response.writeHead(statusCode, {
		"content-type": "application/json",
		"content-length": Buffer.byteLength(content),
		"cache-control": "no-store",
		"access-control-allow-origin": "*"
	});
	response.end(content);
};

const main = async (): Promise<void> => {
	const port = getPort();
	const jwks = await loadJwks();
	const server = createServer((request, response) => {
		if (request.method === "GET" && request.url === "/.well-known/jwks.json") {
			sendJson(response, 200, jwks);
			return;
		}

		if (request.method === "GET" && request.url === "/health") {
			sendJson(response, 200, { status: "ok" });
			return;
		}

		sendJson(response, 404, { error: "Not found" });
	});

	server.listen(port, "localhost", () => {
		console.log(`JWKS endpoint: http://localhost:${port}/.well-known/jwks.json`);
	});
};

main().catch((error: unknown) => {
	console.error(error instanceof Error ? error.message : error);
	process.exitCode = 1;
});
