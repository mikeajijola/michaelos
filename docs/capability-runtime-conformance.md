# Capability runtime conformance

MichaelOS treats capability identity, actor provenance, invocation authority, realisation availability, execution outcome, and issue completion as separate facts.

- `Caller` remains a compatibility interface vocabulary. New execution records add actor, interface, and modality independently; legacy records normalize to explicit unknown provenance where the old event cannot support a stronger claim.
- Read/navigation calls can use local ephemeral browser policy. Write, destructive, and delegated calls require an exact grant bound to subject, capability, canonical arguments, target, risk, time, replay state, and monotonically narrower parent lineage.
- Every call observes its selected realisation immediately before handler execution. Unavailable or indeterminate realisations fail before the handler; degraded realisations remain explicit.
- The registry generates `capabilities/parity-matrix.json`. Every capability/interface pair either has the canonical parity assertions or a machine-readable non-applicability reason.
- Issue completion is evaluated separately from merge state. Each criterion needs evidence bound to the issue-contract digest, candidate head, and integrated revision; missing evidence is indeterminate and failed checks are incomplete.
- `knowledge.search` projects the canonical public content structures into one deterministic lexical corpus. Results carry typed source references, evidence snippets, matched fields, rank, strategy, and corpus digest. Only references present in the confirmed result may be opened or cited as retrieved evidence.

The conformance suite includes deliberate authority widening/replay, parity drift, stale issue-contract, missing evidence, fabricated knowledge reference, and no-match fixtures. Playwright exercises the canonical Agent CLI in desktop, mobile, and reduced-motion projects and inspects the persisted execution record rather than inferring behavior from pixels.
