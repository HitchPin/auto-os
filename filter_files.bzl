def _get_openapi_files(ctx):
  for out in ctx.outputs.outs:
    ctx.actions.run_shell(
      inputs = ctx.files.src,
      outputs = [out],
      command = "cp {src} {dst}".format(
          src = ctx.files.src[0].path + "/" + out.short_path,
          dst = out.path,
      ),
    )
  return DefaultInfo(files = depset(ctx.outputs.outs))

get_openapi_files = rule(
  implementation = _get_openapi_files,
  attrs = {
    "src": attr.label(mandatory = True),
    "outs": attr.output_list(mandatory = True),
  },
)