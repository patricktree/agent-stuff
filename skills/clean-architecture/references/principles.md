# Clean Architecture Principles

## Sources

This reference synthesizes these sources:

- Robert C. Martin, "The Clean Architecture"
- Lazar Nikolov, "Why Clean Architecture makes debugging easier"

## Core idea

Clean Architecture separates policy from mechanism.

- Inner layers hold higher-level policy.
- Outer layers hold lower-level details.
- Source code dependencies point inward.
- Flow of control may move outward and inward, but dependency direction must still point inward.

## Layer responsibilities

### Entities

- Hold the most general business rules.
- Should be the least likely code to change.
- Must not depend on UI, web, persistence, or framework concerns.

### Use cases / application layer

- Implement application-specific business workflows.
- Orchestrate entities and ports.
- Should change when application behavior changes.
- Must not depend on databases, web frameworks, SDKs, or presentation details.

### Interface adapters

- Convert between external formats and the forms most useful to use cases and entities.
- Typical examples: controllers, presenters, mappers, repository adapters, serializers.
- Own request parsing, response formatting, and framework-facing glue.

### Frameworks and drivers

- Hold the database, web framework, SDK, filesystem, queues, and other concrete tools.
- Should mostly be glue code.
- Must stay replaceable.

## Dependency rule

The non-negotiable rule is: dependencies point inward.

Practical implications:

- Inner layers must not import framework classes, SDK clients, ORM entities, or transport models.
- Inner layers should define ports or interfaces when they need work performed by outer layers.
- Outer layers implement those ports.
- Data crossing boundaries should be simple and explicit.

## Crossing boundaries

When control flow requires an inner layer to "call outward," use dependency inversion.

Example pattern:

1. A controller calls a use case.
2. The use case depends on an output port or repository interface defined inward.
3. An outer adapter implements that interface.
4. Runtime wiring connects the concrete adapter.

This preserves inward source dependencies while still allowing the full request lifecycle to work.

## Data crossing boundaries

Prefer:

- plain objects
- simple request and response DTOs
- explicit mapping functions

Avoid:

- passing ORM rows inward
- passing framework request or response objects inward
- leaking SDK-specific result shapes into use cases
- reusing persistence models as domain models just because they are convenient

## Debugging implications

The Sentry article adds an operational lens: the architecture makes systems easier to debug when responsibilities are consistent.

### Why traces get easier to read

If each operation follows a similar shape, traces become predictable:

1. entrypoint or controller
2. use case orchestration
3. repository or gateway calls
4. infrastructure span

That makes it faster to:

- scan traces
- compare slow requests
- identify hotspots such as repeated repository calls
- separate business-rule latency from infrastructure latency

### Why errors get easier to triage

When layers own specific concerns, error classes become locators.

Examples:

- input parsing errors point toward controller or adapter code
- authorization failures point toward use case code
- persistence or SDK failures point toward repository or infrastructure code

This works best when the codebase is disciplined about responsibility boundaries.

## Testing implications

The same separation that improves debugging also improves testing.

- Entities can be tested as pure business rules.
- Use cases can be tested with mocked ports.
- Adapters can be tested for translation and mapping behavior.
- End-to-end tests can stay focused on wiring and integration.

A useful heuristic: if validating a business rule requires a running web app or database, the boundary is probably too weak.

## Smells and anti-patterns

Watch for these boundary leaks:

- entities with ORM decorators, HTTP helpers, or validation library types
- use cases that know SQL queries or SDK pagination details
- controllers that contain core business decisions
- repositories returning persistence models directly to use cases
- domain errors coupled to HTTP status codes
- a framework directory structure dictating where business logic must live

## How to apply it pragmatically

Clean Architecture is a dependency-management tool, not a requirement to maximize layers.

Use the smallest structure that preserves the boundaries:

- for a small app, entities and use cases may live close together
- for a larger app, separate packages or modules may be warranted
- keep translation and infrastructure details outside the business core either way

## Incremental migration strategy

For an existing codebase, migrate per use case:

1. Choose one user-visible workflow.
2. Identify current entrypoint, business rules, and external dependencies.
3. Define a plain input and output shape.
4. Extract use-case logic away from framework code.
5. Define interfaces for persistence or external systems.
6. Move mapping code into outer adapters.
7. Add tests around the extracted business logic.
8. Repeat.

This reduces risk compared with a full rewrite.
