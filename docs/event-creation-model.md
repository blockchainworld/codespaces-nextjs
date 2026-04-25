# Professional Prediction Event Model

This document defines the backend data model and operational workflow for creating a professional prediction event on Predict.info.

## Product Principle

A professional prediction market is not just a question. It is a governed contract with:

- a precise resolution rule
- a controlled publication workflow
- source-linked evidence inputs
- explicit market states
- auditable ownership across editorial, risk, and settlement operations

## Core Entities

### 1. EventDraft

Initial market concept before approval.

Required fields:

- `draftId`
- `title`
- `question`
- `category`
- `tags[]`
- `proposedOutcomeType` (`binary`, `scalar`, `multiple-choice`)
- `proposedCloseTime`
- `proposedResolveTime`
- `hypothesis`
- `sourceLinks[]`
- `createdBy`
- `createdAt`
- `status` (`draft`, `needs-review`, `rejected`, `approved`)

### 2. ResolutionSpec

Binding settlement contract attached to an approved event.

Required fields:

- `resolutionSpecId`
- `questionCanonical`
- `resolutionRule`
- `primaryResolver`
- `secondaryResolver`
- `disputeWindowHours`
- `resolutionEvidenceRequirements[]`
- `invalidConditions[]`
- `timezone`
- `finalResolveDeadline`
- `version`

### 3. MarketEvent

Production event published to the platform.

Required fields:

- `eventId`
- `slug`
- `title`
- `category`
- `status` (`draft`, `scheduled`, `active`, `paused`, `closing`, `resolved`, `cancelled`)
- `visibility` (`internal`, `private-beta`, `public`)
- `openTime`
- `closeTime`
- `resolveTimeTarget`
- `outcomeType`
- `currentProbability`
- `liquidityPlan`
- `signalPolicyId`
- `resolutionSpecId`
- `ownerTeam`
- `createdAt`
- `updatedAt`

### 4. MarketSignal

News, data release, or research item linked to a market.

Required fields:

- `signalId`
- `eventId`
- `sourceType` (`rss`, `wire`, `research`, `internal-note`, `official-filing`)
- `sourceName`
- `headline`
- `summary`
- `publishedAt`
- `ingestedAt`
- `signalScore`
- `impact`
- `sourceQuality`
- `link`
- `dedupeKey`

### 5. EventTimelineEntry

Auditable event-history record.

Required fields:

- `entryId`
- `eventId`
- `entryType` (`signal`, `manual-adjustment`, `status-change`, `rule-update`, `resolution-note`)
- `title`
- `detail`
- `timestamp`
- `actor`
- `relatedSignalId`
- `probabilityBefore`
- `probabilityAfter`

### 6. EventApproval

Operational control record for publication.

Required fields:

- `approvalId`
- `eventId`
- `editorApproval`
- `riskApproval`
- `legalApproval`
- `liquidityApproval`
- `approvedAt`
- `blockedReasons[]`

## Lifecycle Workflow

### Stage 1. Drafting

Owner creates `EventDraft` with a precise question and initial evidence set.

Checks:

- Is the question unambiguous?
- Is the outcome observable?
- Is the close time valid?
- Does a reliable resolver exist?

### Stage 2. Editorial Review

Editorial team converts draft wording into canonical market language.

Checks:

- Remove ambiguity and subjective wording
- Remove overlapping or duplicate markets
- Attach category and signal tags

### Stage 3. Resolution Design

Operations creates `ResolutionSpec`.

Checks:

- Final resolution rule is machine-readable and human-readable
- Invalid conditions are explicitly listed
- Resolver hierarchy is defined

### Stage 4. Risk and Liquidity Approval

Risk team and liquidity operations decide whether the market can go live.

Checks:

- Manipulation risk
- Market duplication risk
- Adequate initial liquidity
- Jurisdiction and policy restrictions

### Stage 5. Publication

Approved draft becomes `MarketEvent`.

Actions:

- publish slug
- attach `ResolutionSpec`
- initialize probability and liquidity plan
- enable signal ingestion and timeline recording

### Stage 6. Live Operations

During active trading, the platform updates:

- signal ingestion
- event timeline
- market status
- probability and liquidity snapshots

Escalations:

- pause market
- update rule version
- publish dispute note

### Stage 7. Resolution

Settlement operations resolve the event using `ResolutionSpec`.

Outputs:

- final outcome
- resolver evidence package
- dispute record if needed
- final timeline entry

## Minimal Backend Tables

- `event_drafts`
- `resolution_specs`
- `market_events`
- `market_signals`
- `event_timeline_entries`
- `event_approvals`
- `event_state_snapshots`

## Operational Rules

- No market goes public without approved `ResolutionSpec`
- No market goes live without risk and liquidity approval
- Every status change must create a timeline entry
- Every manual probability adjustment must be attributable to an actor and reason
- Every resolved event must preserve the evidence bundle used for settlement

## Why This Matters

This model separates three concerns that toy systems collapse together:

- question drafting
- market publication
- market settlement

That separation is what makes a professional prediction platform auditable, governable, and commercially trustworthy.