import { DeployedContracts, deployProxy, grantRole, InstanceName, setDeploymentMetadata } from '../../utils/Deploy';
import { Roles } from '../../utils/Roles';
import { DeployFunction } from 'hardhat-deploy/types';
import { HardhatRuntimeEnvironment } from 'hardhat/types';

const func: DeployFunction = async ({ getNamedAccounts }: HardhatRuntimeEnvironment) => {
    const { deployer } = await getNamedAccounts();

    const network = await DeployedContracts.BancorNetwork.deployed();
    const networkSettings = await DeployedContracts.NetworkSettings.deployed();
    const bnt = await DeployedContracts.BNT.deployed();
    const bntPool = await DeployedContracts.BNTPool.deployed();
    const externalRewardsVault = await DeployedContracts.ExternalAutoCompoundingRewardsVault.deployed();

    const autoCompoundingRewardsAddress = await deployProxy({
        name: InstanceName.AutoCompoundingRewards,
        from: deployer,
        args: [network.address, networkSettings.address, bnt.address, bntPool.address, externalRewardsVault.address]
    });

    await grantRole({
        name: InstanceName.BNTPool,
        id: Roles.BNTPool.ROLE_BNT_POOL_TOKEN_MANAGER,
        member: autoCompoundingRewardsAddress,
        from: deployer
    });

    await grantRole({
        name: InstanceName.ExternalAutoCompoundingRewardsVault,
        id: Roles.Vault.ROLE_ASSET_MANAGER,
        member: autoCompoundingRewardsAddress,
        from: deployer
    });

    return true;
};

export default setDeploymentMetadata(__filename, func);
