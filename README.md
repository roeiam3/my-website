# Roei Amsalem Website

Professional Jekyll site for portfolio and networking blog content.

## Local development

```bash
bundle install
bundle exec jekyll serve
```

Open: `http://127.0.0.1:4000`

## How to publish new blog posts

Create a new file in `_posts/` with this format:

`YYYY-MM-DD-title.md`

Example front matter:

```yaml
---
layout: post
title: Your Post Title
categories: [networking]
excerpt: One-sentence summary for the blog list and feed.
---
```

Then write content in Markdown under the front matter.

## Structure

- `_config.yml`: site settings and metadata
- `_layouts/`: shared page and post templates
- `_posts/`: blog posts
- `assets/css/main.scss`: all site styling
- `index.md`, `projects.md`, `blog.md`: main pages

## Notes

- `_site/` is generated output and is intentionally ignored by git.
- RSS/Atom feed is generated automatically from `_posts/`.
