import { OrgAccountHelper, PortfolioHelper } from '../helper';
import type { MachineContext } from './Types';

export class MachineOrchestrator {

    #orgHelper: OrgAccountHelper;
    #portfolioHelper: PortfolioHelper;

    constructor(org: OrgAccountHelper, portfolio: PortfolioHelper) {
        this.#orgHelper = org;
        this.#portfolioHelper = portfolio;
    }

    handle = async (context: MachineContext): Promise<MachineContext> => {

        if (context.step === 'RegisterBeacon') {
            return await this.#registerBeacon(context);
        } else if (context.step === 'CreateLocalPortfolio') {
            return await this.#createLocalPortfolio(context);
        } else if (context.step === 'ListProductsToCopy') {
            return await this.#listProductsToCopy(context);
        } else if (context.step === 'CopyProduct') {
            return await this.#copyProduct(context);
        } else if (context.step === 'CheckCopyProductStatus') {
            return await this.#checkCopyProductStatus(context);
        } else if (context.step === 'AssociateProductWithPortfolio') {
            return await this.#associateProductWithPortfolio(context);
        } else if (context.step === 'AssociatePrincipal') {
            return await this.#associatePrincipal(context);
        }
        return context;
    }

    #registerBeacon = async (context: MachineContext): Promise<MachineContext> => {

        await this.#orgHelper.registerBeacon(context.tenantName, context.project, context.accountProps);
        return {
            ...context,
            step: 'CreateLocalPortfolio'
        };
    }
    
    #createLocalPortfolio = async (context: MachineContext): Promise<MachineContext> => {

        const ids = await this.#portfolioHelper.createLocalPortfolio(context);
        return {
            ...context,
            step: 'ListProductsToCopy',
            portfolio: {
                sharedPortfolioId: ids.sharedPortfolioId,
                localPortfolioId: ids.localPortfolioId,
            }
        };
    }
    #listProductsToCopy = async (context: MachineContext): Promise<MachineContext> => {

        const products = await this.#portfolioHelper.listProductsToCopy(context);
        return {
            ...context,
            step: 'CopyProduct',
            portfolio: {
                ...context.portfolio!,
                products: products,
                productIndex: 0
            }
        };
    }
    
    #copyProduct = async (context: MachineContext): Promise<MachineContext> => {

        const token = await this.#portfolioHelper.copyProduct(context);
        return {
            ...context,
            step: 'CheckCopyProductStatus',
            portfolio: {
                ...context.portfolio!,
                copyProductToken: token
            }
        };
    }

    #checkCopyProductStatus = async (context: MachineContext): Promise<MachineContext> => {

        const status = await this.#portfolioHelper.getProductStatus(context);
        if (status === 'SUCCEEDED') {
            return {
                ...context,
                step: 'AssociateProductWithPortfolio'
            }
        } else {
            return {
                ...context
            }
        }
    }

    #associateProductWithPortfolio = async (context: MachineContext): Promise<MachineContext> => {

        await this.#portfolioHelper.associateProductWithPortfolio(context);
        if (context.portfolio!.productIndex! + 1 === context.portfolio!.products!.length) {
            return {
                ...context,
                step: 'AssociatePrincipal'
            }
        } else {
            return {
                ...context,
                portfolio: {
                    ...context.portfolio!,
                    productIndex: context.portfolio!.productIndex! + 1,
                    copyProductToken: undefined
                },
                step: 'CopyProduct'
            }
        }
    }

    #associatePrincipal = async (context: MachineContext): Promise<MachineContext> => {

        await this.#portfolioHelper.associatePrincipal(context);
        return {
            ...context,
            step: 'Done'
        }
    }
}