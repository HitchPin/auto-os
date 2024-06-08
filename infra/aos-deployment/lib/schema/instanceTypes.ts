import { z } from "zod";

const InstanceTypeSchema = z.enum([
  "c5n.2xlarge",
  "r5dn.8xlarge",
  "hpc7g.4xlarge",
  "c7a.medium",
  "is4gen.xlarge",
  "r7a.32xlarge",
  "r5.24xlarge",
  "t2.2xlarge",
  "r6g.medium",
  "t1.micro",
  "c6in.xlarge",
  "r7iz.16xlarge",
  "r6id.16xlarge",
  "x2gd.metal",
  "t4g.nano",
  "r5a.xlarge",
  "m6gd.4xlarge",
  "c6gn.16xlarge",
  "r7iz.12xlarge",
  "m5dn.large",
  "g5.4xlarge",
  "m6a.2xlarge",
  "r3.large",
  "g3.16xlarge",
  "f1.2xlarge",
  "m5a.16xlarge",
  "c7gn.xlarge",
  "m6id.xlarge",
  "trn1.32xlarge",
  "c6a.16xlarge",
  "c7g.8xlarge",
  "r6g.large",
  "r6a.xlarge",
  "c6in.24xlarge",
  "c4.4xlarge",
  "m5.8xlarge",
  "m5d.8xlarge",
  "m7i.metal-24xl",
  "m2.4xlarge",
  "x1e.2xlarge",
  "i3en.3xlarge",
  "c6i.4xlarge",
  "m7g.4xlarge",
  "r5a.2xlarge",
  "m5a.2xlarge",
  "m6id.2xlarge",
  "r5n.12xlarge",
  "r6a.2xlarge",
  "i3en.24xlarge",
  "m6idn.large",
  "m7i.16xlarge",
  "c3.large",
  "c6id.8xlarge",
  "c5d.large",
  "m4.4xlarge",
  "c7i.2xlarge",
  "d3en.2xlarge",
  "c7a.xlarge",
  "m5ad.12xlarge",
  "i4i.16xlarge",
  "m5zn.2xlarge",
  "m7gd.xlarge",
  "x1e.8xlarge",
  "i2.2xlarge",
  "m6gd.12xlarge",
  "r6a.metal",
  "x2iezn.4xlarge",
  "m7gd.large",
  "r6in.24xlarge",
  "c6i.32xlarge",
  "r7iz.8xlarge",
  "x2iedn.2xlarge",
  "im4gn.2xlarge",
  "is4gen.4xlarge",
  "x2gd.8xlarge",
  "m5d.xlarge",
  "c7gn.16xlarge",
  "g6.24xlarge",
  "c3.8xlarge",
  "r7a.2xlarge",
  "c6a.24xlarge",
  "c6gd.metal",
  "m5n.16xlarge",
  "mac2-m2.metal",
  "r6g.16xlarge",
  "r6gd.medium",
  "m5dn.2xlarge",
  "c7gd.medium",
  "m6gd.xlarge",
  "m5dn.12xlarge",
  "r6idn.16xlarge",
  "c5ad.24xlarge",
  "m7gd.16xlarge",
  "r6gd.2xlarge",
  "r6in.metal",
  "r7a.xlarge",
  "i3en.12xlarge",
  "inf2.48xlarge",
  "r6i.xlarge",
  "g5.2xlarge",
  "m6id.12xlarge",
  "r6idn.xlarge",
  "c7gn.large",
  "r5ad.24xlarge",
  "t3a.2xlarge",
  "c7a.large",
  "m5ad.4xlarge",
  "r7iz.32xlarge",
  "m6a.metal",
  "c6a.32xlarge",
  "im4gn.xlarge",
  "m5a.4xlarge",
  "m6idn.4xlarge",
  "t3.2xlarge",
  "m7i.8xlarge",
  "d2.8xlarge",
  "r7a.4xlarge",
  "x2idn.24xlarge",
  "m7a.xlarge",
  "m6idn.12xlarge",
  "r6idn.8xlarge",
  "c6id.24xlarge",
  "m6g.metal",
  "r7gd.8xlarge",
  "r6id.xlarge",
  "c5ad.12xlarge",
  "i4g.xlarge",
  "r5ad.12xlarge",
  "a1.medium",
  "m6gd.medium",
  "c7g.4xlarge",
  "z1d.2xlarge",
  "m5zn.large",
  "c6i.8xlarge",
  "m5dn.xlarge",
  "x1e.32xlarge",
  "inf2.8xlarge",
  "c5ad.4xlarge",
  "r7gd.xlarge",
  "c7gn.8xlarge",
  "c6in.12xlarge",
  "r6id.12xlarge",
  "x2iedn.xlarge",
  "c6i.large",
  "r7iz.xlarge",
  "r6id.4xlarge",
  "i4g.8xlarge",
  "r6idn.2xlarge",
  "r7g.medium",
  "m5ad.large",
  "r6g.8xlarge",
  "m7g.large",
  "trn1.2xlarge",
  "m6in.24xlarge",
  "c6i.2xlarge",
  "m7i.2xlarge",
  "r6id.2xlarge",
  "c5.4xlarge",
  "r6in.12xlarge",
  "m6i.24xlarge",
  "r3.8xlarge",
  "r7i.16xlarge",
  "c6a.48xlarge",
  "m6in.16xlarge",
  "c7i.8xlarge",
  "r5a.large",
  "m7i.24xlarge",
  "m6a.large",
  "r5ad.8xlarge",
  "c5n.large",
  "d3en.8xlarge",
  "r5b.12xlarge",
  "m5.12xlarge",
  "m7i-flex.2xlarge",
  "m5.24xlarge",
  "m6i.large",
  "g4dn.metal",
  "c6gn.xlarge",
  "r6gd.xlarge",
  "r4.16xlarge",
  "c6g.16xlarge",
  "r6gd.large",
  "m6id.32xlarge",
  "r6idn.24xlarge",
  "c5d.12xlarge",
  "x1.16xlarge",
  "c7a.metal-48xl",
  "c6i.24xlarge",
  "r6in.large",
  "inf1.xlarge",
  "i4i.24xlarge",
  "x2iezn.8xlarge",
  "hpc7g.8xlarge",
  "c4.8xlarge",
  "c7g.16xlarge",
  "m5zn.6xlarge",
  "im4gn.8xlarge",
  "trn1n.32xlarge",
  "r7i.metal-48xl",
  "r7a.large",
  "m6i.8xlarge",
  "m7g.16xlarge",
  "m6gd.metal",
  "r5a.12xlarge",
  "m5.xlarge",
  "t3.large",
  "c1.xlarge",
  "c6id.large",
  "c6gn.4xlarge",
  "p3.2xlarge",
  "r7g.metal",
  "r6a.8xlarge",
  "g4dn.12xlarge",
  "d2.2xlarge",
  "r6i.24xlarge",
  "c7a.2xlarge",
  "c5ad.xlarge",
  "r6g.4xlarge",
  "m5d.large",
  "c6in.16xlarge",
  "r6i.4xlarge",
  "r5b.large",
  "p2.8xlarge",
  "c7i.metal-24xl",
  "g6.48xlarge",
  "inf2.24xlarge",
  "c5d.2xlarge",
  "r7g.xlarge",
  "c7a.4xlarge",
  "t3.xlarge",
  "x2gd.16xlarge",
  "c5ad.16xlarge",
  "m5ad.2xlarge",
  "i4i.metal",
  "a1.large",
  "c7gd.16xlarge",
  "x2gd.4xlarge",
  "t2.large",
  "m6in.32xlarge",
  "r7iz.metal-16xl",
  "g6.8xlarge",
  "r7a.medium",
  "c7a.8xlarge",
  "u-3tb1.56xlarge",
  "c5a.4xlarge",
  "m7a.16xlarge",
  "m2.2xlarge",
  "t4g.2xlarge",
  "g4ad.2xlarge",
  "a1.xlarge",
  "m5.metal",
  "c6id.16xlarge",
  "g4ad.8xlarge",
  "c5.xlarge",
  "c6i.16xlarge",
  "m7gd.12xlarge",
  "m7a.32xlarge",
  "r6a.12xlarge",
  "m5d.16xlarge",
  "c7g.xlarge",
  "c5n.9xlarge",
  "x2iedn.metal",
  "i4i.4xlarge",
  "m5dn.8xlarge",
  "r5n.4xlarge",
  "c6g.12xlarge",
  "r7gd.16xlarge",
  "m5d.metal",
  "z1d.xlarge",
  "r5.large",
  "t3a.small",
  "c5a.12xlarge",
  "g4ad.4xlarge",
  "i4g.large",
  "m6g.xlarge",
  "t4g.medium",
  "c4.large",
  "r7g.2xlarge",
  "m7g.12xlarge",
  "m4.xlarge",
  "r6a.32xlarge",
  "r6gd.metal",
  "g5.24xlarge",
  "c6g.xlarge",
  "x2gd.medium",
  "g3.8xlarge",
  "h1.8xlarge",
  "g5g.2xlarge",
  "r5a.16xlarge",
  "m5n.8xlarge",
  "c5n.4xlarge",
  "mac1.metal",
  "mac2.metal",
  "c6gn.12xlarge",
  "m5ad.8xlarge",
  "m6in.12xlarge",
  "c5a.xlarge",
  "t3.medium",
  "d3.8xlarge",
  "r5b.metal",
  "m7g.8xlarge",
  "r5b.2xlarge",
  "c3.xlarge",
  "t4g.large",
  "m6in.metal",
  "r5dn.xlarge",
  "m7i.48xlarge",
  "c6gn.medium",
  "c7gd.xlarge",
  "r7i.metal-24xl",
  "c6in.8xlarge",
  "c6g.large",
  "m7gd.metal",
  "c6in.2xlarge",
  "d3.2xlarge",
  "r3.4xlarge",
  "c7a.12xlarge",
  "m6i.metal",
  "c5.24xlarge",
  "i4i.2xlarge",
  "m1.xlarge",
  "r5d.xlarge",
  "c7gd.large",
  "m7gd.medium",
  "r6gd.4xlarge",
  "c7gn.metal",
  "m3.xlarge",
  "r7gd.4xlarge",
  "c6a.8xlarge",
  "r7i.2xlarge",
  "c6a.12xlarge",
  "m5zn.3xlarge",
  "m6i.16xlarge",
  "r5b.xlarge",
  "m6g.4xlarge",
  "x2gd.2xlarge",
  "c1.medium",
  "r5b.4xlarge",
  "r5ad.large",
  "r3.2xlarge",
  "h1.2xlarge",
  "c5a.24xlarge",
  "r5dn.large",
  "d3en.6xlarge",
  "c5.12xlarge",
  "u-12tb1.112xlarge",
  "r6id.32xlarge",
  "hpc7g.16xlarge",
  "d3en.4xlarge",
  "inf1.6xlarge",
  "t3a.medium",
  "c7i.large",
  "r5a.4xlarge",
  "u-6tb1.56xlarge",
  "m7gd.8xlarge",
  "r6g.12xlarge",
  "m6gd.16xlarge",
  "r7gd.medium",
  "r5.metal",
  "g5g.16xlarge",
  "r7iz.2xlarge",
  "inf1.2xlarge",
  "r7i.12xlarge",
  "c7i.24xlarge",
  "vt1.3xlarge",
  "m6idn.32xlarge",
  "r7i.8xlarge",
  "r5b.24xlarge",
  "m4.large",
  "i4g.2xlarge",
  "m6a.4xlarge",
  "r5.16xlarge",
  "c5d.4xlarge",
  "c5a.2xlarge",
  "vt1.6xlarge",
  "p4d.24xlarge",
  "c6gd.xlarge",
  "i4g.4xlarge",
  "r5d.large",
  "c7i.16xlarge",
  "x2gd.xlarge",
  "m5n.large",
  "r6id.24xlarge",
  "r5d.4xlarge",
  "c5d.24xlarge",
  "r5dn.metal",
  "m5n.12xlarge",
  "d3.xlarge",
  "c7i.xlarge",
  "c6gd.16xlarge",
  "t2.micro",
  "m7a.medium",
  "r6in.32xlarge",
  "r6a.48xlarge",
  "m6idn.xlarge",
  "g3.4xlarge",
  "m6g.large",
  "r5.4xlarge",
  "g5.12xlarge",
  "r5n.16xlarge",
  "c6a.4xlarge",
  "x2idn.metal",
  "c7a.16xlarge",
  "h1.4xlarge",
  "c5ad.2xlarge",
  "m7g.xlarge",
  "c5d.18xlarge",
  "g5g.8xlarge",
  "m7a.12xlarge",
  "r7g.8xlarge",
  "i4g.16xlarge",
  "m5ad.24xlarge",
  "m7gd.4xlarge",
  "t4g.micro",
  "m6idn.2xlarge",
  "r3.xlarge",
  "r4.xlarge",
  "m7i-flex.4xlarge",
  "r5n.24xlarge",
  "r7i.xlarge",
  "g5g.metal",
  "m5n.4xlarge",
  "r7gd.metal",
  "x2iezn.12xlarge",
  "r5d.24xlarge",
  "r6idn.large",
  "c4.xlarge",
  "m5.4xlarge",
  "c6a.xlarge",
  "r5d.2xlarge",
  "h1.16xlarge",
  "r5d.16xlarge",
  "c5.9xlarge",
  "r6in.4xlarge",
  "r7gd.2xlarge",
  "t4g.small",
  "m6g.8xlarge",
  "m7a.48xlarge",
  "m5n.metal",
  "r4.2xlarge",
  "p5.48xlarge",
  "c7i.metal-48xl",
  "c7g.2xlarge",
  "m5d.24xlarge",
  "r5ad.2xlarge",
  "m7a.4xlarge",
  "m6a.16xlarge",
  "r7g.4xlarge",
  "r6a.4xlarge",
  "g4dn.xlarge",
  "r5.8xlarge",
  "t3.nano",
  "c5.metal",
  "m6id.16xlarge",
  "r5d.8xlarge",
  "m5ad.xlarge",
  "c5a.16xlarge",
  "c6id.32xlarge",
  "m4.16xlarge",
  "u-24tb1.112xlarge",
  "c7a.24xlarge",
  "u-6tb1.112xlarge",
  "m6id.metal",
  "x2gd.large",
  "a1.2xlarge",
  "c6a.metal",
  "is4gen.2xlarge",
  "m7a.24xlarge",
  "r6idn.4xlarge",
  "c4.2xlarge",
  "r5n.2xlarge",
  "x2gd.12xlarge",
  "t3a.large",
  "r5.xlarge",
  "i2.xlarge",
  "r6i.16xlarge",
  "t4g.xlarge",
  "m5zn.metal",
  "r7a.metal-48xl",
  "m6in.4xlarge",
  "a1.metal",
  "m6i.4xlarge",
  "c7g.medium",
  "c6in.large",
  "i3.xlarge",
  "c7gd.2xlarge",
  "r7gd.large",
  "r5ad.16xlarge",
  "m6i.32xlarge",
  "t3.micro",
  "m5a.8xlarge",
  "x2idn.16xlarge",
  "i4i.large",
  "c5n.18xlarge",
  "x2iedn.4xlarge",
  "g5.16xlarge",
  "m6idn.24xlarge",
  "r7a.24xlarge",
  "m5dn.metal",
  "m5zn.12xlarge",
  "c7a.32xlarge",
  "im4gn.large",
  "a1.4xlarge",
  "r6in.16xlarge",
  "c7g.large",
  "m5.16xlarge",
  "m5n.24xlarge",
  "c7g.metal",
  "r5dn.12xlarge",
  "r6idn.32xlarge",
  "c6in.32xlarge",
  "m7g.2xlarge",
  "i3.16xlarge",
  "c5n.metal",
  "m4.10xlarge",
  "r6i.metal",
  "m5d.2xlarge",
  "x1e.16xlarge",
  "c7gd.8xlarge",
  "c5.large",
  "r6idn.metal",
  "x2iedn.16xlarge",
  "r7i.large",
  "r6i.12xlarge",
  "m5dn.4xlarge",
  "m4.2xlarge",
  "m3.2xlarge",
  "r5ad.xlarge",
  "c5d.xlarge",
  "m7a.8xlarge",
  "r6a.24xlarge",
  "c7gd.12xlarge",
  "m7i.large",
  "m5.2xlarge",
  "m5zn.xlarge",
  "z1d.large",
  "c3.2xlarge",
  "inf2.xlarge",
  "c6gn.8xlarge",
  "m5dn.24xlarge",
  "r5dn.16xlarge",
  "m6gd.8xlarge",
  "m5dn.16xlarge",
  "g6.xlarge",
  "c6in.4xlarge",
  "r6id.large",
  "i2.8xlarge",
  "g6.2xlarge",
  "z1d.metal",
  "vt1.24xlarge",
  "c6id.12xlarge",
  "g6.12xlarge",
  "t2.xlarge",
  "r5.12xlarge",
  "m6g.16xlarge",
  "mac2-m2pro.metal",
  "r6a.16xlarge",
  "m5.large",
  "r6gd.8xlarge",
  "m7g.medium",
  "r7a.8xlarge",
  "r6gd.16xlarge",
  "m6in.xlarge",
  "r6id.8xlarge",
  "m6idn.metal",
  "g5.xlarge",
  "c6id.metal",
  "r5b.16xlarge",
  "g6.16xlarge",
  "c5d.metal",
  "m5n.xlarge",
  "c6gn.large",
  "m7g.metal",
  "r6id.metal",
  "r5d.metal",
  "r5n.xlarge",
  "m6id.4xlarge",
  "x2iezn.2xlarge",
  "i2.4xlarge",
  "c7gd.metal",
  "t2.medium",
  "c5.2xlarge",
  "r6in.8xlarge",
  "m5d.12xlarge",
  "z1d.6xlarge",
  "c7i.4xlarge",
  "z1d.12xlarge",
  "i3.8xlarge",
  "is4gen.large",
  "c3.4xlarge",
  "c7a.48xlarge",
  "r5.2xlarge",
  "x2iezn.metal",
  "i3.large",
  "im4gn.4xlarge",
  "c7i.12xlarge",
  "m6g.12xlarge",
  "x2idn.32xlarge",
  "m6in.large",
  "c6gn.2xlarge",
  "c6g.medium",
  "g6.4xlarge",
  "r7i.48xlarge",
  "gr6.4xlarge",
  "c6gd.2xlarge",
  "c6gd.medium",
  "g5.8xlarge",
  "m3.large",
  "d2.4xlarge",
  "r6gd.12xlarge",
  "x2iedn.32xlarge",
  "g4dn.16xlarge",
  "m7i-flex.8xlarge",
  "i3en.large",
  "m6id.8xlarge",
  "i4i.32xlarge",
  "c7gn.12xlarge",
  "c6i.xlarge",
  "gr6.8xlarge",
  "r5n.8xlarge",
  "m6i.xlarge",
  "i4i.xlarge",
  "c7gn.medium",
  "r5ad.4xlarge",
  "m3.medium",
  "p2.xlarge",
  "r7i.24xlarge",
  "r5d.12xlarge",
  "m5n.2xlarge",
  "r7g.large",
  "m6idn.16xlarge",
  "r5dn.4xlarge",
  "p3.16xlarge",
  "r6a.large",
  "r6i.8xlarge",
  "x1e.4xlarge",
  "inf1.24xlarge",
  "m6a.32xlarge",
  "dl1.24xlarge",
  "r5a.8xlarge",
  "g3s.xlarge",
  "m6id.24xlarge",
  "c5ad.8xlarge",
  "x1.32xlarge",
  "x1e.xlarge",
  "i3en.xlarge",
  "is4gen.medium",
  "r6g.2xlarge",
  "c5a.8xlarge",
  "r4.8xlarge",
  "t2.small",
  "r6g.xlarge",
  "c6i.metal",
  "r6idn.12xlarge",
  "m6a.xlarge",
  "c6id.xlarge",
  "m6in.2xlarge",
  "c7gn.2xlarge",
  "x2iezn.6xlarge",
  "r5b.8xlarge",
  "m5ad.16xlarge",
  "c7g.12xlarge",
  "m6idn.8xlarge",
  "im4gn.16xlarge",
  "i4i.12xlarge",
  "m2.xlarge",
  "t3a.nano",
  "g4ad.16xlarge",
  "t3.small",
  "r7gd.12xlarge",
  "d3.4xlarge",
  "c7gn.4xlarge",
  "c6g.8xlarge",
  "x2iedn.24xlarge",
  "m7a.2xlarge",
  "c6g.4xlarge",
  "c6a.2xlarge",
  "p3.8xlarge",
  "c5ad.large",
  "i3.2xlarge",
  "m5a.large",
  "i3.metal",
  "r6g.metal",
  "c6i.12xlarge",
  "m6gd.2xlarge",
  "r7iz.metal-32xl",
  "r6i.32xlarge",
  "c6id.2xlarge",
  "r7a.12xlarge",
  "p2.16xlarge",
  "m7i.xlarge",
  "r5a.24xlarge",
  "r4.large",
  "r7a.16xlarge",
  "i3en.2xlarge",
  "m7a.metal-48xl",
  "m7i-flex.large",
  "r5dn.2xlarge",
  "c6gd.4xlarge",
  "m6a.24xlarge",
  "g5g.4xlarge",
  "u-9tb1.112xlarge",
  "r6in.xlarge",
  "r4.4xlarge",
  "c5a.large",
  "c7i.48xlarge",
  "c6a.large",
  "m6in.8xlarge",
  "t3a.micro",
  "m7i.4xlarge",
  "g4dn.8xlarge",
  "c6gd.8xlarge",
  "c6g.2xlarge",
  "m5d.4xlarge",
  "i3en.6xlarge",
  "m6i.12xlarge",
  "c6gd.large",
  "m7i-flex.xlarge",
  "c5d.9xlarge",
  "i3en.metal",
  "r7a.48xlarge",
  "m6gd.large",
  "m7a.large",
  "g4dn.4xlarge",
  "m6a.12xlarge",
  "r7g.12xlarge",
  "r7iz.large",
  "m6id.large",
  "z1d.3xlarge",
  "g4ad.xlarge",
  "t2.nano",
  "i3.4xlarge",
  "c5.18xlarge",
  "u-18tb1.112xlarge",
  "g5g.xlarge",
  "p3dn.24xlarge",
  "m5a.xlarge",
  "i4i.8xlarge",
  "m6g.2xlarge",
  "m6i.2xlarge",
  "m6a.8xlarge",
  "r7g.16xlarge",
  "r7i.4xlarge",
  "m1.small",
  "c6in.metal",
  "m1.large",
  "f1.16xlarge",
  "r7iz.4xlarge",
  "m7gd.2xlarge",
  "r5dn.24xlarge",
  "d3en.xlarge",
  "c6id.4xlarge",
  "r5n.metal",
  "r5n.large",
  "c7gd.4xlarge",
  "g4dn.2xlarge",
  "c5n.xlarge",
  "c6g.metal",
  "r6i.large",
  "m6g.medium",
  "m7i.12xlarge",
  "c6gd.12xlarge",
  "d3en.12xlarge",
  "g5.48xlarge",
  "is4gen.8xlarge",
  "m6a.48xlarge",
  "x2iedn.8xlarge",
  "m5a.12xlarge",
  "t3a.xlarge",
  "d2.xlarge",
  "r6in.2xlarge",
  "r6i.2xlarge",
  "f1.4xlarge",
  "m1.medium",
  "m5a.24xlarge",
  "m7i.metal-48xl",
]);
type InstanceType = z.infer<typeof InstanceTypeSchema>;
export { InstanceTypeSchema }
export type { InstanceType };