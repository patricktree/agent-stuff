---
name: clean-architecture
description: Design, review, or refactor code with Clean Architecture (Hexagonal, Ports and Adapters, Onion) boundaries.
disable-model-invocation: true
---

# Clean Architecture

Clean Architecture is a dependency-management tool, not a layer count. Its one non-negotiable rule is the **dependency rule**: source code dependencies point inward toward higher-level policy, even where control flow runs outward. Inner layers declare ports; outer layers implement them; runtime wiring connects the two.

## Layers

Map the codebase's existing names onto these responsibilities rather than renaming to match:

| Layer | Owns | Knows about |
| --- | --- | --- |
| Entities | Core business concepts and invariants; changes least often | business concepts only |
| Use cases / application | Application-specific workflows, authorization decisions, orchestration of entities and ports | entities and the ports it declares |
| Interface adapters | Controllers, presenters, mappers, repository adapters, serializers, authentication/session lookup | use cases and external formats |
| Frameworks / drivers | Web framework, database, queues, filesystem, SDKs, CLIs; mostly glue | concrete tools |

Data crosses boundaries as plain objects, request/response models, and explicit mapping functions. Persistence models and domain models stay separate shapes even when they look alike.

Use the smallest structure that preserves the boundaries: in a small app, entities and use cases can share a module; separate packages earn their place as the app grows. Every added layer or interface must pay for itself in dependency control, testability, or replaceability.

## Boundary leaks

Audit for these during design and review:

| If you see... | Leak | Fix |
| --- | --- | --- |
| Use case imports web framework, SDK client, or transport types | dependency leak | plain input/output models; a port for the external call |
| Use case knows SQL, query builders, or SDK pagination details | dependency leak | a repository or gateway port with a domain-shaped method |
| Entity carries ORM decorators, HTTP helpers, or validation-library types | dependency leak | move mapping and validation glue to an adapter |
| Business logic throws HTTP status codes or transport errors | boundary leak | domain/application errors, translated to transport errors in the adapter |
| Controller holds business decisions, persistence, and formatting | mixed responsibilities | orchestration to a use case, formatting to a presenter |
| Repository returns ORM rows or SDK result shapes | outer format leaking inward | map to a domain/application shape inside the adapter |
| Framework directory layout dictates where business logic lives | framework coupling | keep the core in its own module; framework integration behind adapters |

## Testing

- Entities: fast unit tests over pure business rules.
- Use cases: tests with fake ports for repositories, gateways, clocks, and auth context.
- Adapters: tests for translation (request parsing, response shaping, ORM and SDK mapping).
- A few end-to-end tests to verify wiring across boundaries.

If verifying a business rule needs a running web server or database, the boundary is in the wrong place.

## Debugging

Consistent layer ownership turns error classes into locators. Follow a failure from its entrypoint through controller, use case, and repository or gateway, and use this table to narrow where to look:

| Symptom | Likely layer |
| --- | --- |
| Malformed input, request parsing, authentication/session lookup | controller / interface adapter |
| Wrong authorization decision | use case |
| Wrong business rule | entity or use case |
| SQL, HTTP SDK, filesystem, or queue failure | framework / driver |
| Wrong response shape or view formatting | presenter / interface adapter |

When instrumenting, give every use case the same span structure (entrypoint → use case → repository/gateway → infrastructure), so traces are scannable and business-rule latency separates from infrastructure latency.

## Refactoring an existing codebase

Migrate one use case at a time; propose a full rewrite only when the user asks for one and accepts the risk.

1. Map current modules onto the layers and note where dependencies point outward.
2. Pick one high-value, user-visible workflow and identify its entrypoint, business rules, and external dependencies.
3. Define its plain input and output shapes.
4. Extract the use case out of framework code.
5. Declare ports for persistence and external systems at the seam where inner logic touches an outer detail.
6. Move translation (HTTP parsing, ORM mapping, serialization, SDK handling) into adapters that implement those ports.
7. Add tests around the extracted logic, then repeat for adjacent use cases.

## Output

Match the request; typical deliverables are a layer mapping of current modules, a dependency-direction or boundary-leak audit, a proposed module structure, a per-use-case refactoring plan, or an explanation of the testing and debugging effects. Name the trade-offs of any structure you propose.
