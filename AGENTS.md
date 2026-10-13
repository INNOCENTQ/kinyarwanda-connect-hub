# Architecture rules

- The admin dashboard uses the existing authenticated data policies and payment-review RPC; dashboard summaries derive from all paginated payment records to avoid truncated revenue totals.
- Weather refreshes have an explicit request version and cancel superseded forecast requests so refreshing at unchanged coordinates still retrieves current data.