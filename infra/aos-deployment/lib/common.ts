import { Aws, Fn, Stack, Token } from "aws-cdk-lib";
import { BaseStack } from "./base";
import { Construct } from "constructs";
import * as aosInternal from "../../aos-cdk-internal/dist";

export interface ClusterInfoProps {
  readonly name: string;
  readonly id: string;
  readonly dnsRoot: string;
  readonly region: string;
  readonly account: string;
}

export interface IClusterInfo {
  readonly name: string;
  readonly id: string;
  readonly dnsRoot: string;
  readonly region: string;
  readonly account: string;
  namesFor: (c: Construct) => IClusterNames;
}

export interface IClusterNames {
  get paramPrefix(): string;
  get hyphenatedPrefix(): string;
  get dnsRootParent(): string;
  get hyphenatedLowercasePrefix(): string;
}

export class ClusterInfo implements IClusterInfo {
  #namesFor: IClusterNames | undefined;
  readonly #props: ClusterInfoProps;
  constructor(p: ClusterInfoProps) {
    this.#props = p;
  }

  get id(): string {
    return this.#props.id;
  }
  get name(): string {
    return this.#props.name;
  }
  get dnsRoot(): string {
    return this.#props.dnsRoot;
  }
  get region(): string {
    return this.#props.region;
  }
  get account(): string {
    return this.#props.account;
  }

  namesFor = (c: Construct): IClusterNames => {
    if (this.#namesFor === undefined) {
      const bs = Stack.of(c) as BaseStack;
      const str = `${this.name}${this.id}-`;

      const strFunc = (bs.node.tryFindChild(
        "ClusterInfoStringFuncs"
      ) as aosInternal.StringFuncs) ??
        new aosInternal.StringFuncs(bs, "ClusterInfoStringFuncs", str);
      const dnsFunc = (bs.node.tryFindChild(
        "ClusterInfoDnsStringFuncs"
      ) as aosInternal.StringFuncs) ??
        new aosInternal.StringFuncs(bs, "ClusterInfoDnsStringFuncs", this.dnsRoot);

      this.#namesFor = {
        paramPrefix: `/${this.name}-${this.id}/`,
        hyphenatedPrefix: `${this.name}${this.id}-`,
        dnsRootParent: dnsFunc.parentDomain,
        hyphenatedLowercasePrefix: strFunc.lowerCase,
      };
    }
    return this.#namesFor;
  };
}

export const fromParams = (c: Construct) => {
    const s = Stack.of(c) as BaseStack;
  return new ClusterInfo({
    name: s.nameParam.valueAsString,
    id: s.idParam.valueAsString,
    dnsRoot: s.dnsRootParam.valueAsString,
    account: Aws.ACCOUNT_ID,
    region: Aws.REGION,
  });
};
