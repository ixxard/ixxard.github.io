---
title: "{{ replaceRE `^\d{4}-\d{2}-\d{2}-` "" .File.ContentBaseName | replaceRE `-` " " | title }}"
date: {{ .Date }}
draft: false
tags: []
---

<!-- A note: short, dated, no ceremony. Shows on /notes/ in full and on the home page. -->

