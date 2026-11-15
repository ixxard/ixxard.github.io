// Sample file for the style guide: shows how [blog:...] regions are marked.
// Your own code goes in code/<series>/<part>/, e.g. code/hvf/00a/.
#include <Hypervisor/Hypervisor.h>
#include <stdio.h>
#include <stdlib.h>

#define CHECK(expr)                                                   \
    do {                                                              \
        hv_return_t r_ = (expr);                                      \
        if (r_ != HV_SUCCESS) {                                       \
            fprintf(stderr, "%s failed: 0x%x\n", #expr, (unsigned)r_); \
            exit(1);                                                  \
        }                                                             \
    } while (0)

int main(void) {
    // [blog:create]
    CHECK(hv_vm_create(NULL));

    hv_vcpu_t vcpu;
    hv_vcpu_exit_t *exit_info;
    CHECK(hv_vcpu_create(&vcpu, &exit_info, NULL));
    // [/blog:create]

    // [blog:run]
    CHECK(hv_vcpu_run(vcpu));
    printf("exit reason %u\n", exit_info->reason);
    // [/blog:run]

    hv_vcpu_destroy(vcpu);
    hv_vm_destroy();
    return 0;
}
