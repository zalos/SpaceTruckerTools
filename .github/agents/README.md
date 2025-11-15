# Custom Copilot Agents Workflow

This workspace defines a guided Angular workflow that chains multiple Copilot agents together via handoffs. Use it to keep large tasks organized and reviewed before completion.

## Agents & order

1. **angular-workflow** – Intake agent. Restates the problem and provides the handoff to planning.
2. **angular-plan** – Researches project context and produces an implementation plan with steps, risks, and tests.
3. **angular-dev** – Implements the plan, runs commands/tests, and prepares the change for review.
4. **angular-architecture** – Reviews architectural quality, scalability, and code structure.
5. **angular-ux** – Checks UX polish, responsiveness, and accessibility.
6. **angular-ba** – Verifies the work against business requirements and documentation expectations.
7. **angular-dev (again)** – Addresses feedback from any review stage before final sign-off.

Every review agent includes a "Request Fixes" handoff back to `angular-dev`, so issues can be resolved without restarting the workflow.

## Usage

1. Open the Chat view and choose **angular-workflow**.
2. Describe the Angular task. The agent will summarize and prompt you to click **Generate Implementation Plan** for the next step.
3. Follow the handoff buttons after each response to progress through plan → implementation → reviews → BA sign-off.
4. At any review stage, choose **Request ... Fixes** to return to `angular-dev` with the reviewer’s feedback queued as the next prompt.

## Tips

- Keep prompts focused so each agent can provide concise output.
- Encourage the planning agent to capture assumptions and testing strategy—the downstream agents rely on that clarity.
- Reviews are sequential: only pass forward when the previous agent reports "Go".
- The BA review should confirm documentation updates (README/TODO), so mention any manual steps or follow-ups before handing off.
