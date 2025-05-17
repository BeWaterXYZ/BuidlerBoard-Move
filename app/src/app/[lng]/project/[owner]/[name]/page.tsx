'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import type { ProjectEndorsement, Repository } from '@/types/supabase';
import { ConnectButton, useWallet } from '@razorlabs/razorkit';
import { InputGenerateTransactionPayloadData } from '@aptos-labs/ts-sdk';
import { useTranslation } from '@/app/i18n/client';

async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy text: ', err);
    return false;
  }
}

export default function ProjectProfile({ 
  params: { lng, name, owner } 
}: { 
  params: { lng: string; name: string, owner: string } 
}) {
  const { t } = useTranslation(lng, 'project');
  const { data: project } = useQuery<Repository>(['project', name], 
    () => fetch(`/api/project?owner=${owner}&name=${name}`).then(res => res.json())
  );

  if (!project) return <div>{t('loading')}</div>;

  return (
    <div className="container mx-auto p-4">
      <ProjectInfo project={project} t={t} />
      <ContributorSection contributors={project.contributors} t={t} />
      {/* <EndorsementSection name={name} endorsements={project.endorsements || []} t={t} lng={lng} /> */}
    </div>
  );
}

function ProjectInfo({ project, t }: { project: Repository; t: any }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (text: string) => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold">{project.name}</h1>
        <div className="flex gap-2">
          {project.badges?.map((badge) => (
            <img
              key={badge.type}
              src={`/api/badges/${badge.type}`}
              alt={badge.name}
              className="w-8 h-8"
              title={badge.name}
            />
          ))}
        </div>
      </div>
      <p className="text-gray-600">{project.description}</p>
      <div className="flex space-x-4">
        <span>⭐ {t('stars', { count: project.stargazers_count })}</span>
        <span>🔄 {t('forks', { count: project.forks_count })}</span>
        <span>🏆 {t('score', { score: project.score })}</span>
      </div>
      {project.blockchain_tx && (
        <div className="flex items-center space-x-2 text-sm bg-gray-900/30 p-3 rounded-lg">
          <span className="text-gray-400">{t('tx_hash')}:</span>
          <div className="flex items-center space-x-2 flex-1">
            <a 
              href={`https://explorer.movementlabs.xyz/txn/${project.blockchain_tx}?network=bardock+testnet`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 hover:underline font-mono"
            >
              {shortenAddress(project.blockchain_tx)}
            </a>
            <button
              onClick={() => handleCopy(project.blockchain_tx!)}
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
      <div className="flex flex-wrap gap-2">
        {project.languages.map(lang => (
          <span key={lang} className="px-2 py-1 bg-black rounded">
            {lang}
          </span>
        ))}
      </div>
    </div>
  );
}

function ContributorSection({ contributors, t }: { contributors: any[]; t: any }) {
  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold mb-4">{t('contributors.title')}</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {contributors?.map((contributor) => (
          <div key={contributor.login} className="flex items-center space-x-2">
            <img 
              src={contributor.avatar_url} 
              alt={contributor.login}
              className="w-10 h-10 rounded-full"
            />
            <div>
              <div className="font-medium">{contributor.login}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function EndorsementSection({ 
  name, 
  endorsements, 
  t, 
  lng 
}: { 
  name: string; 
  endorsements: ProjectEndorsement[]; 
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

      try {
        const payload: InputGenerateTransactionPayloadData = {
          function: `${process.env.NEXT_PUBLIC_MODULE_ADDRESS}::github_score::endorse_project`,
          typeArguments: [],
          functionArguments: [name, message]
        };

        const resp = await signAndSubmitTransaction({
          payload,
        });

        return resp;
      } catch (error) {
        console.error('Transaction failed:', error);
        throw new Error(t('endorsements.transaction_failed'));
      }
    },
    {
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

function shortenAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
} 