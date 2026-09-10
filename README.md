# Foreman

Foreman is a small supervisor for a fleet of human/AI workers.

Its job is deliberately narrow:

1. observe agent status,
2. decide who needs attention or a nudge,
3. send instructions through the messaging layer,
4. surface the fleet clearly to the operator.

Foreman is **not** the messaging bus, agent runtime, filesystem layer, or task database.

## Architecture

```text
                    Foreman
             policy + operator TUI
                       │
                       │ observe / instruct
                       ▼
                     Loose
          identity + messages + status events
                       │
        ┌──────────────┼──────────────┐
        ▼              ▼              ▼
      Hermes         Hermes        other worker
      local           VPS          / human
```

Loose owns agent identity, messaging, and status publication/subscription. Hermes and other runtimes execute work. Foreman reads that shared state and applies supervision policy.

The initial interface is a terminal UI. A web/dashboard surface can come later if it proves useful.

## Agent status

Foreman expects Loose agents to expose a lightweight status object. The exact schema belongs in Loose, but conceptually:

```json
{
  "reported": {
    "state": "working",
    "task": "GH-182",
    "summary": "Refactoring auth middleware",
    "last_progress_at": "2026-09-10T01:11:00Z",
    "blocked_on": null
  },
  "control": {
    "priority": 4,
    "do_not_interrupt": false
  }
}
```

Workers report reality. Authorized supervisors may set control fields. Foreman subscribes to status changes rather than repeatedly interrogating agents.

See `fingerskier/Loose#17` for the Loose-side status proposal.

## Foreman policy

The first useful policy can remain almost embarrassingly small:

```text
working + recent progress  -> leave alone
working + stale progress   -> request an update
blocked                    -> help, delegate, or escalate
idle                       -> ask the worker to inspect its domain queue
needs attention            -> surface to operator
done                       -> allow the worker to choose its next domain task
```

Agents remain responsible for understanding the work in their domain. Foreman supervises and triggers; it does not need to become a universal scheduler.

## TUI

The first screen is a fleet board:

```text
FOREMAN                     15 agents

WORKING  6   IDLE  7   BLOCKED  1   ATTENTION  1

NAME             MACHINE      STATE       TASK              AGE
architect        local        working     spectrum #441     18m
lab-chief        lab          watching    test stand         7m
acme             vps-3        blocked     GH-91             23m
angel            vps-1        idle        -                  2m

[j/k] select   [enter] inspect   [m] message   [r] refresh   [q] quit
```

The TUI should answer, at a glance:

- who exists,
- what each worker is doing,
- whether progress is fresh,
- who is blocked,
- who needs the operator.

## Near-term scope

- [x] define the simplified architecture
- [x] establish a TUI-first application shell
- [ ] connect to Loose agent/status subscriptions
- [ ] show live fleet state
- [ ] inspect an agent and recent status history
- [ ] send a message/instruction to an agent
- [ ] add simple stale/blocked/attention policy
- [ ] persist only Foreman-specific configuration

## Explicitly deferred

Do not add these until the simpler model proves insufficient:

- Foreman-owned global work queues
- leases/locks
- a separate fleet database
- filesystem synchronization
- task state duplicated from GitHub/customer systems
- Hermes-specific orchestration logic
- autonomous work invention

The design goal is a thin control surface over the collaboration fabric, not another agent platform.
