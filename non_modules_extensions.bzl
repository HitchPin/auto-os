""" External repositories for the CI that need to be shared between WORKSPACE and MODULE.bazel files """

load(
    "@rules_nixpkgs_core//:nixpkgs.bzl",
    "nixpkgs_package",
)

def repositories(*, bzlmod):

    nixpkgs_package(
        name = "graphviz",
        attribute_path = "graphviz",
        repository = Label("@nixpkgs"),
    )


def _non_module_dev_deps_impl(_ctx):
    repositories(bzlmod = True)

non_module_dev_deps = module_extension(
    implementation = _non_module_dev_deps_impl,
)