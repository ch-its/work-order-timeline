# Work Order Timeline (Angular 19 + Signals)

A high-performance, interactive scheduling timeline built to demonstrate modern Angular patterns, complex state management, and robust automated testing. This project was developed as a technical assessment focusing on scalability, accessibility, and professional engineering standards.

## Key Features

* **Signal-Based Architecture**: Utilizes Angular Signals for fine-grained reactivity, ensuring only the necessary parts of the DOM update during state changes.
* **Infinite Horizontal Scroll**: A custom-built virtual timeline that dynamically prepends and appends date "chunks" as the user scrolls, supporting an infinite temporal range.
* **Contextual Tooltips & Menus**: Real-time mouse tracking for interactive tooltips and task-specific action menus.
* **Performance Optimized**: Implements `ChangeDetectionStrategy.OnPush` and `trackBy` functions to minimize re-renders and DOM churn.
* **Enterprise UI/UX**: Professional styling using custom SCSS, featuring a slide-out "Edit/Create" panel and date-overlap validation.

## Testing Strategy (The "Bonus" Suite)

This project implements a dual-layer testing strategy to ensure reliability and catch UI regressions:

1.  **Unit Tests (Vitest)**: Focused on complex date-to-pixel math and signal state transitions.
    * **Run command**: `npm test`
2.  **End-to-End Tests (Playwright)**: Real-browser simulations including a regression test for the "Ghost Tooltip" bug.
    * **Run command**: `npx playwright test --ui`
3.  **CI/CD Integration**: A **GitHub Actions** workflow is configured to automatically run Playwright tests on every push to the `main` branch, ensuring a stable repository.

## 🛠️ Installation & Setup

1.  **Clone the Repository**:
    ```bash
    git clone [https://github.com/ch-its/work-order-timeline.git](https://github.com/ch-its/work-order-timeline.git)
    cd work-order-timeline
    ```
2.  **Install Dependencies**:
    ```bash
    npm install --legacy-peer-deps
    ```
3.  **Run the App**:
    ```bash
    ng serve
    ```
    Navigate to `http://localhost:4200/`.

## Extended Documentation

To see the depth of the engineering process and AI collaboration, please refer to:
* [**AI Prompts Log**](./AI_PROMPTS.md): Documentation of the architectural planning and collaboration with AI.
* [**Technical Trade-offs**](./TRADE_OFFS.md): Detailed explanation of architectural decisions and engineering rationale.

---
*Created by Chaitanya Mahajan as a technical submission.*