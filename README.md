# Foreman
Plug-in to manage agents

Every few minutes the fireman should answer:
* What bots exist?
* Which are currently running?
* What is each bot working on?
* When did each last make progress?
* Which have no work?
* Which are blocked/stuck?
* Which queues contain unclaimed work?
* Can I assign something without bothering User?

Each agent should maintain a `status.json`:
```json
{
  "agent": "acme-coder",
  "machine": "vps-3",
  "scope": "customer/acme",
  "status": "working",
  "task": "GH-182",
  "started_at": "...",
  "last_progress_at": "...",
  "blocked_on": null,
  "next_action": "run integration tests"
}
```

Foreman polls these statuses.
- them updates are a script run instead of a slough of interrogations
- each agent is responsible for keeping track of work for it's domain- so, the fireman isn't assigning work but triggering it

Perhaps we give a skill that runs on a schedule to update a `todo.csv`

Agents could be a Hermes gateway or a harness.

top-level script:
* global agent registry
* work queues
* leases/locks
* priorities
* customer isolation
* assignment policy
* “stuck” detection
* escalation
* audit trail
* cross-machine coordination

