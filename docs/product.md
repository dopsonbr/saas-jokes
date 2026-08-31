# Punchline HQ Product Brief

## Problem

Business teams draft jokes in documents, chat threads, and campaign tools with no shared lifecycle. That makes versions hard to find and public sharing difficult to control.

## Primary users

Marketing, social, sales, and internal-communications teams collaborating inside one Clerk organization.

## Jobs to be done

- When I have a joke idea, I want a structured place to draft the setup and punchline so the team can refine it.
- When the joke is ready, I want an unlisted link so I can share it outside the workspace.
- When the moment passes, I want to revoke the link without losing the private draft or audit context.

## Core entities

- **Joke**: title, setup, punchline, tags, lifecycle state, creator, and timestamps.
- **Share**: a nullable high-entropy token and publication timestamp attached to one joke.
- **Customer cell**: one organization-pinned API deployment and Neon database.

## MVP outcomes

- Organization members can create, edit, search, filter, archive, and view saved jokes.
- Drafts remain private until published.
- Published jokes have revocable, unlisted public URLs.
- Signed-out visitors can read only the published joke DTO.
- Marketing clearly explains the workflow and isolated-cell architecture.

## Non-goals

- AI generation, billing, moderation, role-specific publishing, public discovery, custom domains, analytics vendors, and fleet automation.
