## Setup

Welcome to the `auto-os` monorepo. This has a lot of moving parts, but the important thing to know is that we're using the Bazel build system, which has excellent support for polyglot monorepos. However, to minimize the toolchain setup process and keep everyone running the same version of the same tools, its highly recommended that you utilize the accompanying Docker Dev Container for your development work. I've found [VS Code's DevContainers Extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers) to be fantastic. Once you have it, as well as a recent version of Docker, installed, you'll receive a prompt from VS Code asking if you want to reopen this workspace in your dev container. If you don't see the prompt, just close and reopen the project manually.

The first-time dev container setup will take a few minutes, so lets go what this repository's goal is, and a little bit of how the goal was tackled.

#### Backstory

We want to improve our hitchpin.com search by an order of magnitude - no more relying on exact substring matches. We want some fuzzyness, something that lets us reach the user even when they dont know what they want. Specifically, these features are on the horizon:
1. Search Alerts (saving a search, getting notified when a new item in the catalog matches it)
2. Fuzzy Search
3. Search Suggestions (did you mean _____, or you might like _________)
4. Semantic Search (capturing meaning)
5. Personalized suggestions and ranking based on view and purchase history
6. Conceirge experience, i.e a conversational style search using LLMs with access to the live catalog.

Sounds great, right? ElasticSearch will be perfect! However, ElasticSearch is a bit resource intensive, we'll need several resources to safely deploy, potentially some hardware-accellerated compute for the ML, and we're on a budget - so instead of handing AWS or Elastic Co. the 500% premium they charge for their managed offerings, we decided to implement a managed, single-customer SaaS ourselves.

What does that mean? What are the requirements?
1. Completely automated cluster setup and teardown
2. Support all the niceties of a managed service providing, such as:
  a. Centralized monitoring/metrics/telemetry/logging
  b. Automated snapshots to durable cloud storage (S3)
  c. Freedom to customize our cluster however we need, and change it rapidly in response to changing traffic patterns
  d. Not be expensive
  e. Stay updated with patches and upgrades
  f. Secure and stable
3. Not strain the team with a maintenance nightmare or tech debt.

Easy, right? Just need to recreate an entire AWS Service on our own with the same feature set (in some areas, arguably larger), mostly after office hours. So what's the plan?

