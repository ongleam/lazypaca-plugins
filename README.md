# lazypaca plugins

<img src="./assets/banner.jpg" alt="Too lazy to go out, but still ready to hunt for the perfect food spot" width="420">

Connect Lazypaca restaurant discovery and reservation tools to Claude Code or Codex with one plugin.

## Install

**Claude Code**

```
/plugin marketplace add ongleam/lazypaca-plugins
/plugin install lazypaca@lazypaca
```

**Codex**

```
codex plugin marketplace add ongleam/lazypaca-plugins
codex plugin add lazypaca@lazypaca
```

Installation registers the MCP server automatically; no separate `mcp add` command is required.

| Tool                             | Purpose                                             |
| -------------------------------- | --------------------------------------------------- |
| `search_places`                  | Search by area, cuisine, and opening date           |
| `get_places_details`             | Fetch details for several restaurants               |
| `render_place_map`               | Display search results in a map widget              |
| `check_reservation_availability` | Check live reservation times                        |
| `render_reservation_form`        | Show a Google sign-in reservation form              |
| `request_reservation`            | Request a reservation when a host cannot show forms |
| `find_reservations`              | Find active reservations for the connected account  |
| `get_reservation_status`         | Check a user-provided reservation number            |
| `cancel_reservation`             | Cancel a reservation or submit a cancellation request |

Search, details, maps, and availability checks do not require sign-in. Reservation requests,
status checks, and cancellations use Google OAuth. Requests and cancellations change external
state. The plugin connects only to a remote HTTPS MCP server and stores no credentials in its
manifests.

See the [Privacy Policy](https://lazypaca.com/privacy), [Terms of Service](https://lazypaca.com/terms),
and [Support](https://lazypaca.com/support).

## Connect without the plugin

```
claude mcp add --transport http lazypaca https://api.lazypaca.com/mcp
codex mcp add lazypaca --url https://api.lazypaca.com/mcp
```

For ChatGPT, add the same URL as a connector.

## Development

See [CLAUDE.md](./CLAUDE.md) for platform differences, validation commands, and security rules.
