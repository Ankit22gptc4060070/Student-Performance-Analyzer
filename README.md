## Project Overview (Abstract)

*Goal:* Build a lightweight Student Performance Analyzer that educators or students can use to upload subject-wise marks, calculate totals/averages/grades, view class-level statistics, filter results, export data, and visualize performance using charts — all without external JS libraries.

*Key features:*
- CSV upload / paste CSV input.
- Robust parsing (basic) and validation.
- Per-student: Total, Average, Grade, Pass/Fail status.
- Class metrics: mean, highest, lowest, grade distribution.
- Filtering (by average), sorting, and CSV export.
- Visualizations: Bar chart (averages), per-subject averages, grade distribution pie chart.
- Responsive UI using Bootstrap.

---

## Objectives

1. Deliver a single-file reference implementation plus separated file variants.
2. Use only HTML/CSS/vanilla JS and Bootstrap (CDN allowed).
3. Write clear comments and README for deployment (GitHub + Netlify).
4. Provide extensible structure so students can add ML/analytics later.

---

## Modules & Workflow

1. *Input module* — Accept CSV via file upload or pasted text. Sanitize and parse into rows.
2. *Validation module* — Ensure columns, numeric checks, and required marks present.
3. *Computation module* — Compute total, average, grade, pass/fail rules.
4. *UI module* — Populate table, summary cards, and filters. Provide sorting and export.
5. *Charting module* — Draw charts on <canvas>: bar chart (student averages), line chart (subject trends) and pie (grade distribution).
6. *Persistence/Export* — Export filtered results to CSV and store last dataset in localStorage for quick reload.

Flow: User provides CSV → Parser → Validator → Compute metrics → Render UI & Charts → User filters/sorts/exports.
