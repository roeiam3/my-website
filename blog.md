---
layout: default
title: Blog
---

# Blog

Technical writeups, tutorials, and study logs on enterprise networking.

<div class="card-list">
  <a class="card-link" href="{{ '/blog/datapath-visualized/' | relative_url }}">
    <h2>Datapath Visualized</h2>
    <p>Visual walkthroughs of how traffic moves through network devices — ingress, lookup, rewrite, and egress.</p>
    <time>2026-07-03</time>
  </a>
</div>

{% if site.posts.size > 0 %}
<div class="card-list">
  {% for post in site.posts %}
  <a class="card-link" href="{{ post.url | relative_url }}">
    <h2>{{ post.title }}</h2>
    <p>{{ post.excerpt | strip_html | truncate: 140 }}</p>
    <time>{{ post.date | date: "%Y-%m-%d" }}</time>
  </a>
  {% endfor %}
</div>
{% else %}
<p>No posts yet. New writeups will appear here soon.</p>
{% endif %}
