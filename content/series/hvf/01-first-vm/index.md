---
title: "First VM"
description: ""
date: 2026-11-15T16:36:23+05:30
draft: false
tags: ["hypervisor", "low-level", "systems-programming", "investigation"]
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

## Beginnings

It all started when one day I installed Parallels Desktop to run some Windows application that required WSL2 internally. Found out there is no support for nested virtualization. Then one day, Apple announced [nested Virtualization support](https://developer.apple.com/documentation/virtualization/vzgenericplatformconfiguration/isnestedvirtualizationsupported)

And rejoice I did, soon to realize that Windows was still not supported. It had first party support for Linux and macOS only. I waited some time, only to realize waiting is futile. One way was to use QEMU's emulator TCG, but that option was too slow for my purposes. Meanwhile I also wanted to experiment with Hyper-V and Windows Sandbox, the only issue, I wanted to do it in comfort from my trusty M4 Pro MacBook while travelling.

What would it really take to bring support for nested virtualization using Apple's Hypervisor.framework on Windows?

This blogpost acts as the steps I would take to support it. To understand what I want to do properly, let's target the fundamentals. Before bringing up QEMU and get Windows up and running we need to understand how Hypervisor.framework works, spelled out.

## Let's bring up Hypervisor.framework and start building

You need a Mac with Apple silicon, the Xcode command-line tools (`xcode-select --install`), and an empty folder (and of course a trusty editor)

### Makefile and Entitlement

Starting with a barebones Makefile

```makefile {title="Makefile" hl_lines="1-2" linenos=true}
CC=clang
CFLAGS= -Wall -Wextra -Werror -O1
LDFLAGS= -framework Hypervisor
PROGRAM=hello_hvf

all: $(PROGRAM)

%: %.c entitlements.plist
	$(CC) $(CFLAGS) $< -o $@ $(LDFLAGS)
	codesign --force --sign - --entitlements entitlements.plist $@

clean:
	rm -f $(PROGRAM)

.PHONY: all clean
```

Of course we are dealing with macOS here, so we need to codesign for it to run on my own machine. Add a barebones `entitlements.plist` right where the Makefile exists and give it `com.apple.security.hypervisor` key.

```xml {title="entitlements.plist"}
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>com.apple.security.hypervisor</key>
  <true/>
</dict>
</plist>
```

### Dive into writing code

With all this done, we can start investigating and writing real code. The documentation lives in [developer.apple.com/documentation/hypervisor](https://developer.apple.com/documentation/hypervisor)

```c {title="hello_hvf.c"}
#include <Hypervisor/Hypervisor.h>
// and the rest of usual C stuff
#include <inttypes.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <sys/mman.h>
#include <unistd.h>
```

Every Hypervisor.framework call returns an `hv_return_t` which could be

| Return value | Meaning |
|---|---|
| [`HV_SUCCESS: Int`](https://developer.apple.com/documentation/hypervisor/hv_success) | The operation completed successfully. |
| [`HV_ERROR: Int`](https://developer.apple.com/documentation/hypervisor/hv_error) | The operation was unsuccessful. |
| [`HV_BUSY: Int`](https://developer.apple.com/documentation/hypervisor/hv_busy) | The operation was unsuccessful because the owning resource was busy. |
| [`HV_BAD_ARGUMENT: Int`](https://developer.apple.com/documentation/hypervisor/hv_bad_argument) | The operation was unsuccessful because the function call had an invalid argument. |
| [`HV_NO_RESOURCES: Int`](https://developer.apple.com/documentation/hypervisor/hv_no_resources) | The operation was unsuccessful because the host had no resources available to complete the request. |
| [`HV_NO_DEVICE: Int`](https://developer.apple.com/documentation/hypervisor/hv_no_device) | The operation was unsuccessful because no VM or vCPU was available. |
| [`HV_UNSUPPORTED: Int`](https://developer.apple.com/documentation/hypervisor/hv_unsupported) | The operation requested isn’t supported by the hypervisor. |
| [`HV_DENIED: Int`](https://developer.apple.com/documentation/hypervisor/hv_denied) | The system didn’t allow the requested operation. |

Learning from all the DirectX and Vulkan tutorials I have followed, it would be a good practice to catch all the hv calls so let's write a small preprocessor macro

```c {title="hello_hvf.c"}
#define CHECK(expr) do { \
    hv_return_t __res = (expr); \
    if (__res != HV_SUCCESS) { \
        fprintf(stderr, "%s:%d: %s failed: 0x%08x\n", __FILE__, __LINE__, #expr, (unsigned)__res); \
        exit(1); \
    } \
} while(0)
```

We will bind all the `hv_` calls in the `CHECK` which currently checks for only `HV_SUCCESS`, which should be enough for our initial purpose. In time, we will have to learn to recognize a few by the value itself (`0xfae94001` is `HV_ERROR`, `0xfae9400f` is `HV_UNSUPPORTED`)

### First encounter with the hypervisor kind

At last, we call our first (and second) hypervisor call.

```c {title="hello_hvf.c"}
int main(void)
{
    CHECK(hv_vm_create(NULL));
    printf("\nVM created yo\n");
    CHECK(hv_vm_destroy());
    return 0;
}
```

`hv_vm_create()` turns _this process_ into the container of one virtual machine. We pass `NULL` as an argument, which means default configuration. Later on I guess we will need to specify our configuration.

At this stage, it should start compiling and we should be able to see

```console
$ make all
$ ./hello_hvf

VM created yo
```

### Let's find a guest to run

So we eventually need some guest code to run on host, and what's better than one that adds 1 to 41 to answer all questions. Recalling from what little assembly is known

```asm
.text
.p2align 2
.globl _guest_start
_guest_start:
	mov x0, #41
	add x0, x0, #1
	hvc #7               /* hand control to host by the guest */
.globl _guest_end
_guest_end:
```

This would be the bare minimum guest that shall run on our host macOS. We can have this inline and have memory marked as executable. Just a standard unix thingy with `mmap` and `memcpy`. A guest thinks it has RAM at some physical addresses; Oh well, it doesn't. Those are guest-physical addresses (IPAs, intermediate physical addresses), and the host would decide what each one means through a second translation the guest can't see.

```c {title="hello_hvf.c"}
extern const unsigned char guest_start[], guest_end[];
__asm__(
    ".text\n"
    ".p2align 2\n"
    ".globl _guest_start\n"
    "_guest_start:\n"
    "    mov  x0, #41\n"      /* x0 = 41 */
    "    add  x0, x0, #1\n"   /* x0 = x0 + 1 */
    "    hvc  #7\n"           /* hypervisor call: hand control to the host */
    ".globl _guest_end\n"
    "_guest_end:\n"
);

/* Guest-physical address where the guest's one page of memory appears. */
#define GUEST_RAM_BASE 0x10000

/* Processor state for the vCPU: EL1 using SP_EL1 (EL1h), with D, A, I, F masked. */
#define CPSR_EL1H_MASKED 0x3c5
```

To start the vCPU, we need the Processor State (PSTATE) set. In the CPSR mask, we set Debug, SError, IRQ and FIQ masked. We also tell it to run on EL1. That's too much jargon, well, just like x86-64, the hardware has privilege levels from Ring3 to Ring0, ARM has privilege levels from EL0 to EL3. Kernels usually run in EL1.

We will create a memory mapping, copy our guest code over in that memory, and then call `hv_vm_map()`. Once mapped, we will create our vCPU using `hv_vcpu_create()`. We will set initial registers that we defined using `hv_vcpu_set_reg()` and finally we shall run the guest code using `hv_vcpu_run`. We need a cpu type defined with `hv_vcpu_t` to create the virtual cpu.

```c {title="hello_hvf.c"}
    size_t page = (size_t)getpagesize();

    void *ram = mmap(NULL, page, PROT_READ | PROT_WRITE, MAP_ANON | MAP_PRIVATE, -1, 0);
    if (ram == MAP_FAILED) {
        perror("mmap");
        return 1;
    }

    memcpy(ram, guest_start, (size_t)(guest_end - guest_start));
    CHECK(hv_vm_map(ram, GUEST_RAM_BASE, page, HV_MEMORY_READ | HV_MEMORY_WRITE | HV_MEMORY_EXEC));

    hv_vcpu_t vcpu;
    hv_vcpu_exit_t *exit_info;
    CHECK(hv_vcpu_create(&vcpu, &exit_info, NULL));
    CHECK(hv_vcpu_set_reg(vcpu, HV_REG_PC, GUEST_RAM_BASE));
    CHECK(hv_vcpu_set_reg(vcpu, HV_REG_CPSR, CPSR_EL1H_MASKED));
    CHECK(hv_vcpu_run(vcpu));

    uint64_t esr = exit_info->exception.syndrome;
    uint64_t x0, pc;

    CHECK(hv_vcpu_get_reg(vcpu, HV_REG_X0, &x0));
    CHECK(hv_vcpu_get_reg(vcpu, HV_REG_PC, &pc));
    printf("exit reason : %u (1 = exception)\n", (unsigned)exit_info->reason);
    printf("syndrome    : 0x%016" PRIx64 "\n", esr);
    printf("  EC        : 0x%02" PRIx64 " (0x16 = HVC from AArch64)\n", (esr >> 26) & 0x3f);
    printf("  imm16     : %" PRIu64 "\n", esr & 0xffff);
    printf("guest x0    : %" PRIu64 "\n", x0);
    printf("guest pc    : 0x%" PRIx64 "\n", pc);
```

We need to be clear about what thread owns what here.

- **A vCPU belongs to the thread that created it.** Every call that touches a vCPU's registers (`hv_vcpu_set_reg`, `hv_vcpu_get_sys_reg`, `hv_vcpu_run`) must come from that thread. Later in this series, we are going to run multiple vCPUs, so we must design this properly.
- **`hv_vcpu_run()` runs real instructions on the real CPU.** This is definitely not an emulator. The CPU switches into the guest and stays there until something only the host can handle happens. Then the call returns. That return is an **exit**.
- **The exit carries a syndrome, ahm, well not like that syndrome.** When an Arm CPU takes an exception it records why in a _syndrome register_, `ESR`. The framework hands us the guest's: bits 31:26 are the **exception class** (EC), what kind of event; bit 25 says the instruction was 32 bits; bits 24:0 are the **ISS**, details that depend on the class. Decoding syndromes is the whole job of a VMM.

Well, cleanup is necessary as well, I am not all for labels, but later on I could do some goto magic to quickly cleanup.

```c {title="hello_hvf.c"}
    CHECK(hv_vcpu_destroy(vcpu));
    CHECK(hv_vm_unmap(GUEST_RAM_BASE, page));
    CHECK(hv_vm_destroy());
    munmap(ram, page);
```

This will run and output something like this

```text
exit reason : 1 (1 = exception)
syndrome    : 0x000000005a000007
  EC        : 0x16 (0x16 = HVC from AArch64)
  imm16     : 7
guest x0    : 42
guest pc    : 0x1000c
```

Voila, the guest really ran and gave us the answer to the universe!

We are able to run a guest in this first part of the Apple Hypervisor bringup. We still need to go a long way to support nested virtualization on Windows. See you in the next part.
