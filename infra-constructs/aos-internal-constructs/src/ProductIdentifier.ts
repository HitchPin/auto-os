import * as cdk from "aws-cdk-lib";
import {
  aws_ec2 as ec2,
  aws_iam as iam,
  aws_lambda as lambda,
  custom_resources as cr,
  CustomResource,
} from "aws-cdk-lib";
import { Construct } from "constructs";
import { readFileSync } from "fs";
import path = require("path");

export class ProductIdentifier extends Construct {

  readonly productName: string;
  readonly productId: string;
  readonly provisionedProductId: string;

  constructor(
    parent: Construct,
    name: string
  ) {
    super(parent, name);

    const fRole = new iam.Role(this, "ProductIdentifierRole", {
      assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
      inlinePolicies: {
        orgIntrospector: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              actions: [
                "servicecatalog:SearchProvisionedProducts",
              ],
              resources: ["*"],
            }),
          ],
        }),
      },
    });
    const f = new lambda.SingletonFunction(this, "ProductIdFunc", {
      uuid: "identifier-func",
      runtime: lambda.Runtime.PYTHON_3_12,
      handler: "index.on_event",
      role: fRole,
      code: lambda.Code.fromInline(
        readFileSync(
          path.resolve(__dirname, "./internal/product_id_finder.py")
        ).toString("utf8")
      ),
    });
    const p = new cr.Provider(this, "ProductIdProvider", {
      onEventHandler: f,
    });
    const rsrc = new CustomResource(this, "ProductIdResource", {
      properties: {},
      serviceToken: p.serviceToken,
    });
    this.productName = rsrc.getAttString("Name");
    this.productId = rsrc.getAttString("ProductId");
    this.provisionedProductId = rsrc.getAttString("ProvisionedProductId");
  }
}
