---
title: "Devices and EL2"   # working title: change it freely
description: ""
date: 2026-11-16
draft: true
tags: ["hypervisor", "low-level", "systems-programming"]
# part: "02"              # optional: defaults to this folder's prefix. Always quote it.
code: "https://github.com/ixxard/AppleHypervizorExperiments/tree/part2"   # the "code for this part" link
---

<!--
  Working notes for this part. This comment never renders.
    Book:  docs/book/00b-devices.md (MMIO: a UART at 0x09000000, the run loop, ISV)
           docs/book/00c-el2.md     (hv_vm_config_set_el2_enabled, CurrentEL, HCR_EL2)
    Code:  ~/Uben/AppleHypervizorExperiments/repo, branch part2 (cut from part1), file hello_hvf.c
-->

<!--
  Pointers. This comment never renders. Delete it whenever you like.
  Every element, rendered next to its source: `make dev`, then /posts/style-guide/

  HEADINGS
    ## Section            in the contents sidebar
    ### Subsection        in the contents sidebar
    #### Small label      not listed

  CODE FROM A FILE (stays in sync with the file; the build stops if the pointer breaks)
    {{</* src file="code/hvf/00a/vm.c" region="create-vm" */>}}
        and in vm.c, on their own lines:   // [blog:create-vm]   ...   // [/blog:create-vm]
    {{</* src file="code/hvf/00a/vm.c" lines="12-30" hl="3-4" */>}}

  CODE TYPED HERE
    ```c {title="vm.c" hl_lines="2-3" linenos=true}
    ```console                 lines starting "$ " are commands; copy takes only those

  CALLOUTS (GitHub syntax)
    > [!NOTE]   > [!TIP]   > [!WARNING]   > [!HOOD] Under the hood   > [!EXERCISE]- Try it

  REGISTER
    {{</* reg name="HCR_EL2" */>}}
    34 | E2H | what it does
    {{</* /reg */>}}

  IMAGE next to this file:   ![alt text](diagram.svg "Caption")
  OTHER PART:                [part 00a](../00a-first-vm/)
  FOOTNOTE:                  claim[^why]   ...   [^why]: the note
-->

