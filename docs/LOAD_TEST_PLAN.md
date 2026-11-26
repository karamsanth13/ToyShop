# 500-visitor load test plan

This is a reproducible starting plan, not a performance claim. Run only against an isolated staging deployment or local stack with permission. Do not send load to production. Final traffic mix, latency/error thresholds, and the 500-user target still need product-owner approval.

## Scenario

- 500 concurrent virtual visitors after a staged ramp-up.
- Public read mix: homepage (`/`) and shop details (`/api/shop`).
- No login attempts, form writes, Admin routes, or external image downloads in the first pass.
- Observe p50/p95/p99 latency, HTTP error rate, PostgreSQL connection saturation/pool waits, and API CPU/memory.
- Run at least 5 minutes at 500 VUs after warm-up; repeat with realistic image requests in a separate run.

## Run

Install k6 on the test machine, start the staging environment, then set `TOYSHOP_BASE_URL` to the staging origin and run:

```sh
k6 run scripts/load-test.js
```

The script uses provisional gates of p95 under 1 second and less than 1% failed requests. Replace these thresholds only after the owner approves the service objective. Preserve the k6 summary and deployment/database metrics with the test date and commit identifier.
