'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import type { Developer } from '@/types/supabase';
import { ConnectButton, useWallet } from '@razorlabs/razorkit';
import { InputGenerateTransactionPayloadData } from '@aptos-labs/ts-sdk';
import { useTranslation } from '@/app/i18n/client';
import { getBadgeEmoji } from '@/utils/badge-generator';
import { copyToClipboard } from '@/utils/copy-to-clipboard';
// 添加徽章类型定义
interface Badge {
  type: number;
  name: string;
  issueTime: string;
}

// 添加背书类型定义
interface Endorsement {
  from: string;
  message: string;
  timestamp: string;
}


export default function DeveloperProfile({ 
  params: { lng, login } 
}: { 
  params: { lng: string; login: string } 
}) {
  const { t } = useTranslation(lng, 'developer');
  const { data: developer } = useQuery<Developer>(['developer', login], 
    () => fetch(`/api/developer?login=${login}`).then(res => res.json())
  );

  if (!developer) return <div>{t('loading')}</div>;

  return (
    <div className="container mx-auto p-4">
      <DeveloperInfo developer={developer} t={t} />
      {/* <BadgeSection badges={developer.badges} t={t} lng={lng} /> */}
      {/* <EndorsementSection login={login} endorsements={developer.endorsements} t={t} lng={lng} /> */}
    </div>
  );
}

function DeveloperInfo({ developer, t }: { developer: Developer; t: any }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (text: string) => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div>
      <div className="flex items-center space-x-4">
        <img 
          src={developer.avatar_url} 
          alt={developer.login}
          className="w-20 h-20 rounded-full"
        />
        <div>
          <h1 className="text-2xl font-bold">{developer.login}</h1>
          <p className="text-gray-600">{developer.bio}</p>
          <div className="mt-2 flex space-x-4">
            <span>⭐ {t('total_stars', { count: developer.total_stars })}</span>
            <span>👥 {t('followers', { count: developer.followers })}</span>
            <span>🏆 {t('score', { score: developer.score })}</span>
          </div>
        </div>
      </div>

      {developer.blockchain_tx && (
        <div className="mt-4 flex items-center space-x-2 text-sm bg-gray-900/30 p-3 rounded-lg">
          <span className="text-gray-400">{t('tx_hash')}:</span>
          <div className="flex items-center space-x-2 flex-1">
            <a 
              href={`https://explorer.movementlabs.xyz/txn/${developer.blockchain_tx}?network=bardock+testnet`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 hover:underline font-mono"
            >
              {shortenAddress(developer.blockchain_tx)}
            </a>
            <button
              onClick={() => handleCopy(developer.blockchain_tx!)}
              className="p-1.5 hover:bg-gray-800 rounded-md transition-colors"
              title={t('copy_hash')}
            >
              {copied ? (
                <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                </svg>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function BadgeSection({ badges, t, lng }: { badges: Badge[]; t: any; lng: string }) {
  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold mb-4">{t('badges.title')}</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {badges?.map((badge) => (
          <div 
            key={`${badge.type}-${badge.issueTime}`}
            className="p-4 border rounded-lg text-center"
          >
            <div className="text-2xl mb-2">
              {getBadgeEmoji(badge.type)}
            </div>
            <div className="font-medium">{t(`badges.types.${badge.type}`)}</div>
            <div className="text-sm text-gray-500">
              {new Date(badge.issueTime).toLocaleDateString(lng)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function EndorsementSection({ 
  login, 
  endorsements, 
  t, 
  lng 
}: { 
  login: string; 
  endorsements: Endorsement[]; 
  t: any; 
  lng: string 
}) {
  const [message, setMessage] = useState('');
  const { account, connected, signAndSubmitTransaction } = useWallet();

  const endorseMutation = useMutation(
    async (message: string) => {
      if (!connected || !account) {
        throw new Error(t('endorsements.wallet_required'));
      }

      if (account.address === login) {
        throw new Error(t('endorsements.self_endorse_error'));
      }

      try {
        const payload: InputGenerateTransactionPayloadData = {
          function: `${process.env.NEXT_PUBLIC_MODULE_ADDRESS}::github_score::endorse_developer`,
          typeArguments: [],
          functionArguments: [
            login,
            message
          ]
        };

        const resp = await signAndSubmitTransaction({
          payload,
        });

        console.log(resp);
        return resp;
      } catch (error) {
        console.error('Transaction failed:', error);
        throw new Error(t('endorsements.transaction_failed'));
      }
    },
    {
      onError: (error) => {
        console.error('Endorsement failed:', error);
      },
      onSuccess: () => {
        setMessage('');
      }
    }
  );

  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold mb-4">{t('endorsements.title')}</h2>
      <div className="space-y-4 mb-6">
        {endorsements?.map((endorsement) => (
          <div 
            key={`${endorsement.from}-${endorsement.timestamp}`}
            className="p-4 border rounded-lg"
          >
            <div className="flex items-center gap-2">
              <div className="font-medium">{t('endorsements.from')}</div>
              <div className="text-sm text-gray-500">
                {shortenAddress(endorsement.from)}
              </div>
            </div>
            <p className="mt-2">{endorsement.message}</p>
            <div className="text-sm text-gray-500 mt-2">
              {new Date(Number(endorsement.timestamp) * 1000).toLocaleDateString(lng)}
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4">
        {!connected ? (
          <ConnectButton className="w-full" />
        ) : (
          <>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t('endorsements.write_endorsement')}
              className="w-full p-2 border rounded-lg"
              rows={3}
            />
            <button
              onClick={() => endorseMutation.mutate(message)}
              disabled={endorseMutation.isLoading || !message.trim()}
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50"
            >
              {endorseMutation.isLoading ? t('endorsements.submitting') : t('endorsements.submit')}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// 辅助函数：缩短地址显示
function shortenAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}