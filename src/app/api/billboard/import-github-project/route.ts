import { NextResponse } from 'next/server';
import { Octokit } from '@octokit/rest';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { BlockchainService } from '@/services/blockchain';
import { ScoreCalculator } from '@/utils/score-calculator';
import { Developer } from '@/types/supabase';


const octokit = new Octokit({
  auth: process.env.GITHUB_ACCESS_TOKEN
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('body', body);

    // 解析 GitHub URL
    const { repoUrl } = body;
    
    if (!repoUrl) {
      return NextResponse.json(
        { 
          code: 400, 
          msg: 'Missing required parameter', 
          details: { 
            repoUrl: 'Repository URL is required'
          }
        },
        { status: 400 }
      );
    }

    // 解析 URL 获取 owner 和 repo
    try {
      const urlParts = new URL(repoUrl).pathname.split('/').filter(Boolean);
      if (urlParts.length < 2) {
        return NextResponse.json(
          { 
            code: 400, 
            msg: 'Invalid GitHub repository URL',
            details: { 
              repoUrl: 'URL must be in format: https://github.com/owner/repo'
            }
          },
          { status: 400 }
        );
      }
      
      const [owner, repo] = urlParts;
      console.log('Parsed repository:', { owner, repo });

      // 获取仓库信息
      const repoResponse = await octokit.repos.get({
        owner,
        repo,
      }).catch(error => {
        console.error('GitHub API error:', error);
        if (error.status === 404) {
          return { error: 'Repository not found' };
        }
        return { error: error.message };
      });

      if ('error' in repoResponse) {
        return NextResponse.json(
          { 
            code: 404, 
            msg: 'Repository not found',
            error: repoResponse.error 
          },
          { status: 404 }
        );
      }

      const { data: repoData } = repoResponse;

      // 获取贡献者信息
      const { data: contributors = [] } = await octokit.repos.listContributors({
        owner,
        repo,
      }).catch(() => ({ data: [] }));

      // 获取语言信息
      const { data: languages = {} } = await octokit.repos.listLanguages({
        owner,
        repo,
      }).catch(() => ({ data: {} }));

      console.log('Saving to database:', repoData.full_name);

      // 先查询现有数据
      const { data: existingRepo } = await supabaseAdmin
        .from('repositories')
        .select('score, blockchain_tx, badges, endorsements')
        .eq('id', repoData.id)
        .single();

      // 然后进行 upsert
      const { data, error } = await supabaseAdmin
        .from('repositories')
        .upsert({
          id: repoData.id,
          reponame: repoData.full_name,
          name: repoData.name,
          description: repoData.description,
          languages: Object.keys(languages),
          stargazers_count: repoData.stargazers_count,
          forks_count: repoData.forks_count,
          topics: repoData.topics || [],
          ecosystem: null,
          sector: null,
          updated_at: repoData.updated_at,
          score: existingRepo?.score || 0,
          blockchain_tx: existingRepo?.blockchain_tx || null,
          badges: existingRepo?.badges || [],
          endorsements: existingRepo?.endorsements || []
        })
        .select()
        .single();

      if (error) {
        console.error('Database error:', error);
        throw error;
      }

      // 保存贡献者信息
      if (contributors.length > 0) {
        const top5Contributors = contributors.slice(0, 5);
        
        try {
          const contributorDetails = await Promise.all(
            top5Contributors.map(async (c) => {
              if (!c.login) return null;
              
              try {
                const { data: user } = await octokit.users.getByUsername({
                  username: c.login
                }).catch((error) => {
                  if (error.status === 403 && error.message.includes('API rate limit exceeded')) {
                    throw new Error('RATE_LIMIT_EXCEEDED');
                  }
                  return { data: null };
                });

                if (!user) return null;

                // 获取用户所有的仓库并计算总 stars
                let totalStars = 0;
                try {
                  let page = 1;
                  while (true) {
                    const { data: userRepos } = await octokit.repos.listForUser({
                      username: user.login,
                      per_page: 100,
                      page
                    });
                    
                    if (userRepos.length === 0) break;
                    
                    totalStars += userRepos.reduce((sum, repo) => sum + (repo.stargazers_count || 0), 0);
                    if (userRepos.length < 100) break;
                    page++;
                  }
                } catch (error: any) {
                  if (error.status === 403 && error.message.includes('API rate limit exceeded')) {
                    throw new Error('RATE_LIMIT_EXCEEDED');
                  }
                  console.error(`Error fetching stars for user ${user.login}:`, error);
                }

                // 获取用户最受欢迎的仓库
                const { data: repos = [] } = await octokit.repos.listForUser({
                  username: user.login,
                  sort: "updated",
                  direction: 'desc',
                  per_page: 1
                }).catch((error) => {
                  if (error.status === 403 && error.message.includes('API rate limit exceeded')) {
                    throw new Error('RATE_LIMIT_EXCEEDED');
                  }
                  return { data: [] };
                });

                let popularRepo = null;
                if (repos.length > 0) {
                  const repo = repos[0];
                  if (repo.name) {
                    // 获取仓库的语言统计
                    const { data: languages = {} } = await octokit.repos.listLanguages({
                      owner: user.login,
                      repo: repo.name
                    }).catch((error) => {
                      if (error.status === 403 && error.message.includes('API rate limit exceeded')) {
                        throw new Error('RATE_LIMIT_EXCEEDED');
                      }
                      return { data: {} };
                    });

                    const totalBytes: number = Object.values(languages as Record<string, number>)
                      .reduce((a, b) => a + b, 0);
                    
                    const languagesWithPercentage = Object.entries(languages as Record<string, number>)
                      .map(([name, bytes]) => ({
                        name,
                        percentage: Math.round((bytes / totalBytes) * 100)
                      }));

                    popularRepo = {
                      html_url: repo.html_url,
                      name: repo.name,
                      description: repo.description,
                      languages: languagesWithPercentage
                    };
                  }
                }

                return {
                  id: user.id,
                  login: user.login,
                  html_url: user.html_url,
                  avatar_url: user.avatar_url,
                  bio: user.bio,
                  followers: user.followers,
                  total_stars: totalStars,
                  popular_repo: popularRepo,
                  created_at: user.created_at,
                  updated_at: new Date().toISOString(),
                  score: 0,
                  blockchain_tx: null,
                  badges: [],
                  endorsements: []
                };
              } catch (error) {
                if (error instanceof Error && error.message === 'RATE_LIMIT_EXCEEDED') {
                  throw error;
                }
                console.error(`Error processing contributor ${c.login}:`, error);
                return null;
              }
            })
          );

          // 过滤掉null值并保存到developers表
          const validContributors: Developer[] = contributorDetails.filter((c): c is NonNullable<typeof c> => c !== null);
          if (validContributors.length > 0) {
            // 先将开发者数据存入数据库
            const { error: devError } = await supabaseAdmin
              .from('developers')
              .upsert(validContributors);

            if (devError) {
              console.error('Error saving developers:', devError);
              throw devError;
            }

            const blockchainService = new BlockchainService();
            

            // 计算并更新项目分数
            const projectScore = ScoreCalculator.calculateProjectScore({
              followers: repoData.subscribers_count || 0,
              totalStars: repoData.stargazers_count,
              forks: repoData.forks_count,
              contributions: contributors.length,
              recentActivity: ScoreCalculator.calculateRecentActivity(repoData.updated_at)
            });

            // 上传项目数据到区块链
            const projectTxHash = await blockchainService.uploadProjectData(data, projectScore);

            // 更新数据库中的项目分数和交易哈希
            await supabaseAdmin
              .from('repositories')
              .update({ 
                score: projectScore,
                blockchain_tx: projectTxHash 
              })
              .eq('id', data.id);

            // 批量查询现有开发者数据
            const { data: existingDevs } = await supabaseAdmin
              .from('developers')
              .select('id, score, blockchain_tx, badges, endorsements')
              .in('id', validContributors.map(c => c.id));

            const existingDevsMap = new Map(existingDevs?.map(d => [d.id, d]) || []);

            // 计算所有开发者的新分数
            const developersToUpdate = validContributors.map(contributor => {
              const existingDev = existingDevsMap.get(contributor.id);
              
              const developerScore = ScoreCalculator.calculateDeveloperScore({
                followers: contributor.followers,
                totalStars: contributor.total_stars,
                contributions: 1,
                recentActivity: ScoreCalculator.calculateRecentActivity(contributor.updated_at)
              });

              return {
                ...contributor,
                score: developerScore,
                blockchain_tx: existingDev?.blockchain_tx || null,
                badges: existingDev?.badges || [],
                endorsements: existingDev?.endorsements || [],
                needsBlockchainUpdate: !existingDev || existingDev.score !== developerScore
              };
            });

            // 批量更新数据库
            const { error: updateError } = await supabaseAdmin
              .from('developers')
              .upsert(developersToUpdate.map(({ needsBlockchainUpdate, ...dev }) => dev));

            if (updateError) {
              console.error('Error updating developers:', updateError);
              throw updateError;
            }

            // 找出需要更新区块链的开发者
            const developersForBlockchain = developersToUpdate.filter(d => d.needsBlockchainUpdate);

            if (developersForBlockchain.length > 0) {
              // 批量上传到区块链
              const txHash = await blockchainService.uploadDevelopersBatch(
                developersForBlockchain,
                developersForBlockchain.map(d => d.score)
              );
              console.log('batch developer scores transaction hash', txHash);
              const shouldUpdateDevelopers = developersForBlockchain.map(dev => ({
                id: dev.id,
                blockchain_tx: txHash
              }));
              console.log('shouldUpdateDevelopers', shouldUpdateDevelopers);
              
              // 添加错误处理和结果验证
              const { error: updateTxError } = await supabaseAdmin
                .from('developers')
                .upsert(shouldUpdateDevelopers);

              if (updateTxError) {
                console.error('Error updating transaction hash:', updateTxError);
                throw updateTxError;
              }

              // 验证更新是否成功
              const { data: verifyUpdate } = await supabaseAdmin
                .from('developers')
                .select('id, blockchain_tx')
                .in('id', developersForBlockchain.map(d => d.id));
              
              console.log('Verification after update:', verifyUpdate);

              // 保存到repository_contributors表
              const contributorsData = contributors.map(c => ({
                repository_id: repoData.id,
                login: c.login,
                avatar_url: c.avatar_url,
              }));

              const { error: contribError } = await supabaseAdmin
                .from('repository_contributors')
                .upsert(contributorsData);

              if (contribError) {
                console.error('Error saving contributors:', contribError);
                throw contribError;
              }
              
              return NextResponse.json({
                code: 0,
                msg: 'success',
                data: {
                  ...data,
                  score: projectScore,
                  blockchain_tx: projectTxHash,
                  contributors: validContributors.map(c => ({
                    ...c,
                    score: c.score,
                    blockchain_tx: c.blockchain_tx
                  }))
                }
              });
            }
          }
        } catch (error) {
          if (error instanceof Error && error.message === 'RATE_LIMIT_EXCEEDED') {
            return NextResponse.json(
              {
                code: 429,
                msg: 'GitHub API rate limit exceeded. Please try again later.',
                error: 'Rate limit exceeded'
              },
              { status: 429 }
            );
          }
          throw error;
        }
      }
    } catch (error) {
      console.error('Error parsing repository URL:', error);
      return NextResponse.json(
        { 
          code: 400, 
          msg: 'Failed to parse repository URL',
          error: error instanceof Error ? error.message : 'Unknown error',
          details: error
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error importing project:', error);
    return NextResponse.json(
      { 
        code: 500, 
        msg: 'Failed to import project',
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error
      },
      { status: 500 }
    );
  }
} 