---
title: "About"
description: "Senior software developer working on hypervisors, Arm64 virtualization and graphics."
draft: false         # true hides the page and its "about" menu entry
toc: false
menus: main
weight: 40
aliases: ["/About.html", "/About/"]   # old Jekyll URLs keep working
---

I'm Sankrant, a senior software developer at Aquila Clouds. My work sits close to the machine: hypervisors, Arm64 virtualization and the C code that drives them. I also write about computer graphics.

This site is where I explain those systems from the code up, in multi-part series, standalone posts and shorter notes.

## Expertise

- **Virtualization on Apple silicon:** Hypervisor.framework, QEMU's HVF accelerator, and the Arm64 exception model beneath them (EL0 to EL2, traps, VHE).
- **Nested virtualization:** running a hypervisor inside a guest, with Windows 11 on Arm and Hyper-V as the target.
- **Systems programming in C:** virtual machine monitors built from first principles.
- **Computer graphics:** SDL3 and graphics programming.

## Selected work

### Nested Windows on Apple silicon

2026 · research build
{.meta}

A modified QEMU on Hypervisor.framework that boots Windows 11 Pro Arm64 with Hyper-V enabled and runs an interactive Windows Sandbox inside it, on an Apple silicon Mac. It is a research build tested on one machine, not a general or upstream-supported feature. The Hypervisor.framework series on this site builds up to it, starting from a first VM in C.

### Getting started with SDL3

PCQuest · May 2025
{.meta}

An introductory guide to SDL3.

<a class="badge-link" href="/pdfs/PQCSankrant.pdf"><img src="/images/Pcqlogo_sm.png" alt="PCQuest" width="125" height="40"><span>Read the article (PDF)</span></a>

## Interests

Exploratory computing, physics and video games.

## Contact

Code is on [GitHub](https://github.com/ixxard). New writing arrives by [RSS](/index.xml).
