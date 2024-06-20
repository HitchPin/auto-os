import { ServiceCatalog, ProductViewDetail, CopyProductStatus } from '@aws-sdk/client-service-catalog';
import type { MachineContext } from '../machine';
import { fromTemporaryCredentials } from '@aws-sdk/credential-providers'

export class PortfolioHelper {

    #accountRoleArn: string;

    constructor(accountRoleArn: string) {
        this.#accountRoleArn = accountRoleArn;
    }   

    createLocalPortfolio = async (context:MachineContext): Promise<{ sharedPortfolioId: string, localPortfolioId: string }> => {
        const svcCat = await this.#svcCatForAccount(context.project.awsRegion, context.accountProps.accountId);

        const sharesRes = await svcCat.listAcceptedPortfolioShares({
            PortfolioShareType: 'AWS_ORGANIZATIONS'
        });
        const portfolio = sharesRes.PortfolioDetails![0]!;
        const copiedRes = await svcCat.createPortfolio({
            AcceptLanguage: 'en',
            Description: portfolio.Description!,
            DisplayName: portfolio.DisplayName!,
            ProviderName: portfolio.ProviderName!,
            Tags: [
                {
                    Key: 'PortfolioType',
                    Value: 'Inherited'
                }
            ]
        });
        return {
            sharedPortfolioId: portfolio.Id!,
            localPortfolioId: copiedRes.PortfolioDetail!.Id!
        };
    }

    listProductsToCopy = async (context: MachineContext): Promise<ProductViewDetail[]> => {
        const svcCat = await this.#svcCatForAccount(context.project.awsRegion, context.accountProps.accountId);

        const srcId = context.portfolio!.sharedPortfolioId;
        const localId = context.portfolio!.localPortfolioId!;
        const products = await svcCat.searchProductsAsAdmin({
            PortfolioId: srcId
        });
        const ps = products.ProductViewDetails!;
        return ps;
    }

    copyProduct = async (context: MachineContext): Promise<string> => {
        const svcCat = await this.#svcCatForAccount(context.project.awsRegion, context.accountProps.accountId);
        const product = context.portfolio!.products![context.portfolio!.productIndex!];
    
        console.log(`Copying product ${product.ProductViewSummary!.Name!}`);
        const r = await svcCat.copyProduct({
            AcceptLanguage: 'en',
            SourceProductArn: product.ProductARN!,
            CopyOptions: ['CopyTags'],
        });
        return r.CopyProductToken!;
    }

    getProductStatus = async (context: MachineContext): Promise<CopyProductStatus> => {
        const svcCat = await this.#svcCatForAccount(context.project.awsRegion, context.accountProps.accountId);
        const statusRes = await svcCat.describeCopyProductStatus({
            CopyProductToken: context.portfolio!.copyProductToken!
        });
        if (statusRes!.CopyProductStatus === 'FAILED') {
            throw new Error('Failed to copy product. ' + statusRes!.StatusDetail!);
        }
        return statusRes!.CopyProductStatus!;
    }

    associateProductWithPortfolio = async (context: MachineContext): Promise<void> => {
        const svcCat = await this.#svcCatForAccount(context.project.awsRegion, context.accountProps.accountId);
        
        const product = context.portfolio!.products![context.portfolio!.productIndex!];
        const searchResult = await svcCat.searchProductsAsAdmin();
        const localProduct = searchResult.ProductViewDetails!.find(p => p.ProductViewSummary!.Name! === product.ProductViewSummary!.Name);
        if (!localProduct) {
            throw new Error('Cannot find local product.');
        }

        console.log(`Found copied product with ID: ${localProduct.ProductViewSummary!.ProductId!}`);
        await svcCat.associateProductWithPortfolio({
            AcceptLanguage: 'en',
            PortfolioId: context.portfolio!.localPortfolioId!,
            ProductId: localProduct.ProductViewSummary!.ProductId!
        });
    }

    associatePrincipal = async (context: MachineContext): Promise<void> => {
        const svcCat = await this.#svcCatForAccount(context.project.awsRegion, context.accountProps.accountId);
        
        await svcCat.associatePrincipalWithPortfolio({
            AcceptLanguage: 'en',
            PortfolioId: context.portfolio!.localPortfolioId!,
            PrincipalARN: `arn:aws:iam::${context.accountProps.accountId}:role/AutoOsOrgAccessRole`,
            PrincipalType: 'IAM'
        });
    }

    #svcCatForAccount = async (region: string, accountId: string): Promise<ServiceCatalog> => {
        const orgAdminCreds = fromTemporaryCredentials({
            params: {
                RoleArn: this.#accountRoleArn,
                DurationSeconds: 60 * 15,
                RoleSessionName: 'org-account-assumer',
            }
        });
        
        const svcCat = new ServiceCatalog({
            credentials: fromTemporaryCredentials({
                params: {
                    RoleArn: `arn:aws:iam::${accountId}:role/AutoOsOrgAccessRole`,
                    DurationSeconds: 60 * 15,
                    RoleSessionName: 'portfolio-importer',
                },
                masterCredentials: orgAdminCreds
            }),
            region: region
        });

        return svcCat;
    }
}