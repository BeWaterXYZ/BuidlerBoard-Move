import { 
  Aptos, 
  AptosConfig, 
  Network, 
  Account,
  Ed25519PrivateKey 
} from '@aptos-labs/ts-sdk';
import type { Developer, Repository } from '@/types/supabase';

const MODULE_ADDRESS = process.env.NEXT_PUBLIC_MODULE_ADDRESS!;
const MODULE_NAME = 'github_score';

// 验证地址格式
function validateAddress(address: string): string {
  try {
    // 确保地址以 0x 开头
    if (!address.startsWith('0x')) {
      address = `0x${address}`;
    }
    
    // 验证是否是有效的16进制字符串
    if (!/^0x[0-9a-fA-F]+$/.test(address)) {
      throw new Error('Invalid hex format');
    }
    
    return address;
  } catch (error) {
    console.error('Invalid address format:', error);
    throw new Error('Invalid address format');
  }
}

export class BlockchainService {
  private client: Aptos;
  private account: Account;

  constructor() {
    const config = new AptosConfig({ 
      network: Network.CUSTOM,
      fullnode: process.env.MOVEMENT_RPC_URL!
    });
    this.client = new Aptos(config);
    
    // 验证模块地址和私钥
    const moduleAddress = validateAddress(process.env.NEXT_PUBLIC_MODULE_ADDRESS!);
    console.log('moduleAddress', moduleAddress);
    const privateKeyHex = validateAddress(process.env.MOVEMENT_PRIVATE_KEY!);

    this.account = Account.fromPrivateKey({
      privateKey: new Ed25519PrivateKey(privateKeyHex)
    });
  }

  // 上传开发者数据到链上
  async uploadDeveloperData(developer: Developer, score: number) {
    try {
      const transaction = await this.client.transaction.build.simple({
        sender: this.account.accountAddress,
        data: {
          function: `${MODULE_ADDRESS}::${MODULE_NAME}::submit_developer_score`,
          typeArguments: [],
          functionArguments: [
            developer.id.toString(),
            developer.login,
            score,
            developer.total_stars,
            developer.followers,
            Math.floor(Date.now() / 1000)
          ]
        }
      });

      const authenticator = await this.client.transaction.sign({
        signer: this.account,
        transaction
      });

      const result = await this.client.transaction.submit.simple({
        transaction,
        senderAuthenticator: authenticator
      });
      console.log('developer score transaction result', result);
      await this.client.waitForTransaction({ transactionHash: result.hash });

      return result.hash;
    } catch (error) {
      console.error('Error uploading developer data to blockchain:', error);
      throw error;
    }
  }

  // 上传项目数据到链上
  async uploadProjectData(repository: Repository, score: number) {
    try {
      const transaction = await this.client.transaction.build.simple({
        sender: this.account.accountAddress,
        data: {
          function: `${MODULE_ADDRESS}::${MODULE_NAME}::submit_project_score`,
          typeArguments: [],
          functionArguments: [
            repository.id.toString(),
            repository.name,
            score,
            repository.stargazers_count,
            repository.forks_count,
            Math.floor(Date.now() / 1000)
          ]
        }
      });

      const authenticator = await this.client.transaction.sign({
        signer: this.account,
        transaction
      });

      const result = await this.client.transaction.submit.simple({
        transaction,
        senderAuthenticator: authenticator
      });
      console.log('project score transaction result', result);

      await this.client.waitForTransaction({ transactionHash: result.hash });

      return result.hash;
    } catch (error) {
      console.error('Error uploading project data to blockchain:', error);
      throw error;
    }
  }

  // 查询开发者分数
  async getDeveloperScore(githubId: string): Promise<number> {
    try {
      const resource = await this.client.account.getAccountResource({
        accountAddress: MODULE_ADDRESS,
        resourceType: `${MODULE_ADDRESS}::${MODULE_NAME}::DeveloperScore`
      });
      
      return (resource as any).data.score;
    } catch (error) {
      console.error('Error fetching developer score:', error);
      throw error;
    }
  }

  async awardProjectBadge(projectId: string, badgeType: number) {
    try {
      const transaction = await this.client.transaction.build.simple({
        sender: this.account.accountAddress,
        data: {
          function: `${MODULE_ADDRESS}::${MODULE_NAME}::award_project_badge`,
          typeArguments: [],
          functionArguments: [projectId, badgeType]
        }
      });

      const authenticator = await this.client.transaction.sign({
        signer: this.account,
        transaction
      });

      const result = await this.client.transaction.submit.simple({
        transaction,
        senderAuthenticator: authenticator
      });

      await this.client.waitForTransaction({ transactionHash: result.hash });
      return result.hash;
    } catch (error) {
      console.error('Error awarding project badge:', error);
      throw error;
    }
  }

  // 批量上传开发者数据到链上
  async uploadDevelopersBatch(developers: Developer[], scores: number[]) {
    try {
      // Prepare batch data
      const github_ids = developers.map(dev => dev.id.toString());
      const logins = developers.map(dev => dev.login);
      const total_stars = developers.map(dev => dev.total_stars);
      const followers = developers.map(dev => dev.followers);
      const timestamp = Math.floor(Date.now() / 1000);

      const transaction = await this.client.transaction.build.simple({
        sender: this.account.accountAddress,
        data: {
          function: `${MODULE_ADDRESS}::${MODULE_NAME}::submit_developers_scores`,
          typeArguments: [],
          functionArguments: [
            github_ids,
            logins, 
            scores,
            total_stars,
            followers,
            timestamp
          ]
        }
      });

      const authenticator = await this.client.transaction.sign({
        signer: this.account,
        transaction
      });

      const result = await this.client.transaction.submit.simple({
        transaction,
        senderAuthenticator: authenticator
      });
      console.log('batch developer scores transaction result', result);
      const txHash = result.hash;
      await this.client.waitForTransaction({ transactionHash: result.hash });
      // console.log('batch developer scores transaction hash', txHash);
      return txHash;
    } catch (error) {
      console.error('Error uploading batch developer data to blockchain:', error);
      throw error;
    }
  }

  // 批量上传项目数据到链上
  async uploadProjectsBatch(repositories: Repository[], scores: number[]) {
    try {
      // Prepare batch data
      const github_ids = repositories.map(repo => repo.id.toString());
      const names = repositories.map(repo => repo.name);
      const stars = repositories.map(repo => repo.stargazers_count);
      const forks = repositories.map(repo => repo.forks_count);
      const timestamp = Math.floor(Date.now() / 1000);

      const transaction = await this.client.transaction.build.simple({
        sender: this.account.accountAddress,
        data: {
          function: `${MODULE_ADDRESS}::${MODULE_NAME}::submit_projects_scores`,
          typeArguments: [],
          functionArguments: [
            github_ids,
            names,
            scores,
            stars,
            forks,
            timestamp
          ]
        }
      });

      const authenticator = await this.client.transaction.sign({
        signer: this.account,
        transaction
      });

      const result = await this.client.transaction.submit.simple({
        transaction,
        senderAuthenticator: authenticator
      });
      console.log('batch project scores transaction result', result);
      await this.client.waitForTransaction({ transactionHash: result.hash });

      return result.hash;
    } catch (error) {
      console.error('Error uploading batch project data to blockchain:', error);
      throw error;
    }
  }
} 