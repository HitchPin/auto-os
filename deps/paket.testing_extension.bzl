"Generated"

load(":paket.testing.bzl", _testing = "testing")

def _testing_impl(_ctx):
    _testing()

testing_extension = module_extension(
    implementation = _testing_impl,
)
