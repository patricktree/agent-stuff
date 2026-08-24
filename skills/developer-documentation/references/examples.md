# Documentation transformations

Open this reference when a concrete model is more useful than another rule.

## Happy path: task documentation

### Request

Document how to enable request logging for a local service.

### Result

````markdown
# Enable request logging

Enable request logging to inspect each HTTP request handled by the local server.

## Prerequisites

- Service CLI 3.2 or later
- A local project with a `service.yaml` file

## Enable logging

1. In `service.yaml`, set `requestLogging` to `true`:

   ```yaml
   requestLogging: true
   ```

1. Restart the local server:

   ```console
   service dev
   ```

## Verify logging

Send a request to `http://localhost:8080/health`. The terminal output includes
the request method, path, and HTTP status code.

````

Why it works: the title and heading state reader goals, prerequisites precede the procedure, identifiers use code formatting, steps are imperative, and the verification result is observable.

## Robust variant: document a security-sensitive command

````markdown
## Rotate an access token

Rotating a token immediately invalidates the previous token. Update dependent
services before you revoke the old token to avoid an outage.

1. Create a token that expires after 24 hours:

   ```console
   acme tokens create --expires-in=24h --output=json
   ```

1. Store the returned token in your secret manager. Don't commit the token to
   source control or include it in logs.
2. Update each dependent service to use the new token.
3. Verify that each service can authenticate with the new token.
4. Revoke the previous token:

   ```console
   acme tokens revoke TOKEN_ID
   ```

   Replace `TOKEN_ID` with the identifier of the previous token. This action
   can't be undone.

````

Why it works: the consequence appears before the procedure, the safe sequence avoids downtime, secret handling is explicit, the placeholder is explained, verification precedes revocation, and the irreversible action is labeled.

## Anti-pattern and correction

### Anti-pattern

````markdown
## Setting Things Up

Simply run the following command, which will obviously configure everything:

`tool init --force --project=my-real-customer-project`

Click here for more info. The tool should then create the files below, and you
can edit config(s) if desired.
````

Problems: title case and an `-ing` heading; dismissive language; an unsupported claim; no prerequisite or consequence for `--force`; real-looking customer data; a non-copyable inline command; vague link text; ambiguous expected behavior; directional language; and incorrect pluralization.

### Corrected version

````markdown
## Initialize the project

The `--force` option overwrites an existing configuration file. Commit or back
up local changes before you continue.

Initialize the example project:

```console
tool init --force --project=PROJECT_ID
```

Replace `PROJECT_ID` with your project identifier. The command creates a
`tool.yaml` file in the current directory.

For configuration fields and defaults, see [Configuration reference](LINK).

````
