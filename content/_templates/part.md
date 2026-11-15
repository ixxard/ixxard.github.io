---
title: ""
description: ""
date: {{date:YYYY-MM-DD}}
draft: true
tags: []
# part: "00a"              # optional: defaults to this folder's prefix. Always quote it.
# code: "code/hvf/00a"     # optional: defaults to code/<series>/<part> when that folder exists
---

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

