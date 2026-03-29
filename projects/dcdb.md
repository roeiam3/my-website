---
layout: default
title: DCDB — Datacenter Database
date: 2026-03-29
permalink: /projects/dcdb/
---

# DCDB — Datacenter Database

<p class="meta">Started: 2026-03-29</p>

## Project Overview

DCDB is a lightweight, self-hosted web application for managing datacenter device inventory. It tracks servers, network devices, rack layouts, and documentation across multiple sites — all from a single Flask + SQLite app that runs anywhere with Docker or Python.

The goal was to build a practical tool that a small infrastructure team could deploy in minutes and use daily without relying on expensive commercial DCIM platforms.

- **Source code:** [github.com/roeiam3/DCDB](https://github.com/roeiam3/DCDB)

---

## Key Features

### Inventory Management

- Unified inventory table with search, sort, and multi-level filtering (by site, device class, project, device type)
- Two-tier classification — devices are organized by class (Server / Network Device) and then by project or device type
- Slide-out device detail panel with full device info, editable notes, changelog history, and downloadable user guides
- Real-time duplicate detection for hostnames, serial numbers, and MAC addresses
- Automatic per-device changelog tracking the last 3 changes

### Dashboard

- 8 configurable stat cards covering total assets, servers, network devices, per-site counts, per-project counts, and more
- 4 donut chart slots selectable from 11 chart types (by category, manufacturer, model, site, room, rack, project, airflow, etc.)
- 2 bar graph slots selectable from 11 graph types (top racks by density, devices by manufacturer, rack utilization, etc.)
- Color-coded site breakdown chips with individual visibility toggles
- All widget changes apply instantly without page reload

### Rack View

- Interactive rack diagrams auto-populated from inventory data
- Per-device RU positioning with color-coded device classes
- Uploaded rack images rendered at correct U-height per model
- Configurable 42U or 48U rack heights

### Administration

- Managed settings for sites, rooms, racks, vendors, device models (with U-height), device types, and projects
- Cascading relationships — rooms belong to sites, racks belong to rooms, models belong to vendors
- Upload rack images (PNG) and PDF user guides per device model
- CSV export and import with filtered inventory and category-specific templates

### User Experience

- Dark and light mode with instant theme toggle, saved to browser
- Admin and viewer roles with role-based UI visibility
- Responsive sidebar with quick access to rack views

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Python 3.12, Flask |
| Database | SQLite (single file, zero config) |
| Frontend | Vanilla JS, CSS variables, Canvas charts |
| Production server | Gunicorn |
| Deployment | Docker, Docker Compose |

---

## Architecture

The entire application runs as a single Flask process backed by one SQLite file. There are no external dependencies, no message queues, and no separate database servers. This makes it easy to deploy on any machine that has Docker or Python installed.

```
DCDB/
├── app.py              # Flask routes, API endpoints, dashboard data
├── database.py         # Schema, constants, DB init, demo seeder
├── templates/          # Jinja2 templates (dashboard, inventory, rack view, settings)
├── static/             # CSS, JS, rack images, user guides
├── Dockerfile          # python:3.12-slim + Gunicorn
└── docker-compose.yml  # Service orchestration with persistent volumes
```

---

## Quick Start

Getting DCDB running takes a single command:

```bash
git clone https://github.com/roeiam3/DCDB.git && cd DCDB
docker compose up -d
```

The app ships with sample data (2 sites, devices across categories) so you can explore immediately at **http://localhost:5000**.

---

## What I Learned

This project reinforced several skills across the full stack:

- **Flask application design** — structuring routes, API endpoints, and Jinja2 templates in a maintainable way
- **SQLite schema design** — cascading relationships, migrations, and seeding demo data
- **Frontend without frameworks** — building a responsive, interactive UI with vanilla JS and CSS variables
- **Docker deployment** — creating production-ready containers with persistent volumes for data durability
- **Dashboard visualization** — rendering configurable charts and graphs on HTML Canvas
- **Inventory UX patterns** — multi-level filtering, slide-out detail panels, duplicate detection, and changelog tracking
