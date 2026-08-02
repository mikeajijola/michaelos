# Lily Capability Trace

Lily Capability Trace is an observable execution record, not chain of thought or hidden reasoning.

Each entry is created from a real `CapabilityExecution` returned by the shared browser executor. It contains the execution ID, registered capability ID, validated arguments, success or error status, duration, and error text. The capability layer's `resolveCanonicalInvocation()` supplies Action Keys and the Agent CLI command; Lily response text never supplies invocation evidence.

The compact response shows one capability ID or a multi-capability count. Its accessible disclosure expands to the arguments, Action Keys, CLI command, status, duration, and the label “Invoked by Lily.” Stored history continues to use caller `navigator`.

Copy capability emits canonical JSON with `capability` and `arguments`. Copy Action Keys and Copy CLI use the registry-derived canonical values. Copy feedback is announced non-disruptively. Inspect opens the existing Agent Console Inspector focused on the entry's execution ID.

Errors are first-class trace entries. A route change is never used as evidence of success; only the executor's status is authoritative.
