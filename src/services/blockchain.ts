import { 
  Aptos, 
  AptosConfig, 
  Network, 
  Account,
  Ed25519PrivateKey 
} from '@aptos-labs/ts-sdk';
import type { Developer, Repository } from '@/types/supabase';

const MODULE_ADDRESS = process.env.MOVEMENT_MODULE_ADDRESS!;
const MODULE_NAME = 'github_score';

export class BlockchainService {
  private client: Aptos;
  private account: Account;

  constructor() {
    const config = new AptosConfig({ 
      network: Network.CUSTOM,
      fullnode: process.env.MOVEMENT_RPC_URL!
    });
    this.client = new Aptos(config);
    
    // 从私钥创建账户
    const privateKey = new Ed25519PrivateKey(process.env.MOVEMENT_PRIVATE_KEY!);
    this.account = Account.fromPrivateKey({ privateKey });
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
      
      // 根据实际的资源结构来获取分数
      const score = (resource as any).data.score;
      return score;
    } catch (error) {
      console.error('Error fetching developer score:', error);
      throw error;
    }
  }

  // 查询项目分数
  async getProjectScore(githubId: string): Promise<number> {
    try {
      const resource = await this.client.account.getAccountResource({
        accountAddress: MODULE_ADDRESS,
        resourceType: `${MODULE_ADDRESS}::${MODULE_NAME}::ProjectScore`
      });
      
      // 根据实际的资源结构来获取分数
      const score = (resource as any).data.score;
      return score;
    } catch (error) {
      console.error('Error fetching project score:', error);
      throw error;
    }
  }
} 