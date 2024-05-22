example_library = rule(
    implementation = _example_library_impl,
    attrs = {
        "deps": attr.label_list(),
    },
)