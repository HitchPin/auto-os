import { Project } from "../schema"
import { ProductViewDetail } from '@aws-sdk/client-service-catalog'

type MachineStep = 'RegisterBeacon' | 'CreateLocalPortfolio' | 'ListProductsToCopy' |  'CopyProduct' |
    'CheckCopyProductStatus' | 'AssociateProductWithPortfolio' | 'AssociatePrincipal' | 'Done';

interface PortfolioProps {
    sharedPortfolioId: string
    localPortfolioId?: string,
    products?: ProductViewDetail[]
    productIndex?: number,
    copyProductToken?: string
}

export interface MachineContext {
    step: MachineStep,
    tenantName: string,
    project: Project
    accountProps: {
        accountId: string,
        accountEmail: string
    },
    portfolio?: PortfolioProps,

}