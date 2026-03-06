# Work Order Timeline

A high-performance, interactive scheduling timeline built with Angular 19 to demonstrate complex state management, custom UI layout logic, and robust automated testing.

## Setup Steps Required

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/ch-its/work-order-timeline.git
   cd work-order-timeline
   ```

2. **Install Dependencies**:
   *Note: Due to specific peer dependency requirements in the modern Angular 19 ecosystem, use the legacy peer deps flag during installation.*
   ```bash
   npm install --legacy-peer-deps
   ```

## How to Run the Application

To start the local development server, run:

```bash
ng serve
```

Once the server compiles successfully, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload if you modify any source files.

## Brief Description of my Approach

My approach focuses on **Performance, Reactivity, and Accessibility**. 

Instead of relying on heavy Canvas libraries, I have built a custom DOM-based grid, utilizing CSS Flexbox and absolute positioning. To handle the potentially massive amount of DOM nodes in a multi-year timeline, I have implemented a custom "Infinite Horizontal Scroll" (windowing) technique. It dynamically prepends and appends 12-day chunks of time to the timeline when the user scrolls near the edges, keeping the initial load fast and the DOM lightweight.

For state management, I have utilized a **Signal-based architecture**. By moving away from legacy RxJS BehaviorSubjects for standard state, the app achieves fine-grained reactivity. Combined with `ChangeDetectionStrategy.OnPush` and custom `trackBy` functions, the UI only re-renders the exact DOM nodes that change, entirely eliminating UI lag during hover events or form inputs. 

Finally, I prioritized a Test-Driven pipeline, implementing a GitHub Actions CI/CD workflow that runs Playwright End-to-End tests on every commit to ensure critical bug fixes (like preventing "ghost tooltips" on deletion) do not regress.

## Libraries Used and Why

* **Angular Signals (`@angular/core`)**: Chosen as the primary state management tool for its superior developer ergonomics, automatic dependency tracking, and seamless integration with `OnPush` change detection.
* **Playwright (`@playwright/test`)**: Selected over Cypress or Protractor for End-to-End testing. It is incredibly fast, supports multiple browser engines, and its visual UI mode made it the perfect tool to test complex mouse-hover and DOM-deletion interactions.
* **Vitest**: Chosen for unit testing the complex date-to-pixel math. It is significantly faster than standard Karma/Jasmine setups and integrates beautifully with modern build tools.
* **ng-bootstrap (`@ng-bootstrap/ng-bootstrap`)**: Used specifically for the `NgbDatepicker`. It provides a highly accessible, keyboard-navigable foundation that I could easily override with custom SCSS to match the required enterprise styling.
* **ng-select (`@ng-select/ng-select`)**: Selected for the status dropdowns because it natively supports custom HTML templates for options, allowing me to easily render the colored status "pills" directly inside the select input.

## Testing Commands

* **Run Unit Tests**: `npm test`
* **Run E2E Tests (with UI)**: `npx playwright test --ui`

## Extended Documentation

* [**AI Prompts Log**](./AI_PROMPTS.md) - Documentation of the architectural planning and collaboration with AI.
* [**Technical Trade-offs**](./TRADE_OFFS.md) - Detailed rationale behind key technical and architectural decisions.