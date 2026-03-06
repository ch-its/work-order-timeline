# AI Prompts Log 

This Markdown file contains a few selected AI Prompts I've used in completing this home challenge
---

Prompt 1: "I am architecting a Work Order Timeline application. I want to move away from legacy lifecycle hooks and use a Signal-based architecture for maximum reactivity. 
1. Define a `WorkOrder` interface with `docId`, `status`, and a `data` object for start/end dates.
2. Design a `TimelineService` using `WritableSignal` to store the state.
3. Include a mock data generator that produces a varied set of work orders to test the UI boundaries."

Prompt 2 : "I need to implement an infinite horizontal scroll for the timeline view. 
- The initial view should center on today's date.
- Use `leftOffsetIndex` and `rightOffsetIndex` signals to track the expanded range.
- Calculate the `scrollLeft` threshold to trigger a 'load more' event that prepends or appends 12-day chunks.
- How can I handle the scroll jump when prepending dates to the left so the user doesn't lose their visual position?"

Prompt 3: "Create a robust math utility function `getBarWidth(wo: WorkOrder)`:
- The timeline uses a fixed 40px width per day column.
- It must handle date differences across months.
- Implement a fail-safe: any task, regardless of duration, must be at least 40px wide to maintain 'clickability' and visibility.
- Provide a corresponding `getPixelPositionFromDate` helper for the `left` CSS placement."

Prompt 4: "I've identified a 'Ghost Tooltip' bug: when a user deletes a work order while hovering over it, the tooltip remains stuck on the screen because the 'mouseleave' event never triggers on a deleted element. 
- Propose a fix within the `deleteWorkOrder` method to reset the `hoveredOrder` signal.
- Ensure the context menu and editing panel states are also cleaned up in the same atomic update."

Prompt 5: "Review the application for Performance Engineering and Accessibility:
- Implement `ChangeDetectionStrategy.OnPush` to minimize re-renders.
- Optimize `*ngFor` loops using `trackBy` functions mapped to `docId`.
- Audit the HTML for **ARIA** compliance: add role definitions, aria-labels for date inputs, and ensure focus management when modals or menus are closed."
