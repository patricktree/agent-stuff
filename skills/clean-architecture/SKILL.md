---
name: clean-architecture
description: Guides Clean Architecture design, review, and refactoring. Use when asked to apply Clean Architecture, Ports and Adapters, Hexagonal Architecture, Onion Architecture, dependency inversion across layers, or to separate business logic from frameworks, UI, databases, and external services. Also use when reviewing boundaries, use cases, repositories, controllers, entities, or explaining how layered architecture improves testing and debugging.
---

# Clean Architecture

Use this skill when the user wants to design, review, refactor, or explain a codebase using Clean Architecture.

## Goals

- Keep business rules independent from frameworks and infrastructure details.
- Make dependencies point inward toward higher-level policy.
- Preserve testability, replaceability, and predictable debugging paths.
- Keep architecture practical; do not add layers that do not earn their cost.

## Core rules

1. Apply the dependency rule: source code dependencies must point inward.
2. Keep entities and use cases free of framework, database, transport, and UI details.
3. Cross boundaries with interfaces, simple request/response models, or plain data structures.
4. Keep controllers, presenters, repositories, gateways, and framework glue in outer layers.
5. Do not pass framework objects or ORM rows into inner layers.
6. Name layers by responsibility, not by technology.

## Mental model

Use these layers unless the existing codebase already uses equivalent names:

| Layer | Responsibility | Should know about |
|---|---|---|
| Entities | Core business concepts and invariant rules | business concepts only |
| Use cases / application | Application-specific workflows and orchestration | entities and boundary interfaces |
| Interface adapters | Controllers, presenters, mappers, repository adapters | use cases and external formats |
| Frameworks / drivers | Web framework, database, queues, SDKs, CLIs | concrete tools and glue code |

If the project uses different labels, map them to these responsibilities instead of forcing a rename.

## When working on an existing codebase

1. Identify the current dependency direction.
2. Find business rules mixed with UI, HTTP, database, or SDK code.
3. Draw the boundary that should exist around entities and use cases.
4. Introduce interfaces at the seam where inner logic currently depends on an outer detail.
5. Move translation code outward: HTTP parsing, ORM mapping, serialization, SDK response handling.
6. Refactor incrementally around one use case at a time.

## Boundary checks

Use these checks during design or review:

| If you see... | Treat it as... | Preferred fix |
|---|---|---|
| Use case imports web framework types | dependency leak | replace with plain input/output models |
| Entity imports ORM decorators or persistence helpers | dependency leak | move persistence mapping to adapter layer |
| Business logic throws transport-specific errors | boundary leak | introduce domain or application errors |
| Controller contains authorization, persistence, and formatting logic | mixed responsibilities | move orchestration to use case and formatting to presenter |
| Repository returns ORM models directly | outer format leaking inward | map to domain/application data shape |
| Framework dictates package structure of core logic | framework coupling | isolate framework integration behind adapters |

## Debugging heuristics

Clean Architecture helps debugging when traces and failures are predictable. Use this model:

1. Start from the failing entrypoint.
2. Follow the request through controller or handler, then use case, then repository or gateway.
3. Identify which layer owns the failure class.
4. Confirm whether the bug is in validation, authorization, business rules, mapping, or infrastructure.

Use layer ownership to narrow investigation:

| Symptom | Likely layer |
|---|---|
| malformed input or request parsing failure | controller / interface adapter |
| authentication or session lookup failure | controller / interface adapter |
| authorization decision is wrong | use case / application |
| core business rule is wrong | entity or use case |
| SQL, HTTP SDK, filesystem, or queue failure | infrastructure / driver |
| response shape or view formatting bug | presenter / interface adapter |

When instrumenting traces, keep span names structurally consistent across use cases so traces are easy to scan.

## Testing guidance

Prefer tests by layer responsibility:

- Test entities with fast unit tests over pure business rules.
- Test use cases with mocked ports for repositories, gateways, clocks, and auth context.
- Test adapters for translation concerns: request parsing, response shaping, ORM mapping, SDK mapping.
- Use a smaller number of end-to-end tests to verify wiring across boundaries.

If a test needs a web server or database to verify a business rule, the boundary is probably in the wrong place.

## Refactoring guidance

Prefer this order:

1. Pick one high-value use case.
2. Write down its input, output, and business rule expectations.
3. Extract a use case function or service with plain inputs and outputs.
4. Introduce ports for persistence or external APIs.
5. Move framework and data-source code into adapters.
6. Repeat for adjacent use cases.

Avoid a big-bang rewrite unless the user explicitly asks for one and accepts the risk.

## Trade-offs

Call out these trade-offs explicitly:

- Small apps may not need every layer as a separate directory or class.
- Over-abstracting too early creates ceremony without value.
- The goal is dependency control, not diagram compliance.
- A simpler modular architecture is often enough if the same boundaries are preserved.

## What to produce

Adapt to the user's request. Typical outputs include:

- a proposed folder/package structure
- a dependency-direction review
- a boundary-leak audit
- a refactoring plan per use case
- a mapping of current modules into entities / use cases / adapters / infrastructure
- an explanation of how the architecture affects testing and debugging

## Reference

Read `references/principles.md` when you need deeper guidance on dependency direction, boundary crossing, debugging implications, and migration heuristics.
