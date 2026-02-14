---
layout: default
title: Blog
---

# Blog

Technical writeups, tutorials, and study logs on enterprise networking.

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
