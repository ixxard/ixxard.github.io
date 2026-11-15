# Writing cheat sheet

`make dev`, then open <http://localhost:1313/posts/style-guide/> to see every element below rendered beside its source. The page saves as you type.

## Where things go

```
content/
  series/
    hvf/                         one folder per series
      _index.md                  title, description, roadmap, intro
      00a-first-vm/              one folder per part; "00a" becomes the part label
        index.md                 the text
        diagram.svg              images sit next to the text
    winhv/                       the next series, kept apart
  posts/<slug>/index.md          standalone write-ups
  notes/2026-11-15-<slug>.md     short dated notes
  about.md
code/
  hvf/00a/                       programs for part 00a: shown with {{< src >}}, linked under the post
```

| make | what |
|---|---|
| `make part series=hvf slug=00b-devices` | new part (draft) with pointers inside |
| `make series series=winhv` | new series |
| `make post slug=why-hv-denied` | standalone post (draft) |
| `make note slug=esr-decoding` | dated note (published) |
| `make dev` | live preview, drafts included |

A page with `draft: true` never reaches the public site. Flip it to `false` to publish.

## Front matter

```yaml
title: "First VM"
description: "One sentence. Shown under the title, in feeds and on share cards."
date: 2026-11-15
draft: true
tags: [hvf, arm64]
# part: "00a"             default: folder prefix. Quote it; labels sort as text.
# code: "code/hvf/00a"    default: code/<series>/<part> if that folder exists
# toc: false              hide the contents sidebar
```

Series `_index.md`:

```yaml
title: "Introduction to Hypervisor.framework"
description: "..."
weight: 10                 # order on the home page
roadmap:                   # planned parts, shown as "soon" until published
  - { part: "00b", title: "Devices" }
```

## Headings

```markdown
## Section          listed in the contents sidebar
### Subsection      listed
#### Small label    not listed
```

## Code

From a file, so the post can't drift from the program:

```markdown
{{< src file="code/hvf/00a/vm.c" region="create-vm" >}}
{{< src file="code/hvf/00a/vm.c" lines="12-30" hl="3-4" >}}
{{< src file="code/hvf/00a/Makefile" >}}
```

Mark regions in the source on lines of their own, in any comment style:

```c
// [blog:create-vm]
...
// [/blog:create-vm]
```

Options: `title=`, `lang=`, `hl=` (snippet lines, from 1), `linenos=false`. A wrong path, region or range stops the build and names the line.

Typed into the post:

````markdown
```c {title="vm.c" linenos=true hl_lines="3-4"}
...
```

```console
$ make 01-hello          ← copy button takes only "$ " lines
output here
```

```diff
- old
+ new
```
````

## Callouts

```markdown
> [!NOTE]  / [!TIP] / [!IMPORTANT] / [!WARNING] / [!CAUTION]
> [!HOOD] Under the hood          custom type, custom title
> [!SPEC]                         quotation from a manual
> [!EXERCISE]- Try it             - folded, + open
```

## Register

```markdown
{{< reg name="HCR_EL2" title="Hypervisor Configuration Register" >}}
34    | E2H  | EL2 hosts an OS (VHE)
63:35 | RES0 | reserved
{{< /reg >}}
```

## Everything else

```markdown
![alt](diagram.svg "Caption")          image beside index.md
[part 00a](/series/hvf/00a-first-vm/)  link; a broken one warns during make dev
claim[^why]  ...  [^why]: the note     footnote
<kbd>⌘</kbd>                           key
<details><summary>Fold</summary> ... </details>
```

Keys for readers: `[` and `]` previous/next part, `t` theme.
