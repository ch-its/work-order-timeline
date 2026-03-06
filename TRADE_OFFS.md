# Technical Trade-offs

This document outlines the architectural choices made during the development of the Work Order Timeline and the rationale behind them.

---

## 1. CSS Flexbox/Grid vs. HTML5 Canvas
**Decision:** Use a DOM-based approach (Flexbox and relative positioning) instead of a Canvas-based timeline.

* **Rationale:** For a timeline with hundreds or even a few thousand work orders, the DOM is highly performant when combined with Angular's `OnPush` change detection. 
* **Trade-off:** While Canvas can handle tens of thousands of elements more efficiently, it sacrifices built-in **Accessibility (ARIA)**, browser searchability (`Ctrl+F`), and ease of styling with standard CSS. Given the requirement for a responsive, interactive UI, the DOM provided a better balance of developer velocity and user accessibility.

## 2. Angular Signals vs. RxJS/BehaviorSubjects
**Decision:** Use **Angular Signals** for the primary state of work orders and UI visibility.

* **Rationale:** Signals provide fine-grained reactivity out of the box. Unlike RxJS, they don't require manual unsubscriptions (preventing memory leaks) and offer a cleaner syntax for derived state (using `computed`).
* **Trade-off:** RxJS is still superior for complex asynchronous event streams (like debouncing scroll events). I chose a hybrid approach: **Signals** for state storage and **RxJS** (via `fromEvent`) for handling the high-frequency scroll listener to maintain performance.

## 3. Infinite Scroll: Dynamic Prepending vs. Fixed Range
**Decision:** Implement a dynamic "Windowing" scroll that prepends and appends dates as the user nears the edges.

* **Rationale:** Loading a fixed 5-year timeline on initialization would lead to a massive DOM, slowing down initial render times (LCP). By prepending 12-day chunks only when needed, the app remains lightweight.
* **Trade-off:** Prepending elements to the left of the scroll container shifts the user's visual position. I solved this by calculating the pixel width of the added elements and instantly adjusting the `scrollLeft` to ensure a seamless "infinite" feel, which adds slight complexity to the scroll handler logic.

## 4. Playwright (E2E) vs. Jasmine (Unit) for Bug Verification
**Decision:** Using Playwright to verify the "Ghost Tooltip" fix rather than relying solely on Unit tests.

* **Rationale:** Unit tests are great for math, but they often "mock" away the very DOM interactions that cause UI bugs. 
* **Trade-off:** E2E tests are slower to run and require more infrastructure (GitHub Actions). However, for a high-stakes UI bug like a stuck tooltip, the confidence gained by watching a real browser perform a hover-and-delete action is worth the performance cost.
