# DMap — Multi-Agent Communication Rules

> All agents MUST read this file before starting any work.

---

## 1. The 4 Agents

| Agent | Role | What They Do | What They DON'T Do |
|-------|------|-------------|-------------------|
| **PM** 📝 | Plan & Coordinate | Write specs, create task lists, track progress, report to user | Write code, design UI |
| **UI Designer** 🎨 | Visual Design | Design system, colors, fonts, component specs, CSS tokens | Write backend code, API logic |
| **Senior Developer** 💎 | Implementation | Frontend code, backend code, database, Docker | Write specs, design decisions |
| **Reality Checker** 🧐 | QA & Testing | Test everything, find bugs, verify spec compliance | Write features, fix code |

## 2. The Golden Rule

**Docs are the single source of truth.** Agents communicate through `docs/`:

```
PM writes tasks → docs/TASKS.md → Developer reads and builds
UI Agent writes design → docs/DESIGN.md → Developer reads and implements
Developer updates → docs/STATUS.md → Reality Checker reads and tests
Reality Checker reports → docs/STATUS.md → PM reads and plans next
```

## 3. Document Ownership

| Document | Owner | Others Can |
|----------|-------|-----------|
| `docs/SPEC.md` | PM | Read only |
| `docs/TASKS.md` | PM | Read only |
| `docs/AGENT_RULES.md` | PM | Read only |
| `docs/STATUS.md` | Everyone | Read & Write (append only) |
| `docs/DESIGN.md` | UI Designer | Read only |

## 4. Before You Work

Every agent MUST:
1. Read `docs/SPEC.md` — what we're building
2. Read `docs/AGENT_RULES.md` — this file
3. Read `docs/TASKS.md` — find YOUR assigned tasks
4. Check `docs/STATUS.md` — what's already done

## 5. After You Finish

Append to `docs/STATUS.md`:
```markdown
## [Date] — [Agent Name]
**What I did**: [Brief description]
**Files changed**: [List]
**What's next**: [What the next agent should pick up]
**Blockers**: [Any issues]
```

## 6. Conflict Resolution

- `SPEC.md` wins over all other docs
- `DESIGN.md` wins over CSS implementation
- If you find a conflict, **don't fix it** — note it in `STATUS.md`

## 7. Naming Conventions

| Item | Convention | Example |
|------|-----------|---------|
| Components | PascalCase | `POIDetailPanel.jsx` |
| CSS files | kebab-case | `poi-detail-panel.css` |
| API routes | kebab-case | `/api/accessibility-features` |
| DB tables | snake_case | `poi_accessibility` |
| CSS variables | kebab-case | `--color-score-good` |

## 8. Rating System (ALL Agents Must Agree)

**1-10 scale everywhere.** Never 1-5. Never 3-color.
- DB: `SMALLINT CHECK (rating >= 1 AND rating <= 10)`
- API: `overall_score` as 0-10 (0 = unrated)
- Frontend: score with color from 6-tier scale
- Design: exact hex colors from `DESIGN.md`
